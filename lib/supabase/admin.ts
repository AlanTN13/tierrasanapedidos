import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AdminSession = {
  userId: string;
  email: string;
  role: string;
};

export type AuthenticatedSession = {
  userId: string;
  email: string;
};

function buildLoginRedirect(nextPath: string, reason?: string) {
  const searchParams = new URLSearchParams();

  if (reason) {
    searchParams.set("reason", reason);
  }

  if (nextPath) {
    searchParams.set("next", nextPath);
  }

  const query = searchParams.toString();
  return query ? `/admin/login?${query}` : "/admin/login";
}

export async function requireAuthenticatedUser(
  nextPath = "/admin",
): Promise<AuthenticatedSession> {
  if (!isSupabaseConfigured()) {
    redirect(buildLoginRedirect(nextPath, "missing-config"));
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const userId = claims?.sub;
  const email = claims?.email;

  if (!userId || !email) {
    redirect(buildLoginRedirect(nextPath));
  }

  return {
    userId,
    email,
  };
}

export async function requireAdminUser(): Promise<AdminSession> {
  const { userId, email } = await requireAuthenticatedUser("/admin");
  const supabase = await createClient();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminUser) {
    redirect(buildLoginRedirect("/admin", "not-admin"));
  }

  return {
    userId,
    email: adminUser.email ?? email,
    role: adminUser.role,
  };
}
