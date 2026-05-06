"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelKey, FeaturesMeta, PredictionResponse } from "@/types";
import { getFeaturesMeta } from "@/lib/api";
import { formatFeatureName, clamp } from "@/lib/utils";
import ModelSwitcher from "@/components/shared/ModelSwitcher";
import ProbabilityRing from "@/components/shared/ProbabilityRing";
import Loader from "@/components/shared/Loader";

interface Props {
  onResult: (r: PredictionResponse) => void;
  result: PredictionResponse | null;
  loading: boolean;
  error: string | null;
  onPredict: (features: number[], model: ModelKey) => void;
  serverReady: boolean;
}

export default function PredictTab({ onResult, result, loading, error, onPredict, serverReady }: Props) {
  const [model, setModel]         = useState<ModelKey>("ensemble");
  const [meta, setMeta]           = useState<FeaturesMeta | null>(null);
  const [values, setValues]       = useState<Record<string, number>>({});
  const [metaLoading, setMetaLoading] = useState(true);

  useEffect(() => {
    getFeaturesMeta().then(m => {
      setMeta(m);
      const defaults: Record<string, number> = {};
      m.feature_names.forEach(name => {
        defaults[name] = m.feature_ranges[name]?.mean ?? 0;
      });
      setValues(defaults);
      setMetaLoading(false);
    }).catch(() => setMetaLoading(false));
  }, []);

  function handleSlider(name: string, val: number) {
    setValues(prev => ({ ...prev, [name]: val }));
  }

  function handleSubmit() {
    if (!meta) return;
    const features = meta.feature_names.map(n => values[n] ?? 0);
    onPredict(features, model);
  }

  if (!serverReady) {
    return <Loader message="Waking up server… this takes ~30s on first load." />;
  }

  if (metaLoading) {
    return <Loader message="Loading feature definitions…" />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: "24px" }}>

      {/* Form panel */}
      <motion.div layout className="card" style={{ padding: "28px" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>Manual Input</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Top 10 diagnostic features</p>
          </div>
          <div style={{ minWidth: "220px" }}>
            <ModelSwitcher value={model} onChange={setModel} />
          </div>
        </div>

        {meta && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
            {meta.top10_names.map((name, i) => {
              const rng = meta.feature_ranges[name];
              const val = values[name] ?? rng?.mean ?? 0;
              const pct = rng ? ((val - rng.min) / (rng.max - rng.min)) * 100 : 50;
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                      {formatFeatureName(name)}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {val.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={rng?.min ?? 0}
                    max={rng?.max ?? 1}
                    step={(((rng?.max ?? 1) - (rng?.min ?? 0)) / 200)}
                    value={val}
                    onChange={e => handleSlider(name, parseFloat(e.target.value))}
                    style={{ "--pct": `${pct}%` } as React.CSSProperties}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{rng?.min.toFixed(2)}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>avg {rng?.mean.toFixed(2)}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{rng?.max.toFixed(2)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                background: "var(--malignant-dim)", border: "1px solid var(--malignant)",
                fontSize: "13px", color: "var(--malignant)",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", gap: "8px" }}
        >
          {loading ? (
            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}><circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/><path d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>Analysing…</>
          ) : "Run Analysis"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>

      {/* Result panel */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="card"
            style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Result · {result.model_used}
              </p>
            </div>

            <ProbabilityRing
              probability={result.label === "Malignant" ? result.probability_malignant : result.probability_benign}
              label={result.label}
            />

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="card-raised" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Malignant probability</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--malignant)" }}>
                    {(result.probability_malignant * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="card-raised" style={{ padding: "14px 16px", marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Benign probability</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--benign)" }}>
                      {(result.probability_benign * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "var(--accent-dim)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Model confidence</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
              Switch to Confidence or Features tab for detailed breakdown
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
