export const PRESENTATION_MEASUREMENT_KINDS = ["unit", "weight", "volume"] as const;
export const PRESENTATION_MEASUREMENT_UNITS = ["unit", "g", "kg", "ml", "l"] as const;

export type PresentationMeasurementKind =
  (typeof PRESENTATION_MEASUREMENT_KINDS)[number];
export type PresentationMeasurementUnit =
  (typeof PRESENTATION_MEASUREMENT_UNITS)[number];

type PresentationMeasurement = {
  measurementKind: PresentationMeasurementKind;
  amountValue: number;
  amountUnit: PresentationMeasurementUnit;
};

export function formatPresentationLabel({
  measurementKind,
  amountValue,
  amountUnit,
}: PresentationMeasurement) {
  if (measurementKind === "unit") {
    if (amountValue === 1) {
      return "unidad";
    }

    return `${formatAmountValue(amountValue)} unidades`;
  }

  return `${formatAmountValue(amountValue)}${amountUnit}`;
}

export function calculateAmountInBaseUnits({
  amountValue,
  amountUnit,
}: Pick<PresentationMeasurement, "amountValue" | "amountUnit">) {
  if (amountUnit === "kg" || amountUnit === "l") {
    return roundMeasurement(amountValue * 1000);
  }

  return roundMeasurement(amountValue);
}

export function normalizeMeasurementUnitForKind(
  measurementKind: PresentationMeasurementKind,
  amountUnit: string,
): PresentationMeasurementUnit {
  if (measurementKind === "weight") {
    return amountUnit === "kg" ? "kg" : "g";
  }

  if (measurementKind === "volume") {
    return amountUnit === "l" ? "l" : "ml";
  }

  return "unit";
}

export function parseMeasurementValue(value: string) {
  const trimmed = value.trim();
  const normalized =
    trimmed.includes(",") && trimmed.includes(".")
      ? trimmed.replace(/\./g, "").replace(",", ".")
      : trimmed.replace(",", ".");
  const amount = Number.parseFloat(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Medida invalida: ${value}`);
  }

  return roundMeasurement(amount);
}

export function formatAmountInputValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

export function inferPresentationMeasurementFromLabel(label: string): PresentationMeasurement {
  const normalized = label.trim().toLowerCase();
  const rawAmount = normalized.match(/([0-9]+(?:[.,][0-9]+)?)/)?.[1] ?? "1";
  const amountValue = parseMeasurementValue(rawAmount);

  if (normalized.includes("kg")) {
    return {
      measurementKind: "weight",
      amountValue,
      amountUnit: "kg",
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
    };
  }

  if (normalized.includes("ml")) {
    return {
      measurementKind: "volume",
      amountValue,
      amountUnit: "ml",
    };
  }

  if (
    (normalized.includes("litro") || /(^|[^a-z])l([^a-z]|$)/.test(normalized)) &&
    !normalized.includes("ml")
  ) {
    return {
      measurementKind: "volume",
      amountValue,
      amountUnit: "l",
    };
  }

  return {
    measurementKind: "unit",
    amountValue,
    amountUnit: "unit",
  };
}

function formatAmountValue(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function roundMeasurement(value: number) {
  return Math.round(value * 1000) / 1000;
}
