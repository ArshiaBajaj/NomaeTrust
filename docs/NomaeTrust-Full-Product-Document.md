# NomaeTrust — Full Product Document

**Version:** 2.0  
**Last updated:** June 2025  
**Team:** Arshia Bajaj · Anushka · Sudhith · Renesh  
**Live app:** [https://nomaetrust.vercel.app](https://nomaetrust.vercel.app)  
**Source:** [https://github.com/ArshiaBajaj/NomaeTrust](https://github.com/ArshiaBajaj/NomaeTrust)  
**Challenge:** USAII High School Challenge (Direction B)

> **Download:** `docs/NomaeTrust-Full-Product-Document.md` — export to PDF from your editor for Devpost, judges, or investors.

---

## Table of contents

1. [Brand & positioning](#1-brand--positioning)
2. [Executive summary](#2-executive-summary)
3. [Problem statement](#3-problem-statement)
4. [Solution overview](#4-solution-overview)
5. [User personas](#5-user-personas)
6. [Product principles](#6-product-principles)
7. [Features & routes](#7-features--routes)
8. [User flows](#8-user-flows)
9. [AI architecture](#9-ai-architecture)
10. [Human-in-the-loop](#10-human-in-the-loop)
11. [Responsible AI guardrails](#11-responsible-ai-guardrails)
12. [Technologies used](#12-technologies-used)
13. [AI tools used](#13-ai-tools-used)
14. [Data sources](#14-data-sources)
15. [Technical architecture](#15-technical-architecture)
16. [API reference](#16-api-reference)
17. [Data models](#17-data-models)
18. [Environment variables](#18-environment-variables)
19. [Local development](#19-local-development)
20. [Deployment](#20-deployment)
21. [Browser extension & Discord bot](#21-browser-extension--discord-bot)
22. [USAII pitch video script (5:00)](#22-usaii-pitch-video-script-500)
23. [5-minute live demo script](#23-5-minute-live-demo-script)
24. [Hackathon / Devpost submission copy](#24-hackathon--devpost-submission-copy)
25. [Investor pitch](#25-investor-pitch)
26. [Responsible AI disclosure](#26-responsible-ai-disclosure)
27. [Success metrics](#27-success-metrics)
28. [Roadmap](#28-roadmap)
29. [Risks & mitigations](#29-risks--mitigations)
30. [Project file structure](#30-project-file-structure)
31. [Assets & logos](#31-assets--logos)
32. [Quick reference card](#32-quick-reference-card)

---

## 1. Brand & positioning

### Name meaning

**Nomae** = **no confusion**.  
**NomaeTrust** = clarity you can trust **before** you share.

### Taglines

| Use | Copy |
|-----|------|
| Primary | **Rumor → Reality → Action** |
| Brand | **No confusion. Just the next step.** |
| Investor | **Pre-share verification — Nomae means no confusion.** |
| Deck hook | **Most fact-checking is post-mortem. NomaeTrust is pre-mortem.** |
| One-liner | **When the group chat panics, NomaeTrust listens.** |

### Elevator pitches

**20 seconds (family):**  
*"Nomae" means no confusion. Someone forwards a scary voice note or headline — instead of TRUE or FALSE, NomaeTrust gives you an Action Card: what was said, what checks out, and what to do next.*

**20 seconds (investor):**  
*NomaeTrust is pre-share verification for the AI era — Action Cards for people, publish gates for platforms. Nomae means no confusion.*

**30 seconds (USAII):**  
*Misinformation fails because fact-checks arrive too late and don't tell anyone what to do. NomaeTrust extracts claims from voice, images, and headlines; checks Atlanta trusted sources; returns Action Cards with next steps. Platforms get a publish gate. Humans confirm on the Confusion Map — AI assists, never auto-verdicts.*

### Differentiators

| vs. generic fact-checkers | NomaeTrust |
|---------------------------|------------|
| TRUE/FALSE labels | **Action Cards** with Do/Don't steps |
| Post-viral archive | **Pre-share** verification |
| English-only essays | **Multilingual** summaries (Somali, Spanish) |
| National noise | **Confusion Map** — local rumor signal |
| Passive reading | **Digital Detective** — active media literacy |
| Platform labels after harm | **Publish gate** before amplification |

---

## 2. Executive summary

NomaeTrust is a family-first trust platform that helps people move from **confusion → clarity → action** when rumors spread about local services (food banks, school closures, boil-water advisories, transit disruptions, etc.).

Unlike generic fact-checkers that output binary TRUE/FALSE labels, NomaeTrust produces **Action Cards** with plain-language next steps, trusted source citations, confidence bands, multilingual sharing, community validation, and gamified media literacy training.

**Dual-sided model:**
- **Individuals & families** — verify voice notes, screenshots, headlines
- **Platforms & publishers** — publish gate + review queue
- **Community validators** — Confusion Map + validator queue

**Demo scope:** Atlanta / Georgia (metro-scalable architecture)

**Core story:** At 2 a.m., when Fatima receives a frantic WhatsApp voice note — *"The food bank closed, don't go"* — NomaeTrust turns panic into a verified Action Card with tap-to-call links, trusted government sources, and shareable evidence in Somali and Spanish.

---

## 3. Problem statement

| Pain | Description |
|------|-------------|
| **Speed of rumors** | WhatsApp voice notes, screenshots, and forwarded clips spread faster than people can verify |
| **Binary fact-checking fails families** | "FALSE" doesn't tell someone whether to go to the food bank tomorrow or call 211 |
| **Reused / manipulated media** | Old photos and deepfake clips reframed with new captions ("happening now in Atlanta") |
| **Language & trust gaps** | Multilingual households need shareable summaries elders can forward |
| **No community signal** | Individual checks don't show whether neighbors are confused about the same rumor |
| **Platform amplification** | Bad claims go live before anyone reviews them |

### Why existing tools fall short

| Category | Gap NomaeTrust fills |
|----------|----------------------|
| Scam call blockers | Phone fraud, not community service rumors |
| Generic AI chatbots | No Action Cards, no regional RAG, no validator queue |
| Deepfake detectors alone | Technical scores without family-facing next steps |
| Social platform labels | Not localized, not action-oriented, always after the fact |

---

## 4. Solution overview

Five integrated flows + two portals:

| Flow | Input | Output |
|------|-------|--------|
| **Action Cards** | Voice note / screenshot | Action Card + optional map sync |
| **News Watch** | Headline / URL | Action Card + outlet tier + fact-checks |
| **Context Trace** | Image / URL | Timeline + drift score + verdict |
| **Digital Detective** | Video clip + swipe | Literacy feedback + forensic tips |
| **Confusion Map** | Pipeline + community reports | Local pins + validator queue |
| **Publish Gate** | Platform submission | Approve / Hold / Block |

---

## 5. User personas

### Fatima — Anxious Forwarder (primary)

| Attribute | Detail |
|-----------|--------|
| Age | 34 |
| Context | Works nights; WhatsApp voice notes from church groups |
| Languages | English + Somali |
| Need | *"Is this true? What should I do tonight?"* |
| Success | Action Card with 211 link, Somali summary, confidence band |

### Marcus — Community Validator (secondary)

| Attribute | Detail |
|-----------|--------|
| Role | Library volunteer / neighborhood leader |
| Need | See local rumors; attach provenance |
| Success | Reviews validator queue; badges claim with official source |

### Teen — Media Literacy Trainee (tertiary)

| Attribute | Detail |
|-----------|--------|
| Context | Deepfakes on TikTok / WhatsApp |
| Success | Completes Detective cases; learns forensic tells |

### Metro News — Platform Publisher (B2B)

| Attribute | Detail |
|-----------|--------|
| Role | Trust & Safety team |
| Need | Review content before publication |
| Success | Publish gate queue; policy-driven holds/blocks |

---

## 6. Product principles

1. **Action over verdict** — always pair analysis with "what to do next"
2. **Show your work** — cite trusted sources; expose confidence bands
3. **Human in the loop** — route uncertain claims to community validators
4. **Multilingual by default** — Somali + Spanish on Action Cards
5. **Fail gracefully** — demo mode when API keys missing; never blank-screen
6. **Mobile-first** — PWA shell, bottom tab bar, immersive Detective
7. **Pre-share, not post-mortem** — verify at the moment of sharing

---

## 7. Features & routes

### Portals

| Portal | Login | Home | Tab bar |
|--------|-------|------|---------|
| Individual | `/login/individual` | `/individual` | Claims · Verify · Detective · Map |
| Platform | `/login/platform` | `/platform` | Gate · Queue · Map |
| Trust Circle | `/trust-circle/login` | `/trust-circle` | — |

Auth: lightweight demo — profile in `localStorage` (no password).

### All routes

| Route | Page | Auth | Notes |
|-------|------|------|-------|
| `/` | Landing / entry gate | — | Static `<h1>` for Devpost bot |
| `/choose` | Switch portal | — | |
| `/login/individual` | Individual sign-in | — | Mobile header + back |
| `/login/platform` | Platform sign-in | — | Mobile header + back |
| `/individual` | Major claims home | Individual | Shazam-style hub |
| `/platform` | Publish gate | Platform | Review queue |
| `/news-watch` | News Watch | Signed-in | Headline fact-check |
| `/stress` | Action Cards (voice) | Signed-in | Legacy `/voice` redirects here |
| `/screenshot` | Screenshot verify | Signed-in | OCR pipeline |
| `/call` | Context Trace | Signed-in | Legacy aliases redirect here |
| `/detective` | Digital Detective | Signed-in | Immersive, no chrome |
| `/trust-map` | Confusion Map | Signed-in | Leaflet + validators |
| `/settings` | Settings | Signed-in | Theme toggle (light/dark) |
| `/disclosure` | Responsible AI | — | Judge-facing |
| `/trust-circle/login` | Trust Circle login | — | |
| `/trust-circle` | Trust Circle dashboard | Trust Circle | |
| `/home` | Marketing home | — | Desktop |

### Feature requirements (summary)

#### Action Cards (`/stress`)
- Audio/video ≤25 MB; Whisper + GPT pipeline
- 5-step UI: Upload → Transcription → Claim → RAG → Action Card
- Somali + Spanish translations; PDF export; map sync
- Demo fallback when OpenAI unavailable

#### Screenshot (`/screenshot`)
- GPT-4o-mini vision OCR → same Action Card pipeline

#### News Watch (`/news-watch`)
- Headline/URL → claim extraction → Google ClaimReview → Action Card
- Outlet reliability tiers (A–D); demo fact-check fallback

#### Context Trace (`/call`)
- EXIF + vision + SerpAPI reverse search
- Narrative drift 0–100; verdict taxonomy
- Demo scenario when APIs down

#### Digital Detective (`/detective`)
- Swipe Manipulated / Verified; SDFVD clips (H.264)
- XP, levels, combos, 6 achievements; optional Hive scoring
- Progress in `localStorage`

#### Confusion Map (`/trust-map`)
- Pins by status; hotspots; validator queue
- Manual community reports; 30s polling

#### Publish Gate (`/platform`)
- Submit → risk signals → human Approve/Hold/Block
- Policy configuration

#### Trust Circle
- Create/join circles; trust phrase; simulated call verify

#### Mobile / PWA
- Breakpoint 768px; phone frame on desktop
- Splash → onboarding → app shell
- `nt-frame--tabbed` dock clearance only when tab bar visible
- Dark/light theme via `ThemeContext`

---

## 8. User flows

### Rumor → Action Card
```
WhatsApp voice note → Upload (/stress) → Whisper → GPT claim
→ Regional RAG (Atlanta) → Action Card → Share / PDF → Map sync
```

### Headline → News Watch
```
Forwarded headline → News Watch → fact-check search → Action Card
```

### Image → Context Trace
```
Suspicious image/URL → EXIF + vision + reverse search
→ timeline + drift + verdict
```

### Media literacy
```
Detective → onboarding → watch clip → swipe → XP + forensic tip
```

### Community validation
```
Claim on map → validator queue → review → provenance badge → status update
```

### Platform publish
```
Submission → automated signals → moderator decision → map link
```

---

## 9. AI architecture

AI **assists** analysis — outputs are suggestions with sources, not final community verdicts.

### Pipeline summary

```
INPUT                    AI CAPABILITY              OUTPUT
─────────────────────────────────────────────────────────────
Voice note        →  Whisper + GPT + RAG     →  Action Card
Screenshot        →  Vision OCR + GPT + RAG  →  Action Card
Headline / URL    →  Fact-check + GPT        →  Action Card
Image / URL       →  Vision + reverse search →  Context Trace
Video clip        →  Hive (optional) + tips  →  Literacy feedback
Map claim         →  AI suggestion only      →  Human-validated pin
Platform submit   →  Risk signals            →  Human publish decision
```

### 1. Action Cards — Voice (`/stress`)

| | |
|---|---|
| **Inputs** | Audio/video ≤25 MB (mp3, wav, m4a, mp4, webm) |
| **AI** | Speech-to-text + claim extraction + evidence synthesis |
| **Processing** | Whisper → GPT claim → Atlanta RAG → GPT Action Card → map sync |
| **Outputs** | Action Card: summary, outcome, confidence, steps, translations, PDF |

### 2. Action Cards — Screenshot (`/screenshot`)

| | |
|---|---|
| **Inputs** | Image (png, jpg, webp) |
| **AI** | Vision OCR + same pipeline as voice |
| **Outputs** | Action Card |

### 3. News Watch (`/news-watch`)

| | |
|---|---|
| **Inputs** | Headline text and/or article URL |
| **AI** | Claim extraction + fact-check retrieval + summarization |
| **Processing** | GPT claim → Google ClaimReview (or demo) → outlet tier → Action Card |
| **Outputs** | Fact-check hits, outlet badge, Action Card |

### 4. Context Trace (`/call`)

| | |
|---|---|
| **Inputs** | Image upload or public image URL |
| **AI** | Vision + metadata + reverse image search + narrative classification |
| **Processing** | EXIF → GPT-4o vision → SerpAPI (URL) → timeline + drift score |
| **Outputs** | Authentic / Reused Media / Out of Context / Misleading |

### 5. Digital Detective (`/detective`)

| | |
|---|---|
| **Inputs** | Video clip + user swipe |
| **AI** | Optional Hive deepfake score + educational explanation |
| **Outputs** | Feedback, XP, forensic tips — **training only** |

### 6. Confusion Map + Publish Gate

| | |
|---|---|
| **Inputs** | Claims from pipelines + submissions |
| **AI** | Suggests `analysisOutcome`; geolocation inference |
| **Human** | Final map `status`; publish Approve/Hold/Block |

All pipelines include **demo fallbacks** when API keys are missing.

---

## 10. Human-in-the-loop

### Decision AI does NOT make

**Final community verification status on the Confusion Map** (verified / disputed / pending).

### How it works

1. AI produces `analysisOutcome` suggestion with confidence and sources
2. New map claims enter as **`pending`**
3. **Human validators** verify, dispute, escalate, attach provenance badges
4. Low-confidence / urgent claims → **validator queue**

### Why

Rumors affect real behavior — missing food distribution, skipping school, panic-sharing. Wrong automated labels cause harm. Humans with local context and official sources must confirm before a claim is community-verified.

**Backend rule:** `status` is *"Community / validator decision — never set from AI alone"* (`mapStore.ts`).

---

## 11. Responsible AI guardrails

### Primary risk: Over-reliance

Users treating AI summaries as confirmed fact and forwarding them in group chats — amplifying misinformation with false authority.

### Mitigations

1. **No binary verdicts** — confidence bands + sources + Do/Don't steps
2. **Human map confirmation** — AI suggests; validators confirm
3. **Validator queue** — weak matches don't become settled fact
4. **Show your work** — cited Atlanta/Georgia sources + ClaimReview
5. **Honest uncertainty** — `inconclusive` when evidence is weak
6. **Demo transparency** — synthetic results labeled when APIs unavailable
7. **No outlet "fake news" stamps** — tiers + fact-checks as suggestions
8. **Ephemeral audio** — processed in memory, not stored
9. **Disclosure page** — models, limits, failure modes documented

---

## 12. Technologies used

### Languages
TypeScript, JavaScript, HTML, CSS

### Frontend
React 19, Vite 6, Tailwind CSS 4, React Router 7, Leaflet / react-leaflet, jsPDF, exifr

### Backend
Node.js, Express 4, multer, tsx

### Platforms
Web app (mobile-first PWA), Chrome extension (MV3), Discord bot (discord.js)

### Cloud & deployment
- **Vercel** — frontend + serverless API (`api/index.ts` → `backend/dist/app.js`)
- **Render** — optional standalone API (`render.yaml`)

### Storage (MVP)
In-memory backend stores, localStorage (sessions, Detective progress, theme), JSON seed files — no production database

### External APIs
OpenAI, Google Fact Check Tools API, SerpAPI, Hive AI, Discord API, OpenStreetMap

### Datasets
SDFVD, FaceForensics++ (optional), curated Atlanta government catalog

### Dev tools
Cursor (AI-assisted coding), Git, npm, ffmpeg-static

---

## 13. AI tools used

### Runtime AI

| Tool | Model | Use | Cost |
|------|-------|-----|------|
| OpenAI | `whisper-1` | Voice transcription | Paid |
| OpenAI | `gpt-4o-mini` | Claims, OCR, Action Cards, News Watch, Context Trace synthesis | Paid |
| OpenAI | `gpt-4o` | Context Trace vision (upload path) | Paid |
| Google | Fact Check Tools API | News Watch ClaimReview | Free (API key) |
| SerpAPI | Reverse image search | Context Trace URLs | Paid (free tier) |
| Hive AI | Video moderation | Detective (optional) | Paid (optional) |

### Datasets (not live inference hosting)

| Dataset | Use | Cost |
|---------|-----|------|
| SDFVD | Detective training clips | Free |
| FaceForensics++ | Optional clip pairs | Free |
| Demo fallbacks | Offline demo flows | Free (in-repo) |
| Government catalog | Regional RAG | Free (curated) |

### Development

| Tool | Use | Cost |
|------|-----|------|
| Cursor | AI-assisted coding | Paid |

---

## 14. Data sources

### Live APIs
- Google Fact Check Tools API — ClaimReview entries
- SerpAPI — reverse image search (when configured)
- Hive AI — deepfake scores (when configured)
- OpenStreetMap — map tiles

### Curated catalogs (in-repo)
- **~68 Atlanta/Georgia government sites** (`governmentWebsites.ts`) — RAG for Action Cards
- **~21 news outlets** with tiers A–D (`newsOutlets.ts`)
- **Official feed pins** — GEMA, 211, APS on map (`officialFeeds.ts`)

### Research datasets
- **SDFVD** — [Hugging Face](https://huggingface.co/datasets/Hemgg/SDFVD-video-dataset) — `npm run detective:import-sdfvd`
- **FaceForensics++** — optional — `npm run detective:import-ff++`

### Synthetic / demo data

| Data | Purpose | How created |
|------|---------|-------------|
| `demoFactChecks.ts` | News Watch when no Google key | 8 hand-written ClaimReview-style Atlanta rumors |
| `demoMode.ts` | Voice pipeline fallback | Fixed food-bank closure transcript |
| `mapStore.ts` seed claims | Confusion Map demo | 9 Atlanta-area rumors with realistic metadata |
| `contextTraceDemo.ts` | Context Trace offline | Chennai flood photo reused as false Atlanta story |
| `callVerification.ts` | Call verify demo | Scripted scam vs. trusted-family transcripts |
| `mockClaims.ts` | UI development | Sample OCR, voice claims, evidence cards |
| Platform reviews | Publish gate | Generated at runtime on submission |

Synthetic data mirrors real rumor patterns so judges always see end-to-end flows without a production database.

### User-generated (ephemeral)
- Uploaded audio/images — processed in memory, not persisted
- Map reports — in-memory per serverless instance
- Detective progress + profiles — `localStorage`

---

## 15. Technical architecture

### Stack diagram

```
┌─────────────────────────────────────────────────────────┐
│         NomaeTrust Frontend (Vite + React 19)           │
│  Theme · PWA · Individual Home · Detective · Map      │
└──────────────────────────┬──────────────────────────────┘
                           │ /api/*
┌──────────────────────────▼──────────────────────────────┐
│  Vercel Serverless: api/index.ts → backend/dist/app.js  │
│  OR local/Render: backend/server.ts → app.listen        │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
   OpenAI     SerpAPI     Hive AI    SDFVD clips
```

### Key files

| File | Role |
|------|------|
| `backend/app.ts` | Express app factory (routes, CORS, health) |
| `backend/server.ts` | Local dev server entry |
| `api/index.ts` | Vercel serverless handler |
| `src/config/api.ts` | Frontend API base URL |
| `src/context/ThemeContext.tsx` | Light/dark theme |
| `src/components/mobile/MobileAppShell.tsx` | PWA shell, tab bar, safe areas |

### Mobile shell

- `nt-frame--tabbed` — bottom dock clearance only when tab bar shown
- `nt-frame--headerless` — safe-area top on landing/home
- Fixed `body` on mobile — single scroll container (`.nt-scroll`)
- Immersive `/detective` — no header/tab bar

---

## 16. API reference

**Production:** `https://nomaetrust.vercel.app/api`  
**Local:** `http://localhost:3001/api` (or Vite proxy)

### Health
`GET /health` → `{ status, port, openaiConfigured, runtime }`

### Analysis
- `POST /analyze-audio` — voice → Action Card
- `POST /analyze-image` — screenshot → Action Card

### Context Trace
- `POST /context-trace/analyze` — image upload
- `POST /context-trace/analyze-url` — URL

### Map
- `GET /map/claims`, `/map/claims/major`, `/map/hotspots`, `/map/validator-queue`, `/map/nearby`, `/map/stream`
- `POST /map/claims`, `/map/validate`, `/map/dispute`, `/map/escalate`

### Detective
- `GET /detective/challenges`, `/detective/setup`
- `POST /detective/report-catch`, `/detective/score-url`

### News Watch
- `GET /news-watch/outlets`, `/news-watch/feed`
- `POST /news-watch/check`

### Platform
- `GET /platform/stats`, `/platform/policies`, `/platform/reviews`
- `POST /platform/submit`
- `PATCH /platform/policies`, `/platform/reviews/:id`

### Trust Circle
- `POST /trust-circle/create`, `/join`, `/leave`
- `GET /trust-circle/me`

### Extension
- `POST /extension/verify` — requires `X-NomaeTrust-Key`
- `POST /verify-call` — simulated call verification

---

## 17. Data models

### Claim
```
id, text, source, status (pending|verified|disputed|unverified),
analysisOutcome (verified|not_verified|inconclusive),
confidence, lat/lng, category, urgentReview,
validatorId, provenanceBadge, extractedAt
```

### Action Card
```
plainLanguageSummary, verificationOutcome, confidenceBand,
actionSteps[], doNotDo[], primaryActionUrl,
sourceReferences[], translations { somali, spanish }
```

### Context Trace
```
imageDescription, timelineAppearances[], narrativeDriftScore,
narrativeDriftBand, verdict
```

### Detective Progress (localStorage)
```
xp, level, sessionCombo, dailyStreak, achievements[]
```

---

## 18. Environment variables

### Backend (`backend/.env`)

```env
OPENAI_API_KEY=sk-...          # Required for live AI
GOOGLE_FACT_CHECK_API_KEY=     # Optional, free — News Watch
SERPAPI_KEY=                   # Optional — Context Trace URLs
HIVE_API_KEY=                  # Optional — Detective live scoring
EXTENSION_API_KEY=             # Extension + Discord bot
FRONTEND_BASE_URL=https://nomaetrust.vercel.app
PORT=3001
```

### Vercel Production (required)
- `OPENAI_API_KEY` — **required**
- `FRONTEND_BASE_URL` — recommended for CORS + deep links

### Discord (`bots/discord/.env`)
- `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`

---

## 19. Local development

```bash
# Terminal 1 — backend
cd backend && npm install && cp .env.example .env
npm run dev    # :3001

# Terminal 2 — frontend
npm install && npm run dev    # :5173
```

### Detective clips (once per machine)
```bash
npm run detective:import-sdfvd
npm run detective:transcode-clips
```

### Build all (matches Vercel)
```bash
npm run build:all
```

### Demo logins

| Portal | Example |
|--------|---------|
| Individual | Fatima, Atlanta, GA |
| Platform | Metro News, Trust & Safety, demo@news.com |

---

## 20. Deployment

### Vercel (primary)

```bash
vercel --prod --yes
```

`vercel.json`:
- `build:all` — backend tsc + frontend vite
- `/api/*` → `api/index.ts` (60s max duration)
- SPA fallback → `index.html`
- Static `<h1>NomaeTrust</h1>` in `index.html` for Devpost link checker

**Verify:**
```bash
curl https://nomaetrust.vercel.app/api/health
```

### Render (optional API)

`render.yaml` — deploy `backend/` as standalone web service with health check at `/api/health`.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| OpenAI not working on Vercel | Set `OPENAI_API_KEY` in Production env; redeploy |
| `openaiConfigured: false` | Check key not placeholder value |
| Map resets | Serverless in-memory — expected for MVP |
| Detective no video | Run import + transcode scripts locally |

---

## 21. Browser extension & Discord bot

### Extension (`extension/`)
- MV3 — Reddit + Discord web injection
- `POST /api/extension/verify` with `X-NomaeTrust-Key`
- Load unpacked: `chrome://extensions`

### Discord bot (`bots/discord/`)
```bash
cd bots/discord && npm install && npm run dev
```
- Slash verify command; 10/hour rate limit
- Embed with Action Card + map links

---

## 22. USAII pitch video script (5:00)

**Format:** YouTube / Vimeo / Loom · 3–5 minutes  
**Demo link:** https://nomaetrust.vercel.app

| Time | Speaker | Section |
|------|---------|---------|
| 0:00–0:30 | **Arshia** | Hook — The problem |
| 0:30–2:00 | **Anushka** | Solution — AI approach |
| 2:00–4:00 | **Sudhith** | Demo — Show it working |
| 4:00–5:00 | **Renesh** | Impact — Who benefits |

### ARSHIA — Hook (0:00–0:30)

> It's 2 a.m. Your group chat lights up. A voice note: *"The food bank closed. Don't go."* No one knows if it's true — but everyone's already forwarding it. Fact-checks say TRUE or FALSE. Families need to know **what to do tonight**. **NomaeTrust** means *no confusion*. We turn panic into **Action Cards** — next steps, not labels.

### ANUSHKA — Solution (0:30–2:00)

> Rumors arrive as voice notes, screenshots, or headlines. **Whisper** transcribes. **GPT-4o-mini** extracts claims. We match Atlanta trusted sources and Google ClaimReview fact-checks. Output: **Action Cards** with confidence, sources, Do's and Don'ts — Somali and Spanish for group chats. **Context Trace** catches reused photos. **Digital Detective** trains deepfake spotting. On the **Confusion Map**, AI only suggests — **human validators** confirm. We never auto-stamp TRUE or FALSE.

### SUDHITH — Demo (2:00–4:00)

> Live at nomaetrust.vercel.app. Sign in as **Fatima**, Atlanta.  
> **News Watch:** paste APS closure headline → fact-check + Action Card.  
> **Voice notes:** upload audio → pipeline → Action Card.  
> **Context Trace:** image → timeline + Reused Media verdict.  
> **Detective:** one swipe → forensic tip.  
> **Map:** Atlanta pins → validator queue.  
> **Publish Gate:** Metro News → review before go-live.

### RENESH — Impact (4:00–5:00)

> **Fatima** — Action Cards at 2 a.m. in language her family shares. **Marcus** — community validator on the map. **Teens** — Detective before deepfakes spread. **Platforms** — publish gate before amplification. **Nomae** means no confusion. **NomaeTrust** — Rumor, Reality, Action. Try it: **nomaetrust.vercel.app**.

---

## 23. 5-minute live demo script

**Prep:** Fatima login · headline copied · short audio ready

| Time | Route | Action |
|------|-------|--------|
| 0:00 | `/` | Hook → Individuals sign-in |
| 0:30 | `/individual` | Orb + tools grid |
| 1:15 | `/news-watch` | Paste headline → Check |
| 2:00 | `/stress` | Upload voice note |
| 2:45 | `/screenshot` | Upload screenshot |
| 3:15 | `/call` | Context Trace |
| 3:50 | `/detective` | One swipe |
| 4:20 | `/trust-map` | Map + pin |
| 4:45 | `/platform` | Publish gate |

**Opener:** *"At 2 a.m., a voice note says the food bank closed. NomaeTrust doesn't say TRUE or FALSE — it gives families an Action Card with what to do next."*

**Closer:** *"Rumor to reality to action — for families, validators, and platforms."*

---

## 24. Hackathon / Devpost submission copy

### About the project

NomaeTrust helps people move from **confusion → clarity → action** when rumors spread. We produce **Action Cards** — plain next steps, sources, confidence bands, multilingual summaries — not TRUE/FALSE labels. Five flows: Action Cards, News Watch, Context Trace, Digital Detective, Confusion Map + Publish Gate. **Nomae** means no confusion. **Tagline:** Rumor → Reality → Action.

### Built with

React 19, TypeScript, Vite, Tailwind CSS 4, Node.js, Express, Vercel, OpenAI (Whisper + GPT-4o-mini + GPT-4o), Google Fact Check API, SerpAPI, Hive AI, Leaflet, PWA, Chrome extension, Discord.js.

### Try it out

| Link | Purpose |
|------|---------|
| https://nomaetrust.vercel.app | Live demo |
| https://nomaetrust.vercel.app/disclosure | Responsible AI |
| https://github.com/ArshiaBajaj/NomaeTrust | Source |

### Demo materials (USAII Section 6)

| Requirement | Submission |
|-------------|------------|
| **Pitch video** | 3–5 min YouTube/Vimeo/Loom — use Section 22 script |
| **Demo link** | https://nomaetrust.vercel.app |
| **Structure** | Hook 30s → Solution 90s → Demo 120s → Impact 60s |

---

## 25. Investor pitch

**One line:** Pre-share verification for the AI era — Action Cards for people, publish gates for platforms. Nomae means no confusion.

**Market:** B2C families + B2B publishers/platforms  
**Moat:** Workflow + data flywheel (every verification improves routing)  
**Model:** Freemium consumer → platform SaaS → API/enterprise

---

## 26. Responsible AI disclosure

Live: https://nomaetrust.vercel.app/disclosure

### Outcome taxonomy (not TRUE/FALSE)

| Outcome | Meaning |
|---------|---------|
| `verified` | Aligns with trusted sources |
| `not_verified` | Contradicts or lacks support |
| `inconclusive` | Insufficient evidence |

### Context Trace verdicts
Authentic · Reused Media · Out of Context · Misleading

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

## 27. Success metrics (MVP)

| Metric | Target |
|--------|--------|
| Time to Action Card | <60s |
| Detective session | ≥5 cases |
| Map sync from pipeline | 100% |
| Demo reliability | 0 blank screens |
| Judge comprehension | "Action not verdict" |

---

## 28. Roadmap

### Phase 0 — Hackathon MVP ✅
Action Cards, News Watch, Context Trace, Detective, Map, Publish Gate, PWA, theme, Atlanta sources, demo fallbacks

### Phase 1 — Post-hackathon
Postgres/Supabase persistence, production auth, CI/CD

### Phase 2 — Pilot
WhatsApp/SMS share, expanded metros, live Hive on Detective, validator reputation

### Phase 3 — Scale
On-device deepfake hints, government API partnerships, multi-city federation

---

## 29. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| API key missing at demo | Demo mode + Disclosure |
| Video codec issues | `transcode-clips` to H.264 |
| Serverless data loss | Seed data + re-sync |
| Over-trust in AI | Confidence bands + validator queue |
| Devpost link checker | Static `<h1>` in HTML |

---

## 30. Project file structure

```
NomaeTrust/
├── docs/
│   ├── PRD.md
│   ├── NomaeTrust-Full-Product-Document.md   ← this file
│   ├── NomaeTrust-Complete-Guide.md
│   ├── NomaeTrust-Logo-Full.png
│   └── logos/ + NomaeTrust-Logos.zip
├── api/index.ts              # Vercel serverless entry
├── backend/
│   ├── app.ts                # Express app
│   ├── server.ts             # Local server
│   ├── routes/               # API handlers
│   ├── services/             # AI pipelines
│   ├── store/                # In-memory stores
│   └── data/                 # Catalogs + demo data
├── src/                      # React frontend
├── extension/                # Chrome MV3
├── bots/discord/             # Discord bot
├── scripts/                  # Detective clip import
├── vercel.json
├── render.yaml
└── package.json
```

---

## 31. Assets & logos

| File | Description |
|------|-------------|
| `docs/NomaeTrust-Logo-Full.png` | Full wordmark (download) |
| `docs/NomaeTrust-Logos.zip` | All logo variants |
| `public/logo.png` | App wordmark |

---

## 32. Quick reference card

| | |
|---|---|
| **Live** | https://nomaetrust.vercel.app |
| **Health** | https://nomaetrust.vercel.app/api/health |
| **Tagline** | Rumor → Reality → Action |
| **Brand** | Nomae = no confusion |
| **Demo user** | Fatima / Atlanta |
| **Platform demo** | Metro News |
| **Headline** | APS closing all campuses tomorrow |
| **Local dev** | `backend: npm run dev` + root: `npm run dev` |
| **Deploy** | `vercel --prod --yes` |
| **Pitch** | Arshia · Anushka · Sudhith · Renesh — 5:00 |

---

*NomaeTrust Full Product Document v2.0 — consolidates PRD, technical docs, USAII submission copy, pitch scripts, and deployment guide. June 2025.*
