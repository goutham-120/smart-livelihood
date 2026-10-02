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

### Requests to Backend (P1 and P2)
1. `GET /api/directory/centers`, `/counselors`, `/schemes` must accept `district` query param and return named arrays `centers`, `counselors`, `schemes` respectively.
2. `GET /api/placements` response must populate `user` with `name`, `phone`, `email`, `district`, `isSynthetic`.
3. `PATCH /api/tasks/:id` must accept a `comment` string and append `{ text, author, at }` to `task.comments[]`.
4. Analytics is consumed at `/api/analytics/overview` which correctly maps to officer routes.
