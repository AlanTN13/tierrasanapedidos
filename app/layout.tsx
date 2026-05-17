import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tierrasanapedidos.vercel.app"),
  title: "Tierra Sana · Dietetica & Bienestar",
  description:
    "Catalogo natural con pedido simple por WhatsApp para Tierra Sana.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Tierra Sana · Dietetica & Bienestar",
    description:
      "Catalogo natural con pedido simple por WhatsApp para Tierra Sana.",
    url: "https://tierrasanapedidos.vercel.app",
    siteName: "Tierra Sana",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/logo-tierra-sana-header.png",
        width: 1200,
        height: 1200,
        alt: "Logo Tierra Sana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tierra Sana · Dietetica & Bienestar",
    description:
      "Catalogo natural con pedido simple por WhatsApp para Tierra Sana.",
    images: ["/logo-tierra-sana-header.png"],
  },
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
