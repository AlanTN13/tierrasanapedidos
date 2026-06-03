import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = path.join(repoRoot, "data/products.json");
const catalogPath = path.join(repoRoot, "lib/catalog.ts");

const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const catalogSource = fs.readFileSync(catalogPath, "utf8");

const issues = [];

function collectDuplicates(values, label) {
  const counts = new Map();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  for (const [value, count] of counts.entries()) {
    if (count > 1) {
      issues.push(`${label} duplicado: "${value}" aparece ${count} veces`);
    }
  }
}

collectDuplicates(products.map((product) => product.id), "ID");
collectDuplicates(products.map((product) => product.nombre), "Nombre");

const extraCategoriesBlock = catalogSource.match(
  /const PRODUCT_EXTRA_CATEGORIES:[\s\S]*?=\s*\{([\s\S]*?)\n\};/,
);

if (!extraCategoriesBlock) {
  issues.push("No se encontró PRODUCT_EXTRA_CATEGORIES en lib/catalog.ts");
} else {
  const keyMatches = [
    ...extraCategoriesBlock[1].matchAll(/^\s*(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:/gm),
  ];
  const keys = keyMatches.map((match) => match[1] ?? match[2]);
  collectDuplicates(keys, "Clave en PRODUCT_EXTRA_CATEGORIES");

  const disallowedFrutosSecosExtras = new Set([
    "coco-rallado",
    "miel-liquida-beepure",
    "pasta-mani-beepure",
    "pasta-mani-entrenuts-caramel",
    "pasta-mani-entrenuts-cookie",
  ]);

  for (const match of keyMatches) {
    const key = match[1] ?? match[2];
    const lineStart = match.index ?? 0;
    const lineEnd = extraCategoriesBlock[1].indexOf("\n", lineStart);
    const line =
      extraCategoriesBlock[1].slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

    if (
      disallowedFrutosSecosExtras.has(key) &&
      line.includes('"Frutos secos y snack"')
    ) {
      issues.push(
        `Cruce no permitido: "${key}" no debería mapear también a "Frutos secos y snack"`,
      );
    }
  }
}

if (issues.length > 0) {
  console.error("Catalog validation failed:\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(
  `Catalog validation passed (${products.length} productos, sin duplicados ni cruces bloqueados).`,
);
