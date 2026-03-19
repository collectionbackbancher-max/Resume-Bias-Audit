# BiasAuditor.ai

## Overview

BiasAuditor.ai is a web application that helps hiring teams detect unconscious bias in resumes. Users upload resumes (PDF or DOCX), and the system analyzes them for gender-coded language, age proxies, and other bias markers using a combination of a rule-based bias engine and OpenAI-powered AI analysis. Each resume receives a fairness score, risk level classification (Low/Moderate/High), and detailed bias flags with remediation suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React SPA)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state caching and mutations
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (Inter, Space Grotesk)
- **Animations**: Framer Motion for page transitions and UI animations
- **Charts**: Recharts for visualizing fairness scores (pie charts in reports)
- **File Upload**: react-dropzone for drag-and-drop file upload UI
- **Key Pages**:
  - `LandingPage` — Marketing/login page for unauthenticated users
  - `Dashboard` — Shows analysis history, average scores, risk distribution
  - `Upload` — File upload (PDF/DOCX) or manual text entry for resume scanning
  - `Report` — Detailed bias analysis report with score visualization and flag breakdown

### Backend (Express + Node.js)
- **Framework**: Express.js with TypeScript, run via tsx in dev, esbuild-bundled for production
- **API Design**: RESTful JSON API under `/api/` prefix
- **File Processing**: Server-side PDF parsing (pdf-parse) and DOCX extraction (mammoth) via multer for file uploads
- **Bias Analysis Pipeline**:
  1. File upload → text extraction (server-side)
  2. Rule-based bias engine (`server/bias_engine.ts`) scans for gender-coded words, age proxies, graduation years
  3. OpenAI API call for deeper AI-powered analysis (summary, detailed bias flags, suggestions)
  4. Results stored in database with score, risk level, and structured analysis JSON
- **Key Endpoints**:
  - `POST /api/scan-resume` — Upload file, extract text, run analysis
  - `GET /api/resumes` — List user's resume analyses
  - `GET /api/resumes/:id` — Get single resume analysis
  - `POST /api/resumes/:id/analyze` — Trigger AI analysis on stored resume

### Authentication
- **Method**: Replit Auth (OpenID Connect) — not username/password
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Implementation**: Passport.js with OIDC strategy, session middleware
- **Auth Routes**: `/api/login`, `/api/logout`, `/api/auth/user`
- **Middleware**: `isAuthenticated` guard on protected API routes

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` and `shared/models/` directory
- **Migration Strategy**: `drizzle-kit push` (schema push, not migration files)
- **Key Tables**:
  - `users` — Replit Auth user profiles (id, email, name, profile image)
  - `sessions` — Express session storage (required for auth)
  - `resumes` — Resume analyses (userId, filename, rawText, score, riskLevel, analysis JSON)
  - `conversations` / `messages` — Chat storage (from Replit integrations, may not be actively used in main app)

### Shared Code
- `shared/schema.ts` — Drizzle table definitions and Zod schemas, shared between client and server
- `shared/routes.ts` — API route definitions with Zod response schemas (type-safe API contract)
- `shared/models/` — Data model definitions (auth, chat)

### Build System
- **Dev**: Vite dev server with HMR proxied through Express
- **Production Build**: `script/build.ts` runs Vite for client bundle + esbuild for server bundle
- **Output**: `dist/public/` (client assets) and `dist/index.cjs` (server bundle)
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`

### Replit Integrations
The `server/replit_integrations/` and `client/replit_integrations/` directories contain pre-built integration modules:
- **Auth**: Replit OIDC authentication (actively used)
- **Chat**: Conversation/message CRUD with OpenAI streaming (available but secondary)
- **Audio**: Voice recording, playback, and streaming (available but secondary)
- **Image**: Image generation via OpenAI (available but secondary)
- **Batch**: Batch processing utilities with rate limiting (available but secondary)

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable. Used for all data storage including sessions, users, and resume analyses.
- **OpenAI API** (via Replit AI Integrations): Connected via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`. Used for AI-powered resume bias analysis.

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit proxy)
- `SESSION_SECRET` — Secret for Express session encryption
- `ISSUER_URL` — OIDC issuer URL for Replit Auth (defaults to `https://replit.com/oidc`)
- `REPL_ID` — Replit environment identifier

### Key NPM Packages
- **Server**: express, drizzle-orm, pg, passport, openid-client, multer, pdf-parse, mammoth, openai
- **Client**: react, wouter, @tanstack/react-query, framer-motion, recharts, react-dropzone, shadcn/ui (Radix primitives)
- **Shared**: zod, drizzle-zod