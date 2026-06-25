"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInAdmin(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?reason=missing-config");
  }

  const next = normalizeNextPath(formData.get("next"));
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" ? rawPassword : "";

  if (!email) {
    redirect("/admin/login?error=missing-email");
  }

  if (!password) {
    redirect("/admin/login?error=missing-password");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(next);
}

function normalizeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin";
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/admin";
  }

  return trimmed;
}
