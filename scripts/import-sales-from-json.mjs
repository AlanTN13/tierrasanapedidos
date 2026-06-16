import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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
    "Definí NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY para importar ventas.",
  );
}

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sourceArg = args.find((value) => !value.startsWith("--"));

if (!sourceArg) {
  throw new Error(
    "Uso: node scripts/import-sales-from-json.mjs /ruta/al/archivo.json [--dry-run]",
  );
}

const sourcePath = path.resolve(process.cwd(), sourceArg);
const sourceFileName = path.basename(sourcePath);
const sourceKey = `import:whatsapp-json:${sourceFileName}`;

const PRODUCT_ALIASES = new Map([
  ["chip chocolate", "Chips de chocolate negro"],
  ["datiles pakistan", "Dátiles sin carozo Pakistán"],
  ["hummus ajo negro", "Hummus con ajo negro"],
  ["pistachos con cascara", "Pistachos con cáscara salados"],
]);

const HISTORICAL_PRODUCT_SPECS = new Map([
  [
    "crocante de arroz",
    {
      name: "Crocante de arroz",
      slug: "crocante-de-arroz-historico",
      description: "Producto histórico importado desde ventas de WhatsApp.",
      imagePath: null,
      defaultMeasurementKind: "unit",
      defaultAmountValue: 1,
      defaultAmountUnit: "unit",
      defaultPresentationLabel: "unidad",
    },
  ],
  [
    "harina de avena",
    {
      name: "Harina de avena",
      slug: "harina-de-avena-historico",
      description: "Producto histórico importado desde ventas de WhatsApp.",
      imagePath: "/productos/harina-avena-sin-tacc.svg",
      defaultMeasurementKind: "weight",
      defaultAmountValue: 500,
      defaultAmountUnit: "g",
      defaultPresentationLabel: "500g",
    },
  ],
  [
    "mani japones sabor pizza",
    {
      name: "Maní japonés sabor pizza",
      slug: "mani-japones-sabor-pizza-historico",
      description: "Producto histórico importado desde ventas de WhatsApp.",
      imagePath: null,
      defaultMeasurementKind: "weight",
      defaultAmountValue: 250,
      defaultAmountUnit: "g",
      defaultPresentationLabel: "250g",
    },
  ],
  [
    "te de arandanos y frambuesa",
    {
      name: "Té de arándanos y frambuesa",
      slug: "te-de-arandanos-y-frambuesa-historico",
      description: "Producto histórico importado desde ventas de WhatsApp.",
      imagePath: null,
      defaultMeasurementKind: "unit",
      defaultAmountValue: 1,
      defaultAmountUnit: "unit",
      defaultPresentationLabel: "unidad",
    },
  ],
  [
    "te de limon lima jengibre y menta",
    {
      name: "Té de limón, lima, jengibre y menta",
      slug: "te-de-limon-lima-jengibre-y-menta-historico",
      description: "Producto histórico importado desde ventas de WhatsApp.",
      imagePath: null,
      defaultMeasurementKind: "unit",
      defaultAmountValue: 1,
      defaultAmountUnit: "unit",
      defaultPresentationLabel: "unidad",
    },
  ],
]);

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function normalizeText(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function parseQuantity(value) {
  const quantity =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? "").replace(",", "."));

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(`Cantidad inválida: ${value}`);
  }

  return quantity;
}

function parseDateStartOfDay(value) {
  if (!value) {
    throw new Error("La venta no tiene fecha.");
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Fecha inválida: ${value}`);
  }

  return date.toISOString();
}

function inferMeasurementFromLabel(label) {
  const normalized = normalizeText(label);
  const rawAmount = normalized.match(/([0-9]+(?:[.,][0-9]+)?)/)?.[1] ?? "1";
  const amountValue = Number.parseFloat(rawAmount.replace(",", "."));

  if (
    normalized.includes("kg") ||
    normalized.includes("kilo") ||
    normalized.includes("kilos")
  ) {
    return {
      measurementKind: "weight",
      amountValue,
      amountUnit: "kg",
      amountInBaseUnits: amountValue * 1000,
      label: `${Number.isInteger(amountValue) ? amountValue : String(amountValue).replace(".", ",")} kilo`,
    };
  }

  if (
    normalized.includes("gram") ||
    /(^|[^a-z])gr([^a-z]|$)/.test(normalized) ||
    /(^|[^a-z])g([^a-z]|$)/.test(normalized)
  ) {
    return {
      measurementKind: "weight",
      amountValue,
      amountUnit: "g",
      amountInBaseUnits: amountValue,
      label: `${Number.isInteger(amountValue) ? amountValue : String(amountValue).replace(".", ",")}g`,
    };
  }

  if (normalized.includes("ml")) {
    return {
      measurementKind: "volume",
      amountValue,
      amountUnit: "ml",
      amountInBaseUnits: amountValue,
      label: `${Number.isInteger(amountValue) ? amountValue : String(amountValue).replace(".", ",")}ml`,
    };
  }

  if (
    normalized.includes("litro") ||
    normalized === "l" ||
    normalized.endsWith(" l")
  ) {
    return {
      measurementKind: "volume",
      amountValue,
      amountUnit: "l",
      amountInBaseUnits: amountValue * 1000,
      label: `${Number.isInteger(amountValue) ? amountValue : String(amountValue).replace(".", ",")}l`,
    };
  }

  return {
    measurementKind: "unit",
    amountValue: 1,
    amountUnit: "unit",
    amountInBaseUnits: 1,
    label: "unidad",
  };
}

function normalizeSourcePresentationLabel(productName, rawLabel, linePrice) {
  const normalizedProduct = normalizeText(productName);
  const normalizedLabel = normalizeText(rawLabel);

  if (!normalizedLabel || normalizedLabel === "1") {
    if (normalizedProduct === "datiles pakistan" && linePrice === 9900) {
      return "1 kilo";
    }

    return "unidad";
  }

  if (normalizedLabel === "1 kilo" || normalizedLabel === "1kg") {
    return "1 kilo";
  }

  return rawLabel.trim();
}

function parseLooseSalesFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").trimEnd();

  try {
    return JSON.parse(raw);
  } catch {
    const normalized = `${raw}\n  ]\n}\n`;
    return JSON.parse(normalized);
  }
}

async function loadCatalogState() {
  const [{ data: products, error: productsError }, { data: presentations, error: presentationsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, slug, name, description, image_path, is_active")
        .order("name", { ascending: true }),
      supabase
        .from("product_presentations")
        .select(
          "id, product_id, label, price_cents, sort_order, is_active, measurement_kind, amount_value, amount_unit, amount_in_base_units",
        )
        .order("sort_order", { ascending: true }),
    ]);

  if (productsError) {
    throw productsError;
  }

  if (presentationsError) {
    throw presentationsError;
  }

  return {
    products: products ?? [],
    presentations: presentations ?? [],
  };
}

function buildCatalogIndexes(state) {
  const productByNormalizedName = new Map();
  const presentationsByProductId = new Map();

  for (const product of state.products) {
    productByNormalizedName.set(normalizeText(product.name), product);
  }

  for (const presentation of state.presentations) {
    const list = presentationsByProductId.get(presentation.product_id) ?? [];
    list.push(presentation);
    presentationsByProductId.set(presentation.product_id, list);
  }

  return {
    productByNormalizedName,
    presentationsByProductId,
  };
}

async function ensureHistoricalProduct({
  sourceProductName,
  state,
  indexes,
  createdProducts,
}) {
  const normalizedSourceName = normalizeText(sourceProductName);
  const aliasName = PRODUCT_ALIASES.get(normalizedSourceName) ?? sourceProductName;
  const normalizedName = normalizeText(aliasName);
  const existing = indexes.productByNormalizedName.get(normalizedName);

  if (existing) {
    return existing;
  }

  const spec = HISTORICAL_PRODUCT_SPECS.get(normalizedSourceName);

  if (!spec) {
    throw new Error(`No encontré producto en catálogo para "${sourceProductName}".`);
  }

  const desiredSlug = spec.slug;
  let finalSlug = desiredSlug;
  let suffix = 2;

  while (state.products.some((product) => product.slug === finalSlug)) {
    finalSlug = `${desiredSlug}-${suffix}`;
    suffix += 1;
  }

  if (dryRun) {
    const dryRunProduct = {
      id: `dry-run-product-${finalSlug}`,
      slug: finalSlug,
      name: spec.name,
      description: spec.description,
      image_path: spec.imagePath,
      is_active: false,
    };

    state.products.push(dryRunProduct);
    indexes.productByNormalizedName.set(normalizeText(dryRunProduct.name), dryRunProduct);
    createdProducts.push(dryRunProduct.name);
    return dryRunProduct;
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      slug: finalSlug,
      name: spec.name,
      description: spec.description,
      image_path: spec.imagePath,
      tags: ["historico", "whatsapp"],
      is_featured: false,
      featured_order: null,
      is_active: false,
    })
    .select("id, slug, name, description, image_path, is_active")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? `No pude crear el producto "${spec.name}".`);
  }

  state.products.push(inserted);
  indexes.productByNormalizedName.set(normalizeText(inserted.name), inserted);
  createdProducts.push(inserted.name);
  return inserted;
}

async function ensurePresentation({
  product,
  sourceProductName,
  rawLabel,
  quantity,
  linePrice,
  state,
  indexes,
  createdPresentations,
}) {
  const normalizedSourceName = normalizeText(sourceProductName);
  const spec = HISTORICAL_PRODUCT_SPECS.get(normalizedSourceName);
  const normalizedLabel = normalizeSourcePresentationLabel(
    sourceProductName,
    rawLabel,
    linePrice,
  );
  const presentationLabel = spec?.defaultPresentationLabel && normalizeText(rawLabel) === "1"
    ? spec.defaultPresentationLabel
    : normalizedLabel;
  const normalizedPresentationLabel = normalizeText(presentationLabel);
  const existingPresentations = indexes.presentationsByProductId.get(product.id) ?? [];
  const existing = existingPresentations.find(
    (presentation) => normalizeText(presentation.label) === normalizedPresentationLabel,
  );

  if (existing) {
    return existing;
  }

  const measurement = spec && (!rawLabel || normalizeText(rawLabel) === "1")
    ? {
        measurementKind: spec.defaultMeasurementKind,
        amountValue: spec.defaultAmountValue,
        amountUnit: spec.defaultAmountUnit,
        amountInBaseUnits:
          spec.defaultAmountUnit === "kg" || spec.defaultAmountUnit === "l"
            ? spec.defaultAmountValue * 1000
            : spec.defaultAmountValue,
        label: spec.defaultPresentationLabel,
      }
    : inferMeasurementFromLabel(presentationLabel);

  const unitPriceValue =
    typeof linePrice === "number" && Number.isFinite(linePrice) && quantity > 0
      ? Math.round((linePrice * 100) / quantity)
      : 0;

  const nextSortOrder =
    existingPresentations.length > 0
      ? Math.max(...existingPresentations.map((item) => item.sort_order ?? 0)) + 1
      : 0;

  if (dryRun) {
    const dryRunPresentation = {
      id: `dry-run-presentation-${product.slug}-${slugify(presentationLabel)}`,
      product_id: product.id,
      label: measurement.label,
      price_cents: unitPriceValue,
      sort_order: nextSortOrder,
      is_active: false,
      measurement_kind: measurement.measurementKind,
      amount_value: measurement.amountValue,
      amount_unit: measurement.amountUnit,
      amount_in_base_units: measurement.amountInBaseUnits,
    };

    state.presentations.push(dryRunPresentation);
    indexes.presentationsByProductId.set(product.id, [
      ...existingPresentations,
      dryRunPresentation,
    ]);
    createdPresentations.push(`${product.name} · ${measurement.label}`);
    return dryRunPresentation;
  }

  const { data: inserted, error } = await supabase
    .from("product_presentations")
    .insert({
      product_id: product.id,
      label: measurement.label,
      price_cents: unitPriceValue,
      sort_order: nextSortOrder,
      is_active: false,
      measurement_kind: measurement.measurementKind,
      amount_value: measurement.amountValue,
      amount_unit: measurement.amountUnit,
      amount_in_base_units: measurement.amountInBaseUnits,
    })
    .select(
      "id, product_id, label, price_cents, sort_order, is_active, measurement_kind, amount_value, amount_unit, amount_in_base_units",
    )
    .single();

  if (error || !inserted) {
    throw new Error(
      error?.message ??
        `No pude crear la presentación "${measurement.label}" para "${product.name}".`,
    );
  }

  state.presentations.push(inserted);
  indexes.presentationsByProductId.set(product.id, [...existingPresentations, inserted]);
  createdPresentations.push(`${product.name} · ${inserted.label}`);
  return inserted;
}

async function loadLatestCostByPresentationId() {
  const { data, error } = await supabase
    .from("inventory_summary_by_presentation")
    .select("product_presentation_id, last_unit_cost_cents");

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => [row.product_presentation_id, row.last_unit_cost_cents ?? 0]),
  );
}

async function getAdminUserId() {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw error;
  }

  const adminUser = data?.[0];

  if (!adminUser) {
    throw new Error("No encontré usuarios admin para asignar las ventas importadas.");
  }

  return adminUser.user_id;
}

async function saleAlreadyImported(note) {
  const { data, error } = await supabase
    .from("sales")
    .select("id")
    .eq("notes", note)
    .limit(1);

  if (error) {
    throw error;
  }

  return Boolean(data?.length);
}

function buildImportNote({ sourceDescription, orderIndex }) {
  const suffix = sourceDescription ? ` | descripcion: ${sourceDescription}` : "";
  return `${sourceKey} | pedido: ${orderIndex}${suffix}`;
}

async function main() {
  const parsed = parseLooseSalesFile(sourcePath);
  const orders = Array.isArray(parsed) ? parsed : parsed.pedidos;

  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error("El archivo no contiene pedidos para importar.");
  }

  const state = await loadCatalogState();
  const indexes = buildCatalogIndexes(state);
  const latestCostByPresentationId = await loadLatestCostByPresentationId();
  const adminUserId = await getAdminUserId();
  const createdProducts = [];
  const createdPresentations = [];
  const inferredPrices = [];
  const importedSales = [];
  const skippedSales = [];

  for (const [index, order] of orders.entries()) {
    const orderIndex = index + 1;
    const note = buildImportNote({
      sourceDescription: order.descripcion?.trim() || "",
      orderIndex,
    });

    if (await saleAlreadyImported(note)) {
      skippedSales.push(orderIndex);
      continue;
    }

    const soldAt = parseDateStartOfDay(order.fecha);
    const channel = order.cliente?.trim() || "Sin nombre";
    const saleItems = [];

    for (const item of order.items ?? []) {
      const product = await ensureHistoricalProduct({
        sourceProductName: item.producto,
        state,
        indexes,
        createdProducts,
      });
      const presentation = await ensurePresentation({
        product,
        sourceProductName: item.producto,
        rawLabel: item.gramaje ?? "",
        quantity: parseQuantity(item.cantidad),
        linePrice: item.precio,
        state,
        indexes,
        createdPresentations,
      });
      const quantityValue = parseQuantity(item.cantidad);
      const fallbackLinePrice =
        typeof item.precio === "number" && Number.isFinite(item.precio)
          ? item.precio
          : Math.round((presentation.price_cents * quantityValue) / 100);

      if (typeof item.precio !== "number" || !Number.isFinite(item.precio)) {
        inferredPrices.push({
          order: orderIndex,
          product: item.producto,
          presentation: presentation.label,
          inferredLinePrice: fallbackLinePrice,
        });
      }

      const lineTotalCents = Math.round(fallbackLinePrice * 100);
      const unitPriceCents =
        quantityValue > 0 ? Math.round(lineTotalCents / quantityValue) : lineTotalCents;
      const unitCostSnapshotCents = latestCostByPresentationId.get(presentation.id) ?? 0;
      const lineMarginCents =
        lineTotalCents - Math.round(unitCostSnapshotCents * quantityValue);

      saleItems.push({
        product_presentation_id: presentation.id,
        quantity: String(quantityValue),
        unit_price_cents: unitPriceCents,
        unit_cost_snapshot_cents: unitCostSnapshotCents,
        line_total_cents: lineTotalCents,
        line_margin_cents: lineMarginCents,
      });
    }

    if (saleItems.length === 0) {
      skippedSales.push(orderIndex);
      continue;
    }

    if (dryRun) {
      importedSales.push({
        orderIndex,
        channel,
        soldAt,
        items: saleItems.length,
      });
      continue;
    }

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        sold_at: soldAt,
        channel,
        notes: note,
        created_by: adminUserId,
      })
      .select("id")
      .single();

    if (saleError || !sale) {
      throw new Error(saleError?.message ?? `No pude crear la venta ${orderIndex}.`);
    }

    const { error: itemsError } = await supabase.from("sale_items").insert(
      saleItems.map((saleItem) => ({
        sale_id: sale.id,
        ...saleItem,
      })),
    );

    if (itemsError) {
      await supabase.from("sales").delete().eq("id", sale.id);
      throw new Error(itemsError.message);
    }

    importedSales.push({
      orderIndex,
      saleId: sale.id,
      channel,
      soldAt,
      items: saleItems.length,
    });
  }

  console.log(
    JSON.stringify(
      {
        source: sourceFileName,
        dryRun,
        totalOrders: orders.length,
        importedSales: importedSales.length,
        skippedSales: skippedSales.length,
        createdProducts,
        createdPresentations,
        inferredPrices,
        sample: importedSales.slice(0, 5),
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
