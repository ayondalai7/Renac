"use client";
import { useState, useEffect } from "react";
import { Theme } from "@/types";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("recnac_theme") as Theme | null;
    const t = stored || "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("recnac_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, toggle };
}
