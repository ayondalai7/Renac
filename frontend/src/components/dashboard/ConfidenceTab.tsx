"use client";
import { motion } from "framer-motion";
import { PredictionResponse } from "@/types";
import ConfidenceBar from "@/components/shared/ConfidenceBar";

interface Props { result: PredictionResponse; }

export default function ConfidenceTab({ result }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Header */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Model Confidence</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Confidence score of the selected model + predictions across all 5 classifiers.
        </p>
      </div>

      {/* Primary confidence */}
      <div className="card" style={{ padding: "28px" }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
          Primary Model — {result.model_used}
        </p>
        <div style={{ display: "flex", gap: "32px", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "48px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {(result.confidence * 100).toFixed(1)}<span style={{ fontSize: "20px", color: "var(--text-muted)" }}>%</span>
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>confidence</p>
          </div>
          <div style={{ flex: 1 }}>
            <ConfidenceBar
              value={result.confidence}
              color={result.label === "Benign" ? "var(--benign)" : "var(--malignant)"}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="card-raised" style={{ padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Malignant</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--malignant)" }}>
              {(result.probability_malignant * 100).toFixed(1)}%
            </p>
          </div>
          <div className="card-raised" style={{ padding: "14px 16px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Benign</p>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--benign)" }}>
              {(result.probability_benign * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* All models comparison */}
      <div className="card" style={{ padding: "28px" }}>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px" }}>
          All Models Comparison
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {result.all_models.map((m, i) => (
            <motion.div
              key={m.model}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: m.label === "Benign" ? "var(--benign)" : "var(--malignant)",
                  }} />
                  <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{m.model}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{
                    fontSize: "11px", padding: "2px 10px", borderRadius: "999px",
                    background: m.label === "Benign" ? "var(--benign-dim)" : "var(--malignant-dim)",
                    color: m.label === "Benign" ? "var(--benign)" : "var(--malignant)",
                    border: `1px solid ${m.label === "Benign" ? "var(--benign)" : "var(--malignant)"}`,
                    fontWeight: 600,
                  }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", minWidth: "44px", textAlign: "right" }}>
                    {(m.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ConfidenceBar
                value={m.confidence}
                color={m.label === "Benign" ? "var(--benign)" : "var(--malignant)"}
                delay={i * 0.06}
              />
            </motion.div>
          ))}
        </div>

        {/* Agreement indicator */}
        {(() => {
          const labels = result.all_models.map(m => m.label);
          const majority = labels.filter(l => l === result.label).length;
          const agreement = (majority / labels.length) * 100;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: "20px", padding: "12px 16px",
                background: "var(--accent-dim)", borderRadius: "8px",
                border: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Model agreement on {result.label}</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>{agreement.toFixed(0)}%</span>
            </motion.div>
          );
        })()}
      </div>
    </motion.div>
  );
}
