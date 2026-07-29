-- Security hardening for existing databases that already applied 001_initial.sql

-- 1) Prevent deleting clients that still have projects
alter table public.projects
  drop constraint if exists projects_client_id_fkey;

alter table public.projects
  add constraint projects_client_id_fkey
  foreign key (client_id) references public.clients (id) on delete restrict;

-- 2) Keep project.client_id in the same organisation on insert and update
create or replace function public.set_organization_id_from_client()
returns trigger
language plpgsql
as $$
declare
  client_org uuid;
begin
  select organization_id into client_org
  from public.clients
  where id = new.client_id;

  if client_org is null then
    raise exception 'Client not found';
  end if;

  if tg_op = 'INSERT' then
    new.organization_id := client_org;
  elsif new.organization_id is distinct from old.organization_id then
    raise exception 'Cannot change project organisation';
  elsif new.organization_id is distinct from client_org then
    raise exception 'Client must belong to the same organisation as the project';
  end if;

  return new;
end;
$$;

drop trigger if exists projects_set_org on public.projects;
create trigger projects_set_org
  before insert or update on public.projects
  for each row execute function public.set_organization_id_from_client();

create or replace function public.set_organization_id_from_project()
returns trigger
language plpgsql
as $$
begin
  select organization_id into new.organization_id
  from public.projects
  where id = new.project_id;

  if new.organization_id is null then
    raise exception 'Project not found';
  end if;

  return new;
end;
$$;

-- 3) Profiles: only display_name is mutable
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.organization_id is distinct from old.organization_id
    or new.email is distinct from old.email
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Only display_name can be updated on profiles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_columns on public.profiles;
create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- 4) Anonymous pulse: revoke org-wide SELECT; expose aggregates via definer views
drop policy if exists "org members can read pulse" on public.project_pulse;
drop policy if exists "users can read own pulse" on public.project_pulse;

create policy "users can read own pulse"
  on public.project_pulse for select
  using (
    user_id = auth.uid()
    and organization_id = public.current_organization_id()
  );

create or replace view public.project_pulse_stats
with (security_invoker = false)
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
where p.organization_id = public.current_organization_id()
group by p.organization_id, p.project_id;

create or replace view public.project_pulse_comments
with (security_invoker = false)
as
select
  id,
  organization_id,
  project_id,
  comment,
  updated_at
from public.project_pulse
where organization_id = public.current_organization_id()
  and length(trim(comment)) > 0;

grant select on public.project_pulse_stats to authenticated, anon;
grant select on public.project_pulse_comments to authenticated, anon;
