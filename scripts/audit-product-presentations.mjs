import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const rawProducts = JSON.parse(fs.readFileSync("data/products.json", "utf8"));
const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function inferPresentation(label) {
  const normalized = String(label)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
  const amountMatch = normalized.match(/([0-9]+(?:[.,][0-9]+)?)/);
  const amountValue = amountMatch
    ? Number(String(amountMatch[1]).replace(",", "."))
    : 1;

  if (normalized.includes("kg") || normalized.includes("kilo")) {
    return {
      key: `weight:${amountValue * 1000}`,
      measurementKind: "weight",
      amountValue,
      amountUnit: "kg",
      amountInBaseUnits: amountValue * 1000,
    };
  }

  if (
    normalized.includes("gram") ||
    /(^|[^a-z])gr([^a-z]|$)/.test(normalized) ||
    /(^|[^a-z])g([^a-z]|$)/.test(normalized)
  ) {
    return {
      key: `weight:${amountValue}`,
      measurementKind: "weight",
      amountValue,
      amountUnit: "g",
      amountInBaseUnits: amountValue,
    };
  }

  if (normalized.includes("ml")) {
    return {
      key: `volume:${amountValue}`,
      measurementKind: "volume",
      amountValue,
      amountUnit: "ml",
      amountInBaseUnits: amountValue,
    };
  }

  if (normalized.includes("litro") || normalized === "l" || normalized.endsWith(" l")) {
    return {
      key: `volume:${amountValue * 1000}`,
      measurementKind: "volume",
      amountValue,
      amountUnit: "l",
      amountInBaseUnits: amountValue * 1000,
    };
  }

  return {
    key: `unit:${amountValue}`,
    measurementKind: "unit",
    amountValue,
    amountUnit: "unit",
    amountInBaseUnits: amountValue,
  };
}

function frontendWantedMap() {
  return new Map(
    rawProducts.map((product) => [
      product.id,
      {
        name: product.nombre,
        presentations: (product.presentaciones ?? []).map((presentation, index) => {
          const inferred = inferPresentation(presentation.etiqueta);

          return {
            label: presentation.etiqueta,
            priceCents: Math.round(presentation.precio * 100),
            sortOrder: index,
            ...inferred,
          };
        }),
      },
    ]),
  );
}

const wantedBySlug = frontendWantedMap();
const [{ data: products, error: productsError }, { data: presentations, error: presentationsError }] =
  await Promise.all([
    supabase.from("products").select("id, slug, name, is_active").order("name"),
    supabase
      .from("product_presentations")
      .select(
        "id, product_id, label, measurement_kind, amount_value, amount_unit, amount_in_base_units, price_cents, sort_order, is_active",
      )
      .order("sort_order"),
  ]);

if (productsError) {
  throw productsError;
}

if (presentationsError) {
  throw presentationsError;
}

const presentationsByProductId = new Map();

for (const presentation of presentations ?? []) {
  const list = presentationsByProductId.get(presentation.product_id) ?? [];
  list.push(presentation);
  presentationsByProductId.set(presentation.product_id, list);
}

const report = [];

for (const product of products ?? []) {
  const wanted = wantedBySlug.get(product.slug);

  if (!wanted) {
    continue;
  }

  const dbPresentations = presentationsByProductId.get(product.id) ?? [];
  const activePresentations = dbPresentations.filter((presentation) => presentation.is_active);
  const activeKeys = new Set(
    activePresentations.map(
      (presentation) => `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}`,
    ),
  );
  const wantedKeys = new Set(wanted.presentations.map((presentation) => presentation.key));
  const missing = wanted.presentations.filter((presentation) => !activeKeys.has(presentation.key));
  const extra = activePresentations
    .filter(
      (presentation) =>
        !wantedKeys.has(
          `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}`,
        ),
    )
    .map((presentation) => ({
      id: presentation.id,
      label: presentation.label,
      key: `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}`,
      priceCents: presentation.price_cents,
    }));
  const priceMismatches = wanted.presentations.flatMap((wantedPresentation) => {
    const match = activePresentations.find(
      (presentation) =>
        `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}` ===
        wantedPresentation.key,
    );

    if (!match || match.price_cents === wantedPresentation.priceCents) {
      return [];
    }

    return [
      {
        label: wantedPresentation.label,
        key: wantedPresentation.key,
        dbPriceCents: match.price_cents,
        frontendPriceCents: wantedPresentation.priceCents,
      },
    ];
  });

  const duplicates = Object.values(
    activePresentations.reduce((accumulator, presentation) => {
      const key = `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}`;
      const list = accumulator[key] ?? [];
      list.push({
        id: presentation.id,
        label: presentation.label,
        priceCents: presentation.price_cents,
      });
      accumulator[key] = list;
      return accumulator;
    }, {}),
  ).filter((entries) => entries.length > 1);

  if (missing.length || extra.length || priceMismatches.length || duplicates.length) {
    report.push({
      slug: product.slug,
      name: product.name,
      missing,
      extra,
      priceMismatches,
      duplicates,
    });
  }
}

console.log(JSON.stringify({ count: report.length, report }, null, 2));
