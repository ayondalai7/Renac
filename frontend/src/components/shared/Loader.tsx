"use client";
import { motion } from "framer-motion";

interface Props { message?: string; }

export default function Loader({ message = "Analysing..." }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "48px" }}>
      <div style={{ position: "relative", width: 48, height: 48 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              border: "2px solid var(--accent)",
              opacity: 0,
            }}
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.46, ease: "easeOut" }}
          />
        ))}
        <div style={{
          position: "absolute", inset: "12px",
          borderRadius: "50%",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
        }} />
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{message}</p>
    </div>
  );
}
