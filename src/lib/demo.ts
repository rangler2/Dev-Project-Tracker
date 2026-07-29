import type {
  Client,
  Organization,
  Profile,
  Project,
  ProjectPulse,
  ProjectPulseComment,
  ProjectPulseStats,
  ProjectReadinessWithProfile,
  ProjectWithClient,
} from "@/types/database";

const demoRequested = process.env.DEMO_MODE === "true";

// Never bypass auth in production, even if DEMO_MODE is misconfigured.
if (demoRequested && process.env.NODE_ENV === "production") {
  console.error("DEMO_MODE is ignored when NODE_ENV=production");
}

export const DEMO_MODE =
  demoRequested && process.env.NODE_ENV !== "production";

export const demoOrg: Organization = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Great State",
  created_at: "2026-01-01T00:00:00.000Z",
};

export const demoProfile: Profile = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  organization_id: demoOrg.id,
  email: "alex@greatstate.co",
  display_name: "Alex Rivera",
  created_at: "2026-01-02T00:00:00.000Z",
};

export const demoClients: Client[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    organization_id: demoOrg.id,
    name: "Northwind Retail",
    created_at: "2026-02-01T00:00:00.000Z",
    updated_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    organization_id: demoOrg.id,
    name: "Contoso Health",
    created_at: "2026-02-02T00:00:00.000Z",
    updated_at: "2026-02-02T00:00:00.000Z",
  },
];

export const demoProjects: Project[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    organization_id: demoOrg.id,
    client_id: demoClients[0].id,
    name: "Storefront relaunch",
    cms: "Sitecore 10.3",
    cms_version: "",
    fe_stack: "Next.js, TypeScript, Tailwind",
    notes: "Headless storefront with shared design system.",
    created_at: "2026-02-10T00:00:00.000Z",
    updated_at: "2026-02-10T00:00:00.000Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    organization_id: demoOrg.id,
    client_id: demoClients[1].id,
    name: "Patient portal",
    cms: "Contentful 2024",
    cms_version: "",
    fe_stack: "React, Vite, MUI",
    notes: "Auth-gated portal with appointment booking.",
    created_at: "2026-02-12T00:00:00.000Z",
    updated_at: "2026-02-12T00:00:00.000Z",
  },
];

export const demoProjectsWithClient: ProjectWithClient[] = demoProjects.map(
  (project) => ({
    ...project,
    clients: demoClients.find((c) => c.id === project.client_id) ?? null,
  }),
);

export const demoReadiness: ProjectReadinessWithProfile[] = [
  {
    id: "r1",
    organization_id: demoOrg.id,
    project_id: demoProjects[0].id,
    user_id: demoProfile.id,
    is_set_up: true,
    access_dev: true,
    access_uat: true,
    access_live: false,
    be_level: "intermediate",
    fe_level: "advanced",
    qa_level: "basic",
    updated_at: "2026-03-01T00:00:00.000Z",
    profiles: {
      id: demoProfile.id,
      display_name: demoProfile.display_name,
      email: demoProfile.email,
    },
  },
  {
    id: "r2",
    organization_id: demoOrg.id,
    project_id: demoProjects[0].id,
    user_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    is_set_up: true,
    access_dev: true,
    access_uat: false,
    access_live: false,
    be_level: "advanced",
    fe_level: "basic",
    qa_level: "none",
    updated_at: "2026-03-02T00:00:00.000Z",
    profiles: {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      display_name: "Sam Chen",
      email: "sam@greatstate.co",
    },
  },
];

export const demoPulse: ProjectPulse = {
  id: "p1",
  organization_id: demoOrg.id,
  project_id: demoProjects[0].id,
  user_id: demoProfile.id,
  ease: 4,
  joy: 5,
  team_support: 4,
  clarity: 3,
  would_return: 4,
  comment: "Great team, a bit of CMS config friction on content sync.",
  created_at: "2026-03-03T00:00:00.000Z",
  updated_at: "2026-03-03T00:00:00.000Z",
};

export const demoPulseStats: ProjectPulseStats[] = [
  {
    organization_id: demoOrg.id,
    project_id: demoProjects[0].id,
    response_count: 5,
    overall_avg: 3.8,
    ease_avg: 4.2,
    joy_avg: 4.8,
    team_support_avg: 3.2,
    clarity_avg: 2.4,
    would_return_avg: 4.0,
    last_updated: "2026-03-04T00:00:00.000Z",
  },
  {
    organization_id: demoOrg.id,
    project_id: demoProjects[1].id,
    response_count: 2,
    overall_avg: 2.8,
    ease_avg: 2.5,
    joy_avg: 3.0,
    team_support_avg: 3.5,
    clarity_avg: 2.0,
    would_return_avg: 3.0,
    last_updated: "2026-03-04T00:00:00.000Z",
  },
];

export const demoPulseComments: ProjectPulseComment[] = [
  {
    id: "c1",
    organization_id: demoOrg.id,
    project_id: demoProjects[0].id,
    comment: "Great team, a bit of CMS config friction on content sync.",
    updated_at: "2026-03-03T00:00:00.000Z",
  },
  {
    id: "c2",
    organization_id: demoOrg.id,
    project_id: demoProjects[0].id,
    comment: "Design system makes FE work enjoyable.",
    updated_at: "2026-03-02T00:00:00.000Z",
  },
];
