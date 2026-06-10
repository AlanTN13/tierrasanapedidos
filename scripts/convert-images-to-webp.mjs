import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const REFERENCE_FILES = [
  "components/hero.tsx",
  "data/products.json",
  "lib/catalog-data.ts",
  "lib/catalog.ts",
  "lib/home.ts",
  "scripts/import-catalog-to-supabase.mjs",
];

const IMAGE_REFERENCE_PATTERN =
  /\/(?:productos|categorias(?:-optimized)?|hero-optimized|recetas(?:-optimized)?)\/[^"'`\s)]+\.(?:png|jpe?g)/g;

const TRANSFORM_PRESETS = [
  { prefix: "/hero-optimized/", maxDimension: 2200, quality: 80 },
  { prefix: "/categorias-optimized/", maxDimension: 1400, quality: 78 },
  { prefix: "/categorias/", maxDimension: 1400, quality: 80 },
  { prefix: "/recetas-optimized/", maxDimension: 1600, quality: 80 },
  { prefix: "/recetas/", maxDimension: 1600, quality: 80 },
  { prefix: "/productos/", maxDimension: 1600, quality: 82 },
];

const args = new Set(process.argv.slice(2));
const shouldDeleteOriginals = args.has("--delete-originals");
const shouldSyncSupabase = args.has("--sync-supabase");

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function getOutputPath(relativePath) {
  return relativePath.replace(/\.(png|jpe?g)$/i, ".webp");
}

function getPreset(relativePath) {
  return (
    TRANSFORM_PRESETS.find((preset) => relativePath.startsWith(preset.prefix)) ?? {
      maxDimension: 1600,
      quality: 80,
    }
  );
}

async function collectReferencedImages() {
  const references = new Set();

  for (const file of REFERENCE_FILES) {
    const absolutePath = path.join(repoRoot, file);
    const contents = await fs.readFile(absolutePath, "utf8");
    const matches = contents.match(IMAGE_REFERENCE_PATTERN) ?? [];

    for (const match of matches) {
      references.add(match);
    }
  }

  return [...references].sort();
}

async function convertImage(relativePath) {
  const sourcePath = path.join(repoRoot, "public", relativePath.slice(1));
  const outputRelativePath = getOutputPath(relativePath);
  const outputPath = path.join(repoRoot, "public", outputRelativePath.slice(1));
  const preset = getPreset(relativePath);

  await fs.access(sourcePath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: preset.maxDimension,
      height: preset.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: preset.quality,
      effort: 4,
    })
    .toFile(outputPath);

  if (shouldDeleteOriginals) {
    await fs.unlink(sourcePath);
  }

  return outputRelativePath;
}

async function updateReferenceFiles(replacements) {
  for (const file of REFERENCE_FILES) {
    const absolutePath = path.join(repoRoot, file);
    const originalContents = await fs.readFile(absolutePath, "utf8");
    let nextContents = originalContents;

    for (const [fromPath, toPath] of replacements) {
      nextContents = nextContents.split(fromPath).join(toPath);
    }

    if (nextContents !== originalContents) {
      await fs.writeFile(absolutePath, nextContents);
    }
  }
}

async function loadEnvFromLocalFile() {
  const envPath = path.join(repoRoot, ".env.local");

  try {
    const contents = await fs.readFile(envPath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
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
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function syncSupabasePaths(replacements) {
  await loadEnvFromLocalFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY para sincronizar rutas en Supabase.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  for (const [fromPath, toPath] of replacements) {
    if (fromPath.startsWith("/productos/")) {
      const { error } = await supabase
        .from("products")
        .update({ image_path: toPath })
        .eq("image_path", fromPath);

      if (error) {
        throw error;
      }
    }

    if (fromPath.startsWith("/categorias-optimized/")) {
      const { error } = await supabase
        .from("categories")
        .update({ image_path: toPath })
        .eq("image_path", fromPath);

      if (error) {
        throw error;
      }
    }
  }
}

async function main() {
  const referencedImages = await collectReferencedImages();

  if (referencedImages.length === 0) {
    console.log("No se encontraron imágenes JPG/PNG referenciadas para convertir.");
    return;
  }

  const replacements = [];

  for (const relativePath of referencedImages) {
    const outputRelativePath = await convertImage(relativePath);
    replacements.push([relativePath, outputRelativePath]);
  }

  await updateReferenceFiles(replacements);

  if (shouldSyncSupabase) {
    await syncSupabasePaths(replacements);
  }

  console.log(
    JSON.stringify(
      {
        converted: replacements.length,
        deletedOriginals: shouldDeleteOriginals,
        syncedSupabase: shouldSyncSupabase,
        sample: replacements.slice(0, 10).map(([fromPath, toPath]) => ({
          from: toPosixPath(fromPath),
          to: toPosixPath(toPath),
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
