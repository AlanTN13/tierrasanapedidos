import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tierra Sana · Dietetica & Bienestar",
  description:
    "Catalogo natural con pedido simple por WhatsApp para Tierra Sana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
