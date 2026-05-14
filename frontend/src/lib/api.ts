import axios from "axios";
import { ModelKey, PredictionResponse, FeaturesMeta, DatasetInfo, CSVUploadResult } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await api.get("/health");
    return res.data.models_loaded === true;
  } catch {
    return false;
  }
}

export async function getFeaturesMeta(): Promise<FeaturesMeta> {
  const res = await api.get<FeaturesMeta>("/features");
  return res.data;
}

export async function getDatasetInfo(): Promise<DatasetInfo> {
  const res = await api.get<DatasetInfo>("/dataset");
  return res.data;
}

export async function predict(
  features: number[],
  model: ModelKey = "ensemble"
): Promise<PredictionResponse> {
  const res = await api.post<PredictionResponse>("/predict", { features, model });
  return res.data;
}

export async function predictCSV(
  file: File,
  model: ModelKey = "ensemble"
): Promise<CSVUploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<CSVUploadResult>(
    `/predict/csv?model=${model}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}