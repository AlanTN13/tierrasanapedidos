import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AdminSession = {
  userId: string;
  email: string;
  role: string;
};

export async function requireAdminUser(): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?reason=missing-config");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const userId = claims?.sub;
  const email = claims?.email;

  if (!userId || !email) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login?reason=not-admin");
  }

  return {
    userId,
    email: adminUser.email ?? email,
    role: adminUser.role,
  };
}
