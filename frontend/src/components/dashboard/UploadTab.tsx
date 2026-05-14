"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelKey, CSVUploadResult, PredictionResponse } from "@/types";
import ModelSwitcher from "@/components/shared/ModelSwitcher";
import ProbabilityRing from "@/components/shared/ProbabilityRing";
import Loader from "@/components/shared/Loader";
import { formatFeatureName } from "@/lib/utils";

interface Props {
  loading: boolean;
  error: string | null;
  onResult: (r: PredictionResponse) => void;
  onUploadPredict: (file: File, model: ModelKey) => void;
  csvResult: CSVUploadResult | null;
}

export default function UploadTab({ loading, error, onResult, onUploadPredict, csvResult }: Props) {
  const [model, setModel]       = useState<ModelKey>("ensemble");
  const [file, setFile]         = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) { alert("Only CSV files are accepted."); return; }
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleSubmit() {
    if (!file) return;
    onUploadPredict(file, model);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Header */}
      <div className="card" style={{ padding: "24px 28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>Lab Report Upload</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          For clinicians — upload a lab-exported CSV with patient tissue sample measurements.
          Column names are auto-detected and fuzzy-matched to UCI feature names.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: csvResult ? "1fr 1fr" : "1fr", gap: "20px" }}>

        {/* Upload panel */}
        <div className="card" style={{ padding: "28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <ModelSwitcher value={model} onChange={setModel} />
          </div>

          {/* Drop zone */}
          <motion.div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            animate={{ borderColor: dragging ? "var(--accent)" : file ? "var(--benign)" : "var(--border)" }}
            style={{
              border: "2px dashed var(--border)", borderRadius: "12px",
              padding: "40px 24px", textAlign: "center", cursor: "pointer",
              background: dragging ? "var(--accent-dim)" : file ? "var(--benign-dim)" : "transparent",
              transition: "background 0.2s",
            }}
          >
            <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <p style={{ fontSize: "28px", marginBottom: "10px" }}>📄</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--benign)" }}>{file.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {(file.size / 1024).toFixed(1)} KB · Click to replace
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p style={{ fontSize: "28px", marginBottom: "10px" }}>📂</p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                    Drop lab report CSV or click to browse
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                    Column names auto-matched · Max 100 patient rows
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px",
                  background: "var(--malignant-dim)", border: "1px solid var(--malignant)",
                  fontSize: "13px", color: "var(--malignant)" }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loading && <div style={{ marginTop: "20px" }}><Loader message="Processing lab report..." /></div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={!file || loading}
            style={{ width: "100%", marginTop: "20px" }}>
            {loading ? "Analysing..." : "Run Analysis"}
          </button>

          {/* CSV format hint */}
          <div className="card-raised" style={{ padding: "14px 16px", marginTop: "16px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
              Expected Format
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
              mean radius, mean texture, worst area, ...
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
              Headers auto-matched. Partial columns accepted (missing values default to 0).
              One row = one patient sample.
            </p>
          </div>
        </div>

        {/* Results panel */}
        <AnimatePresence>
          {csvResult && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* Column mapping report */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>
                  Column Mapping Report
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  {[
                    { label: "Rows Processed", val: `${csvResult.successful_rows}/${csvResult.total_rows}`, color: "var(--benign)" },
                    { label: "Columns Matched", val: `${csvResult.matched_columns}/30`, color: "var(--accent)" },
                    { label: "Failed Rows", val: csvResult.failed_rows, color: csvResult.failed_rows > 0 ? "var(--malignant)" : "var(--text-muted)" },
                    { label: "Missing Features", val: csvResult.missing_features.length, color: csvResult.missing_features.length > 0 ? "var(--amber)" : "var(--text-muted)" },
                  ].map(s => (
                    <div key={s.label} className="card-raised" style={{ padding: "12px 14px" }}>
                      <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.val}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {csvResult.missing_features.length > 0 && (
                  <div style={{ padding: "10px 12px", background: "var(--amber-dim)", borderRadius: "8px", border: "1px solid var(--amber)", marginBottom: "10px" }}>
                    <p style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600, marginBottom: "4px" }}>Missing features (defaulted to 0):</p>
                    <p style={{ fontSize: "11px", color: "var(--amber)", lineHeight: 1.6 }}>
                      {csvResult.missing_features.map(f => formatFeatureName(f)).join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Predictions */}
              <div className="card" style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>
                  Patient Predictions ({csvResult.predictions.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                  {csvResult.predictions.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="card-raised"
                      style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Patient {i + 1}</p>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: p.label === "Benign" ? "var(--benign)" : "var(--malignant)", marginTop: "2px" }}>
                          {p.label}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "18px", fontWeight: 700, color: p.label === "Benign" ? "var(--benign)" : "var(--malignant)" }}>
                          {((p.label === "Benign" ? p.probability_benign : p.probability_malignant) * 100).toFixed(1)}%
                        </p>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          confidence {(p.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {csvResult.predictions.length > 1 && (() => {
                  const malCount = csvResult.predictions.filter(p => p.label === "Malignant").length;
                  const benCount = csvResult.predictions.filter(p => p.label === "Benign").length;
                  return (
                    <div style={{ marginTop: "14px", padding: "12px 14px", background: "var(--accent-dim)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        Batch summary: <span style={{ color: "var(--malignant)", fontWeight: 600 }}>{malCount} Malignant</span> · <span style={{ color: "var(--benign)", fontWeight: 600 }}>{benCount} Benign</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}