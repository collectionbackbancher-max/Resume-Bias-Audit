# Deploying BiasAuditor.ai to Firebase + Cloud Run

This guide walks through deploying the app to:
- **Google Cloud Run** — hosts the Express backend
- **Firebase Hosting** — serves the React frontend and proxies `/api/**` to Cloud Run

---

## Prerequisites

You need:
- A [Google account](https://accounts.google.com)
- A [Google Cloud project](https://console.cloud.google.com) with **billing enabled**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20+ installed

---

## Step 1 — Install the CLIs

```bash
# Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Firebase CLI
npm install -g firebase-tools
firebase login
```

---

## Step 2 — Create your Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and click **Add project**
2. Name it (e.g. `biasauditor-ai`) and follow the prompts
3. Note the **Project ID** shown on the project settings page

---

## Step 3 — Link this repo to your project

Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual project ID:

```json
{
  "projects": {
    "default": "biasauditor-ai"
  }
}
```

Also set your project in gcloud:

```bash
gcloud config set project YOUR_FIREBASE_PROJECT_ID
```

---

## Step 4 — Enable required APIs

```bash
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

---

## Step 5 — Build and push the Docker image

Replace `YOUR_PROJECT_ID` with your actual Google Cloud project ID:

```bash
# Authenticate Docker with Google
gcloud auth configure-docker

# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/biasauditor-api .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/biasauditor-api
```

---

## Step 6 — Deploy to Cloud Run

Replace every `YOUR_*` placeholder with your real values:

```bash
gcloud run deploy biasauditor-api \
  --image gcr.io/YOUR_PROJECT_ID/biasauditor-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "SUPABASE_DATABASE_URL=YOUR_SUPABASE_DATABASE_URL" \
  --set-env-vars "SUPABASE_URL=YOUR_SUPABASE_URL" \
  --set-env-vars "SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY" \
  --set-env-vars "AI_INTEGRATIONS_OPENAI_API_KEY=YOUR_OPENAI_KEY" \
  --set-env-vars "AI_INTEGRATIONS_OPENAI_BASE_URL=YOUR_OPENAI_BASE_URL"
```

After deployment completes, Cloud Run prints a **Service URL** like:

```
Service URL: https://biasauditor-api-xxxxxxxxxx-uc.a.run.app
```

**Copy that URL** — you need it in the next step.

---

## Step 7 — Add your Cloud Run URL to firebase.json

Open `firebase.json` and replace **both** occurrences of `CLOUD_RUN_URL` with the
Service URL you copied in Step 6:

```json
"rewrites": [
  {
    "source": "/api/**",
    "destination": "https://biasauditor-api-xxxxxxxxxx-uc.a.run.app"
  },
  {
    "source": "/health",
    "destination": "https://biasauditor-api-xxxxxxxxxx-uc.a.run.app"
  },
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

---

## Step 8 — Build and deploy the frontend to Firebase Hosting

```bash
# Build the frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Firebase prints your live Hosting URL:

```
Hosting URL: https://YOUR_PROJECT_ID.web.app
```

---

## Step 9 — Allow your Firebase domain in Supabase

1. Go to your [Supabase project](https://supabase.com/dashboard) → **Authentication** → **URL Configuration**
2. Add your Firebase Hosting URL (`https://YOUR_PROJECT_ID.web.app`) to the **Redirect URLs** list
3. Also add any custom domain you plan to use

---

## Environment Variables Reference

| Variable | Where to find it |
|---|---|
| `SUPABASE_DATABASE_URL` | Supabase dashboard → Project Settings → Database → Connection string (pooler) |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon/public key |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Your Replit AI integrations key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Your Replit AI integrations base URL |

---

## Subsequent deployments

After the first deployment, updating the app is just two commands:

```bash
# Re-build and push backend image, then redeploy Cloud Run
docker build -t gcr.io/YOUR_PROJECT_ID/biasauditor-api . && \
docker push gcr.io/YOUR_PROJECT_ID/biasauditor-api && \
gcloud run deploy biasauditor-api --image gcr.io/YOUR_PROJECT_ID/biasauditor-api --region us-central1

# Re-build and redeploy frontend
npm run build && firebase deploy --only hosting
```
