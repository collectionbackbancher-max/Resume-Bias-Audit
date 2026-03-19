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
- **Provider**: Supabase Auth (email/password).
- **Mechanism**: JWT tokens for stateless session management.
- **Security**: All protected API routes are secured with an `isAuthenticated` middleware.

### Database
- **Type**: PostgreSQL.
- **ORM**: Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts` and `shared/models/`.
- **Key Tables**: `users` (profiles), `resumes` (analysis data).

### Pricing & Subscription
- **Tiers**: Free, Starter, and Team plans with varying scan limits, features (e.g., bulk uploads, PDF downloads), and pricing.
- **Enforcement**: Backend logic enforces plan limits and feature access.
- **Frontend**: Displays plan information, usage, and upgrade options.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data store.
- **OpenAI API**: Used for AI-powered text cleaning, section parsing, bias analysis, and rewrite suggestions.
- **Supabase Auth**: For user authentication and management.
- **System binaries**: Tesseract (OCR) and pdftoppm (PDF conversion).

### Key Libraries/Packages
- **Backend**: `express`, `drizzle-orm`, `multer`, `pdf-parse`, `mammoth`, `openai`.
- **Frontend**: `react`, `wouter`, `@tanstack/react-query`, `framer-motion`, `recharts`, `shadcn/ui`.
- **Shared**: `zod` (for schema validation).