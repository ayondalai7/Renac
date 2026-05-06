"use client";
import { useState, useEffect } from "react";
import { AUTH_KEY, PASSWORD } from "@/lib/constants";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    setAuthenticated(stored === "true");
  }, []);

  function login(input: string): boolean {
    if (input === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthenticated(true);
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  }

  return { authenticated, login, logout };
}
