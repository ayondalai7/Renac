"use client";
import { motion } from "framer-motion";
import { Theme } from "@/types";
import { DISCLAIMER } from "@/lib/constants";

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onReset: () => void;
  hasResult: boolean;
}

export default function Navbar({ theme, onToggleTheme, onReset, hasResult }: Props) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* Disclaimer */}
      <div className="disclaimer" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
        {DISCLAIMER}
      </div>

      {/* Main nav */}
      <div style={{
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        padding: "0 clamp(12px, 3vw, 24px)",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "8px",
            background: "var(--accent-dim)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="var(--accent)" strokeWidth="1.2"/>
              <path d="M7 4v3l2 1" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display" style={{ fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Recnac
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {hasResult && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="btn-secondary"
              onClick={onReset}
              style={{ padding: "7px 16px", fontSize: "12px" }}
            >
              New Analysis
            </motion.button>
          )}
          <button
            onClick={onToggleTheme}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M8 3V1M8 15v-2M3 8H1M15 8h-2M4.22 4.22 2.8 2.8M13.2 13.2l-1.42-1.42M4.22 11.78 2.8 13.2M13.2 2.8l-1.42 1.42" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="3" stroke="var(--text-secondary)" strokeWidth="1.2"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M13.5 8.5A5.5 5.5 0 0 1 7.5 2.5a5.5 5.5 0 1 0 6 6z" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
