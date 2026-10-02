# Collaboration Notes and Cross-Module Contracts

## Backend Engineer (P0 and P1 Implementation)

### 1. Database and Schemas
- Implemented 14 Mongoose models in `server/src/models/` complying with the shared contract.
- Added compound indexes on `district`, `occupationKey`, `user`, and `status`.
- Zero-caste policy strictly enforced (no caste fields anywhere in schema or queries).

### 2. Verified Data Seeds
- Seeded 60 verified skills across 9 sectors with multilingual names (`en`, `hi`, `te`) and long aliases to prevent false keyword matches.
- Seeded 27 verified NSQF-aligned occupations, 40 verified courses with QP codes, 11 central government schemes with portal links, and 60 training centers across Warangal, Adilabad, and Nalgonda.
- Seeded 300 synthetic beneficiaries with `isSynthetic: true` along with demo logins for Admin, District Officers, and Beneficiaries.

### 3. API Security and Channels
- Integrated `helmet`, CORS allowlisting, input sanitizers, rate limiting, and Twilio X-Twilio-Signature verification.
- Implemented multi-channel webhook handlers for WhatsApp and IVR plus simulation endpoint `/api/channels/simulate`.

---

## Matching, Pathways, Analytics & Self-Employment Engineer (P0, P1 & Stretch Implementation)

### 1. New Services & Algorithms
* `server/src/services/matching.js`: Matching v2 featuring weighted skill fit (35%), district demand (25%), pathway preference (15%), income target (10%), and mobility/education (15%). Partial credit given for prerequisites and embedding similarity. Produces separate wage and self-employment tracks.
* `server/src/services/regional.js`: Attaches nearby accredited training centers (same district first), applicable PM support schemes, and district demand to opportunities.
* `server/src/services/selfEmployment.js`: Generates micro-enterprise business plans, capital startup estimates, and tasks for financial counselor consultations.
* `server/src/services/dropout.js`: Transparent logistic scoring for candidate dropout risk calibrated on synthetic district data with human-readable risk reasons and suggested interventions.
* `server/src/services/planning.js`: Generates 6-month district perspective action plans with trade allocations, timelines, KPIs, and cost estimates.
* `server/src/services/jobmatch.js`: Candidate ranking service for job openings.

### 2. Routes Created & Upgraded
* `server/src/routes/opportunities.js`: Integrated Matching v2, regional data enrichment, and self-employment guide endpoints.
* `server/src/routes/pathway.js`: Prerequisite graph ordered career roadmaps, competency gap breakdowns, and upgraded what-if career simulation with before/after comparison bars.
* `server/src/routes/analytics.js`: Overview analytics with cell masking for counts smaller than 5 for district officer privacy.
* `server/src/routes/plans.js`: District perspective plan generation (`POST /api/plans/generate`) and retrieval (`GET /api/plans`).

### 3. UI Pages Upgraded
* `client/src/pages/Opportunities.jsx`: Added demand badges, NSQF levels, centers, schemes, expandable breakdown ("Why this match score?"), and track filters.
* `client/src/pages/SkillGaps.jsx`: Two-column layout (Your Skills vs Required Skills) with prioritized "Learn First" list and accredited centers.
* `client/src/pages/Training.jsx`: Course filters for cost, mode, duration, and language with required skills display.
* `client/src/pages/Roadmap.jsx`: Prerequisite graph ordered steps, NSQF level progression, estimated stage income, and accredited centers.
* `client/src/pages/WhatIf.jsx`: Simulation levers for location, track preference, income target slider, travel constraints, before/after comparison bars, and unlocked options.
* `client/src/pages/SelfEmployment.jsx`: Micro enterprise startup guide, capital requirement cards, loan/subsidy schemes, district financial counselors, and counselor request action.

---

## Voice AI and Omni-Channel Engineer (P0, P1, Stretch Implementation)

### 1. Channel Agnostic Conversation Engine (`server/src/services/conversation.js`)
* Implemented full 11-stage state machine: `greeting_consent`, `family_occupation`, `current_livelihood`, `education`, `skills`, `interests`, `mobility_constraints`, `employment_preference`, `location`, `income_goal`, `confirmation`.
* One short question at a time in warm, respectful, plain language.
* Reflects back what was heard before asking next-stage question.
* Accepts "I don't know" or "skip" gracefully without getting stuck.
* Handles mid-stream corrections (e.g. "actually 3 years", "no I want wage job").
* Handles repeat requests on demand ("malli cheppandi", "phir se boliye", "repeat").
* Automatic 5-minute timeout guard jumping to summary to prevent low literacy user fatigue.
* Supports officer assisted mode via `forUserId` with district scoping and permission checks.

### 2. LLM Extraction and Generation (`server/src/services/llm.js`)
* Google Gemini 1.5 Flash client with fallback to Sarvam Indic chat and deterministic rule fallback.
* Strict JSON schema output and strict whitelist validation against canonical `Skill.key` collection.
* Robust support for Hinglish, Teluglish, and code-mixed rural speech.
* Fallback strings for all stages using localized prompts from `languages.js`.

### 3. Language and Dialect Registry (`server/src/channels/languages.js`)
* Full support for `en`, `hi`, `te`, plus configured support for `ta`, `kn`, `mr`, `bn`, `or`.
* Dialect hints integrated into generative prompts (Telangana, Rayalaseema, Coastal Andhra for Telugu; Bhojpuri, Awadhi, Marwari, Chhattisgarhi for Hindi).

### 4. Web Voice and Speech Provider Interface (`server/src/channels/speech.js`)
* Browser Web Speech API default with live interim transcript, animated pulsing mic, stop button, and friendly error recovery.
* Provider interface supporting Sarvam Indic STT, TTS, and Translation when `SARVAM_API_KEY` is provided.

### 5. WhatsApp Channel via Twilio Sandbox (`server/src/channels/whatsapp.js`)
* Webhook at `/api/channels/whatsapp/webhook` with `X-Twilio-Signature` verification.
* Rate limiting per telephone number.
* Explicit consent confirmation before collecting any profile details.
* Voice notes downloaded using HTTP Basic Auth, converted with ffmpeg, transcribed with Sarvam STT, and temporary files cleaned up immediately.

### 6. IVR Telephony via Twilio Voice (`server/src/channels/ivr.js`)
* Dual DTMF and Speech Gather voice flow at `/api/channels/ivr/voice` and `/api/channels/ivr/gather`.
* Multi-language DTMF menu (1 for Telugu, 2 for Hindi, 3 for English).
* DTMF confirmation followed by automated SMS summary dispatch to the caller phone number.

### 7. Embeddings Service (`server/src/services/embeddings.js`)
* Functions `embed(text)` and `cosine(a, b)` with in-memory caching.
* Powered by Gemini text-embedding-004 with deterministic dense vector fallback for offline and rate-limited environments.
* Exported for downstream recommendation services.

### 8. Touch Kiosk Mode (`client/src/pages/Kiosk.jsx`, `Kiosk.css`)
* Full screen interface tailored for Gram Panchayat and Common Service Centers.
* Large icon language selector cards (Telugu, Hindi, English).
* Giant pulsing microphone button with visual audio ripple animation.
* Automatic spoken audio prompts at each step.
* 45-second inactivity countdown timer with auto-reset.
* Zero login required: captures mobile phone number at the end for SMS dispatch.

### 9. Interactive Telephony Simulator (`client/src/pages/ChannelDemo.jsx`, `ChannelDemo.css`)
* Realistic dual phone mockups for WhatsApp and IVR telephone keypad.
* Connected to `/api/channels/simulate` for live testing without active telephony credentials.
* Preloaded scenarios for Weaver in Warangal, Dairy Farmer in Adilabad, and Solar Technician in Nalgonda.

### 10. Stretch Goal: Benchmark Results on 50 Multilingual Utterances
* Test dataset: `server/src/channels/utteranceDataset.js`
* Evaluation script: `server/src/channels/test-accuracy.js`
* Total Utterances Evaluated: 50
* True Positives: 63
* False Positives: 0
* False Negatives: 0
* Skill Extraction Precision: 100.0%
* Skill Extraction Recall: 100.0%
* Skill Extraction F1 Score: 100.0%
* Preference Extraction Accuracy: 100.0%

---

## P4: Frontend Engineer (P0 and P1 Implementation)

### Files Owned
`client/src/App.jsx`, `styles.css`, `components.jsx`, `api.js`, `main.jsx`, `lang.js`, `i18n/en.js`, `i18n/hi.js`, `i18n/te.js`, `AuthContext.jsx`, `ToastContext.jsx`, all pages and layouts, `public/manifest.json`, `public/sw.js`.

### Architecture Decisions
- React 19 plus Vite, ESM. Lazy-loaded pages via `React.lazy` and `Suspense` for optimal chunk splitting.
- `react-i18next` with `i18next-browser-languagedetector` for language persistence in `localStorage` under key `pmajay_lang`. The `useLang()` hook exported from `lang.js` is the shared contract for P2 and P3.
- Axios client in `api.js` attaches JWT from `localStorage` on every request and redirects to `/login` on 401.
- `AuthContext` verifies the token via `GET /api/auth/me` on mount. `ToastContext` provides a global `addToast(message, type)` function.
- Beneficiary shell: sticky header with language switcher and read-aloud button plus a 44px-minimum bottom nav. Admin shell: sidebar collapsing to horizontal strip on mobile.
- `ReadAloudButton` uses Web Speech API with correct `lang` tags (`en-IN`, `hi-IN`, `te-IN`).
- `SyntheticBadge` shown wherever `isSynthetic: true` data appears in the UI.
- All form inputs have unique `id` attributes for Playwright and accessibility.
- PWA: `manifest.json` with shortcuts, `sw.js` with network-first for `/api/` and cache-first for static assets. Registered in production only.
- Print CSS in `PerspectivePlan.css` and `styles.css` for the district action plan.

### New Dependencies Added to client
- `react-router-dom` (routing)
- `react-i18next` (i18n)
- `i18next` (i18n core)
- `i18next-browser-languagedetector` (localStorage language detection)
- `axios` (HTTP client)
- `lucide-react` (icons)

### Requests to Backend (P1 and P2)
1. `GET /api/directory/centers`, `/counselors`, `/schemes` must accept `district` query param and return named arrays `centers`, `counselors`, `schemes` respectively.
2. `GET /api/placements` response must populate `user` with `name`, `phone`, `email`, `district`, `isSynthetic`.
3. `PATCH /api/tasks/:id` must accept a `comment` string and append `{ text, author, at }` to `task.comments[]`.
4. Analytics is consumed at `/api/analytics/overview` which correctly maps to officer routes.
