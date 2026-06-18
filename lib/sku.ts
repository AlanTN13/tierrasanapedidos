import type {
  PresentationMeasurementKind,
  PresentationMeasurementUnit,
} from "@/lib/presentation";

function normalizeSkuToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatSkuNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(Math.trunc(value));
  }

  return value.toFixed(3).replace(/\.?0+$/, "").replace(".", "_");
}

function buildPresentationSuffix({
  measurementKind,
  amountValue,
  amountUnit,
}: {
  measurementKind: PresentationMeasurementKind;
  amountValue: number;
  amountUnit: PresentationMeasurementUnit;
}) {
  if (measurementKind === "unit") {
    if (amountValue === 1) {
      return "UN";
    }

    return `${formatSkuNumber(amountValue)}UN`;
  }

  const suffixUnit =
    measurementKind === "weight"
      ? amountUnit === "kg"
        ? "KG"
        : "G"
      : amountUnit === "l"
        ? "L"
        : "ML";

  return `${formatSkuNumber(amountValue)}${suffixUnit}`;
}

export function generateBaseSku(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const normalized = normalizeSkuToken(value);

    if (normalized) {
      return normalized;
    }
  }

  return "PRODUCTO";
}

export function generatePresentationSku({
  baseSku,
  measurementKind,
  amountValue,
  amountUnit,
}: {
  baseSku: string;
  measurementKind: PresentationMeasurementKind;
  amountValue: number;
  amountUnit: PresentationMeasurementUnit;
}) {
  return `${generateBaseSku(baseSku)}-${buildPresentationSuffix({
    measurementKind,
    amountValue,
    amountUnit,
  })}`;
}

export function normalizeManualSku(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return normalizeSkuToken(value);
}
