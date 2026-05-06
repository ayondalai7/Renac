"use client";
import { motion } from "framer-motion";
import { PredictionResponse } from "@/types";
import { formatFeatureName } from "@/lib/utils";

interface Props { result: PredictionResponse; }

export default function FeaturesTab({ result }: Props) {
  const maxAbs = Math.max(...result.shap_values.map(s => Math.abs(s.shap_value)), 0.001);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div className="card" style={{ padding: "24px 28px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Feature Contribution</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          How each of the top 10 features influenced the prediction. Red pushes toward Malignant, green toward Benign.
        </p>
      </div>

      <div className="card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {result.shap_values.map((s, i) => {
            const isPos = s.direction === "benign";
            const color = isPos ? "var(--benign)" : "var(--malignant)";
            const dimColor = isPos ? "var(--benign-dim)" : "var(--malignant-dim)";
            const pct = (Math.abs(s.shap_value) / maxAbs) * 100;

            return (
              <motion.div
                key={s.feature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                    {formatFeatureName(s.feature)}
                  </span>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      val: {s.value.toFixed(3)}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, color,
                      padding: "1px 8px", borderRadius: "999px",
                      background: dimColor, border: `1px solid ${color}`,
                    }}>
                      {isPos ? "+" : ""}{s.shap_value.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ height: "100%", background: color, borderRadius: "4px" }}
                  />
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  → Pushes toward <span style={{ color, fontWeight: 600 }}>{s.direction}</span>
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Top 10 feature values table */}
      <div className="card" style={{ padding: "28px" }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
          Input Feature Values vs Dataset Average
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {result.top10_features.map((f, i) => {
            const aboveMean = f.value > f.mean;
            return (
              <motion.div
                key={f.feature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: "16px",
                  padding: "10px 0",
                  borderBottom: i < result.top10_features.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{formatFeatureName(f.feature)}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>avg {f.mean.toFixed(3)}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: aboveMean ? "var(--malignant)" : "var(--benign)" }}>
                  {f.value.toFixed(3)}
                </span>
                <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                  background: aboveMean ? "var(--malignant-dim)" : "var(--benign-dim)",
                  color: aboveMean ? "var(--malignant)" : "var(--benign)",
                }}>
                  {aboveMean ? "↑ above" : "↓ below"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
