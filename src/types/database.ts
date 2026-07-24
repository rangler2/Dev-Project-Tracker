export type CompetenceLevel = "none" | "basic" | "intermediate" | "advanced";

export type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export type Profile = {
  id: string;
  organization_id: string;
  email: string;
  display_name: string;
  created_at: string;
};

export type Client = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  organization_id: string;
  client_id: string;
  name: string;
  cms: string;
  cms_version: string;
  fe_stack: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ProjectWithClient = Project & {
  clients: Pick<Client, "id" | "name"> | null;
};

export type ProjectReadiness = {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  is_set_up: boolean;
  access_dev: boolean;
  access_uat: boolean;
  access_live: boolean;
  be_level: CompetenceLevel;
  fe_level: CompetenceLevel;
  qa_level: CompetenceLevel;
  updated_at: string;
};

export type ProjectReadinessWithProfile = ProjectReadiness & {
  profiles: Pick<Profile, "id" | "display_name" | "email"> | null;
};

export type ProjectPulse = {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  ease: number;
  joy: number;
  team_support: number;
  clarity: number;
  would_return: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type ProjectPulseStats = {
  organization_id: string;
  project_id: string;
  response_count: number;
  overall_avg: number;
  ease_avg: number;
  joy_avg: number;
  team_support_avg: number;
  clarity_avg: number;
  would_return_avg: number;
  last_updated: string;
};

export type ProjectPulseComment = {
  id: string;
  organization_id: string;
  project_id: string;
  comment: string;
  updated_at: string;
};

export const COMPETENCE_LEVELS: CompetenceLevel[] = [
  "none",
  "basic",
  "intermediate",
  "advanced",
];

export const PULSE_QUESTIONS = [
  {
    key: "ease" as const,
    label: "Ease",
    prompt: "How easy is this project to work on day to day?",
  },
  {
    key: "joy" as const,
    label: "Joy",
    prompt: "How enjoyable is it to work on?",
  },
  {
    key: "team_support" as const,
    label: "Team support",
    prompt: "How well does the team support each other on this project?",
  },
  {
    key: "clarity" as const,
    label: "Clarity",
    prompt: "How clear are goals, requirements, and feedback?",
  },
  {
    key: "would_return" as const,
    label: "Would return",
    prompt: "Would you choose to work on this project again?",
  },
] as const;

export const PULSE_MIN_RESPONSES = 3;
