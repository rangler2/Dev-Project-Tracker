-- Optional demo data for the seeded Great State organisation.
-- Safe to re-run only on an empty clients table.

insert into public.clients (id, organization_id, name)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'Northwind Retail'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'Contoso Health')
on conflict (id) do nothing;

insert into public.projects (
  id, organization_id, client_id, name, cms, cms_version, fe_stack, notes
)
values
  (
    '33333333-3333-3333-3333-333333333301',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222201',
    'Storefront relaunch',
    'Sitecore 10.3',
    '',
    'Next.js, TypeScript, Tailwind',
    'Headless storefront with shared design system.'
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222202',
    'Patient portal',
    'Contentful 2024',
    '',
    'React, Vite, MUI',
    'Auth-gated portal with appointment booking.'
  )
on conflict (id) do nothing;
