from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict

class PredictionRequest(BaseModel):
    features: List[float] = Field(..., min_items=30, max_items=30)
    model: Optional[str] = Field(default="ensemble", pattern="^(ensemble|svm|rf|gb|ann)$")

    @validator("features")
    def validate_features(cls, v):
        if len(v) != 30:
            raise ValueError("Exactly 30 features required")
        if any(f < 0 for f in v):
            raise ValueError("Features must be non-negative")
        return v

class ModelResult(BaseModel):
    model: str
    prediction: int
    label: str
    probability_malignant: float
    probability_benign: float
    confidence: float

class ShapValue(BaseModel):
    feature: str
    value: float
    shap_value: float
    direction: str  # 'malignant' | 'benign'

class PredictionResponse(BaseModel):
    prediction: int
    label: str
    probability_malignant: float
    probability_benign: float
    confidence: float
    model_used: str
    all_models: List[ModelResult]
    shap_values: List[ShapValue]
    top10_features: List[Dict]

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str

class FeaturesMetaResponse(BaseModel):
    feature_names: List[str]
    top10_names: List[str]
    top10_idx: List[int]
    feature_ranges: Dict
