# Collaboration Notes & Cross-Module Contracts

## Backend Engineer (P0 & P1 Implementation)

### 1. Database & Schemas
- Implemented 14 Mongoose models in `server/src/models/` complying with the shared contract.
- Added compound indexes on `district`, `occupationKey`, `user`, and `status`.
- Zero-caste policy strictly enforced (no caste fields anywhere in schema or queries).

### 2. Verified Data Seeds
- Seeded 60 verified skills across 9 sectors with multilingual names (`en`, `hi`, `te`) and long aliases to prevent false keyword matches.
- Seeded 27 verified NSQF-aligned occupations, 40 verified courses with QP codes, 11 central government schemes with portal links, and 60 training centers across Warangal, Adilabad, and Nalgonda.
- Seeded 300 synthetic beneficiaries with `isSynthetic: true` along with demo logins for Admin, District Officers, and Beneficiaries.

### 3. API Security & Channels
- Integrated `helmet`, CORS allowlisting, input sanitizers, rate limiting, and Twilio X-Twilio-Signature verification.
- Implemented multi-channel webhook handlers for WhatsApp and IVR plus simulation endpoint `/api/channels/simulate`.

---

## Matching, Pathways, Analytics & Self-Employment Engineer (P0, P1 & Stretch Implementation)

### 1. New Services & Algorithms
- `server/src/services/matching.js`: Matching v2 featuring weighted skill fit (35%), district demand (25%), pathway preference (15%), income target (10%), and mobility/education (15%). Partial credit given for prerequisites and embedding similarity. Produces separate wage and self employment tracks.
- `server/src/services/regional.js`: Attaches nearby accredited training centers (same district first), applicable PM support schemes, and district demand to opportunities.
- `server/src/services/selfEmployment.js`: Generates micro enterprise business plans, capital startup estimates, and tasks for financial counselor consultations.
- `server/src/services/dropout.js`: Transparent logistic scoring for candidate dropout risk calibrated on synthetic district data with human-readable risk reasons and suggested interventions.
- `server/src/services/planning.js`: Generates 6-month district perspective action plans with trade allocations, timelines, KPIs, and cost estimates.
- `server/src/services/jobmatch.js`: Candidate ranking service for job openings.

### 2. Routes Created & Upgraded
- `server/src/routes/opportunities.js`: Integrated Matching v2, regional data enrichment, and self employment guide endpoints.
- `server/src/routes/pathway.js`: Prerequisite graph ordered career roadmaps, competency gap breakdowns, and upgraded what-if career simulation with before/after comparison bars.
- `server/src/routes/analytics.js`: Overview analytics with cell masking for counts smaller than 5 for district officer privacy.
- `server/src/routes/plans.js`: District perspective plan generation (`POST /api/plans/generate`) and retrieval (`GET /api/plans`).

### 3. UI Pages Upgraded
- `client/src/pages/Opportunities.jsx`: Added demand badges, NSQF levels, centers, schemes, expandable breakdown ("Why this match score?"), and track filters.
- `client/src/pages/SkillGaps.jsx`: Two column layout (Your Skills vs Required Skills) with prioritized "Learn First" list and accredited centers.
- `client/src/pages/Training.jsx`: Course filters for cost, mode, duration, and language with required skills display.
- `client/src/pages/Roadmap.jsx`: Prerequisite graph ordered steps, NSQF level progression, estimated stage income, and accredited centers.
- `client/src/pages/WhatIf.jsx`: Simulation levers for location, track preference, income target slider, travel constraints, before/after comparison bars, and unlocked options.
- `client/src/pages/SelfEmployment.jsx`: Micro enterprise startup guide, capital requirement cards, loan/subsidy schemes, district financial counselors, and counselor request action.

### 4. Integration Notes for App.jsx & Router Owner
- Register route `/self-employment` in `App.jsx` importing `SelfEmployment` from `./pages/SelfEmployment`: `<Route path="/self-employment" element={<SelfEmployment />} />`.
- `analytics.js` and `plans.js` are ready for API consumption under `/api/analytics` and `/api/plans`.
