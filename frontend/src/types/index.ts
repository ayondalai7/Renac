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

export interface FeatureStat {
  name: string;
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface DatasetInfo {
  total_samples: number;
  total_features: number;
  benign_count: number;
  malignant_count: number;
  feature_names: string[];
  feature_stats: FeatureStat[];
  sample_rows: Record<string, number | string>[];
  source: string;
  missing_values: number;
}

export interface CSVUploadResult {
  predictions: PredictionResponse[];
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  matched_columns: number;
  missing_features: string[];
  unmatched_columns: string[];
  column_map: Record<string, string>;
  errors: { row: number; error: string }[];
}

export type NavTab = "predict" | "confidence" | "features" | "upload" | "dataset";
export type Theme = "light" | "dark";