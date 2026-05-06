import { ModelKey } from "@/types";

export const PASSWORD = "6969";
export const AUTH_KEY = "recnac_auth";

export const MODEL_OPTIONS: { key: ModelKey; label: string; accuracy: string }[] = [
  { key: "ensemble", label: "Ensemble (Voting)", accuracy: "98.25%" },
  { key: "svm",      label: "Support Vector Machine", accuracy: "98.25%" },
  { key: "rf",       label: "Random Forest",          accuracy: "95.61%" },
  { key: "gb",       label: "Gradient Boosting",      accuracy: "95.61%" },
  { key: "ann",      label: "ANN (MLP)",              accuracy: "96.49%" },
];

export const DISCLAIMER =
  "⚠️ Recnac is a research tool only. Results are not a medical diagnosis. Always consult a qualified healthcare professional.";

export const APP_VERSION = "1.0.0";
