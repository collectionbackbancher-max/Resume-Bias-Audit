# BiasAuditor.ai

## Overview

BiasAuditor.ai is a web application designed to help hiring teams identify and mitigate unconscious bias in resumes. It analyzes uploaded resumes (PDF or DOCX) for gender-coded language, age proxies, and other bias markers using a combination of a rule-based engine and AI-powered analysis. The system provides a fairness score, risk level classification (Low/Moderate/High), detailed bias flags, and actionable remediation suggestions. The project aims to promote fair and inclusive hiring practices, improving diversity and reducing hiring risks for companies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Functionality
The application provides resume scanning, bias detection, and reporting features. Users can upload single or bulk resumes, which are then processed through a pipeline involving text extraction, rule-based bias engine analysis, and advanced AI analysis using OpenAI. Results are stored and presented in detailed reports, including fairness scores, risk levels, and specific bias flags with suggestions.

### Frontend
- **Framework**: React with TypeScript (Vite).
- **UI/UX**: Utilizes shadcn/ui (new-york style) built on Radix UI with Tailwind CSS for a modern, neon blue/black theme with cyan accents. Custom fonts (Inter, Space Grotesque) are used.
- **Animations**: Framer Motion is used for dynamic UI elements and transitions.
- **Data Visualization**: Recharts for displaying fairness scores and risk distributions.
- **Auth**: Firebase client SDK (`firebase`). Auth state via `onAuthStateChanged`. `client/src/lib/firebase.ts` exports `auth`. Login/Signup use `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`.
- **Key Pages**: Landing page, Dashboard (analysis history), Upload (resume submission), Report (detailed analysis), Pricing, Blog, and Policy pages. All pages maintain a consistent branding and design aesthetic.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful JSON API.
- **File Processing**: Handles PDF and DOCX text extraction using `pdf-parse` and `mammoth`.
- **Bias Analysis Pipeline**: Text extraction, rule-based bias engine (`server/bias_engine.ts`), and OpenAI API calls for deeper AI analysis (summary, flags, suggestions).
- **Advanced Features**:
    - **NLP Pipeline**: Uses GPT-4o for text cleaning (OCR artifact correction) and structured resume section parsing.
    - **Context-aware Bias Detection**: The bias engine employs expanded keyword lists, section-weighted scoring, frequency-based severity, and identifies intersection signals for more accurate bias flagging.
    - **Bulk Resume Upload**: Supports parallel processing of multiple resumes with per-file error handling and plan-based limits.
    - **Report Page Enhancements**: Includes raw/cleaned text toggle, inline highlighting of flagged phrases, parsed sections panel, and rich flag cards with detailed suggestions.

### Authentication
- **Provider**: Firebase Auth (email/password).
- **Backend middleware**: `server/firebaseAuth.ts` — verifies Firebase ID tokens via `firebase-admin`. Sets `req.user = { id, email, name }`.
- **Frontend**: `client/src/hooks/use-auth.ts` uses `onAuthStateChanged`. Token retrieved via `auth.currentUser.getIdToken()` in `queryClient.ts`.
- **Security**: All protected API routes are secured with `isAuthenticated` from `server/firebaseAuth.ts`.

### ATS Integration
- **Integrations Page**: `/integrations` — connect ATS accounts, import candidates, run bulk bias analysis.
- **Greenhouse Support**: Mock Greenhouse API (real-ready structure). Connect via API key, fetch candidates, scan all resumes in one click.
- **Modular Design**: ATS service logic structured for easy addition of Lever, Workday, BambooHR, etc.
- **API Routes**: `POST /api/ats/connect`, `DELETE /api/ats/disconnect`, `GET /api/ats/status`, `GET /api/ats/candidates`, `POST /api/ats/scan`.

### Database
- **Type**: Firestore (Firebase).
- **Collections**: `users` (doc ID = Firebase UID, stores plan/usage), `scans` (auto-ID, bias analysis results), `ats_connections` (doc ID = userId).
- **Schema**: Plain TypeScript interfaces in `shared/schema.ts` (no ORM).
- **Storage layer**: `server/storage.ts` (`FirestoreStorage` class) — full CRUD via `firebase-admin/firestore`.

### Pricing & Subscription
- **Tiers**: Free, Starter, and Team plans with varying scan limits, features (e.g., bulk uploads, PDF downloads), and pricing.
- **Enforcement**: Backend logic enforces plan limits and feature access.
- **Frontend**: Displays plan information, usage, and upgrade options.
- **Billing**: Paddle integration present (webhook endpoint at `/api/paddle/webhook`). Paddle storage backed by Firestore via `server/replit_integrations/paddle/storage.ts`.

## External Dependencies

### Required Services
- **Firestore**: Primary data store (via Firebase Admin SDK).
- **Firebase Auth**: User authentication (email/password).
- **OpenAI API**: Used for AI-powered text cleaning, section parsing, bias analysis, and rewrite suggestions (via Replit AI Integrations: `AI_INTEGRATIONS_OPENAI_API_KEY` + `AI_INTEGRATIONS_OPENAI_BASE_URL`).
- **System binaries**: Tesseract (OCR) and pdftoppm (PDF conversion).

### Required Environment Variables
**Backend (server):**
- `FIREBASE_PROJECT_ID` — Firebase project ID
- `FIREBASE_CLIENT_EMAIL` — Service account client email
- `FIREBASE_PRIVATE_KEY` — Service account private key (newlines as `\n`)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (Replit integration)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (Replit integration)

**Frontend (client — must be prefixed `VITE_`):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_APP_ID`

### Key Libraries/Packages
- **Backend**: `express`, `firebase-admin`, `multer`, `pdf-parse`, `mammoth`, `openai`.
- **Frontend**: `react`, `firebase`, `wouter`, `@tanstack/react-query`, `framer-motion`, `recharts`, `shadcn/ui`.
- **Shared**: `zod` (for schema validation).
