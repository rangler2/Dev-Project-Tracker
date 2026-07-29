#!/usr/bin/env node
/**
 * Patches the Supabase hosted "Confirm signup" email template so corporate
 * Safe Links / prefetch tools stop consuming the one-time confirmation URL.
 *
 * Requires:
 *   SUPABASE_ACCESS_TOKEN  – https://supabase.com/dashboard/account/tokens
 *   SUPABASE_PROJECT_REF   – project id from the dashboard URL
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... npm run auth:template
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error(`Missing env vars.

Set:
  SUPABASE_ACCESS_TOKEN  (https://supabase.com/dashboard/account/tokens)
  SUPABASE_PROJECT_REF   (e.g. abcdxyz from https://supabase.com/dashboard/project/abcdxyz)

Then run:
  npm run auth:template
`);
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(
  join(root, "supabase/templates/confirm_signup.html"),
  "utf8",
);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mailer_subjects_confirmation: "Confirm your Project Tracker email",
      mailer_templates_confirmation_content: html,
    }),
  },
);

if (!res.ok) {
  const body = await res.text();
  console.error(`Failed to update template (${res.status}):\n${body}`);
  process.exit(1);
}

console.log(`Updated Confirm signup template for project ${projectRef}.
New signups will email a 6-digit code + /auth/confirm link.
Also ensure Redirect URLs include:
  http://localhost:3000/auth/confirm
  http://localhost:3000/auth/callback
`);
