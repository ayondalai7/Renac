"use client";
import { useState } from "react";
import { PredictionResponse, ModelKey, CSVUploadResult } from "@/types";
import { predict as apiPredict, predictCSV as apiPredictCSV } from "@/lib/api";

interface PredictionState {
  result: PredictionResponse | null;
  csvResult: CSVUploadResult | null;
  loading: boolean;
  error: string | null;
}

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({
    result: null, csvResult: null, loading: false, error: null,
  });

  async function runPrediction(features: number[], model: ModelKey) {
    setState(s => ({ ...s, result: null, csvResult: null, loading: true, error: null }));
    try {
      const result = await apiPredict(features, model);
      setState({ result, csvResult: null, loading: false, error: null });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || "Prediction failed. Please check your connection.";
      setState({ result: null, csvResult: null, loading: false, error: msg });
    }
  }

  async function runCSVPrediction(file: File, model: ModelKey) {
    setState(s => ({ ...s, result: null, csvResult: null, loading: true, error: null }));
    try {
      const csvResult = await apiPredictCSV(file, model);
      // Set first prediction as main result for nav pills
      const firstResult = csvResult.predictions.length > 0 ? csvResult.predictions[0] : null;
      setState({ result: firstResult, csvResult, loading: false, error: null });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || "CSV prediction failed.";
      setState({ result: null, csvResult: null, loading: false, error: msg });
    }
  }

  function reset() {
    setState({ result: null, csvResult: null, loading: false, error: null });
  }

  return { ...state, runPrediction, runCSVPrediction, reset };
}