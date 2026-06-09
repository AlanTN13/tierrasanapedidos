import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(repoRoot, ".env.local");
const productsPath = path.join(repoRoot, "data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

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

const CATEGORY_CONFIG = [
  ["Frutos secos y snack", "/categorias-optimized/frutos-secos-y-snack.jpg", ["frutos secos", "snack", "colacion", "mix"]],
  ["Semillas", "/categorias-optimized/semillas.jpg", ["semillas", "topping", "desayuno"]],
  ["Harinas y premezclas", "/categorias-optimized/harinas-y-premezclas.jpg", ["harinas", "premezclas", "panificados"]],
  ["Sin TACC", "/categorias-optimized/sin-tacc.jpg", ["sin tacc", "celiacos", "gluten free"]],
  ["Cereales y granolas", "/categorias-optimized/cereales-y-granolas.jpg", ["cereales", "granolas", "desayuno", "merienda"]],
  ["Sin azucar", "/categorias-optimized/sin-azucar.jpg", ["sin azucar", "light"]],
  ["Dulces y untables", "/categorias-optimized/dulces-y-untables.jpg", ["dulces", "untables", "mermeladas", "miel", "pasta de mani"]],
  ["Legumbres", "/categorias-optimized/legumbres.jpg", ["legumbres", "porotos", "garbanzos", "lentejas"]],
  ["Arroces y oriental", "/categorias-optimized/arroces-y-oriental.jpg", ["arroz", "oriental", "sushi", "papel de arroz"]],
  ["Condimentos y especias", "/categorias-optimized/condimentos-y-especias.jpg", ["condimentos", "especias", "sabor", "cocina"]],
  ["Galletitas", "/categorias-optimized/galletitas.jpg", ["galletitas", "cookies", "snack"]],
  ["Reposteria y endulzantes", "/categorias-optimized/reposteria.jpg", ["reposteria", "hornear", "postres", "dulce", "endulzantes", "azucar", "stevia"]],
  ["Aceites y salsas de soja", "/categorias-optimized/aceites-y-salsas-de-soja.jpg", ["aceites", "salsas", "soja", "cocina", "aderezos"]],
];

const LEGACY_TO_FINAL_CATEGORY_MAP = {
  Aceites: ["Aceites y salsas de soja"],
  "Arroz y Gourmet": ["Arroces y oriental"],
  Cereales: ["Cereales y granolas"],
  "Dulces & Untables": ["Dulces y untables"],
  Especias: ["Condimentos y especias"],
  "Frutos secos y snacks": ["Frutos secos y snack"],
  Galletitas: ["Galletitas"],
  Harinas: ["Harinas y premezclas"],
  Legumbres: ["Legumbres"],
  Reposteria: ["Reposteria y endulzantes"],
  Semillas: ["Semillas"],
};

const PRODUCT_EXTRA_CATEGORIES = {
  almendra: ["Sin azucar", "Sin TACC"],
  "arroz-koshihikari-sushi": ["Sin TACC"],
  "arroz-yamani-integral": ["Sin TACC"],
  "avena-instantanea": ["Sin azucar"],
  "avena-tradicional": ["Sin azucar"],
  "arroz-inflado": ["Sin azucar", "Sin TACC"],
  "cacao-amargo-alcalino": ["Sin azucar", "Sin TACC"],
  "canela-en-polvo": ["Reposteria y endulzantes"],
  "castanas-de-caju": ["Sin azucar", "Sin TACC"],
  "chia-premium": ["Sin azucar", "Sin TACC"],
  "coco-rallado": ["Sin azucar", "Sin TACC"],
  "fecula-de-mandioca": ["Sin TACC"],
  "galletas-de-arroz-con-sal": ["Sin TACC"],
  "galletas-de-arroz-dulces": ["Sin TACC"],
  "galletas-de-arroz-sin-sal": ["Sin TACC"],
  girasol: ["Sin azucar", "Sin TACC"],
  garbanzos: ["Sin TACC"],
  "harina-de-almendras": ["Reposteria y endulzantes", "Sin azucar", "Sin TACC"],
  "harina-de-arroz": ["Sin azucar", "Sin TACC"],
  "harina-de-coco": ["Sin azucar", "Sin TACC"],
  "harina-integral": ["Sin azucar", "Sin TACC"],
  lino: ["Sin azucar", "Sin TACC"],
  lentejas: ["Sin TACC"],
  "maiz-inflado": ["Sin azucar", "Sin TACC"],
  "mix-con-avellanas": ["Sin azucar", "Sin TACC"],
  "mix-de-semillas": ["Sin azucar", "Sin TACC"],
  "nuez-mariposa": ["Sin azucar", "Sin TACC"],
  "pasta-mani-beepure": ["Sin azucar"],
  "pistachos-pelados": ["Sin azucar", "Sin TACC"],
  "porotos-de-alubia": ["Sin TACC"],
  "porotos-negros": ["Sin TACC"],
  "premezcla-bizcochuelo-chocolate-dona-pacha": ["Sin TACC"],
  "premezcla-bizcochuelo-vainilla-dona-pacha": ["Sin TACC"],
  "premezcla-brownie-dona-pacha": ["Sin TACC"],
  "quinoa-inflada": ["Sin azucar", "Sin TACC"],
  "stevia-hileret-50-sobres": ["Sin azucar"],
  "stevia-hileret-liquido-200cc": ["Sin azucar"],
  "zucra-hileret-liquido-200cc": ["Sin azucar"],
};

const FEATURED_PRODUCT_ORDER = [
  "mix-con-avellanas",
  "chia-premium",
  "granola-tropical",
  "harina-de-almendras",
  "pasta-mani-entrenuts-caramel",
  "pistachos-con-cascara",
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Definí NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY para importar el catálogo.",
  );
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveCategories(product) {
  const sourceCategories =
    product.categorias && product.categorias.length > 0
      ? product.categorias
      : [
          ...(LEGACY_TO_FINAL_CATEGORY_MAP[product.categoria] ?? [product.categoria]),
          ...(PRODUCT_EXTRA_CATEGORIES[product.id] ?? []),
        ];

  return [...new Set(sourceCategories)].filter(Boolean);
}

async function main() {
  for (const [index, [name, imagePath, searchTags]] of CATEGORY_CONFIG.entries()) {
    const { error } = await supabase.from("categories").upsert(
      {
        slug: slugify(name),
        name,
        image_path: imagePath,
        search_tags: searchTags,
        sort_order: index,
        is_active: true,
      },
      { onConflict: "slug" },
    );

    if (error) {
      throw error;
    }
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  if (categoriesError) {
    throw categoriesError;
  }

  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));

  for (const product of products) {
    const { data: storedProduct, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          slug: product.id,
          name: product.nombre,
          description: product.descripcion,
          image_path: product.imagen,
          tags: product.tags ?? [],
          is_featured: product.destacado,
          featured_order: FEATURED_PRODUCT_ORDER.indexOf(product.id),
          is_active: true,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (productError) {
      throw productError;
    }

    const resolvedCategories = resolveCategories(product)
      .map((categoryName) => categoryIdByName.get(categoryName))
      .filter(Boolean);

    await supabase.from("product_presentations").delete().eq("product_id", storedProduct.id);
    await supabase.from("product_categories").delete().eq("product_id", storedProduct.id);

    const { error: presentationsError } = await supabase.from("product_presentations").insert(
      product.presentaciones.map((presentation, index) => ({
        product_id: storedProduct.id,
        label: presentation.etiqueta,
        price_cents: Math.round(presentation.precio * 100),
        sort_order: index,
        is_active: true,
      })),
    );

    if (presentationsError) {
      throw presentationsError;
    }

    const { error: categoriesInsertError } = await supabase.from("product_categories").insert(
      resolvedCategories.map((categoryId, index) => ({
        product_id: storedProduct.id,
        category_id: categoryId,
        sort_order: index,
      })),
    );

    if (categoriesInsertError) {
      throw categoriesInsertError;
    }
  }

  console.log(`Catálogo importado: ${products.length} productos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
