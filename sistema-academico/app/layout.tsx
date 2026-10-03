import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academia Althea | Gestión académica",
  description: "Cursos, asistencia y notas de Academia Althea.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="root-body">{children}</body>
    </html>
  );
}
