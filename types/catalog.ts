export type ProductCategory = string;

export type FilterCategory = "Destacados" | ProductCategory;

export type ProductPresentation = {
  etiqueta: string;
  precio: number;
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
};

export type CartItem = {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
};
