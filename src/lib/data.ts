import { requireUser } from "@/lib/auth";
import {
  DEMO_MODE,
  demoClients,
  demoOrg,
  demoProjects,
  demoProjectsWithClient,
  demoPulse,
  demoPulseComments,
  demoPulseStats,
  demoReadiness,
} from "@/lib/demo";
import type {
  Client,
  Project,
  ProjectPulse,
  ProjectPulseComment,
  ProjectPulseStats,
  ProjectReadinessWithProfile,
  ProjectWithClient,
} from "@/types/database";

export async function getOrgName(organizationId: string) {
  if (DEMO_MODE) return demoOrg.name;
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single();
  return data?.name ?? "Organisation";
}

export async function listClients() {
  if (DEMO_MODE) return demoClients;
  const { supabase } = await requireUser();
  const { data } = await supabase.from("clients").select("*").order("name");
  return (data ?? []) as Client[];
}

export async function listProjects() {
  if (DEMO_MODE) return demoProjectsWithClient;
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("projects")
    .select("*, clients(id, name)")
    .order("name");
  return (data ?? []) as ProjectWithClient[];
}

export async function getProject(id: string) {
  if (DEMO_MODE) {
    return demoProjects.find((p) => p.id === id) ?? null;
  }
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Project | null) ?? null;
}

export async function listReadiness(projectId: string) {
  if (DEMO_MODE) {
    return demoReadiness.filter((r) => r.project_id === projectId);
  }
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("project_readiness")
    .select("*, profiles(id, display_name, email)")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as ProjectReadinessWithProfile[];
}

export async function getMyPulse(projectId: string, userId: string) {
  if (DEMO_MODE) {
    return demoPulse.project_id === projectId ? demoPulse : null;
  }
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("project_pulse")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as ProjectPulse | null) ?? null;
}

export async function getPulseStats(projectId?: string) {
  if (DEMO_MODE) {
    return projectId
      ? (demoPulseStats.find((s) => s.project_id === projectId) ?? null)
      : demoPulseStats;
  }
  const { supabase } = await requireUser();
  if (projectId) {
    const { data } = await supabase
      .from("project_pulse_stats")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();
    return (data as ProjectPulseStats | null) ?? null;
  }
  const { data } = await supabase
    .from("project_pulse_stats")
    .select("*")
    .order("overall_avg", { ascending: false });
  return (data ?? []) as ProjectPulseStats[];
}

export async function listPulseComments(projectId: string) {
  if (DEMO_MODE) {
    return demoPulseComments.filter((c) => c.project_id === projectId);
  }
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("project_pulse_comments")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })
    .limit(8);
  return (data ?? []) as ProjectPulseComment[];
}
