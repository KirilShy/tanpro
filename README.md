# TanPro ☀️

A professional tanning assistant web app that guides you through the entire tanning process — from pre-tan preparation to after-sun recovery — using real-time UV data and science-based exposure calculations.

## Features

### 📋 Full Process Guide
Step-by-step interactive checklists for every phase of professional tanning:
- **Pre-Tan** — exfoliation timing, dry-area moisturizing, SPF prep, hydration
- **Session** — 4-position rotation plan, shade breaks, SPF reapplication schedule
- **After-Sun** — shower timing, after-sun care, 48h recovery protocol

Every checklist item includes an expandable expert tip explaining *why* it matters. Progress is saved per day and resets each morning.

### 🌤️ Live UV Dashboard
- Real-time UV index from your location (via [Open-Meteo](https://open-meteo.com/) — no API key required)
- Hourly UV chart for the current day
- 3-day UV forecast with tan quality rating per day
- Best tanning window (UV 3–8 range)
- Sunrise / sunset times

### ⏱️ Smart Tanning Timer
Two modes:
- **4-Position Rotation** — splits session into equal Front / Right Side / Back / Left Side segments with auto-advance alerts and body position diagram
- **Simple Timer** — basic countdown with auto flip reminder at halfway

Includes session history log and pause/resume support.

### 🧴 SPF Tracker
- Log each sunscreen application with SPF level
- 2-hour reapplication countdown with urgency alerts
- Today's application log
- SPF guide and pro application tips

### 🧬 Science-Based Exposure Calculator
Safe exposure times calculated using the WHO MED formula:
```
Burn time = MED (J/m²) / (UV index × 0.025 W/m²) × SPF
```
Calibrated for all 6 Fitzpatrick skin types.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI (Python), uvicorn |
| UV Data | Open-Meteo API (free, no key needed) |
| Storage | Browser localStorage |

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> The Vite dev server proxies `/api/*` requests to the FastAPI backend on port 8001 automatically.

## Project Structure

```
tan-planner/
├── backend/
│   ├── main.py          # FastAPI app — UV data + exposure calculator
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── TanningGuide.jsx   # Step-by-step process guide
    │       ├── Dashboard.jsx      # UV data, forecast, exposure estimates
    │       ├── TanningTimer.jsx   # 4-position rotation timer
    │       ├── SPFTracker.jsx     # Sunscreen log + reminders
    │       └── SkinTypeSetup.jsx  # Fitzpatrick skin type onboarding
    ├── vite.config.js
    └── package.json
```

## Skin Types (Fitzpatrick Scale)

| Type | Description | Burns | Tans |
|------|-------------|-------|------|
| I | Very fair, freckles | Always | Never |
| II | Fair | Usually | Minimally |
| III | Medium | Sometimes | Well |
| IV | Olive | Rarely | Always |
| V | Brown | Very rarely | Deeply |
| VI | Dark | Almost never | — |

## License

MIT
