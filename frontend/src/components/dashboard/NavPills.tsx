"use client";
import { NavTab } from "@/types";

const TABS: { key: NavTab; label: string }[] = [
  { key: "predict",    label: "Predict" },
  { key: "confidence", label: "Confidence" },
  { key: "features",   label: "Features" },
  { key: "upload",     label: "Lab Upload" },
  { key: "dataset",    label: "Dataset" },
];

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  disabled?: NavTab[];
}

export default function NavPills({ active, onChange, disabled = [] }: Props) {
  return (
    <div className="glass-pill-container">
      {TABS.map((tab) => {
        const isDisabled = disabled.includes(tab.key);
        return (
          <button
            key={tab.key}
            className={`glass-pill ${active === tab.key ? "active" : ""}`}
            onClick={() => !isDisabled && onChange(tab.key)}
            disabled={isDisabled}
            style={{ opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}