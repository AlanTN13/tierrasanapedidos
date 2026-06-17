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

const wantedBySlug = new Map(
  rawProducts.map((product) => [
    product.id,
    (product.presentaciones ?? []).map((presentation, index) => ({
      label: presentation.etiqueta,
      priceCents: Math.round(presentation.precio * 100),
      sortOrder: index,
      ...inferPresentation(presentation.etiqueta),
    })),
  ]),
);

const [{ data: products, error: productsError }, { data: presentations, error: presentationsError }] =
  await Promise.all([
    supabase.from("products").select("id, slug, name").order("name"),
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

const productBySlug = new Map((products ?? []).map((product) => [product.slug, product]));
const presentationsByProductId = new Map();

for (const presentation of presentations ?? []) {
  const list = presentationsByProductId.get(presentation.product_id) ?? [];
  list.push(presentation);
  presentationsByProductId.set(presentation.product_id, list);
}

const changes = [];

for (const [slug, wantedPresentations] of wantedBySlug.entries()) {
  const product = productBySlug.get(slug);

  if (!product) {
    continue;
  }

  const dbPresentations = presentationsByProductId.get(product.id) ?? [];
  const activePresentations = dbPresentations.filter((presentation) => presentation.is_active);

  for (const wanted of wantedPresentations) {
    const matches = activePresentations.filter(
      (presentation) =>
        `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}` === wanted.key,
    );
    const preferred =
      matches.find((presentation) => presentation.price_cents === wanted.priceCents) ??
      matches.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

    if (preferred) {
      changes.push({
        type: "upsert-existing",
        id: preferred.id,
        productId: product.id,
        productSlug: slug,
        payload: {
          label: wanted.label,
          measurement_kind: wanted.measurementKind,
          amount_value: String(wanted.amountValue),
          amount_unit: wanted.amountUnit,
          amount_in_base_units: String(wanted.amountInBaseUnits),
          price_cents: wanted.priceCents,
          sort_order: wanted.sortOrder,
          is_active: true,
        },
      });

      for (const duplicate of matches) {
        if (duplicate.id === preferred.id) {
          continue;
        }

        changes.push({
          type: "deactivate-duplicate",
          id: duplicate.id,
          productId: product.id,
          productSlug: slug,
          payload: {
            is_active: false,
          },
        });
      }

      continue;
    }

    const fallbackSameLabel = dbPresentations.find(
      (presentation) =>
        presentation.label === wanted.label ||
        `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}` ===
          wanted.key,
    );

    if (fallbackSameLabel) {
      changes.push({
        type: "repurpose-existing",
        id: fallbackSameLabel.id,
        productId: product.id,
        productSlug: slug,
        payload: {
          label: wanted.label,
          measurement_kind: wanted.measurementKind,
          amount_value: String(wanted.amountValue),
          amount_unit: wanted.amountUnit,
          amount_in_base_units: String(wanted.amountInBaseUnits),
          price_cents: wanted.priceCents,
          sort_order: wanted.sortOrder,
          is_active: true,
        },
      });
      continue;
    }

    changes.push({
      type: "insert-missing",
      id: null,
      productId: product.id,
      productSlug: slug,
      payload: {
        product_id: product.id,
        label: wanted.label,
        measurement_kind: wanted.measurementKind,
        amount_value: String(wanted.amountValue),
        amount_unit: wanted.amountUnit,
        amount_in_base_units: String(wanted.amountInBaseUnits),
        price_cents: wanted.priceCents,
        sort_order: wanted.sortOrder,
        is_active: true,
      },
    });
  }

  const wantedKeys = new Set(wantedPresentations.map((presentation) => presentation.key));
  const extras = activePresentations.filter(
    (presentation) =>
      !wantedKeys.has(
        `${presentation.measurement_kind}:${Number(presentation.amount_in_base_units)}`,
      ),
  );

  for (const extra of extras) {
    changes.push({
      type: "deactivate-extra",
      id: extra.id,
      productId: product.id,
      productSlug: slug,
      payload: {
        is_active: false,
      },
    });
  }
}

const grouped = new Map();

for (const change of changes) {
  const list = grouped.get(change.productSlug) ?? [];
  list.push(change);
  grouped.set(change.productSlug, list);
}

const summary = [];

for (const [slug, productChanges] of grouped.entries()) {
  for (const change of productChanges) {
    if (change.type === "insert-missing") {
      const { error } = await supabase.from("product_presentations").insert(change.payload);

      if (error) {
        throw new Error(`${slug}: ${error.message}`);
      }

      continue;
    }

    const { error } = await supabase
      .from("product_presentations")
      .update(change.payload)
      .eq("id", change.id);

    if (error) {
      throw new Error(`${slug}: ${error.message}`);
    }
  }

  summary.push({
    slug,
    operations: productChanges.map((change) => change.type),
  });
}

console.log(JSON.stringify({ updatedProducts: summary.length, summary }, null, 2));
