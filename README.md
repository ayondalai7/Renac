# Recnac — Breast Cancer Classification App

> ML-powered tumour classification. Research tool only. Not for clinical use.

---

## 🏗️ Stack

| Layer    | Technology          | Hosting        |
|----------|---------------------|----------------|
| Frontend | Next.js 14 + TypeScript | Vercel (free) |
| Backend  | FastAPI + scikit-learn  | Render (free) |
| Models   | SVM, RF, GB, ANN, Ensemble | Bundled in backend |

---

## 📁 Structure

```
recnac/
├── frontend/   → Next.js app → deploy to Vercel
└── backend/    → FastAPI app → deploy to Render
```

---

## 🚀 Deployment Guide

### Step 1 — Deploy Backend to Render

1. Push the entire `recnac/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** to: `backend`
5. Set **Build Command** to:
   ```
   pip install -r requirements.txt
   ```
6. Set **Start Command** to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
7. Set **Environment Variable**:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
   ```
8. Click **Deploy**
9. Copy your Render URL (e.g. `https://recnac-api.onrender.com`)

> ⚠️ Free tier sleeps after 15 min inactivity. First request takes ~30s. The app handles this with a loading screen automatically.

---

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory** to: `frontend`
4. Add **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-recnac-api.onrender.com
   ```
5. Click **Deploy**
6. Your app is live at `https://recnac.vercel.app`

---

### Step 3 — Update CORS on Render

Go back to Render → your backend service → Environment:
```
ALLOWED_ORIGINS=https://recnac.vercel.app,http://localhost:3000
```
Redeploy.

---

## 💻 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs available at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
App available at: `http://localhost:3000`

---

## 🔑 Access

Password: `6969`
Stored in localStorage until browser data is cleared.

---

## 🧠 Models

| Model              | Accuracy | AUC-ROC |
|--------------------|----------|---------|
| Ensemble (default) | 98.25%   | 0.9960  |
| SVM                | 98.25%   | 0.9950  |
| Random Forest      | 95.61%   | 0.9937  |
| Gradient Boosting  | 95.61%   | 0.9907  |
| ANN (MLP)          | 96.49%   | 0.9937  |

Dataset: Breast Cancer Wisconsin (UCI) — 569 samples, 30 features.

---

## 📡 API Endpoints

| Method | Endpoint       | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/health`      | Health check + model status    |
| GET    | `/features`    | Feature names, ranges, top 10  |
| POST   | `/predict`     | Single prediction (30 features)|
| POST   | `/predict/csv` | Batch CSV prediction           |

---

## ⚠️ Disclaimer

Recnac is a machine learning research tool built for academic purposes.
It is **not** a medical device and results should **never** be used as a substitute
for professional medical diagnosis or advice.
