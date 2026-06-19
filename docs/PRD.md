# NomaeTrust — Product Requirements Document

**Version:** 1.0  
**Last updated:** June 2025  
**Status:** Hackathon / MVP  
**Tagline:** Rumor → Reality → Action

---

## 1. Executive Summary

NomaeTrust is a family-first trust platform that helps stressed people move from **confusion → clarity → action** when rumors spread about local support services (food banks, school closures, boil-water advisories, transit disruptions, etc.).

Unlike generic fact-checkers that output binary TRUE/FALSE labels, NomaeTrust produces **Action Cards** with plain-language next steps, multilingual sharing, community validation, and gamified media literacy training. It is designed for the **USAII High School Challenge (Direction B)** and demo-scoped to **Atlanta / Georgia**.

**Core value proposition:** At 2 a.m., when Fatima receives a frantic WhatsApp voice note—“The food bank closed, don’t go”—NomaeTrust turns panic into a verified Action Card with tap-to-call links, trusted government sources, and shareable evidence in Somali and Spanish.

---

## 2. Problem Statement

### 2.1 The problem

| Pain | Description |
|------|-------------|
| **Speed of rumors** | WhatsApp voice notes, screenshots, and forwarded clips spread faster than people can verify. |
| **Binary fact-checking fails families** | “FALSE” labels don’t tell someone whether to go to the food bank tomorrow or call 211. |
| **Reused / manipulated media** | Old photos and deepfake clips are reframed with new captions (“happening now in Atlanta”). |
| **Language & trust gaps** | Multilingual households need shareable summaries elders can forward without reading English news sites. |
| **No community signal** | Individual verification doesn’t show whether neighbors are confused about the same rumor. |

### 2.2 Why existing tools fall short

| Category | Gap NomaeTrust fills |
|----------|----------------------|
| Scam call blockers (SecureLah, etc.) | Focus on phone fraud, not community service rumors |
| Generic AI chatbots | No Action Cards, no Atlanta trusted-source RAG, no validator queue |
| Deepfake detectors alone | Technical scores without family-facing next steps or training |
| Social platform labels | Not localized, not multilingual, not action-oriented |

---

## 3. Vision, Goals & Non-Goals

### 3.1 Vision

Become the trusted layer between viral panic and real-world action for families and community validators—starting with Atlanta, expanding to any metro with curated government source catalogs.

### 3.2 Product goals (MVP)

1. **Reduce time-to-action** — User goes from upload to Action Card in under 60 seconds (demo target).
2. **Responsible AI** — Confidence bands and source citations, not auto-verdicts.
3. **Community visibility** — Verified rumors surface on a Confusion Map with validator workflow.
4. **Media literacy** — Digital Detective trains swipe-based real vs. manipulated recognition.
5. **Mobile-first demo** — PWA shell with Detective as primary mobile entry.

### 3.3 Non-goals (MVP)

- Production-grade identity/auth (Trust Circle uses demo sessions)
- Persistent cloud database (in-memory stores for hackathon)
- Real-time phone network integration for call blocking
- Legal/medical advice automation
- Nationwide source coverage (Atlanta/Georgia only for demo)

---

## 4. Target Users & Personas

### 4.1 Primary persona — **Fatima (Anxious Forwarder)**

| Attribute | Detail |
|-----------|--------|
| Age | 34 |
| Context | Works nights; receives WhatsApp voice notes from aunties and church groups |
| Languages | English + Somali |
| Need | “Is this true? What should I do tonight?” |
| Success | Gets Action Card with 211 link, Somali summary, confidence band |

### 4.2 Secondary persona — **Marcus (Community Validator)**

| Attribute | Detail |
|-----------|--------|
| Role | Library volunteer / neighborhood leader |
| Need | See what rumors are spreading locally; attach provenance |
| Success | Reviews validator queue; badges claim with official source |

### 4.3 Tertiary persona — **Teen (Media Literacy Trainee)**

| Attribute | Detail |
|-----------|--------|
| Context | Sees deepfake clips on TikTok/WhatsApp |
| Need | Quick practice distinguishing real vs. manipulated |
| Success | Completes Detective cases; learns forensic tells (lip sync, blink cadence) |

---

## 5. Product Principles

1. **Action over verdict** — Always pair analysis with “what to do next.”
2. **Show your work** — Cite trusted sources; expose confidence bands.
3. **Human in the loop** — Route uncertain claims to community validators.
4. **Multilingual by default** — Somali + Spanish translations on Action Cards.
5. **Fail gracefully** — Demo mode when API keys missing; never blank-screen the user.
6. **Mobile-first for demo** — Detective + Action Cards optimized for phone.

---

## 6. Feature Requirements

### 6.1 Action Cards (Voice / Stress Mode)

**Route:** `/stress` (also legacy `/voice` redirect)

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Upload audio/video ≤25 MB | P0 | Accepts `.mp3`, `.wav`, `.m4a`, `.mp4`, `.webm` |
| Pipeline visualization | P0 | 5 steps: Upload → Transcription → Claim Extraction → RAG → Action Card |
| Whisper transcription | P0 | OpenAI Whisper via backend |
| Claim extraction | P0 | GPT extracts verifiable claim + category |
| Regional RAG | P0 | Matches claim to Atlanta trusted sources (`governmentWebsites.ts`) |
| Action Card output | P0 | Plain summary, action steps, do-not-do list, primary CTA URL |
| Multilingual share | P0 | Somali + Spanish translations in card |
| WhatsApp share | P1 | Copy formatted evidence to clipboard |
| PDF export | P1 | jsPDF export of Action Card |
| Map sync | P0 | Claim auto-added to Confusion Map on analysis |
| Demo fallback | P0 | Curated demo when OpenAI unavailable |

### 6.2 Screenshot Verification

**Route:** `/screenshot`

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Image upload | P0 | OCR via GPT-4o-mini vision |
| Same Action Card pipeline | P0 | Identical output structure as voice |
| Context Trace CTA | P1 | Link to trace reused images |

### 6.3 Context Trace

**Routes:** `/call`, `/context-trace`, `/context-lens` (aliases)

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Image upload analysis | P0 | EXIF extraction + GPT-4o vision narrative analysis |
| URL analysis | P0 | Fetch public image URL → SerpAPI reverse search + GPT |
| Timeline of appearances | P0 | Earliest → intermediate → current narrative roles |
| Narrative drift score | P0 | 0–100 gauge with band (low/medium/high) |
| Verdict taxonomy | P0 | Authentic / Reused Media / Out of Context / Misleading |
| Demo fallback | P0 | Curated 2018 vs 2026 scenario when backend down |

### 6.4 Digital Detective (Gamified Deepfake Training)

**Route:** `/detective` (mobile default entry)

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Swipe interaction | P0 | Left = Manipulated, Right = Verified |
| Video clips | P0 | SDFVD dataset (H.264); optional FaceForensics++ |
| Result panel | P0 | Hive verdict label, forensic tell, explanation |
| XP & levels | P1 | 500 XP/level; +50 correct, +5 wrong |
| Combo multiplier | P1 | Up to 1.6× for streaks |
| Critical hits | P2 | 18% chance 2× XP |
| Daily streak | P1 | Consecutive-day tracking + weekly freeze |
| Achievements | P1 | 6 badges (first case, combos, sharp eye, etc.) |
| Onboarding | P1 | 3-step tutorial (localStorage gate) |
| Auto-advance | P1 | 4-second countdown between cases |
| Endless deck | P0 | Cycles through 20 SDFVD clips without stopping |
| Progress persistence | P0 | localStorage `nomae-detective-progress-v2` |

**Clip setup (developer):**
```bash
npm run detective:import-sdfvd
npm run detective:transcode-clips   # Required for Safari/browser playback
```

### 6.5 Community Confusion Map

**Route:** `/trust-map`

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Leaflet map | P0 | Pins colored by verification status |
| Hotspot aggregation | P0 | Intensity-based heat markers |
| Community feed | P0 | List of claims with filters |
| Manual report | P1 | Free-text community rumor submission |
| Validator queue | P1 | Review + provenance badge attachment |
| Auto-refresh | P1 | 30-second polling |
| Fit bounds | P2 | Map zooms to selected claim |

### 6.6 Family Trust Circle (Partial — backend ready)

**Routes:** Not wired in App.tsx (planned `/trust-circle/login`, dashboard)

| Requirement | Priority | Status |
|-------------|----------|--------|
| Create/join circle | P1 | Backend API complete |
| Rotating 4-word trust phrase | P1 | Backend + utils complete |
| Call verification simulation | P2 | `POST /api/verify-call` |
| Voice passport enrollment | P2 | localStorage demo |
| Frontend routes | P1 | **Not routed** — gap |

### 6.7 Disclosure & Responsible AI

**Route:** `/disclosure`

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Model transparency | P0 | Lists OpenAI, SerpAPI, Hive usage |
| Demo disclaimers | P0 | Simulated data clearly labeled |
| Privacy summary | P0 | No persistent PII storage claim |
| Judge-facing | P0 | Written for hackathon reviewers |

### 6.8 Mobile / PWA

| Requirement | Priority | Acceptance criteria |
|-------------|----------|---------------------|
| Responsive shell | P0 | Breakpoint 768px via `useIsMobile` |
| Mobile entry redirect | P0 | `/` → `/detective` on mobile |
| Bottom tab bar | P0 | Detective, Verify, Map, Trace |
| PWA manifest | P1 | Standalone, portrait, start_url `/detective` |
| Install prompt | P2 | Android beforeinstallprompt + iOS banner |
| Immersive Detective | P0 | No nav/footer on `/detective` |

---

## 7. User Flows

### 7.1 Rumor → Action Card

```
WhatsApp voice note
  → Upload (/stress)
  → Whisper transcription
  → GPT claim extraction
  → Regional intelligence (Atlanta sources)
  → GPT Action Card composition
  → Share (WhatsApp / PDF)
  → Claim synced to Confusion Map
```

### 7.2 Screenshot → Action Card

```
Forwarded screenshot
  → Upload (/screenshot)
  → GPT-4o-mini OCR
  → Same pipeline as voice
  → Optional: open Context Trace if image reuse suspected
```

### 7.3 Image → Context Trace

```
Suspicious image or URL
  → Upload or paste URL (/call)
  → EXIF + reverse image search (URL path)
  → GPT narrative analysis
  → Timeline + drift score + verdict
```

### 7.4 Media literacy loop

```
Open app (mobile) → Detective
  → Onboarding (first visit)
  → Watch video clip
  → Swipe Manipulated / Verified
  → XP + forensic explanation
  → Auto-advance to next case
```

### 7.5 Community validation

```
Claim appears on map (from pipeline or manual report)
  → Validator opens queue tab
  → Reviews claim text + sources
  → Attaches provenance badge
  → Status updates on map + feed
```

---

## 8. Information Architecture & Routes

| Route | Page | Desktop nav | Mobile tab |
|-------|------|-------------|------------|
| `/` | MobileEntry | — | Home* → Detective |
| `/home` | Home (marketing) | — | — |
| `/detective` | Digital Detective | ✓ | ✓ |
| `/stress` | Action Cards | ✓ | Verify |
| `/screenshot` | Screenshot verify | ✓ | — |
| `/call` | Context Trace | ✓ | Trace |
| `/trust-map` | Confusion Map | ✓ | Map |
| `/disclosure` | Responsible AI | Footer | — |

\*Mobile `/` redirects to `/detective`.

---

## 9. Technical Architecture

### 9.1 Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7 |
| Maps | Leaflet, react-leaflet, markercluster |
| Backend | Express 4, TypeScript (tsx), multer |
| AI | OpenAI (Whisper, GPT-4o-mini, GPT-4o vision) |
| Storage (MVP) | In-memory stores + localStorage |
| Media tooling | ffmpeg-static, SDFVD/FaceForensics import scripts |

### 9.2 System diagram

```
┌─────────────────────────────────────────────────────────┐
│                    NomaeTrust (Vite :5173)              │
│  Detective │ Action Cards │ Context Trace │ Map │ PWA  │
└──────────────────────────┬──────────────────────────────┘
                           │ /api proxy
┌──────────────────────────▼──────────────────────────────┐
│                 Express Backend (:3001)                  │
│  analyze-audio │ analyze-image │ context-trace │ map    │
│  detective │ trust-circle │ verify-call                 │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
   OpenAI     SerpAPI     Hive AI    public/assets/clips
  (Whisper,   (reverse    (deepfake   (SDFVD H.264
   GPT-4o)    image)      scoring)    video files)
```

### 9.3 API surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze-audio` | Voice → Action Card |
| POST | `/api/analyze-image` | Screenshot → Action Card |
| POST | `/api/context-trace/analyze` | Upload image trace |
| POST | `/api/context-trace/analyze-url` | URL image trace |
| GET | `/api/map/hotspots` | Map heat data |
| GET | `/api/map/claims` | All claims |
| GET | `/api/map/validator-queue` | Pending validation |
| POST | `/api/map/claims` | Community report |
| POST | `/api/map/validate` | Validator action |
| GET | `/api/detective/challenges` | Video challenge deck |
| GET | `/api/detective/setup` | Clip import status |
| POST | `/api/detective/score-url` | Hive video score |
| POST | `/api/trust-circle/*` | Family circle CRUD |
| POST | `/api/verify-call` | Simulated call verify |
| GET | `/api/health` | Health check |

### 9.4 Environment variables

```env
OPENAI_API_KEY=       # Required for live analysis
SERPAPI_KEY=          # Context Trace URL reverse search
HIVE_API_KEY=         # Optional live deepfake scoring
PORT=3001
```

---

## 10. Data Model (Key Entities)

### Claim
```
id, text, source (voice|screenshot|call|community|deepfake),
status (verified|unverified|disputed|pending),
confidence, lat/lng, category, urgentReview,
validatorId, provenanceBadge
```

### EvidenceCard / Action Card
```
plainLanguageSummary, verificationOutcome (verified|not_verified|inconclusive),
confidenceBand (low|medium|high), actionSteps[], doNotDo[],
primaryActionLabel, primaryActionUrl, sourceReferences[],
translations { somali, spanish }
```

### ContextTraceAnalysis
```
imageDescription, exifDiscrepancies[], timelineAppearances[],
originalContext, currentClaim, narrativeDriftScore,
narrativeDriftBand, verdict
```

### DetectiveChallenge
```
id, videoUrl, thumbnailUrl, isManipulated, hiveVerdict,
confidence, explanation, highlightRegion, artifactLabel, category
```

### DetectiveProgress (localStorage)
```
xp, level, sessionCombo, dailyStreak, achievements[],
challengesCompleted, totalCorrect, manipulatedCaught
```

---

## 11. Integrations

| Service | Use case | Fallback |
|---------|----------|----------|
| OpenAI Whisper | Audio transcription | Demo transcript |
| GPT-4o-mini | OCR, claims, Action Cards | Demo mode |
| GPT-4o vision | Context Trace analysis | Demo analysis |
| SerpAPI | Reverse image + Google Lens | Skip web matches |
| Hive AI | Deepfake video score | Curated verdict in UI |
| SDFVD (Hugging Face) | Detective training clips | Static image deck |
| FaceForensics++ | Research-grade clip pairs | Optional import |
| OpenStreetMap | Map tiles | — |

---

## 12. Trusted Sources (Atlanta / Georgia)

RAG whitelist built from ~70 government websites (`governmentWebsites.ts`):

- Atlanta Community Food Bank, Georgia 211, GEMA, APS, MARTA
- County health departments, boil-water advisories, DeKalb/Cobb/Gwinnett portals
- High-value sources receive scoring boost in recommendations (6 sources per claim)

---

## 13. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Action Card pipeline <60s (demo); map refresh 30s |
| **Availability** | Demo mode when APIs fail |
| **Privacy** | No persistent user accounts (MVP); uploads processed in memory |
| **Accessibility** | Swipe + button fallback on Detective; semantic labels on key actions |
| **Browser support** | Chrome, Safari (iOS); H.264 video required for Detective |
| **Security** | API keys server-side only; `.env` gitignored |
| **Localization** | Somali + Spanish on Action Cards |

---

## 14. Success Metrics (MVP / Demo)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Action Card | <60s | Pipeline timer |
| Detective session length | ≥5 cases | Progress hook |
| Map claim sync rate | 100% of analyses | Backend addClaim |
| Demo reliability | 0 blank screens | Fallback coverage |
| Judge comprehension | Understand “Action not verdict” | Disclosure + UI copy |

---

## 15. Roadmap

### Phase 0 — Hackathon MVP ✅ (current)
- Action Cards, Screenshot, Context Trace, Detective, Confusion Map, PWA shell
- Atlanta source catalog, demo fallbacks, Disclosure page

### Phase 1 — Post-hackathon hardening
- Wire Trust Circle routes in App.tsx
- Persistent database (Postgres/Supabase) for claims + validators
- Commit teammate workflow + CI

### Phase 2 — Production pilot
- Real SMS/WhatsApp share integrations
- Expanded source catalogs (other metros)
- Hive live scoring on Detective swipes
- Validator authentication + reputation

### Phase 3 — Scale
- On-device deepfake hints (Core ML / TFLite)
- Official government API partnerships
- Multi-city Confusion Map federation

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API key missing at demo | No live analysis | Demo mode + Disclosure |
| Video codec incompatibility | Detective blank cards | `detectcode-clips` to H.264 |
| Clips not in git | Teammate sees no video | Document import scripts in PRD + README |
| In-memory data loss | Map resets on restart | Seed data + re-sync from analyses |
| Over-trust in AI verdict | Harm to families | Confidence bands + validator queue |
| Trust Circle unrouted | Feature invisible | Phase 1 route wiring |

---

## 17. Team Setup & Handoff

### Run locally
```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
npm install && npm run dev

# Detective clips (once per machine)
npm run detective:import-sdfvd
npm run detective:transcode-clips
```

### Push to teammate
```bash
git add -A && git commit -m "Your message"
git push origin initial-project-setup
```
Teammate runs import scripts after pull (mp4 files are gitignored).

---

## 18. Open Questions

1. Should Trust Circle be wired before judge demo or remain backend-only?
2. Primary demo path: Detective-first (mobile) or Action Card-first (Fatima story)?
3. Which base branch for merge: `main` vs `initial-project-setup`?
4. Live Hive scoring in Detective: worth API cost for demo?

---

## 19. Appendix — Achievement Catalog (Detective)

| ID | Title | Unlock condition |
|----|-------|------------------|
| `first_case` | First Case Closed | 1 correct answer |
| `combo_3` | Hot Streak | 3× combo |
| `combo_5` | On Fire | 5× combo |
| `daily_3` | Regular | 3-day streak |
| `deepfake_hunter` | Deepfake Hunter | 5 manipulated caught |
| `sharp_eye` | Sharp Eye | 80%+ accuracy over 10 cases |

---

## 20. Appendix — Verification Outcome Taxonomy

NomaeTrust intentionally avoids binary TRUE/FALSE:

| Outcome | Meaning |
|---------|---------|
| `verified` | Claim aligns with trusted sources |
| `not_verified` | Claim contradicts or lacks support |
| `inconclusive` | Insufficient evidence; validator recommended |

Context Trace verdicts: **Authentic**, **Reused Media**, **Out of Context**, **Misleading**.

---

*This PRD reflects the codebase as of June 2025. Update when Trust Circle routes ship or persistence layer is added.*
