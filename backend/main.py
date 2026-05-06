import os
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

from model import load_all, is_loaded, predict, get_feature_meta
from schemas.prediction import (
    PredictionRequest, PredictionResponse,
    HealthResponse, FeaturesMetaResponse
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://recnac.vercel.app"
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
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        models_loaded=is_loaded(),
        version="1.0.0"
    )


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        models_loaded=is_loaded(),
        version="1.0.0"
    )


@app.get("/features", response_model=FeaturesMetaResponse)
def features_meta():
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not loaded")
    meta = get_feature_meta()
    return FeaturesMetaResponse(**meta)


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


@app.post("/predict/csv", response_model=List[PredictionResponse])
async def predict_csv(file: UploadFile = File(...), model: str = "ensemble"):
    if not is_loaded():
        raise HTTPException(status_code=503, detail="Models not ready.")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted.")

    try:
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file.")

    if df.shape[1] < 10:
        raise HTTPException(status_code=400, detail="CSV must have at least 10 feature columns.")

    if df.shape[0] > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 rows per upload.")

    results = []
    for i, row in df.iterrows():
        try:
            vals = row.values[:30].tolist()
            # Pad to 30 if fewer columns
            if len(vals) < 30:
                vals = vals + [0.0] * (30 - len(vals))
            result = predict([float(v) for v in vals], model)
            results.append(PredictionResponse(**result))
        except Exception as e:
            logger.warning(f"Row {i} failed: {e}")
            continue

    if not results:
        raise HTTPException(status_code=422, detail="No valid rows found in CSV.")

    return results
