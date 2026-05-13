import os
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
from rapidfuzz import process, fuzz

from model import load_all, is_loaded, predict, get_feature_meta
from schemas.prediction import (
    PredictionRequest, PredictionResponse,
    HealthResponse, FeaturesMetaResponse
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://renac.vercel.app"
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading models...")
    load_all()
    logger.info("Models ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Recnac API",
    description="Breast Cancer Classification — ML Backend",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def normalize(name: str) -> str:
    return name.lower().strip().replace("_", " ").replace("-", " ")


def match_columns(df_cols, feature_names, threshold=70):
    norm_features = {normalize(f): f for f in feature_names}
    norm_df_cols  = {normalize(c): c for c in df_cols}
    matched   = {}
    used_cols = set()
    for norm_f, orig_f in norm_features.items():
        if norm_f in norm_df_cols:
            matched[orig_f] = norm_df_cols[norm_f]
            used_cols.add(norm_df_cols[norm_f])
            continue
        result = process.extractOne(norm_f, list(norm_df_cols.keys()),
                                     scorer=fuzz.token_sort_ratio, score_cutoff=threshold)
        if result:
            matched[orig_f] = norm_df_cols[result[0]]
            used_cols.add(norm_df_cols[result[0]])
    missing   = [f for f in feature_names if f not in matched]
    unmatched = [c for c in df_cols if c not in used_cols]
    return matched, missing, unmatched


def build_feature_vector(row, matched, feature_names):
    vec = []
    for feat in feature_names:
        if feat in matched:
            try:
                vec.append(float(row[matched[feat]]))
            except (ValueError, KeyError):
                vec.append(0.0)
        else:
            vec.append(0.0)
    return vec


@app.get("/", response_model=HealthResponse)
def root():
    return HealthResponse(status="ok", models_loaded=is_loaded(), version="1.1.0")


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok", models_loaded=is_loaded(), version="1.1.0")


@app.get("/features", response_model=FeaturesMetaResponse)
def features_meta():
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    return FeaturesMetaResponse(**get_feature_meta())


@app.get("/dataset")
def dataset_info():
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    from sklearn.datasets import load_breast_cancer
    data  = load_breast_cancer()
    X, y  = data.data, data.target
    names = list(data.feature_names)
    feature_stats = []
    for i, name in enumerate(names):
        col = X[:, i]
        feature_stats.append({
            "name": name,
            "min":  round(float(col.min()), 4),
            "max":  round(float(col.max()), 4),
            "mean": round(float(col.mean()), 4),
            "std":  round(float(col.std()), 4),
        })
    sample_indices = [0, 1, 2, 3, 212, 213, 214, 215]
    samples = []
    for i in sample_indices:
        row = {names[j]: round(float(X[i, j]), 4) for j in range(len(names))}
        row["diagnosis"] = "Benign" if y[i] == 1 else "Malignant"
        samples.append(row)
    return {
        "total_samples":   int(len(y)),
        "total_features":  int(len(names)),
        "benign_count":    int(np.sum(y == 1)),
        "malignant_count": int(np.sum(y == 0)),
        "feature_names":   names,
        "feature_stats":   feature_stats,
        "sample_rows":     samples,
        "source":          "Breast Cancer Wisconsin (UCI)",
        "missing_values":  0,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_endpoint(body: PredictionRequest):
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not ready. Try again shortly.")
    try:
        result = predict(body.features, body.model)
        return PredictionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again.")


@app.post("/predict/csv")
async def predict_csv(file: UploadFile = File(...), model: str = Query(default="ensemble")):
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not ready.")
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV. Ensure valid UTF-8 format.")
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty.")
    if df.shape[0] > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 patient rows per upload.")

    meta          = get_feature_meta()
    feature_names = meta["feature_names"]
    matched, missing, unmatched = match_columns(list(df.columns), feature_names)

    if len(matched) < 10:
        raise HTTPException(
            status_code=422,
            detail=f"Only {len(matched)}/30 features matched. Missing: {missing[:5]}. "
                   f"Ensure column headers match UCI feature names."
        )

    results = []
    errors  = []
    for i, (_, row) in enumerate(df.iterrows()):
        try:
            vec    = build_feature_vector(row, matched, feature_names)
            result = predict(vec, model)
            results.append(result)
        except Exception as e:
            errors.append({"row": i + 1, "error": str(e)})

    if not results:
        raise HTTPException(status_code=422, detail="No valid patient rows could be processed.")

    return {
        "predictions":       results,
        "total_rows":        df.shape[0],
        "successful_rows":   len(results),
        "failed_rows":       len(errors),
        "matched_columns":   len(matched),
        "missing_features":  missing,
        "unmatched_columns": unmatched,
        "column_map":        matched,
        "errors":            errors,
    }