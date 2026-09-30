"use client";

import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Cambiar a tema ${dark ? "claro" : "oscuro"}`} title={`Cambiar a tema ${dark ? "claro" : "oscuro"}`}>
    <span className="theme-icon" aria-hidden="true">{dark ? "☀" : "☾"}</span><span>{dark ? "Tema claro" : "Tema oscuro"}</span>
  </button>;
}
