"use client";
import { useState } from "react";
import { PredictionResponse, ModelKey } from "@/types";
import { predict as apiPredict, predictCSV as apiPredictCSV } from "@/lib/api";

interface PredictionState {
  result: PredictionResponse | null;
  loading: boolean;
  error: string | null;
}

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({
    result: null,
    loading: false,
    error: null,
  });

  async function runPrediction(features: number[], model: ModelKey) {
    setState({ result: null, loading: true, error: null });
    try {
      const result = await apiPredict(features, model);
      setState({ result, loading: false, error: null });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Prediction failed. Please check your connection.";
      setState({ result: null, loading: false, error: msg });
    }
  }

  async function runCSVPrediction(file: File, model: ModelKey) {
    setState({ result: null, loading: true, error: null });
    try {
      const results = await apiPredictCSV(file, model);
      if (results.length > 0) {
        setState({ result: results[0], loading: false, error: null });
      } else {
        setState({ result: null, loading: false, error: "No valid results from CSV." });
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "CSV prediction failed.";
      setState({ result: null, loading: false, error: msg });
    }
  }

  function reset() {
    setState({ result: null, loading: false, error: null });
  }

  return { ...state, runPrediction, runCSVPrediction, reset };
}
