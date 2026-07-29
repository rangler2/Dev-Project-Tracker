# Dev Project Tracker

Internal multi-tenant agency app for tracking clients, project stack info, developer readiness, and anonymous project pulse scores.

## Features

- **Email-domain tenancy** — users join an organisation when their work email domain is allow-listed (seeded: `greatstate.co` → Great State). Other domains cannot sign up.
- **Clients & projects** — anyone in the org can create/edit clients and projects (CMS, version, FE stack, notes).
- **Developer readiness** — each person updates only their own setup, env access (dev/UAT/live), and BE/FE/QA competence; the whole org can view the team table.
- **Anonymous pulse** — 1–5 scores for ease, joy, team support, clarity, and would-return, plus optional comment. Leaderboard ranks projects with 3+ responses.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth + Postgres (RLS)

## Setup

1. Create a Supabase project.
2. Copy env vars:

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase dashboard.

3. Run the SQL migration in the Supabase SQL editor (or via Supabase CLI):

- [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql)

Optional demo clients/projects:

- [`supabase/seed.sql`](supabase/seed.sql)

4. In Supabase Auth → URL configuration:
   - **Site URL**: `http://localhost:3000` (or your deployed origin)
   - **Redirect URLs**: include `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/confirm` (plus the same paths on your production origin)

5. **Required — replace the Confirm signup email template.**  
   The default Supabase `{{ .ConfirmationURL }}` link is opened by corporate Safe Links / email scanners, which confirms the account and then shows `otp_expired` when you click it.

   Apply the project template (includes a 6-digit code + safe confirm page):

```bash
# Token: https://supabase.com/dashboard/account/tokens
# Project ref: from https://supabase.com/dashboard/project/<ref>
SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... npm run auth:template
```

   Or paste [`supabase/templates/confirm_signup.html`](supabase/templates/confirm_signup.html) into **Authentication → Email Templates → Confirm signup** in the dashboard.

   After that, new signups enter the **6-digit code** in the app (do not rely on the email link).

   Alternatively, disable email confirmation under Auth settings for faster internal onboarding.

6. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up with an `@greatstate.co` email.

## Adding another organisation

Insert into `organizations` and `organization_domains`:

```sql
insert into organizations (name) values ('Other Agency') returning id;
-- then:
insert into organization_domains (organization_id, domain)
values ('<org-id>', 'otheragency.com');
```

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — ESLint
