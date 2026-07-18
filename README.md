# Carbon Guardian AI 🌍🤖

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?logo=sqlite&logoColor=white)

Carbon Guardian AI is a full-stack personalized carbon footprint reduction platform. It combines a dynamic React dashboard with a robust FastAPI backend. It features emissions calculations, reward feedback loops, community insights, footprint projections, and a deep-learning AI recommendation engine (TensorFlow Recommenders) that continuously learns from user behavior.

## 🏗️ Architecture

```mermaid
graph TD
    UI[React Dashboard (Vite)] -->|JWT Auth, JSON| API[FastAPI Backend]
    API --> DB[(SQLite Database)]
    API --> AI[TensorFlow Recommenders Engine]
    API --> AQI[WAQI & OpenWeather APIs]
    
    subgraph Data Flow
        DB -->|User Activity History| AI
        AI -->|Personalized Suggestions| UI
        UI -->|Feedback (Accept/Reject)| DB
    end
```

## ✨ Key Features
- **Dynamic Dashboard**: Beautiful UI utilizing `requestAnimationFrame` for gauge animations, intersection observers for scroll reveals, and responsive Shadcn UI components.
- **Smart AI Recommendations**: The engine uses real historical data (`emissions_log`, `user_activity`) to feed a TensorFlow ranking model, returning highly contextual eco-actions.
- **Graceful Offline Fallback**: If the backend is unavailable or an endpoint fails, the React frontend seamlessly falls back to local offline mock data—tagged explicitly with `(ex)`—so the UI never crashes.
- **Strict Environment Validation**: Powered by `pydantic-settings`, the backend enforces that security keys (like `JWT_SECRET_KEY`) exist on startup, failing fast to prevent insecure deployments.
- **Self-Documenting API**: Navigate to `/docs` on the backend to see a strictly typed OpenAPI specification of all routes and schemas.

## 🚀 Local Development Setup

### 1. Environment Configuration
First, copy the environment template in the root directory:
```bash
cp .env.example .env
```
Ensure `JWT_SECRET_KEY` and `SEED_ADMIN_PASSWORD` are populated.

### 2. Backend (FastAPI)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed the database with mock users and community data
python scripts/seed.py

# Start the server
uvicorn app.main:app --reload
```
The API (and Swagger docs) will be available at `http://127.0.0.1:8000/docs`.

### 3. Frontend (React / Vite)
```powershell
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` to view the dashboard. Ensure the backend is running to avoid the `(ex)` mock fallbacks.

## 📖 Core API Endpoints
- **Authentication**: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- **User Profile**: `GET /user/profile`, `GET /user/activity`, `POST /user/activity`
- **Emissions**: `POST /emission/calculate`
- **AI Engine**: `POST /ai/recommend`, `POST /ai/feedback`, `POST /ai/retrain`
- **Community**: `GET /community/leaderboard`
- **Marketplace**: `GET /marketplace`
- **Simulations**: `GET /simulation/scenarios`, `POST /simulation/run`

## ☁️ Deployment
- **Frontend**: Designed to be deployed seamlessly on **Vercel** or Netlify. Just set the `VITE_API_BASE` environment variable to your live backend URL.
- **Backend**: Can be hosted on **Render**, **Railway**, or **Fly.io**. For production, swap the local SQLite URL in your `.env` with a hosted Postgres URL (e.g., Supabase) – SQLAlchemy handles the dialect seamlessly.

## 📄 License
MIT License. See LICENSE.
