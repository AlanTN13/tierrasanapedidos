export type ProductCategory =
  | "Frutos secos"
  | "Semillas"
  | "Harinas"
  | "Cereales"
  | "Snacks saludables"
  | "Suplementos"
  | "Sin TACC"
  | "Ofertas";

export type FilterCategory = "Todos" | ProductCategory;

export type ProductPresentation = {
  etiqueta: "100g" | "250g" | "500g" | "1kg" | "unidad";
  precio: number;
};

export type Product = {
  id: string;
  nombre: string;
  categoria: ProductCategory;
  descripcion: string;
  presentaciones: ProductPresentation[];
  imagen: string;
  destacado: boolean;
};

export type CartItem = {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
};
