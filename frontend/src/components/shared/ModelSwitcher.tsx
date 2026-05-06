"use client";
import { ModelKey } from "@/types";
import { MODEL_OPTIONS } from "@/lib/constants";

interface Props {
  value: ModelKey;
  onChange: (m: ModelKey) => void;
}

export default function ModelSwitcher({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
        Model
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as ModelKey)}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          padding: "8px 12px",
          cursor: "pointer",
          outline: "none",
          width: "100%",
        }}
      >
        {MODEL_OPTIONS.map(m => (
          <option key={m.key} value={m.key}>
            {m.label} — {m.accuracy}
          </option>
        ))}
      </select>
    </div>
  );
}
