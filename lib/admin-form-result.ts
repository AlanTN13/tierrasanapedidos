export type AdminFormResult = {
  error: string;
  field?: string;
  fieldIndex?: number;
  reference?: string;
  resume?: { productId: string; existingImagePath: string };
};

export type AdminFormAction = (formData: FormData) => Promise<void | AdminFormResult>;

export class AdminInputError extends Error {
  field?: string;
  fieldIndex?: number;

  constructor(message: string, field?: string, fieldIndex?: number) {
    super(message);
    this.name = "AdminInputError";
    this.field = field;
    this.fieldIndex = fieldIndex;
  }
}

export const UNKNOWN_SAVE_ERROR =
  "No pudimos confirmar que se hayan guardado todos los cambios. Conservamos lo que cargaste en este formulario. Revisá el listado antes de volver a guardar para evitar duplicados.";

// Only known application errors become user-facing text. Database details stay server-side.
export function productErrorResult(error: unknown): AdminFormResult {
  if (error instanceof AdminInputError) {
    return { error: error.message, field: error.field, fieldIndex: error.fieldIndex };
  }

  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";

  if (message.includes("products_base_sku_unique_idx")) {
    return {
      error: "Este SKU base ya existe. Si es el mismo producto, abrilo desde Editar. Si es otro producto, usá un SKU base distinto.",
      field: "baseSku",
    };
  }
  if (message.includes("products_slug_key")) {
    return { error: "Este slug ya existe. Editá el producto existente o elegí otro slug.", field: "slug" };
  }
  if (message.includes("product_presentations_sku_unique_idx")) {
    return {
      error: "El SKU de una presentación ya existe. Revisá los SKU manuales y evitá repetir presentaciones.",
      field: "presentationSkuOverride",
    };
  }
  return { error: UNKNOWN_SAVE_ERROR };
}
