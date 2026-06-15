export type ProductCategory = string;

export type FilterCategory = "Destacados" | ProductCategory;

export type ProductPresentation = {
  id?: string;
  etiqueta: string;
  precio: number;
  measurementKind: "unit" | "weight" | "volume";
  amountValue: number;
  amountUnit: "unit" | "g" | "kg" | "ml" | "l";
  amountInBaseUnits: number;
  sortOrder?: number;
  activa?: boolean;
};

export type Product = {
  id: string;
  nombre: string;
  categoria: ProductCategory;
  categorias?: ProductCategory[];
  descripcion: string;
  tags?: string[];
  presentaciones: ProductPresentation[];
  imagen: string;
  destacado: boolean;
  featuredOrder?: number | null;
};

export type CatalogCategory = {
  id: string;
  slug: string;
  name: ProductCategory;
  image: string;
  searchTags: string[];
  sortOrder: number;
  isActive: boolean;
};

export type CartItem = {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
};
