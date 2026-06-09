import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];

if (!email) {
  throw new Error(
    "Uso: npm run admin:create -- admin@tierrasana.com 'TuPasswordSegura123!'",
  );
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(repoRoot, ".env.local");

if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of envLines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Defini NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY para crear usuarios admin.",
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function findUserByEmail(targetEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === targetEmail,
    );

    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function main() {
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  if (!user?.id) {
    throw new Error(`No se pudo resolver el usuario auth para ${email}.`);
  }

  if (password) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });

    if (updateError) {
      throw updateError;
    }
  }

  const { error } = await supabase.from("admin_users").upsert(
    {
      user_id: user.id,
      email,
      role: "admin",
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  console.log(`Admin listo para ${email}. user_id=${user.id}`);
  console.log("Ahora ya podes entrar desde /admin/login.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
