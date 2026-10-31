# Synapse Enterprise AI — Tri-System Architecture (Client, Server & Backend)

**Synapse Enterprise AI** is organized into **three distinct, decoupled systems**:
1. 🌐 **Client System (`/client` or `/frontend`)** — React.js (Vite) Single-Page Application configured strictly for **Vercel** deployment with Supabase browser SDK (`VITE_SUPABASE_ANON_KEY` & `VITE_SUPABASE_URL`).
2. 🚀 **Server System (`/server`)** — Node.js & Express API Gateway configured for **Render** web service deployment, orchestrating **Google Gemini 2.5 Flash** models, rate-limiting, and RBAC authentication.
3. 🗄️ **Backend System (`/backend`)** — **Supabase** Managed PostgreSQL Core featuring direct connection pooling, service-role admin keys, Row-Level Security (RLS) policies, and database migration scripts.

---

## 🏛️ Tri-System Architecture Diagram

```mermaid
flowchart LR
    subgraph Vercel["Vercel Cloud (Client System)"]
        Client["/client (React + Vite)"]
        VercelConfig["vercel.json SPA Rewrites"]
        ClientEnv[".env: VITE_SUPABASE_URL & ANON_KEY"]
    end

    subgraph Render["Render Cloud (Server System)"]
        Server["/server (Express API)"]
        GeminiSDK["@google/genai (Gemini 2.5 Flash)"]
        RenderYAML["render.yaml Web Service"]
    end

    subgraph Supabase["Supabase Cloud (Backend System)"]
        SupaPostgres[("Supabase PostgreSQL (Port 6543 / 5432)")]
        SupaRLS["Row Level Security (RLS) Policies"]
        SupaAuth["Supabase Service Role & Anon Client"]
        BackendService["/backend (Database & Cloud Proxy)"]
    end

    Client -->|API Requests with Bearer JWT| Server
    Client -.->|Direct Realtime Read / Anon Client| SupaPostgres
    Server -->|Inference & Structured Extraction| GeminiSDK
    Server -->|Elevated DB Queries & Pooler| SupaPostgres
    BackendService -->|Migrations & Admin Control| SupaAuth
    SupaAuth --> SupaPostgres
```

---

## 📂 Tri-System Directory & Environment Breakdown

```
synapse-enterprise-ai/
├── client/                     # SYSTEM 1: VERCEL FRONTEND CLIENT
│   ├── src/config/supabase.js  # Supabase public browser client
│   ├── .env                    # VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   ├── .env.example
│   ├── vercel.json             # Vercel Single-Page Application routing
│   └── package.json
│
├── server/                     # SYSTEM 2: RENDER EXPRESS API & AI SERVER
│   ├── src/config/supabase.js  # Supabase dual client (Anon & Service Role Admin)
│   ├── src/config/gemini.js    # Google Gemini 2.5 Flash SDK
│   ├── .env                    # PORT, SUPABASE_*, DATABASE_URL, GEMINI_API_KEY, CLIENT_URL
│   ├── .env.example
│   ├── render.yaml             # Render Web Service Blueprint
│   └── package.json
│
└── backend/                    # SYSTEM 3: SUPABASE DATABASE & CLOUD BACKEND
    ├── supabase/
    │   ├── schema.sql          # Complete Supabase RLS policies, ENUMs & tables
    │   └── seed.sql            # Enterprise demo persona seed SQL
    ├── src/config/supabase.js  # Supabase Service Role client
    ├── src/config/db.js        # Supabase PostgreSQL Pooler connection & fallback
    ├── .env                    # SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, DATABASE_URL
    ├── .env.example
    ├── render.yaml             # Render Backend Blueprint
    └── package.json
```

---

## ⚡ Supabase Setup (1-Click SQL Script)

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and run [`backend/supabase/schema.sql`](file:///c:/Users/ANSUMAN%20MALLICK/hack/synapse-enterprise-ai/backend/supabase/schema.sql).
4. Run [`backend/supabase/seed.sql`](file:///c:/Users/ANSUMAN%20MALLICK/hack/synapse-enterprise-ai/backend/supabase/seed.sql) to prefill the database with demo users, documents, and workflows.
5. In **Project Settings** -> **API**, copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon public key**
   - **service_role secret key**
6. In **Project Settings** -> **Database** -> **Connection string**, select **Transaction Pooler** (URI) and copy the `DATABASE_URL`.

---

## 🚀 Deployment Instructions

### 1. Client System -> Deploy to Vercel
* Connect repository and set root directory to `client` (or `frontend`).
* Vercel will automatically detect `client/vercel.json`.
* Add Environment Variables in Vercel Dashboard:
  - `VITE_API_URL`: URL of your deployed Render Server (e.g. `https://synapse-enterprise-server.onrender.com/api`)
  - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `<your_anon_key>`

### 2. Server System -> Deploy to Render
* Create a **Web Service** on Render with root directory `server`.
* Set build command: `npm install`
* Set start command: `npm start`
* Or use `server/render.yaml` with Render Blueprints.
* Add Environment Variables:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`: Supabase Transaction Pooler URI
  - `GEMINI_API_KEY`: Google Gemini API Key
  - `CLIENT_URL`: Your Vercel domain (e.g. `https://synapse-enterprise-ai.vercel.app`)

### 3. Backend System -> Deploy to Render & Supabase
* Root directory: `backend`
* Connects directly with Supabase via `@supabase/supabase-js` service role and transaction pooler.


---

## 🚀 Key Platform Capabilities

1. **AI Document Ingestion & Extraction**
   - Ingests financial statements, technical architecture specs, HR policies, and roadmaps.
   - Streams raw text or files to **Gemini 2.5 Flash**, extracting executive summaries, sentiment ratings, key entity chips, and concrete next actions based on strict JSON schemas.

2. **Cross-Departmental Workflow Orchestration**
   - Interactive 4-column visual Kanban board (`backlog`, `in_progress`, `review`, `completed`).
   - One-click **AI Task Breakdown Generator**: Generates subtasks with suggested collaborating departments, estimated hours, and cross-departmental risk assessments.

3. **Context-Aware Enterprise Copilot**
   - Natural language conversational assistant grounded in enterprise knowledge.
   - Retrieval-Augmented Generation (RAG) queries PostgreSQL document summaries, metric KPIs, and open task telemetry to answer complex queries with grounded citations.

4. **Executive Insights & Automated Reporting**
   - Aggregated KPI cards, departmental health radar, and real-time sentiment extraction.
   - One-click weekly executive briefing generation powered by Gemini with printable PDF view and CSV exports.

5. **Cryptographic Security & Compliance**
   - Bcrypt password hashing with **12 salt rounds**.
   - JWT authentication with **24-hour expiration window**.
   - Strict request body validation via **Zod schemas**.
   - Comprehensive, immutable audit trail for every user action.

---

## 📂 Project Structure

```
synapse-enterprise-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # PostgreSQL pg.Pool + resilient enterprise engine
│   │   │   └── gemini.js             # @google/genai initialization & fallback heuristics
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, Me, User directory
│   │   │   ├── documentController.js # Ingestion & Gemini structured extraction
│   │   │   ├── workflowController.js # Kanban tasks & AI subtask decomposition
│   │   │   ├── copilotController.js  # RAG enterprise conversational queries
│   │   │   └── analyticsController.js# KPIs, health checks, & executive briefings
│   │   ├── db/
│   │   │   ├── init.sql              # Production PostgreSQL migration schema
│   │   │   └── seed.js               # Standalone database migration runner
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT Bearer verification
│   │   │   ├── rbacMiddleware.js     # Admin, Manager, Employee RBAC & RLS rules
│   │   │   └── validateMiddleware.js # Zod request validation
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── workflowRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── schemas/
│   │   │   ├── geminiSchemas.js      # Gemini 2.5 Flash response schemas
│   │   │   └── validationSchemas.js  # Zod validation schemas
│   │   ├── services/
│   │   │   ├── auditService.js       # Audit logging service
│   │   │   └── geminiService.js      # Document analysis, workflows & RAG queries
│   │   └── server.js                 # Express server with CORS & rate limiting
│   ├── .env                          # Backend environment variables
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuditLogTable.jsx     # Paginated audit trail with inspection modal
│   │   │   ├── CopilotChat.jsx       # RAG conversational chat interface
│   │   │   ├── DocumentUploadModal.jsx # Drag-and-drop file uploader & extraction
│   │   │   ├── Navbar.jsx            # Top navigation & system status telemetry
│   │   │   ├── ProtectedRoute.jsx    # Authentication & RBAC guard
│   │   │   ├── Sidebar.jsx           # Side navigation with department silos
│   │   │   ├── StatCard.jsx          # Reusable KPI trend card
│   │   │   └── WorkflowKanban.jsx    # Interactive Kanban task board
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth provider, JWT storage, demo switcher
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Executive cockpit with KPIs & metrics
│   │   │   ├── Documents.jsx         # Document intelligence repository
│   │   │   ├── Workflows.jsx         # Initiative creation & task board
│   │   │   ├── Copilot.jsx           # Enterprise copilot full workspace
│   │   │   ├── Reports.jsx           # Briefing generator & CSV/PDF exports
│   │   │   ├── Settings.jsx          # Telemetry, health check & security controls
│   │   │   ├── Login.jsx             # Login screen with 1-click demo personas
│   │   │   └── Register.jsx          # New user onboarding with department select
│   │   ├── services/
│   │   │   └── api.js                # Axios client with JWT interceptor
│   │   ├── App.jsx                   # React Router route registry
│   │   ├── index.css                 # Tailwind directives & glassmorphic styles
│   │   └── main.jsx                  # Application entry point
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔑 Demo Role Credentials Matrix

For immediate evaluation, the platform includes pre-seeded enterprise demo personas accessible with **1-click** on `/login`:

| Persona | Name | Email | Password | Role | Department |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Executive Admin** | Sarah Connor | `admin@synapse.ai` | `Synapse2026!` | `admin` | Operations |
| **Finance Lead** | Marcus Vance | `finance.lead@synapse.ai` | `Synapse2026!` | `manager` | Finance |
| **VP Engineering** | Elena Rostova | `eng.lead@synapse.ai` | `Synapse2026!` | `manager` | Engineering |
| **Staff Engineer** | Alex Rivera | `employee@synapse.ai` | `Synapse2026!` | `employee` | Engineering |

---

## 🛠️ Installation & Setup Guide

### 1. Backend Setup

```bash
cd synapse-enterprise-ai/backend
npm install
```

Configure your environment in `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/synapse_enterprise
JWT_SECRET=super_secret_enterprise_jwt_key_2026_synapse_production
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

*(Note: If PostgreSQL is not currently running locally, Synapse will automatically switch to its resilient enterprise in-memory engine pre-seeded with all demo data, so you can test all features immediately without any database setup!)*

Start the backend server:
```bash
npm start
# or for live reloading:
npm run dev
```

### 2. Frontend Setup

```bash
cd synapse-enterprise-ai/frontend
npm install
npm run dev
```

The application will be accessible at: `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Privileges |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account with department & role | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password and receive JWT | Public |
| `GET` | `/api/users/me` | Fetch currently authenticated user profile | Authenticated |
| `GET` | `/api/users` | List enterprise users for assignment routing | Authenticated |
| `GET` | `/api/documents` | List ingested documents (scoped by department) | Authenticated |
| `POST` | `/api/documents` | Upload & extract document with Gemini 2.5 Flash | Authenticated |
| `DELETE`| `/api/documents/:id` | Remove document from repository | Manager / Admin |
| `GET` | `/api/workflows` | List workflows & tasks (scoped by department) | Authenticated |
| `POST` | `/api/workflows` | Create initiative with AI subtask decomposition | Manager / Admin |
| `PATCH`| `/api/workflows/:id` | Update task status or assignment | Authenticated |
| `DELETE`| `/api/workflows/:id` | Remove task initiative | Manager / Admin |
| `POST` | `/api/ai/copilot` | Natural language enterprise query with RAG | Authenticated |
| `GET` | `/api/analytics/summary` | Aggregate executive KPIs & department metrics | Authenticated |
| `GET` | `/api/analytics/audit-logs`| Paginated cryptographic audit events | Authenticated |
| `POST` | `/api/reports/generate`| Generate automated weekly executive briefing | Authenticated |
| `GET` | `/api/analytics/health` | System health, DB status & Gemini SDK status | Public |

---

## 🧠 Google Gemini 2.5 Flash Integration

The platform utilizes `@google/genai` to deliver high-speed, schema-enforced inference:

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateGeminiResponse(prompt, schema = null) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: schema ? {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are Synapse Core, an advanced Enterprise AI system..."
    } : {
      systemInstruction: "You are Synapse Core, an advanced Enterprise AI system..."
    }
  });
  return response.text;
}
```

---

## 🔒 Security & Data Isolation Architecture

- **Tenant / Department Boundary Enforcement**: Standard employees can only view documents and workflows belonging to their home department. Managers and Global Admins possess cross-departmental orchestration privileges.
- **Bcrypt Salt Rounds**: All passwords hashed with **12 salt rounds**.
- **JWT Protection**: Tokens expire in **24 hours**, verified on every request via `authMiddleware`.
- **Zod Validation**: Rejects malformed requests before hitting business logic.
- **Audit Logging**: Every sensitive action (`USER_LOGIN`, `INGEST_DOCUMENT`, `CREATE_WORKFLOW`, `UPDATE_WORKFLOW`, `COPILOT_QUERY`) is recorded with timestamp and user metadata.

