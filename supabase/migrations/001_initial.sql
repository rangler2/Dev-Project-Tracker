-- Multi-tenant agency project tracker schema

create extension if not exists "pgcrypto";

-- Organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_domains (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  domain text not null unique,
  created_at timestamptz not null default now()
);

create index organization_domains_org_idx on public.organization_domains (organization_id);

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete restrict,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create index profiles_org_idx on public.profiles (organization_id);

-- Clients & projects
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_org_idx on public.clients (organization_id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  cms text not null default '',
  cms_version text not null default '',
  fe_stack text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_org_idx on public.projects (organization_id);
create index projects_client_idx on public.projects (client_id);

create type public.competence_level as enum ('none', 'basic', 'intermediate', 'advanced');

create table public.project_readiness (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  is_set_up boolean not null default false,
  access_dev boolean not null default false,
  access_uat boolean not null default false,
  access_live boolean not null default false,
  be_level public.competence_level not null default 'none',
  fe_level public.competence_level not null default 'none',
  qa_level public.competence_level not null default 'none',
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_readiness_org_idx on public.project_readiness (organization_id);
create index project_readiness_project_idx on public.project_readiness (project_id);

create table public.project_pulse (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  ease smallint not null check (ease between 1 and 5),
  joy smallint not null check (joy between 1 and 5),
  team_support smallint not null check (team_support between 1 and 5),
  clarity smallint not null check (clarity between 1 and 5),
  would_return smallint not null check (would_return between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_pulse_org_idx on public.project_pulse (organization_id);
create index project_pulse_project_idx on public.project_pulse (project_id);

-- Helpers
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

create or replace function public.extract_email_domain(email text)
returns text
language sql
immutable
as $$
  select lower(split_part(email, '@', 2))
$$;

-- Attach profile on signup; reject unknown domains
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_domain text;
  org_id uuid;
  name text;
begin
  -- Use email_domain (not "domain") to avoid clashing with organization_domains.domain
  email_domain := public.extract_email_domain(new.email);
  select od.organization_id into org_id
  from public.organization_domains od
  where od.domain = email_domain;

  if org_id is null then
    raise exception 'Email domain % is not allowed to join any organisation', email_domain
      using errcode = '42501';
  end if;

  name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, organization_id, email, display_name)
  values (new.id, org_id, new.email, name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep organization_id consistent on child rows
create or replace function public.set_organization_id_from_project()
returns trigger
language plpgsql
as $$
begin
  select organization_id into new.organization_id
  from public.projects
  where id = new.project_id;
  return new;
end;
$$;

create trigger project_readiness_set_org
  before insert on public.project_readiness
  for each row execute function public.set_organization_id_from_project();

create trigger project_pulse_set_org
  before insert on public.project_pulse
  for each row execute function public.set_organization_id_from_project();

create or replace function public.set_organization_id_from_client()
returns trigger
language plpgsql
as $$
begin
  select organization_id into new.organization_id
  from public.clients
  where id = new.client_id;
  return new;
end;
$$;

create trigger projects_set_org
  before insert on public.projects
  for each row execute function public.set_organization_id_from_client();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger readiness_touch before update on public.project_readiness
  for each row execute function public.touch_updated_at();
create trigger pulse_touch before update on public.project_pulse
  for each row execute function public.touch_updated_at();

-- Aggregate pulse stats (no user_id)
create or replace view public.project_pulse_stats
with (security_invoker = true)
as
select
  p.organization_id,
  p.project_id,
  count(*)::int as response_count,
  round(avg((p.ease + p.joy + p.team_support + p.clarity + p.would_return) / 5.0)::numeric, 2) as overall_avg,
  round(avg(p.ease)::numeric, 2) as ease_avg,
  round(avg(p.joy)::numeric, 2) as joy_avg,
  round(avg(p.team_support)::numeric, 2) as team_support_avg,
  round(avg(p.clarity)::numeric, 2) as clarity_avg,
  round(avg(p.would_return)::numeric, 2) as would_return_avg,
  max(p.updated_at) as last_updated
from public.project_pulse p
group by p.organization_id, p.project_id;

-- Anonymous comments feed (no user_id)
create or replace view public.project_pulse_comments
with (security_invoker = true)
as
select
  id,
  organization_id,
  project_id,
  comment,
  updated_at
from public.project_pulse
where length(trim(comment)) > 0;

-- RLS
alter table public.organizations enable row level security;
alter table public.organization_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_readiness enable row level security;
alter table public.project_pulse enable row level security;

create policy "org members can read own org"
  on public.organizations for select
  using (id = public.current_organization_id());

create policy "org members can read own domains"
  on public.organization_domains for select
  using (organization_id = public.current_organization_id());

create policy "org members can read profiles"
  on public.profiles for select
  using (organization_id = public.current_organization_id());

create policy "users can update own profile name"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and organization_id = public.current_organization_id());

create policy "org members can read clients"
  on public.clients for select
  using (organization_id = public.current_organization_id());

create policy "org members can insert clients"
  on public.clients for insert
  with check (organization_id = public.current_organization_id());

create policy "org members can update clients"
  on public.clients for update
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can delete clients"
  on public.clients for delete
  using (organization_id = public.current_organization_id());

create policy "org members can read projects"
  on public.projects for select
  using (organization_id = public.current_organization_id());

create policy "org members can insert projects"
  on public.projects for insert
  with check (organization_id = public.current_organization_id());

create policy "org members can update projects"
  on public.projects for update
  using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "org members can delete projects"
  on public.projects for delete
  using (organization_id = public.current_organization_id());

create policy "org members can read readiness"
  on public.project_readiness for select
  using (organization_id = public.current_organization_id());

create policy "users can insert own readiness"
  on public.project_readiness for insert
  with check (
    organization_id = public.current_organization_id()
    and user_id = auth.uid()
  );

create policy "users can update own readiness"
  on public.project_readiness for update
  using (user_id = auth.uid() and organization_id = public.current_organization_id())
  with check (user_id = auth.uid() and organization_id = public.current_organization_id());

create policy "users can delete own readiness"
  on public.project_readiness for delete
  using (user_id = auth.uid() and organization_id = public.current_organization_id());

-- Pulse: users can manage own vote; org can read for aggregation (UI should prefer views)
create policy "org members can read pulse"
  on public.project_pulse for select
  using (organization_id = public.current_organization_id());

create policy "users can insert own pulse"
  on public.project_pulse for insert
  with check (
    organization_id = public.current_organization_id()
    and user_id = auth.uid()
  );

create policy "users can update own pulse"
  on public.project_pulse for update
  using (user_id = auth.uid() and organization_id = public.current_organization_id())
  with check (user_id = auth.uid() and organization_id = public.current_organization_id());

create policy "users can delete own pulse"
  on public.project_pulse for delete
  using (user_id = auth.uid() and organization_id = public.current_organization_id());

-- Seed Great State org
insert into public.organizations (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Great State');

insert into public.organization_domains (organization_id, domain)
values ('11111111-1111-1111-1111-111111111111', 'greatstate.co');
