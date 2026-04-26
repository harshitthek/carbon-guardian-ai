# Carbon Guardian AI

Carbon Guardian AI is a full-stack personalized carbon footprint reduction platform. It combines a React dashboard with a FastAPI backend, SQLite persistence, emissions calculations, reward feedback, community insights, simulation projections, and an AI recommendation engine that learns from user activity.

## What It Includes

- React dashboard closely matching the supplied green sidebar dashboard reference
- rAF-driven animated carbon gauge, counters, graph, and simulation updates
- Intersection Observer plus requestAnimationFrame scroll reveal system
- FastAPI REST backend with modular routes
- SQLite database tables: `users`, `user_activity`, `emissions_log`, `recommendations`, `rewards`, `community_groups`
- Recommendation engine using stored behavior and feedback, with a TensorFlow Recommenders integration hook
- Reward logic that grants Green Points only when a recommendation is accepted
- AQI/weather provider support via `WAQI_TOKEN` and `OPENWEATHER_API_KEY`, with a local calibrated fallback

## Run Locally

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open `http://127.0.0.1:8000` for the working dashboard. The API reference remains available at `http://127.0.0.1:8000/docs`.

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173` only if you want to run the separate React/Vite development version.

## Core API Endpoints

- `GET /user/profile`
- `GET /user/activity`
- `POST /user/activity`
- `POST /emission/calculate`
- `POST /ai/recommend`
- `POST /ai/feedback`
- `POST /ai/retrain`
- `GET /community/leaderboard`
- `GET /simulation/scenarios`
- `GET /simulation/run/{scenario_id}`
- `GET /environment/live`

## AI Behavior

The recommendation endpoint trains its decision from user activity rows and feedback. When TensorFlow and TensorFlow Recommenders are installed, the TFRS ranking hook is used. If those packages are unavailable in a local environment, the app uses the same stored activity and feedback with a lightweight ranking model so recommendations still come from real user history rather than fixed copy.

## Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: Supabase Postgres for production, SQLite for local development

For Postgres production deployment, replace the SQLite connection in `backend/app/database.py` with a pooled Postgres connection and keep the same route/service contracts.

## License

MIT License. See LICENSE.
