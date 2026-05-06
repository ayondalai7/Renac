"use client";
import { motion } from "framer-motion";

interface Props {
  value: number; // 0-1
  label?: string;
  color?: string;
  delay?: number;
}

export default function ConfidenceBar({ value, label, color = "var(--accent)", delay = 0 }: Props) {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{label}</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color }}>{(value * 100).toFixed(1)}%</span>
        </div>
      )}
      <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay }}
          style={{ height: "100%", background: color, borderRadius: "3px" }}
        />
      </div>
    </div>
  );
}
