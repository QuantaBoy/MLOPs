# SmartSupport MLOps — AI Ticket Priority Classifier

An end-to-end MLOps platform for automated customer support ticket priority classification. Combines a React + TypeScript frontend with a FastAPI Python backend, using XGBoost + TF-IDF for NLP-based priority inference, MLflow for experiment tracking, DVC for data versioning, and Supabase for persistent storage and real-time notifications.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  React + Vite Frontend (TypeScript)                        │
│  ├── Customer Portal — Submit tickets, view ML output      │
│  ├── Agent Queue — Triage, status updates, priority        │
│  │                 overrides (feedback loop for retrain)   │
│  └── Admin / MLOps Dashboard — Model health, confusion     │
│                                matrix, drift, retraining   │
└────────────────────────┬────────────────────────────────────┘
                         │  /api/* (Vite proxy → localhost:8000)
┌────────────────────────▼────────────────────────────────────┐
│  FastAPI Backend (Python)                                   │
│  ├── POST /predict          — TF-IDF + XGBoost inference   │
│  ├── POST /tickets          — Create ticket with prediction │
│  ├── PATCH /tickets/:id/override — Agent priority override │
│  ├── GET  /admin/metrics    — Model health & drift data    │
│  ├── POST /admin/retrain    — Trigger retraining pipeline  │
│  └── GET  /admin/retrain/:id — Poll job progress           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    Supabase         MLflow           DVC / Git
  (PostgreSQL +   (Experiment       (Data Version
   Realtime RLS)   Tracking)         Control)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| ML Inference | XGBoost, scikit-learn (TF-IDF), in-browser fallback classifier |
| Backend API | FastAPI, Uvicorn, Pydantic v2 |
| MLOps | MLflow, DVC |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Drift Monitoring | Evidently AI |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting Started

### 1. Frontend (React)

```bash
# Install dependencies
npm install

# Start development server (with Vite proxy to FastAPI)
npm run dev

# Build for production
npm run build
```

### 2. Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
# Or: uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

### 3. Supabase Database

Apply the schema to your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or paste supabase/schema.sql directly into the SQL editor
```

---

## Role-Based Views

| Role | View | Capabilities |
|------|------|-------------|
| **Customer** | Customer Portal | Submit tickets, view ML prediction output & confidence |
| **Support Agent** | Triage Queue | Update ticket status, assign agents, override AI priority (creates training feedback) |
| **Admin / Lead** | MLOps Dashboard | View model versions, accuracy trends, confusion matrix |
| **MLOps Engineer** | MLOps Dashboard | Trigger retraining pipeline, monitor data drift |

---

## ML Pipeline

1. **Inference** — TF-IDF token matching with class-weighted scoring (mirrors production XGBoost)
2. **Feedback Loop** — Agent priority overrides are logged as labeled training rows
3. **Retraining** — Admin triggers retraining job; pipeline pulls override feedback, fits new XGBoost model, evaluates Macro-F1 vs threshold (≥ 0.75), promotes if passing
4. **Drift Monitoring** — Evidently AI compares live token distributions vs training baseline

---

## Project Structure

```
PBL/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Navigation & role switcher
│   │   ├── CustomerDashboard.tsx
│   │   ├── AgentQueue.tsx    # Priority triage queue
│   │   ├── AdminDashboard.tsx # MLOps control center
│   │   ├── PriorityBadge.tsx
│   │   └── ConfidenceMeter.tsx
│   ├── services/
│   │   ├── mlClassifier.ts  # Client-side ML engine + FastAPI adapter
│   │   └── mockData.ts      # Initial seed data
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Root component & state management
│   └── index.css            # Global styles & design tokens
├── supabase/
│   └── schema.sql           # PostgreSQL schema + RLS policies
├── index.html               # Entry HTML with SEO meta tags
└── vite.config.ts           # Vite config with FastAPI proxy
```
