# NomaeTrust — Complete Project Guide

**Version:** 1.0  
**Last updated:** June 2025  
**Live app:** [https://nomaetrust.vercel.app](https://nomaetrust.vercel.app)  
**Source:** [https://github.com/ArshiaBajaj/NomaeTrust](https://github.com/ArshiaBajaj/NomaeTrust)

> **Download:** This file lives at `docs/NomaeTrust-Complete-Guide.md` in the repo. Open it in your editor or export to PDF for judges, investors, or teammates.

---

## Table of contents

1. [Brand & positioning](#1-brand--positioning)
2. [Executive summary](#2-executive-summary)
3. [Problem & solution](#3-problem--solution)
4. [Features & routes](#4-features--routes)
5. [User personas](#5-user-personas)
6. [Product principles](#6-product-principles)
7. [Technical architecture](#7-technical-architecture)
8. [API reference](#8-api-reference)
9. [Data models](#9-data-models)
10. [Environment variables](#10-environment-variables)
11. [Local development](#11-local-development)
12. [Deployment (Vercel)](#12-deployment-vercel)
13. [Browser extension & Discord bot](#13-browser-extension--discord-bot)
14. [Trusted sources & datasets](#14-trusted-sources--datasets)
15. [5-minute demo script](#15-5-minute-demo-script)
16. [Hackathon submission copy](#16-hackathon-submission-copy)
17. [Investor pitch](#17-investor-pitch)
18. [Responsible AI & disclosure](#18-responsible-ai--disclosure)
19. [Project file structure](#19-project-file-structure)
20. [Roadmap & known gaps](#20-roadmap--known-gaps)

---

## 1. Brand & positioning

### Name meaning

**Nomae** means **no confusion**.  
**NomaeTrust** = clarity you can trust before you share.

### Taglines

| Use | Copy |
|-----|------|
| Primary | **Rumor → Reality → Action** |
| Brand | **No confusion. Just the next step.** |
| Investor | **Pre-share verification — Nomae means no confusion.** |
| One-liner | **When the group chat panics, NomaeTrust listens.** |

### Elevator pitch (investor, ~20 sec)

*"Nomae" means no confusion. Someone forwards a scary headline or voice note — instead of a TRUE/FALSE label, NomaeTrust gives you an Action Card: what was said, what checks out, and what to do next. For platforms, we add a publish gate so confusion never goes live in the first place.*

### What makes NomaeTrust different

- **Action over verdict** — plain-language next steps, not TRUE/FALSE stamps
- **Pre-share, not post-mortem** — verify at the moment someone tries to share
- **Dual-sided** — families verify rumors; platforms gate publication
- **Local signal** — Confusion Map shows what neighbors are confused about
- **Media literacy** — Digital Detective trains deepfake recognition

---

## 2. Executive summary

NomaeTrust is a family-first trust platform that helps people move from **confusion → clarity → action** when rumors spread about local services (food banks, school closures, boil-water advisories, transit disruptions, etc.).

Unlike generic fact-checkers that output binary TRUE/FALSE labels, NomaeTrust produces **Action Cards** with plain-language next steps, multilingual sharing, community validation, and gamified media literacy training.

**Demo scope:** Atlanta / Georgia (metro-scalable architecture)  
**Challenge context:** USAII High School Challenge (Direction B)

**Core story:** At 2 a.m., when Fatima receives a frantic WhatsApp voice note — *"The food bank closed, don't go"* — NomaeTrust turns panic into a verified Action Card with tap-to-call links, trusted government sources, and shareable evidence in Somali and Spanish.

---

## 3. Problem & solution

### The problem

| Pain | Description |
|------|-------------|
| Speed of rumors | WhatsApp voice notes, screenshots, and forwarded clips spread faster than people can verify |
| Binary fact-checking fails families | "FALSE" labels don't tell someone whether to go to the food bank tomorrow or call 211 |
| Reused / manipulated media | Old photos and deepfake clips are reframed with new captions ("happening now in Atlanta") |
| Language & trust gaps | Multilingual households need shareable summaries elders can forward |
| No community signal | Individual verification doesn't show whether neighbors are confused about the same rumor |

### The solution

Five integrated flows:

1. **Action Cards** — verify voice notes and screenshots
2. **News Watch** — check headlines with fact-check search + outlet context
3. **Context Trace** — detect reused/out-of-context images
4. **Digital Detective** — gamified deepfake literacy
5. **Confusion Map + Publish Gate** — community validators and platform review

---

## 4. Features & routes

### Portal model

Two audiences share the same backend but different home experiences:

| Portal | Login route | Home route | Primary use |
|--------|-------------|------------|-------------|
| **Individual / family** | `/login/individual` | `/individual` | Verify rumors, Action Cards, News Watch |
| **Platform / publisher** | `/login/platform` | `/platform` | Publish gate, review queue |
| **Trust Circle** | `/trust-circle/login` | `/trust-circle` | Family validator circles (demo) |

Auth is lightweight demo auth — profile saved to `localStorage` (no password).

### All routes

| Route | Page | Auth | Mobile tab | Header |
|-------|------|------|------------|--------|
| `/` | Landing / entry gate | — | — | Hidden |
| `/choose` | Switch portal | — | — | Hidden |
| `/login/individual` | Individual sign-in | — | — | Top bar + back |
| `/login/platform` | Platform sign-in | — | — | Top bar + back |
| `/individual` | Major claims home (Shazam hub) | Individual | Claims | Hidden |
| `/platform` | Publish gate | Platform | Gate | Hidden |
| `/news-watch` | News Watch | Any signed-in | Verify | Top bar |
| `/stress` | Action Cards (voice) | Any signed-in | — | Top bar |
| `/screenshot` | Screenshot verification | Any signed-in | — | Top bar |
| `/call` | Context Trace | Any signed-in | — | Top bar |
| `/detective` | Digital Detective | Any signed-in | Detective | Immersive (no chrome) |
| `/trust-map` | Confusion Map | Any signed-in | Map | Top bar |
| `/settings` | Settings | Any signed-in | — | Hidden |
| `/disclosure` | Responsible AI | — | — | Top bar |
| `/trust-circle/login` | Trust Circle login | — | — | Top bar |
| `/trust-circle` | Trust Circle dashboard | Trust Circle | — | Top bar |
| `/home` | Marketing home (desktop) | — | — | Hidden |

**Legacy redirects:** `/voice` → `/stress`, `/context-trace` → `/call`, `/context-lens` → `/call`, `/call-verification` → `/call`

### Feature details

#### Action Cards (`/stress`)

- Upload audio/video ≤25 MB (`.mp3`, `.wav`, `.m4a`, `.mp4`, `.webm`)
- Pipeline: Upload → Whisper transcription → claim extraction → regional RAG → Action Card
- Outputs: plain summary, action steps, do-not-do list, primary CTA URL, Somali + Spanish translations
- PDF export (jsPDF), WhatsApp clipboard share
- Claims auto-sync to Confusion Map

#### Screenshot verification (`/screenshot`)

- GPT-4o-mini vision OCR
- Same Action Card pipeline as voice
- Link to Context Trace when reuse suspected

#### News Watch (`/news-watch`)

- Paste or share headlines
- Outlet reliability tiers from curated catalog
- Fact-check search: Google Fact Check API → OpenAI web search → demo fallback
- Builds Action Card with confidence bands

#### Context Trace (`/call`)

- Upload image or paste public image URL
- EXIF extraction + GPT-4o vision narrative analysis
- SerpAPI reverse image search (URL path)
- Timeline of appearances, narrative drift score (0–100), verdict taxonomy
- Verdicts: Authentic, Reused Media, Out of Context, Misleading

#### Digital Detective (`/detective`)

- Swipe left = Manipulated, right = Verified
- SDFVD video clips (H.264); optional FaceForensics++
- XP, levels, combos, daily streak, 6 achievements
- Optional Hive AI deepfake scoring
- Progress in `localStorage` (`nomae-detective-progress-v2`)

#### Confusion Map (`/trust-map`)

- Leaflet map with pins colored by verification status
- Hotspot aggregation, community feed, manual rumor reports
- Validator queue — human review + provenance badges
- 30-second polling refresh
- Major claims API for home feed

#### Publish Gate (`/platform`)

- Content submission → automated risk signals
- Human moderator: Approved / Hold / Blocked
- Policy configuration, review queue, stats dashboard

#### Trust Circle (`/trust-circle`)

- Create/join family validator circles
- Rotating 4-word trust phrase
- Simulated call verification (`POST /api/verify-call`)
- Voice passport enrollment (localStorage demo)

---

## 5. User personas

### Fatima (Anxious Forwarder) — primary

- Age 34, works nights, receives WhatsApp voice notes from church groups
- Languages: English + Somali
- Need: *"Is this true? What should I do tonight?"*
- Success: Action Card with 211 link, Somali summary, confidence band

### Marcus (Community Validator) — secondary

- Library volunteer / neighborhood leader
- Need: see local rumors; attach provenance
- Success: reviews validator queue; badges claim with official source

### Teen (Media Literacy Trainee) — tertiary

- Sees deepfakes on TikTok/WhatsApp
- Success: completes Detective cases; learns forensic tells

---

## 6. Product principles

1. **Action over verdict** — always pair analysis with "what to do next"
2. **Show your work** — cite trusted sources; expose confidence bands
3. **Human in the loop** — route uncertain claims to community validators
4. **Multilingual by default** — Somali + Spanish on Action Cards
5. **Fail gracefully** — demo mode when API keys missing; never blank-screen
6. **Mobile-first** — PWA shell, bottom tab bar, immersive Detective

---

## 7. Technical architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7 |
| Maps | Leaflet, react-leaflet, markercluster |
| Backend | Express 4, TypeScript (tsx), multer |
| AI | OpenAI (Whisper, GPT-4o-mini, GPT-4o vision) |
| Storage (MVP) | In-memory stores + localStorage + optional JSON persistence |
| Media | ffmpeg-static, SDFVD/FaceForensics import scripts |
| Deploy | Vercel (frontend + serverless backend) |

### System diagram

```
┌─────────────────────────────────────────────────────────┐
│              NomaeTrust Frontend (Vite)                 │
│  Individual Home │ News Watch │ Detective │ Map │ PWA │
└──────────────────────────┬──────────────────────────────┘
                           │ /api/* (proxied on Vercel)
┌──────────────────────────▼──────────────────────────────┐
│                 Express Backend (:3001)                  │
│  analyze │ context-trace │ map │ detective │ platform │
│  news-watch │ trust-circle │ extension │ verify-call   │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
   OpenAI     SerpAPI     Hive AI    SDFVD clips
  (Whisper,   (reverse    (deepfake   (H.264 video)
   GPT-4o)    image)      scoring)
```

### Mobile app shell

- `MobileAppShell` wraps all routes on mobile (breakpoint 768px)
- Phone-framed layout on desktop (max-width 430px, rounded corners)
- Floating tab bar + FAB dock when authenticated
- `nt-frame--tabbed` adds bottom clearance only when tab bar visible
- `nt-frame--headerless` adds safe-area top padding on headerless screens
- Immersive mode on `/detective` (no nav, no tab bar)

### Analysis pipelines

**Voice / screenshot → Action Card:**
```
Upload → Whisper / Vision OCR → GPT claim extraction
    → Regional RAG (Atlanta sources) → GPT Action Card
    → Optional map sync
```

**News Watch:**
```
Headline → claim extraction → fact-check search → outlet tier
    → Action Card
```

**Context Trace:**
```
Image / URL → EXIF + vision + reverse search → GPT timeline
    → narrative drift score + verdict
```

**Publish Gate:**
```
Submission → automated risk signals → human approve/hold/block
```

---

## 8. API reference

Base URL (local): `http://localhost:3001/api`  
Base URL (production): `https://nomaetrust.vercel.app/api`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | `{ status, port, openaiConfigured, runtime }` |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze-audio` | Voice → Action Card (multipart) |
| POST | `/analyze-image` | Screenshot → Action Card (multipart) |

### Context Trace

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/context-trace/analyze` | Upload image trace (multipart) |
| POST | `/context-trace/analyze-url` | URL image trace (JSON) |

### Confusion Map

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/map/stream` | SSE claim stream |
| GET | `/map/hotspots` | Heat map data |
| GET | `/map/hotspots/:geohash/claims` | Claims in geohash |
| GET | `/map/claims` | All claims (filters) |
| GET | `/map/claims/major` | Major claims for home feed |
| GET | `/map/claims/:id` | Single claim |
| GET | `/map/validator-queue` | Pending validation |
| GET | `/map/categories` | Claim categories |
| GET | `/map/nearby` | Nearby claims (lat/lng) |
| GET | `/map/official-feeds` | Official government feeds |
| GET | `/map/export` | Export claims JSON |
| POST | `/map/claims` | Community report |
| POST | `/map/validate` | Validator action |
| POST | `/map/dispute` | Dispute a claim |
| POST | `/map/escalate` | Escalate urgent claim |

### Digital Detective

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/detective/challenges` | Video challenge deck |
| GET | `/detective/setup` | Clip import status |
| POST | `/detective/report-catch` | Report manipulated catch |
| POST | `/detective/score-url` | Hive video score |

### News Watch

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news-watch/outlets` | Curated outlet catalog |
| GET | `/news-watch/feed` | Live/demo news feed |
| POST | `/news-watch/check` | Check headline → Action Card |

### Platform Publish Gate

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/platform/stats` | Dashboard stats |
| GET | `/platform/policies` | Review policies |
| PATCH | `/platform/policies` | Update policies |
| GET | `/platform/reviews` | Review queue |
| GET | `/platform/reviews/:id` | Single review |
| POST | `/platform/submit` | Submit content for review |
| PATCH | `/platform/reviews/:id` | Approve / hold / block |

### Trust Circle

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trust-circle/create` | Create circle |
| POST | `/trust-circle/join` | Join with invite code |
| GET | `/trust-circle/me` | Current session |
| POST | `/trust-circle/leave` | Leave circle |

### Extension / Discord

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/extension/verify` | Verify claim text/URL (requires `X-NomaeTrust-Key`) |
| POST | `/verify-call` | Simulated call speaker verification |

---

## 9. Data models

### Claim (Confusion Map)

```
id, text, source (voice|screenshot|call|community|deepfake),
status (verified|unverified|disputed|pending),
analysisOutcome (verified|not_verified|inconclusive),
confidence, lat/lng, category, urgentReview,
validatorId, provenanceBadge, extractedAt
```

**Important:** `status` is reserved for community validators — never set from AI alone.

### Action Card / Evidence Card

```
plainLanguageSummary,
verificationOutcome (verified|not_verified|inconclusive),
confidenceBand (low|medium|high),
actionSteps[], doNotDo[],
primaryActionLabel, primaryActionUrl,
sourceReferences[],
translations { somali, spanish }
```

### Context Trace Analysis

```
imageDescription, exifDiscrepancies[],
timelineAppearances[],
originalContext, currentClaim,
narrativeDriftScore, narrativeDriftBand,
verdict (Authentic|Reused Media|Out of Context|Misleading)
```

### Detective Challenge

```
id, videoUrl, thumbnailUrl, isManipulated,
hiveVerdict, confidence, explanation,
highlightRegion, artifactLabel, category
```

### Detective Progress (localStorage)

```
xp, level, sessionCombo, dailyStreak,
achievements[], challengesCompleted,
totalCorrect, manipulatedCaught
```

---

## 10. Environment variables

Copy `backend/.env.example` → `backend/.env` for local dev.

```env
# Required for live AI analysis
OPENAI_API_KEY=sk-...

# Optional — improves specific features
SERPAPI_KEY=                    # Context Trace URL reverse search
HIVE_API_KEY=                   # Detective live deepfake scoring
GOOGLE_FACT_CHECK_API_KEY=      # News Watch ClaimReview (free Google API)
EXTENSION_API_KEY=              # Browser extension + Discord bot

# Deployment
FRONTEND_BASE_URL=http://localhost:5173   # Production: https://nomaetrust.vercel.app
PORT=3001

# Discord bot (bots/discord/.env)
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
```

### Vercel production

Set in **Project Settings → Environment Variables → Production**:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | **Yes** | Without this, demo fallbacks only |
| `FRONTEND_BASE_URL` | Recommended | `https://nomaetrust.vercel.app` |
| `GOOGLE_FACT_CHECK_API_KEY` | Optional | Free; best fact-check accuracy |
| `SERPAPI_KEY` | Optional | Context Trace URLs |
| `HIVE_API_KEY` | Optional | Live Detective scoring |
| `EXTENSION_API_KEY` | Optional | Extension + Discord |

**Note:** On Vercel serverless, map persistence skips disk writes (`VERCEL` env or read-only FS). Claims persist in memory per instance.

---

## 11. Local development

### Prerequisites

- Node.js 18+ (tested on v24)
- npm
- Optional: ffmpeg (via `ffmpeg-static` in devDependencies for clip scripts)

### Run the app

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env   # add OPENAI_API_KEY
npm run dev              # http://localhost:3001

# Terminal 2 — frontend
cd ..                    # repo root
npm install
npm run dev              # http://localhost:5173
```

Vite dev server proxies `/api` to the backend (see `vite.config.ts`).

### Detective video clips (one-time per machine)

Clips are gitignored; import after clone:

```bash
npm run detective:import-sdfvd
npm run detective:transcode-clips   # Required for Safari / iOS playback (H.264)
```

Optional research-grade pairs:

```bash
npm run detective:import-ff++
```

### Build

```bash
npm run build                    # frontend → dist/
cd backend && npm run build      # backend → backend/dist/
```

### Demo login credentials

| Portal | Fields | Example |
|--------|--------|---------|
| Individual | Display name, city | Fatima, Atlanta, GA |
| Platform | Org, team, email | Metro News, Trust & Safety, demo@news.com |

No password — profile stored in `localStorage`.

---

## 12. Deployment (Vercel)

### Configuration (`vercel.json`)

- Frontend: Vite build at `/`
- Backend: Express at `/_/backend` (serverless)
- Rewrite: `/api/*` → `/_/backend/api/*`
- SPA fallback: all other routes → `index.html`

### Deploy

```bash
vercel --prod --yes
```

Production URL: **https://nomaetrust.vercel.app**

Verify after deploy:

```bash
curl https://nomaetrust.vercel.app/api/health
# Expected: {"status":"ok","openaiConfigured":true,"runtime":"vercel"}
```

### Troubleshooting production OpenAI

1. Confirm `OPENAI_API_KEY` is set in Vercel Production env vars
2. Redeploy after adding env vars
3. Check `/api/health` for `openaiConfigured: true`
4. Map persistence is in-memory on serverless — expected for MVP

---

## 13. Browser extension & Discord bot

### Browser extension (`extension/`)

- **Manifest V3** — NomaeTrust Verify
- Injects verify badges on **Reddit** and **Discord** web
- Popup for manual verification
- Calls `POST /api/extension/verify` with `X-NomaeTrust-Key` header
- Load unpacked in Chrome: `chrome://extensions` → Load unpacked → select `extension/`

### Discord bot (`bots/discord/`)

```bash
cd bots/discord
npm install
cp .env.example .env   # DISCORD_BOT_TOKEN, backend URL, EXTENSION_API_KEY
npm run dev
```

- Slash command: verify claim text or URL
- Rate limit: 10 verifies/hour per user
- Returns embed with Action Card link + Confusion Map link

---

## 14. Trusted sources & datasets

### Regional RAG (Atlanta / Georgia)

~70 curated government and NGO sites in `backend/data/governmentWebsites.ts`:

- Atlanta Community Food Bank, Georgia 211, GEMA, APS, MARTA
- County health departments, boil-water advisories
- DeKalb / Cobb / Gwinnett portals

High-value sources receive scoring boost (6 sources per claim).

### Fact-check data

- **Google Fact Check Tools API** — ClaimReview entries
- **OpenAI web search** (`gpt-4o-mini-search-preview`) — fallback when Google key absent
- **Demo fact-checks** — `backend/data/demoFactChecks.ts`

### Deepfake training clips

| Dataset | Source | Import |
|---------|--------|--------|
| SDFVD | [Hugging Face: Hemgg/SDFVD-video-dataset](https://huggingface.co/datasets/Hemgg/SDFVD-video-dataset) | `npm run detective:import-sdfvd` |
| FaceForensics++ | Research dataset (optional) | `npm run detective:import-ff++` |

### Synthetic / demo data

- Demo voice scenarios when OpenAI unavailable
- Context Trace demo (reused-media scenario)
- Confusion Map seed claims (Atlanta-area examples)
- Platform publish gate sample queue
- Simulated call verification (disclosed as demo)

---

## 15. 5-minute demo script

**Live URL:** [https://nomaetrust.vercel.app](https://nomaetrust.vercel.app)  
**Device:** Phone or laptop (desktop shows centered phone frame)

### Prep (60 seconds before)

| Item | Detail |
|------|--------|
| Browser | Chrome or Safari, URL loaded |
| Login | Individual: **Fatima**, city **Atlanta, GA** |
| Platform backup | Org **Metro News**, email **demo@news.com** |
| Headline | *"BREAKING: Atlanta Public Schools closing all campuses tomorrow — officials say stay home"* |
| Voice note | Short `.mp3` or record: *"The food bank closed, don't go"* |

**Opener:** *"At 2 a.m., a WhatsApp voice note says the food bank closed. NomaeTrust doesn't just say TRUE or FALSE — it gives families an Action Card with what to do next."*

### Timing

| Time | Feature | Route | Do |
|------|---------|-------|-----|
| 0:00 | Landing + sign-in | `/` → login | Tap Individuals → Sign in as Fatima |
| 0:30 | Home hub | `/individual` | Show orb + verification tools grid |
| 1:15 | News Watch | `/news-watch` | Paste headline → Check → scroll Action Card |
| 2:00 | Voice / Action Cards | `/stress` | Upload audio → watch 5-step pipeline |
| 2:45 | Screenshots | `/screenshot` | Upload screenshot → Action Card |
| 3:15 | Context Trace | `/call` | Upload image → timeline + drift gauge |
| 3:50 | Digital Detective | `/detective` | Swipe one clip → show forensic tip |
| 4:20 | Confusion Map | `/trust-map` | Pan Atlanta → tap pin |
| 4:45 | Publish gate | `/platform` | Sign in as platform → review queue |

**Close:** *"NomaeTrust is rumor to reality to action: Action Cards for families, Context Trace for reused media, Detective for literacy, Confusion Map for community, and a publish gate for platforms."*

### If running long — cut in order

1. Screenshot upload (describe in one sentence)
2. Validator queue on map
3. Platform portal (mention verbally)
4. Second Detective swipe

### Judge phrases (use 2–3)

- *"Action over verdict."*
- *"Show your work — sources and confidence bands."*
- *"Built for 2 a.m. panic, not journalism school."*
- *"Nomae means no confusion."*

---

## 16. Hackathon submission copy

### About the project

NomaeTrust is a family-first trust platform that helps people move from **confusion → clarity → action** when rumors spread about local services. Unlike TRUE/FALSE labels, NomaeTrust produces **Action Cards**: plain-language next steps, trusted source citations, confidence bands, and multilingual summaries.

**Tagline:** Rumor → Reality → Action  
**Brand:** Nomae means no confusion  
**Demo scope:** Atlanta / Georgia

### Built with

**Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7, Leaflet, PWA  
**Backend:** Node.js, Express, TypeScript  
**Deploy:** Vercel (frontend + serverless backend)  
**AI:** OpenAI (Whisper, GPT-4o-mini), Google Fact Check API, SerpAPI, Hive AI (optional)  
**Other:** OpenStreetMap, jsPDF, exifr, Discord bot + browser extension

### Try it out

| Link | Purpose |
|------|---------|
| [https://nomaetrust.vercel.app](https://nomaetrust.vercel.app) | Live demo |
| [https://nomaetrust.vercel.app/disclosure](https://nomaetrust.vercel.app/disclosure) | Responsible AI |
| [https://github.com/ArshiaBajaj/NomaeTrust](https://github.com/ArshiaBajaj/NomaeTrust) | Source code |

**Quick path:** Sign in as Fatima → News Watch headline → `/stress` voice note → `/detective` swipe → `/trust-map`

### AI architecture

Multi-stage pipeline — AI assists analysis; outputs are suggestions with sources, not final verdicts.

```
User input → Transcription/OCR → Claim extraction
    → Regional RAG (Atlanta sources) → Action Card
    → Optional Confusion Map sync
```

All pipelines include **demo fallbacks** when API keys are missing.

### Human-in-the-loop decision

**AI does NOT decide:** Final community verification status on the Confusion Map (verified / disputed / pending).

Validators verify, dispute, escalate, attach provenance badges. Low-confidence claims route to the **validator queue** rather than published as settled fact.

**Why:** Wrong automated labels can cause real harm (missing food distribution, skipping school). A human with local context must confirm before a claim is community-verified.

### Responsible AI guardrail

**Risk:** Misinformation amplification — users over-trusting AI summaries and forwarding them as fact.

**Mitigations:**
1. No binary verdicts — confidence bands + sources + Do/Don't steps
2. Low confidence → validator queue
3. Demo mode clearly labeled
4. News Watch uses tiers + ClaimReview, not "fake news" labels
5. Context Trace reports drift categories, not single "fake" label
6. Ephemeral audio processing
7. Disclosure page documents models and limitations

### AI tools used

| Tool | Use | Cost |
|------|-----|------|
| OpenAI Whisper | Voice transcription | Paid API |
| OpenAI GPT-4o-mini | Claims, OCR, Action Cards, Context Trace | Paid API |
| Google Fact Check Tools API | News Watch ClaimReview | Free API key |
| SerpAPI | Reverse image search | Paid (free tier) |
| Hive AI | Optional deepfake scoring | Paid API |
| Cursor / AI coding assistants | Development | Paid |

### Data sources

- **Curated RAG:** Atlanta/Georgia government + NGO sites
- **Fact-check:** Google ClaimReview API
- **Deepfake clips:** SDFVD, FaceForensics++ (optional)
- **Synthetic demo:** voice scenarios, map seeds, Context Trace demo, publish gate queue

---

## 17. Investor pitch

**One line:**  
NomaeTrust is pre-share verification for the AI era — Action Cards for people, publish gates for platforms. Nomae means no confusion.

**30-second:**  
Misinformation fails because fact-checks arrive too late and don't tell anyone what to *do*. NomaeTrust extracts claims from voice, images, and headlines; checks sources; detects manipulation; returns Action Cards with next steps. Platforms get a publish gate and confusion map — verify before amplification, not after damage.

**Market:** B2C families + B2B publishers/platforms  
**Moat:** Workflow + data flywheel (every verification improves routing and regional patterns)  
**Business model:** Freemium consumer → platform SaaS (publish gate) → API/enterprise

---

## 18. Responsible AI & disclosure

See live page: [https://nomaetrust.vercel.app/disclosure](https://nomaetrust.vercel.app/disclosure)

### Verification outcome taxonomy (not TRUE/FALSE)

| Outcome | Meaning |
|---------|---------|
| `verified` | Claim aligns with trusted sources |
| `not_verified` | Claim contradicts or lacks support |
| `inconclusive` | Insufficient evidence; validator recommended |

### Context Trace verdicts

Authentic · Reused Media · Out of Context · Misleading

### Privacy (MVP)

- Voice passports on-device (localStorage demo)
- Audio processed ephemerally — not persisted
- Map pins use neighborhood-level metadata
- Trust Circle uses demo session tokens

### Detective achievements

| ID | Title | Unlock |
|----|-------|--------|
| `first_case` | First Case Closed | 1 correct |
| `combo_3` | Hot Streak | 3× combo |
| `combo_5` | On Fire | 5× combo |
| `daily_3` | Regular | 3-day streak |
| `deepfake_hunter` | Deepfake Hunter | 5 manipulated caught |
| `sharp_eye` | Sharp Eye | 80%+ over 10 cases |

---

## 19. Project file structure

```
NomaeTrust/
├── docs/
│   ├── PRD.md                          # Product requirements (detailed)
│   └── NomaeTrust-Complete-Guide.md    # This document
├── src/                                # React frontend
│   ├── App.tsx                         # Routes + shell
│   ├── config/navigation.ts            # Routes, tabs, nav constants
│   ├── pages/                          # Screen components
│   ├── components/                     # UI (mobile, auth, detective, etc.)
│   ├── services/                       # API clients
│   ├── context/                        # Auth, audience, boot state
│   ├── hooks/                          # useIsMobile, haptics, detective progress
│   ├── data/                           # Static demo data
│   └── utils/                          # Evidence card builders, export
├── backend/
│   ├── server.ts                       # Express entry
│   ├── routes/                         # API route handlers
│   ├── services/                       # AI pipelines, RAG, vision, whisper
│   ├── store/                          # In-memory map, platform, trust circle
│   └── data/                           # Government sites, outlets, demo data
├── extension/                          # Chrome MV3 extension (Reddit/Discord)
├── bots/discord/                       # Discord slash-command bot
├── scripts/                            # Detective clip import/transcode
├── public/                             # Static assets, PWA manifest, detective clips
├── vercel.json                         # Vercel deploy config
├── package.json                        # Frontend deps + scripts
└── vite.config.ts                      # Vite + API proxy
```

---

## 20. Roadmap & known gaps

### Phase 0 — Hackathon MVP ✅

Action Cards, Screenshot, Context Trace, Detective, Confusion Map, News Watch, Publish Gate, PWA, Atlanta sources, demo fallbacks, Disclosure

### Phase 1 — Post-hackathon

- Persistent database (Postgres/Supabase)
- Trust Circle polish + production auth
- CI/CD pipeline

### Phase 2 — Production pilot

- Real WhatsApp/SMS share integrations
- Expanded metro source catalogs
- Live Hive scoring on Detective
- Validator reputation system

### Known gaps (MVP)

| Gap | Notes |
|-----|-------|
| In-memory storage | Map/platform data resets on cold start (serverless) |
| Demo auth | localStorage profiles, not production identity |
| Detective clips | Not in git — run import scripts after clone |
| Call verification | Simulated speaker matching (disclosed) |

---

## Quick reference card

| | |
|---|---|
| **Live app** | https://nomaetrust.vercel.app |
| **Health check** | https://nomaetrust.vercel.app/api/health |
| **Tagline** | Rumor → Reality → Action |
| **Brand** | Nomae = no confusion |
| **Demo city** | Atlanta, GA |
| **Demo user** | Fatima (individual) / Metro News (platform) |
| **Local frontend** | npm run dev → :5173 |
| **Local backend** | cd backend && npm run dev → :3001 |
| **Deploy** | vercel --prod --yes |
| **Required env** | OPENAI_API_KEY |

---

*This guide consolidates the PRD, codebase, demo script, hackathon submission copy, and deployment notes as of June 2025. Update when persistence, auth, or routes change.*
