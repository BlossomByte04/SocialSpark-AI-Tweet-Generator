# ✨ Social Spark AI — Walnut Folks Assignment

**AI-powered brand voice analysis and tweet generation system.**
Built for the **Walnut Folks AI & Innovation Trainee** assignment by **Pallavi K**.

## ✨ What It Does

1. **Brand Voice Fingerprinting** — Analyzes any brand across 12 dimensions (tone spectrum, personality archetype, vocabulary, emotional drivers, etc.)
2. **Tweet Generation** — Generates exactly 10 on-brand tweets with balanced style distribution (conversational, promotional, witty, informative, engagement)
3. **Brand Comparison** — Side-by-side voice fingerprint comparison with tone delta visualization
4. **History** — MongoDB-backed generation history with full detail drill-down
5. **10 Pre-loaded Brands** — Confluencr, Walnut Folks, Zomato, Swiggy, Nike, Apple, Duolingo, Amul, Netflix India, boAt (zero API calls needed)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 + Lucide Icons |
| **Backend** | FastAPI + Pydantic v2 |
| **AI** | Gemini 2.5 Flash (free tier) via OpenAI-compatible endpoint |
| **Database** | MongoDB (pymongo) |
| **Caching** | Pre-loaded JSON → Local file cache → MongoDB |

## 📁 Project Structure

```
AI Tweets/
├── backend/                 ← FastAPI backend
│   ├── app.py               ← Main FastAPI app
│   ├── core/                ← AI engines
│   │   ├── voice_analyzer.py
│   │   └── tweet_generator.py
│   ├── routes/              ← API endpoints
│   │   ├── brands.py
│   │   ├── generate.py
│   │   ├── compare.py
│   │   └── history.py
│   ├── schemas/             ← Pydantic models
│   ├── db/                  ← MongoDB layer
│   ├── prompts/             ← LLM prompt templates
│   ├── utils/               ← Export + cache utilities
│   ├── examples/            ← 10 pre-loaded brands JSON
│   └── requirements.txt
├── frontend/                ← Next.js frontend
│   ├── app/                 ← App Router pages
│   │   ├── (dashboard)/     ← Route group with sidebar
│   │   │   ├── generate/    ← Main tweet generation
│   │   │   ├── compare/     ← Brand comparison
│   │   │   ├── history/     ← Generation history
│   │   │   └── about/       ← How It Works
│   │   ├── layout.tsx       ← Root layout
│   │   └── globals.css      ← Tailwind v4 + orange theme
│   ├── components/
│   │   ├── dashboard/       ← Brand grid, tweet cards, fingerprint viz
│   │   └── ui/              ← shadcn/ui primitives
│   ├── lib/api-client.ts    ← Backend API wrapper
│   └── types/               ← TypeScript interfaces
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **MongoDB** running on `localhost:27017` (optional — app works without it)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open

Navigate to **http://localhost:3000** — the app will redirect to the Generate page.

### Environment Variables (optional)

```bash
# backend/.env
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
MONGO_URI=mongodb://localhost:27017
```

## 🎯 Features

- **10 pre-loaded brands** with complete voice fingerprints + tweets — works out of the box with zero API calls
- **Custom brand support** — enter any brand name, industry, and campaign objective
- **Provider settings** — switch between Gemini (free) and OpenAI, enter API keys in the UI
- **Multi-model fallback** — Gemini 2.5 Flash → 3.1 Flash Lite → 3 Flash
- **Rate limiting** — 12s min between requests, exponential backoff on 429s
- **Three-tier caching** — pre-loaded JSON → local file cache → MongoDB
- **Export** — download tweets as CSV or full report as text
- **Responsive dark theme** — orange-branded design matching Walnut Folks identity

## 📐 Architecture

```
Browser (Next.js)  →  FastAPI Backend  →  Gemini / OpenAI API
                           ↕
                       MongoDB
                   (brands, voice_prints,
                    generations, tweets)
```

### Pipeline Flow

1. User selects a brand (preloaded or custom)
2. Backend checks: preloaded data → local cache → MongoDB → live API
3. Voice Analyzer builds 12-dimension fingerprint via Gemini
4. Social Spark AI creates 10 tweets using the fingerprint
5. Results cached locally + persisted to MongoDB
6. Frontend displays fingerprint visualization + tweet cards with engagement scores
