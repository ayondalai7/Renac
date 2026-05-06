export type ModelKey = "ensemble" | "svm" | "rf" | "gb" | "ann";

export interface ModelResult {
  model: string;
  prediction: number;
  label: "Malignant" | "Benign";
  probability_malignant: number;
  probability_benign: number;
  confidence: number;
}

export interface ShapValue {
  feature: string;
  value: number;
  shap_value: number;
  direction: "malignant" | "benign";
}

export interface Top10Feature {
  feature: string;
  value: number;
  min: number;
  max: number;
  mean: number;
}

export interface PredictionResponse {
  prediction: number;
  label: "Malignant" | "Benign";
  probability_malignant: number;
  probability_benign: number;
  confidence: number;
  model_used: string;
  all_models: ModelResult[];
  shap_values: ShapValue[];
  top10_features: Top10Feature[];
}

export interface FeaturesMeta {
  feature_names: string[];
  top10_names: string[];
  top10_idx: number[];
  feature_ranges: Record<string, { min: number; max: number; mean: number }>;
}

export type NavTab = "predict" | "confidence" | "features" | "upload";
export type Theme = "light" | "dark";
