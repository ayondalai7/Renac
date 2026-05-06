import joblib
import numpy as np
from pathlib import Path
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"

MODEL_DISPLAY_NAMES = {
    "ensemble": "Ensemble (Voting)",
    "svm":      "Support Vector Machine",
    "rf":       "Random Forest",
    "gb":       "Gradient Boosting",
    "ann":      "ANN (MLP)",
}

# ── Loaded once at startup ────────────────────────────────────────────────────
_scaler         = None
_models         = {}
_top10_idx      = None
_top10_names    = None
_feature_names  = None
_feature_ranges = None


def load_all():
    global _scaler, _models, _top10_idx, _top10_names, _feature_names, _feature_ranges
    try:
        _scaler         = joblib.load(MODELS_DIR / "scaler.pkl")
        _top10_idx      = joblib.load(MODELS_DIR / "top10_idx.pkl")
        _top10_names    = joblib.load(MODELS_DIR / "top10_names.pkl")
        _feature_names  = joblib.load(MODELS_DIR / "feature_names.pkl")
        _feature_ranges = joblib.load(MODELS_DIR / "feature_ranges.pkl")
        _models = {
            "ensemble": joblib.load(MODELS_DIR / "ensemble_model.pkl"),
            "svm":      joblib.load(MODELS_DIR / "svm_model.pkl"),
            "rf":       joblib.load(MODELS_DIR / "rf_model.pkl"),
            "gb":       joblib.load(MODELS_DIR / "gb_model.pkl"),
            "ann":      joblib.load(MODELS_DIR / "ann_model.pkl"),
        }
        logger.info("All models loaded successfully.")
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        raise RuntimeError(f"Model loading failed: {e}")


def is_loaded() -> bool:
    return _scaler is not None and len(_models) == 5


def get_feature_meta() -> Dict:
    return {
        "feature_names":  [str(n) for n in _feature_names],
        "top10_names":    [str(n) for n in _top10_names],
        "top10_idx":      _top10_idx,
        "feature_ranges": _feature_ranges,
    }


def _compute_shap(features_scaled: np.ndarray) -> List[Dict]:
    """Linear approximation of feature contributions using RF feature importances."""
    rf = _models["rf"]
    importances = rf.feature_importances_
    top_idx = _top10_idx
    shap_vals = []
    for idx in top_idx:
        raw_val = features_scaled[0, idx]
        importance = float(importances[idx])
        contribution = float(raw_val * importance)
        shap_vals.append({
            "feature":    str(_feature_names[idx]),
            "value":      float(features_scaled[0, idx]),
            "shap_value": round(contribution, 4),
            "direction":  "malignant" if contribution < 0 else "benign",
        })
    shap_vals.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
    return shap_vals


def predict(features: List[float], model_key: str = "ensemble") -> Dict[str, Any]:
    if not is_loaded():
        raise RuntimeError("Models not loaded")

    if model_key not in _models:
        raise ValueError(f"Unknown model: {model_key}")

    X = np.array(features, dtype=float).reshape(1, -1)
    X_scaled = _scaler.transform(X)

    # Primary model prediction
    model = _models[model_key]
    proba = model.predict_proba(X_scaled)[0]
    pred  = int(np.argmax(proba))
    prob_malignant = round(float(proba[0]), 4)
    prob_benign    = round(float(proba[1]), 4)
    confidence     = round(float(max(proba)), 4)

    # All models predictions
    all_results = []
    for key, m in _models.items():
        p = m.predict_proba(X_scaled)[0]
        pr = int(np.argmax(p))
        all_results.append({
            "model":                MODEL_DISPLAY_NAMES[key],
            "prediction":           pr,
            "label":                "Benign" if pr == 1 else "Malignant",
            "probability_malignant": round(float(p[0]), 4),
            "probability_benign":    round(float(p[1]), 4),
            "confidence":            round(float(max(p)), 4),
        })

    # SHAP-style values
    shap_vals = _compute_shap(X_scaled)

    # Top 10 feature values for display
    top10_features = []
    for idx, name in zip(_top10_idx, _top10_names):
        rng = _feature_ranges.get(str(name), {})
        top10_features.append({
            "feature": str(name),
            "value":   round(float(X[0, idx]), 4),
            "min":     round(float(rng.get("min", 0)), 4),
            "max":     round(float(rng.get("max", 1)), 4),
            "mean":    round(float(rng.get("mean", 0.5)), 4),
        })

    return {
        "prediction":            pred,
        "label":                 "Benign" if pred == 1 else "Malignant",
        "probability_malignant": prob_malignant,
        "probability_benign":    prob_benign,
        "confidence":            confidence,
        "model_used":            MODEL_DISPLAY_NAMES[model_key],
        "all_models":            all_results,
        "shap_values":           shap_vals,
        "top10_features":        top10_features,
    }
