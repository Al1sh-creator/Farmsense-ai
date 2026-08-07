# 🌿 FarmSense AI — System Architecture
### *AI-Powered Smart Farming for India 🇮🇳*

> **LLM Provider:** ~~Ollama (local)~~ → **Groq API** (`llama-3.1-8b-instant` for chat, `qwen/qwen3.6-27b` for vision)

---

```mermaid
flowchart TD
    %% ─────────────────────────────────────────────
    %% LAYER 1 — CLIENT LAYER
    %% ─────────────────────────────────────────────
    subgraph CLIENT ["🟢  LAYER 1 — CLIENT LAYER  |  React + Vite  :5173"]
        direction LR
        FARMER["👨‍🌾 Farmer"]
        subgraph PAGES ["Pages"]
            direction LR
            P1["🏠 Landing"]
            P2["🔐 Login / Register"]
            P3["📝 Onboarding"]
            P4["📊 Dashboard"]
        end
        subgraph FEATURES ["Feature Modules"]
            direction LR
            F1["🌿 Crop\nComparison"]
            F2["🌦️ Weather\nForecast"]
            F3["🔬 Disease\nDetection"]
            F4["📋 AI\nSuggestions"]
            F5["🔔 Alerts\nPanel"]
            F6["👤 Farm\nProfile"]
            F7["🏛️ Gov\nSchemes"]
            F8["🛡️ Admin\nDashboard"]
        end
        FARMER --> P1 --> P2 --> P3 --> P4
        P4 --> F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8
    end

    CLIENT -- "🔁 REST API  HTTP/JSON" --> BACKEND
    CLIENT <-- "⚡ Socket.io WebSocket Real-time alerts" --> BACKEND

    %% ─────────────────────────────────────────────
    %% LAYER 2 — BACKEND
    %% ─────────────────────────────────────────────
    subgraph BACKEND ["🔵  LAYER 2 — API GATEWAY  |  Node.js + Express  :5000"]
        direction TB
        subgraph MIDDLEWARE ["Middleware"]
            direction LR
            M1["🔑 JWT Auth"]
            M2["🪖 Helmet"]
            M3["🌐 CORS"]
            M4["⚠️ Error Handler"]
        end
        subgraph ROUTES ["12 API Routes"]
            direction LR
            R1["/auth"]
            R2["/farm"]
            R3["/fields"]
            R4["/alerts"]
            R5["/suggestions"]
            R6["/analysis"]
            R7["/crops"]
            R8["/weather"]
            R9["/notifications"]
            R10["/disease"]
            R11["/admin"]
            R12["/inspections"]
        end
        subgraph SERVICES ["Services"]
            direction LR
            S1["📅 Scheduler\nnode-cron"]
            S2["📧 Email\nNodemailer"]
            S3["📱 SMS\nTwilio"]
            S4["📄 PDF\nService"]
            S5["🗺️ Geocoder"]
            S6["🤖 AI Engine\nClient axios"]
        end
        MIDDLEWARE --> ROUTES --> SERVICES
    end

    S6 -- "🔐 axios + X-Internal-Key" --> AIENGINE

    %% ─────────────────────────────────────────────
    %% LAYER 3 — AI ENGINE
    %% ─────────────────────────────────────────────
    subgraph AIENGINE ["🟣  LAYER 3 — AI ENGINE  |  Django REST Framework  :8000  Internal Only"]
        direction TB
        subgraph MLPIPES ["5 ML Pipelines"]
            direction LR
            ML1["🌱 Crop\nRecommendation\nNPK + Weather"]
            ML2["💊 Fertilizer\nOptimizer\nSoil Analysis"]
            ML3["💧 Irrigation\nAdvisor\nCrop Stage"]
            ML4["🦠 Disease\nDetection\nVision Model"]
            ML5["📊 Yield\nPredictor\nFarm Data"]
        end
        subgraph EXTRAS ["Additional Modules"]
            direction LR
            E1["🌤️ Weather\nEngine"]
            E2["🚨 Alert\nGenerator"]
            E3["💬 RAG Chatbot\nGroq API + ChromaDB"]
            E4["🔄 Full Pipeline\nEndpoint"]
        end
        E4 --> ML1 & ML2 & ML3 & ML4 & ML5
    end

    AIENGINE -- "📥 Read / Write" --> DATA
    BACKEND -- "📥 Read / Write" --> DATA

    %% ─────────────────────────────────────────────
    %% LAYER 4 — DATA LAYER
    %% ─────────────────────────────────────────────
    subgraph DATA ["🟡  LAYER 4 — DATA STORAGE"]
        direction LR
        subgraph POSTGRES ["PostgreSQL Database"]
            direction TB
            DB1["👥 users"]
            DB2["🌾 farms"]
            DB3["📐 fields"]
            DB4["🔔 alerts"]
            DB5["📬 notifications"]
            DB6["🌱 crops"]
            DB7["💡 suggestions"]
            DB8["📋 inspection_reports"]
        end
        subgraph VECTOR ["ChromaDB"]
            direction TB
            V1["📚 RAG Knowledge Base\nfarming docs + manuals"]
        end
        subgraph MLMODELS ["ML Models .pkl"]
            direction TB
            PKL1["🌱 crop_model"]
            PKL2["💊 fertilizer_model"]
            PKL3["💧 irrigation_model"]
            PKL4["📊 yield_model"]
        end
    end

    %% ─────────────────────────────────────────────
    %% LAYER 5 — EXTERNAL SERVICES
    %% ─────────────────────────────────────────────
    subgraph EXTERNAL ["⚪  LAYER 5 — EXTERNAL APIs & SERVICES"]
        direction LR
        EXT1["🌐 Open-Meteo API\n16-day weather forecast"]
        EXT2["📧 SMTP / Gmail\nNodemailer email"]
        EXT3["📱 Twilio\nWhatsApp + SMS"]
        EXT4["⚡ Groq API\n(Cloud LPU — llama-3.1-8b-instant)"]
    end

    EXT1 -- "GET forecast" --> E1
    EXT1 -- "GET forecast" --> S1
    S2 -- "Send email" --> EXT2
    S3 -- "Send SMS" --> EXT3
    E3 -- "LLM inference (GROQ_API_KEY)" --> EXT4

    %% ─────────────────────────────────────────────
    %% LAYER 6 — AUTOMATION
    %% ─────────────────────────────────────────────
    subgraph AUTOMATION ["🔴  LAYER 6 — AUTOMATED FLOWS  |  node-cron Scheduler"]
        direction LR
        CRON1["⏰ 6:00 AM\nFetch weather for ALL farms\nGenerate alerts\nSave to DB\nSend Email + SMS"]
        CRON2["⏰ 7:00 AM\nRun Full AI Pipeline\nfor ALL farms\nStore results"]
        CRON3["⏰ 8:00 AM\nSend Daily Summary\nEmail to all farmers"]
        SOCKET["⚡ Socket.io\nReal-time push\nalert to browser"]
    end

    S1 --> CRON1 & CRON2 & CRON3
    CRON1 --> SOCKET
    SOCKET -- "🔴 Live alert" --> CLIENT

    %% ─────────────────────────────────────────────
    %% STYLES
    %% ─────────────────────────────────────────────
    classDef clientStyle fill:#e8f8f0,stroke:#2d8653,stroke-width:2px,color:#0d3320
    classDef backendStyle fill:#e8eeff,stroke:#2a45c9,stroke-width:2px,color:#0a1640
    classDef aiStyle fill:#f0e8ff,stroke:#5a1a9e,stroke-width:2px,color:#2a0a50
    classDef dataStyle fill:#fff4e8,stroke:#c96a10,stroke-width:2px,color:#3d2000
    classDef externalStyle fill:#f0f0f0,stroke:#444444,stroke-width:2px,color:#111111
    classDef autoStyle fill:#ffe8e8,stroke:#b01020,stroke-width:2px,color:#3d0010

    class CLIENT,FARMER,PAGES,FEATURES,P1,P2,P3,P4,F1,F2,F3,F4,F5,F6,F7,F8 clientStyle
    class BACKEND,MIDDLEWARE,ROUTES,SERVICES,M1,M2,M3,M4,R1,R2,R3,R4,R5,R6,R7,R8,R9,R10,R11,R12,S1,S2,S3,S4,S5,S6 backendStyle
    class AIENGINE,MLPIPES,EXTRAS,ML1,ML2,ML3,ML4,ML5,E1,E2,E3,E4 aiStyle
    class DATA,POSTGRES,VECTOR,MLMODELS,DB1,DB2,DB3,DB4,DB5,DB6,DB7,DB8,V1,PKL1,PKL2,PKL3,PKL4 dataStyle
    class EXTERNAL,EXT1,EXT2,EXT3,EXT4 externalStyle
    class AUTOMATION,CRON1,CRON2,CRON3,SOCKET autoStyle
```

---

## 🔑 Key Data Flow Paths

```mermaid
flowchart LR
    subgraph FLOW1 ["🔬 Flow 1 — Disease Detection"]
        direction LR
        A1["👨‍🌾 Farmer\nuploads photo"] --> A2["⚡ Node.js\n/api/disease"] --> A3["🟣 Django\nVision Model"] --> A4["🔬 Diagnosis\nresult"] --> A5["📊 Dashboard\ndisplays result"]
    end

    subgraph FLOW2 ["🚨 Flow 2 — Daily Alert Pipeline"]
        direction LR
        B1["⏰ 6AM\nScheduler"] --> B2["🌐 Open-Meteo\nWeather API"] --> B3["🚨 Alert\nGenerator"] --> B4["🗄️ Save\nto DB"] --> B5["📧 Email\n📱 SMS"] & B6["⚡ Socket.io\nLive Push"]
    end

    subgraph FLOW3 ["💬 Flow 3 — AI Chat"]
        direction LR
        C1["👨‍🌾 Farmer\nasked question"] --> C2["⚡ Node.js\n/api/suggestions"] --> C3["💬 RAG\nChromaDB lookup"] --> C4["⚡ Groq API\nLLM inference"] --> C5["📋 Personalized\nfarming advice"]
    end

    subgraph FLOW4 ["🔄 Flow 4 — Full AI Pipeline"]
        direction LR
        D1["👤 Farm\nProfile saved"] --> D2["🔄 Full Pipeline\nEndpoint"] --> D3["🌱 Crop Rec\n💊 Fertilizer\n💧 Irrigation\n📊 Yield"] --> D4["🗄️ Results\nstored in DB"] --> D5["📊 Dashboard\nupdated"]
    end

    classDef flow1 fill:#e8f8f0,stroke:#2d8653,color:#0d3320
    classDef flow2 fill:#ffe8e8,stroke:#b01020,color:#3d0010
    classDef flow3 fill:#f0e8ff,stroke:#5a1a9e,color:#2a0a50
    classDef flow4 fill:#e8eeff,stroke:#2a45c9,color:#0a1640

    class A1,A2,A3,A4,A5 flow1
    class B1,B2,B3,B4,B5,B6 flow2
    class C1,C2,C3,C4,C5 flow3
    class D1,D2,D3,D4,D5 flow4
```

---

## 📦 Tech Stack Summary

| Layer | Color | Technology | Notes |
|-------|-------|-----------|-------|
| 🟢 Frontend | Green | React + Vite `:5173` | i18n Hindi/English, Socket.io client |
| 🔵 Backend | Blue | Node.js + Express `:5000` | JWT Auth, Helmet, CORS, node-cron |
| 🟣 AI Engine | Purple | Django REST Framework `:8000` | Python, scikit-learn, Pillow vision |
| 🟡 Database | Amber | PostgreSQL | Full relational schema, 9+ tables |
| 🟡 Vector Store | Amber | ChromaDB | RAG knowledge base for AI chat |
| 🟡 ML Models | Amber | .pkl files | crop, fertilizer, irrigation, yield |
| ⚡ LLM | Gray | **Groq API** (Cloud) | `llama-3.1-8b-instant` (chat), `qwen/qwen3.6-27b` (vision) |
| 📱 SMS | Gray | Twilio | WhatsApp + SMS notifications |
| 📧 Email | Gray | Nodemailer | Gmail SMTP with HTML templates |
| 🌐 Weather | Gray | Open-Meteo API | Free, 16-day forecast, no key needed |

---

## 🕐 Automated Schedule

| Time | Job | What Happens |
|------|-----|-------------|
| ⏰ 6:00 AM | Weather + Alerts | Fetch Open-Meteo → generate alerts → save DB → Email + SMS |
| ⏰ 7:00 AM | Full AI Pipeline | Run all 5 ML modules for every farm → store results |
| ⏰ 8:00 AM | Daily Summary | Send HTML summary email to all registered farmers |
| ⚡ Real-time | Socket.io | Instantly push alerts to farmer's open browser tab |

---

---

## ⚡ LLM Provider Note

> **Why is there a file called `ollama_service.py`?**
> The file was originally built for Ollama (local LLM). When Ollama stopped working, it was swapped to **Groq API** internally — but the filename was kept as-is to avoid breaking imports.

| File | Old (broken) | Current (active) |
|------|-------------|------------------|
| `ai/decision_engine/ollama_service.py` | Ollama local | **Groq** `llama-3.1-8b-instant` |
| `ai/decision_engine/vision_service.py` | — | **Groq** `qwen/qwen3.6-27b` (vision) |
| `suggestions/services/suggestion_service.py` | — | **Groq** (LLM enrichment) |

**Groq** is NOT the same as Grok (xAI). Groq is a hardware+API company that runs open-source models (Llama, Qwen, etc.) on their own ultra-fast **LPU chips** in the cloud.

---

*FarmSense AI v2.0 — Built for Indian Farmers 🇮🇳*
