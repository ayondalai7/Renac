"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatasetInfo } from "@/types";
import { getDatasetInfo } from "@/lib/api";
import { formatFeatureName } from "@/lib/utils";

export default function DatasetTab() {
  const [data, setData]       = useState<DatasetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "features" | "samples">("overview");

  useEffect(() => {
    getDatasetInfo()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load dataset info."); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2px solid var(--accent)", borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading dataset...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--malignant)", fontSize: "14px" }}>{error}</div>
  );

  if (!data) return null;

  const benignPct    = ((data.benign_count / data.total_samples) * 100).toFixed(1);
  const malignantPct = ((data.malignant_count / data.total_samples) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Header */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              Breast Cancer Wisconsin Dataset
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Source: {data.source} · No missing values</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["overview", "features", "samples"] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: "6px 14px", borderRadius: "999px", border: "1px solid var(--border)",
                  background: activeSection === s ? "var(--accent)" : "transparent",
                  color: activeSection === s ? "#fff" : "var(--text-secondary)",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              {[
                { n: data.total_samples, l: "Total Samples" },
                { n: data.total_features, l: "Features" },
                { n: data.benign_count, l: "Benign Cases" },
                { n: data.malignant_count, l: "Malignant Cases" },
                { n: data.missing_values, l: "Missing Values" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  <p style={{ fontSize: "32px", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>{s.l}</p>
                </motion.div>
              ))}
            </div>

            {/* Class distribution */}
            <div className="card" style={{ padding: "24px 28px" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>
                Class Distribution
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Benign", count: data.benign_count, pct: benignPct, color: "var(--benign)" },
                  { label: "Malignant", count: data.malignant_count, pct: malignantPct, color: "var(--malignant)" },
                ].map((c, i) => (
                  <div key={c.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{c.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.count} samples</span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: c.color }}>{c.pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ height: "100%", background: c.color, borderRadius: "4px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px", padding: "12px 16px", background: "var(--accent-dim)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Features are computed from digitized images of fine needle aspirate (FNA) of breast masses.
                  Each feature describes characteristics of the cell nuclei present in the image.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FEATURES */}
        {activeSection === "features" && (
          <motion.div key="features"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card" style={{ padding: "24px 28px" }}
          >
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
              All 30 Feature Statistics
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Feature", "Min", "Max", "Mean", "Std Dev"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: h === "Feature" ? "left" : "right",
                        color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", fontSize: "11px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.feature_stats.map((f, i) => (
                    <motion.tr
                      key={f.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--surface-2)" }}
                    >
                      <td style={{ padding: "9px 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                        {formatFeatureName(f.name)}
                      </td>
                      {[f.min, f.max, f.mean, f.std].map((v, j) => (
                        <td key={j} style={{ padding: "9px 12px", textAlign: "right", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                          {v.toFixed(4)}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SAMPLES */}
        {activeSection === "samples" && (
          <motion.div key="samples"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card" style={{ padding: "24px 28px" }}
          >
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px", fontWeight: 600 }}>
              Sample Rows
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              First 4 rows: Malignant · Last 4 rows: Benign
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>Diagnosis</th>
                    {data.feature_stats.slice(0, 10).map(f => (
                      <th key={f.name} style={{ padding: "8px 10px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap", fontSize: "10px" }}>
                        {f.name.replace("mean ", "").replace("worst ", "w.")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sample_rows.map((row, i) => {
                    const diag = row["diagnosis"] as string;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--surface-2)" }}
                      >
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 700,
                            background: diag === "Benign" ? "var(--benign-dim)" : "var(--malignant-dim)",
                            color: diag === "Benign" ? "var(--benign)" : "var(--malignant)",
                            border: `1px solid ${diag === "Benign" ? "var(--benign)" : "var(--malignant)"}`,
                          }}>
                            {diag}
                          </span>
                        </td>
                        {data.feature_stats.slice(0, 10).map(f => (
                          <td key={f.name} style={{ padding: "8px 10px", textAlign: "right", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                            {typeof row[f.name] === "number" ? (row[f.name] as number).toFixed(3) : "—"}
                          </td>
                        ))}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
              Showing first 10 of 30 features for readability.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}