import type { Metadata } from "next";
import "@/styles/app.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "SA-studios | Sistema académico",
  description: "Gestión académica y administrativa",
  icons: { icon: "/sa-studios-logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body><ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider></body></html>;
}
