"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModelKey, PredictionResponse } from "@/types";
import ModelSwitcher from "@/components/shared/ModelSwitcher";
import Loader from "@/components/shared/Loader";

interface Props {
  onResult: (r: PredictionResponse) => void;
  loading: boolean;
  error: string | null;
  onUploadPredict: (file: File, model: ModelKey) => void;
}

export default function UploadTab({ onResult, loading, error, onUploadPredict }: Props) {
  const [model, setModel]     = useState<ModelKey>("ensemble");
  const [file, setFile]       = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      alert("Only CSV files are accepted.");
      return;
    }
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
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
      style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px", margin: "0 auto" }}
    >
      <div className="card" style={{ padding: "24px 28px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Upload Prescription CSV</h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Upload a CSV file with feature columns. The first 30 columns will be used for prediction.
          Maximum 100 rows per file.
        </p>
      </div>

      <div className="card" style={{ padding: "28px" }}>
        <div style={{ marginBottom: "24px" }}>
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
            border: "2px dashed var(--border)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            cursor: "pointer",
            transition: "background 0.2s",
            background: dragging ? "var(--accent-dim)" : file ? "var(--benign-dim)" : "transparent",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--benign)" }}>{file.name}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to replace
                </p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📂</div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                  Drop your CSV here or click to browse
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  CSV with 30 feature columns · Max 100 rows
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px",
                background: "var(--malignant-dim)", border: "1px solid var(--malignant)",
                fontSize: "13px", color: "var(--malignant)",
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <div style={{ marginTop: "20px" }}><Loader message="Processing CSV…" /></div>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!file || loading}
          style={{ width: "100%", marginTop: "20px" }}
        >
          {loading ? "Analysing…" : "Analyse File"}
        </button>

        {/* CSV format hint */}
        <div className="card-raised" style={{ padding: "14px 16px", marginTop: "16px" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
            Expected CSV format
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
            mean radius, mean texture, mean perimeter, … (30 cols)
          </p>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Column headers optional. Numeric values only. One row = one patient sample.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
