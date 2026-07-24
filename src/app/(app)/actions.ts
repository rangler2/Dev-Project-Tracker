"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { CompetenceLevel } from "@/types/database";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function intScore(formData: FormData, key: string) {
  const n = Number(formData.get(key));
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new Error(`Invalid score for ${key}`);
  }
  return n;
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createClientAction(formData: FormData) {
  const { supabase, profile } = await requireUser();
  const name = str(formData, "name");
  if (!name) throw new Error("Client name is required");

  const { error } = await supabase.from("clients").insert({
    name,
    organization_id: profile.organization_id,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/projects");
}

export async function updateClientAction(formData: FormData) {
  const { supabase } = await requireUser();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!id || !name) throw new Error("Client id and name are required");

  const { error } = await supabase
    .from("clients")
    .update({ name })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/projects");
}

export async function deleteClientAction(formData: FormData) {
  const { supabase } = await requireUser();
  const id = str(formData, "id");
  if (!id) throw new Error("Client id is required");

  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/projects");
}

export async function createProjectAction(formData: FormData) {
  const { supabase, profile } = await requireUser();
  const client_id = str(formData, "client_id");
  const name = str(formData, "name");
  if (!client_id || !name) throw new Error("Client and project name are required");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: profile.organization_id,
      client_id,
      name,
      cms: str(formData, "cms"),
      cms_version: str(formData, "cms_version"),
      fe_stack: str(formData, "fe_stack"),
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/projects");
  redirect(`/projects/${data.id}`);
}

export async function updateProjectAction(formData: FormData) {
  const { supabase } = await requireUser();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const client_id = str(formData, "client_id");
  if (!id || !name || !client_id) {
    throw new Error("Project id, name, and client are required");
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      client_id,
      cms: str(formData, "cms"),
      cms_version: str(formData, "cms_version"),
      fe_stack: str(formData, "fe_stack"),
      notes: str(formData, "notes"),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProjectAction(formData: FormData) {
  const { supabase } = await requireUser();
  const id = str(formData, "id");
  if (!id) throw new Error("Project id is required");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/projects");
  redirect("/projects");
}

export async function upsertReadinessAction(formData: FormData) {
  const { supabase, profile, user } = await requireUser();
  const project_id = str(formData, "project_id");
  if (!project_id) throw new Error("Project id is required");

  const level = (value: string): CompetenceLevel => {
    if (
      value === "none" ||
      value === "basic" ||
      value === "intermediate" ||
      value === "advanced"
    ) {
      return value;
    }
    return "none";
  };

  const payload = {
    organization_id: profile.organization_id,
    project_id,
    user_id: user.id,
    is_set_up: bool(formData, "is_set_up"),
    access_dev: bool(formData, "access_dev"),
    access_uat: bool(formData, "access_uat"),
    access_live: bool(formData, "access_live"),
    be_level: level(str(formData, "be_level")),
    fe_level: level(str(formData, "fe_level")),
    qa_level: level(str(formData, "qa_level")),
  };

  const { error } = await supabase
    .from("project_readiness")
    .upsert(payload, { onConflict: "project_id,user_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${project_id}`);
}

export async function upsertPulseAction(formData: FormData) {
  const { supabase, profile, user } = await requireUser();
  const project_id = str(formData, "project_id");
  if (!project_id) throw new Error("Project id is required");

  const payload = {
    organization_id: profile.organization_id,
    project_id,
    user_id: user.id,
    ease: intScore(formData, "ease"),
    joy: intScore(formData, "joy"),
    team_support: intScore(formData, "team_support"),
    clarity: intScore(formData, "clarity"),
    would_return: intScore(formData, "would_return"),
    comment: str(formData, "comment"),
  };

  const { error } = await supabase
    .from("project_pulse")
    .upsert(payload, { onConflict: "project_id,user_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${project_id}`);
  revalidatePath("/leaderboard");
}
