import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ferro Velho",
  description: "Sistema de Gestão para Ferro Velho",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
