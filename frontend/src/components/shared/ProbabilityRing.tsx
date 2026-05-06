"use client";
import { motion } from "framer-motion";

interface Props {
  probability: number; // 0-1
  label: "Malignant" | "Benign";
}

export default function ProbabilityRing({ probability, label }: Props) {
  const size    = 180;
  const stroke  = 10;
  const r       = (size - stroke) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - probability * circ;
  const color   = label === "Benign" ? "var(--benign)" : "var(--malignant)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ fontSize: "32px", fontWeight: 700, color, lineHeight: 1, fontFamily: "var(--font-body)" }}
          >
            {(probability * 100).toFixed(1)}%
          </motion.span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>probability</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          padding: "8px 24px",
          borderRadius: "999px",
          background: label === "Benign" ? "var(--benign-dim)" : "var(--malignant-dim)",
          border: `1px solid ${color}`,
          color,
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </motion.div>
    </div>
  );
}
