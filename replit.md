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
- **Method**: Supabase Auth (email/password) — replaces old Replit Auth
- **Session Storage**: Supabase JWT tokens (stateless, no server-side sessions)
- **Frontend**: `@supabase/supabase-js` client in `client/src/lib/supabase.ts`
- **Backend**: `server/supabaseAuth.ts` — verifies JWT via `supabase.auth.getUser(token)`
- **Auth Pages**: `/login` (Login.tsx) and `/signup` (Signup.tsx)
- **API Auth**: `Authorization: Bearer <access_token>` header on all API requests
- **Auth Routes**: `GET /api/auth/user` — returns current user from JWT
- **Middleware**: `isAuthenticated` guard in `server/supabaseAuth.ts` on all protected API routes
- **User sync**: On each request, Supabase user is upserted into local `users` PostgreSQL table
- **Supabase Project**: `https://ajlyemjgrwooisevyxse.supabase.co`

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

## Pricing & Subscription System

### Plans & Limits
- **Free Plan**: 5 scans/month, single file uploads only, no PDF downloads
- **Starter Plan** ($9/month): 100 scans/month, bulk uploads (up to 10 files), PDF downloads
- **Team Plan** ($29/month): 500 scans/month, all Starter features + priority processing

### Backend Implementation
- **Plan Enforcement**: Checked on every scan before processing (`/api/scan-resume` and `/api/scan-bulk-resumes`)
- **Scan Limit Tracking**: `scans_used` counter in `users_metadata` table, resets monthly
- **Bulk Upload Limits**: Free users limited to 1 file, Starter/Team to 10 files per request
- **PDF Download Restriction**: Free users get 403 error when attempting PDF download via `/api/generate-report/:id`
- **Plan Endpoints**:
  - `GET /api/user/plan` — Returns user's current plan, scan usage, and feature flags
  - `POST /api/user/upgrade` — MVP endpoint for upgrading plan (no payment processing yet)

### Frontend
- **Pricing Page** (`client/src/pages/Pricing.tsx`): Displays all 3 plans with features, highlights Starter as "Most Popular"
- **Dashboard Plan Card**: Shows current plan, scans used/remaining with animated progress bar, upgrade button (hidden for Team users)
- **Feature Flags**: UI shows/hides features based on plan (bulk upload, PDF download buttons)

## Frontend Design & Styling

### Landing Page Redesign
- **Modern Hero Section**: Large gradient typography with neon blue accents on black background
- **Animated Background**: Floating gradient orbs with smooth animations using Framer Motion
- **Dynamic Badges**: Pulsing animations on "AI-Powered Bias Detection" badge
- **Enhanced CTA Buttons**: Gradient backgrounds with hover scale animations
- **Animated Statistics**: Gradient colored stat numbers that scale on hover
- **Improved Footer**: Organized into Product, Company, and Legal columns with policy links

### Dashboard Redesign
- **Neon Blue/Black Theme**: Matches landing page with cyan accents
- **Modern Stats Cards**: Gradient backgrounds with hover shadow effects
- **Enhanced Risk Distribution**: Animated bars showing Low/Moderate/High risk breakdown
- **Improved Resume Cards**: Better typography, hover effects, and gradient borders
- **Loading States**: Animated spinner with gradient colors
- **Better Empty State**: Visually enhanced empty state with clear CTA

### Auth Pages Redesign
- **Login Page** (`client/src/pages/Login.tsx`): Neon blue/black theme with gradient card, cyan button, background orbs
- **Signup Page** (`client/src/pages/Signup.tsx`): Matches login with same neon aesthetic, dark inputs with cyan borders
- **Success Message**: Email confirmation page with emerald success indicator
- **Consistent Branding**: All auth pages use cyan accents, white text, dark backgrounds

### Policy Pages
- **Terms of Service** (`client/src/pages/TermsOfService.tsx`): Complete T&S documentation
- **Privacy Policy** (`client/src/pages/PrivacyPolicy.tsx`): Data collection and usage terms
- **Refund Policy** (`client/src/pages/RefundPolicy.tsx`): 30-day refund guarantee details
- **Consistent Styling**: All policy pages use the neon blue/black theme with back navigation

## Advanced Features (Built)

### NLP Pipeline (`server/nlp_pipeline.ts`)
- **Text Cleaning**: Calls GPT-4o to fix OCR artifacts (broken words, page numbers, noise) — only for OCR-extracted text
- **Section Parsing**: Calls GPT-4o to extract structured resume sections (name, summary, skills, experience, education, projects, other)
- Both steps run in parallel via `Promise.all()` for efficiency
- In-memory cache by text fingerprint to avoid redundant API calls

### Advanced Bias Detection (`server/bias_engine.ts`)
- **Context-aware**: Checks surrounding words ("aggressive sales growth" vs "aggressive leader" = different risk levels)
- **Expanded keyword lists**: Masculine-coded and feminine-coded language detection + age proxies
- **Section-weighted**: Experience/Summary flagged at 1.0× weight; Skills at 0.5×; Other at 0.4×
- **Frequency-based scoring**: Multiple occurrences raise severity
- **Intersection signals**: Age + leadership language combined = automatic High severity
- **Rich flag objects**: phrase, category, context, severity, description, suggestion, section per flag

### Bulk Resume Upload
- **Endpoint**: `POST /api/scan-bulk-resumes` — accepts 1–10 files per request (plan-dependent)
- **Parallel processing**: Files processed concurrently via `Promise.allSettled()`
- **Per-file error handling**: If one file fails, others continue; structured error response per file
- **Batch grouping**: All files in a single request assigned same `batchId` for querying later
- **Plan limits**: Free = 1 file/batch, Starter = 5, Team = 10
- **Response**: `{ batchId, totalFiles, processed, failed, results[] }`

### Report Page Enhancements
- **Raw/Cleaned text toggle**: Shows cleaned version (only if OCR modified text)
- **Annotated resume**: Inline highlighting of flagged phrases with severity colors
- **Parsed sections panel**: Displays extracted sections (name, skills, experience, etc.) with icons
- **Rich flag cards**: Phrase, category, section, context, severity badge, suggestion per flag
- **Intersection signals**: Highlighted when compound patterns detected
- **Score breakdown**: Language/age/name subscores

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable. Used for all data storage including sessions, users, and resume analyses.
- **OpenAI API** (via Replit AI Integrations): Connected via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`. Used for:
  - Text cleaning (GPT-4o)
  - Section parsing (GPT-4o)
  - Bias analysis (GPT-4o via bias_engine)
  - Rewrite suggestions (GPT-5.2)
- **System binaries**: Tesseract (OCR engine), pdftoppm (PDF to image conversion)

### Required Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit proxy)
- `SESSION_SECRET` — Secret for Express session encryption
- `ISSUER_URL` — OIDC issuer URL for Replit Auth (defaults to `https://replit.com/oidc`)
- `REPL_ID` — Replit environment identifier

### Key NPM Packages
- **Server**: express, drizzle-orm, pg, passport, openid-client, multer, pdf-parse, mammoth, openai, axios, node-tesseract-ocr
- **Client**: react, wouter, @tanstack/react-query, framer-motion, recharts, react-dropzone, shadcn/ui (Radix primitives), axios
- **Shared**: zod, drizzle-zod