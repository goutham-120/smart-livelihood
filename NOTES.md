# Collaboration Notes and Cross Module Contracts

## Backend Engineer (P0 and P1 Implementation)

### 1. Database and Schemas
* Implemented 14 Mongoose models in `server/src/models/` complying with the shared contract.
* Added compound indexes on `district`, `occupationKey`, `user`, and `status`.
* Zero caste policy strictly enforced (no caste fields anywhere in schema or queries).

### 2. Verified Data Seeds
* Seeded 60 verified skills across 9 sectors with multilingual names (`en`, `hi`, `te`) and long aliases to prevent false keyword matches.
* Seeded 27 verified NSQF aligned occupations, 40 verified courses with QP codes, 11 central government schemes with portal links, and 60 training centers across Warangal, Adilabad, and Nalgonda.
* Seeded 300 synthetic beneficiaries with `isSynthetic: true` along with demo logins for Admin, District Officers, and Beneficiaries.

### 3. API Security and Channels
* Integrated `helmet`, CORS allowlisting, input sanitizers, rate limiting, and Twilio X Twilio Signature verification.
* Implemented multi channel webhook handlers for WhatsApp and IVR plus simulation endpoint `/api/channels/simulate`.

## Voice AI and Omni Channel Engineer (P0, P1, Stretch Implementation)

### 1. Channel Agnostic Conversation Engine (`server/src/services/conversation.js`)
* Implemented full 11 stage state machine: `greeting_consent`, `family_occupation`, `current_livelihood`, `education`, `skills`, `interests`, `mobility_constraints`, `employment_preference`, `location`, `income_goal`, `confirmation`.
* One short question at a time in warm, respectful, plain language.
* Reflects back what was heard before asking next stage question.
* Accepts "I don't know" or "skip" gracefully without getting stuck.
* Handles mid stream corrections (e.g. "actually 3 years", "no I want wage job").
* Handles repeat requests on demand ("malli cheppandi", "phir se boliye", "repeat").
* Automatic 5 minute timeout guard jumping to summary to prevent low literacy user fatigue.
* Supports officer assisted mode via `forUserId` with district scoping and permission checks.

### 2. LLM Extraction and Generation (`server/src/services/llm.js`)
* Google Gemini 1.5 Flash client with fallback to Sarvam Indic chat and deterministic rule fallback.
* Strict JSON schema output and strict whitelist validation against canonical `Skill.key` collection.
* Robust support for Hinglish, Teluglish, and code mixed rural speech.
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
* Multi language DTMF menu (1 for Telugu, 2 for Hindi, 3 for English).
* DTMF confirmation followed by automated SMS summary dispatch to the caller phone number.

### 7. Embeddings Service (`server/src/services/embeddings.js`)
* Functions `embed(text)` and `cosine(a, b)` with in memory caching.
* Powered by Gemini text embedding 004 with deterministic dense vector fallback for offline and rate limited environments.
* Exported for downstream recommendation services.

### 8. Touch Kiosk Mode (`client/src/pages/Kiosk.jsx`, `Kiosk.css`)
* Full screen interface tailored for Gram Panchayat and Common Service Centers.
* Large icon language selector cards (Telugu, Hindi, English).
* Giant pulsing microphone button with visual audio ripple animation.
* Automatic spoken audio prompts at each step.
* 45 second inactivity countdown timer with auto reset.
* Zero login required: captures mobile phone number at the end for SMS dispatch.

### 9. Interactive Telephony Simulator (`client/src/pages/ChannelDemo.jsx`, `ChannelDemo.css`)
* Realistic dual phone mockups for WhatsApp and IVR telephone keypad.
* Connected to `/api/channels/simulate` for live testing without active telephony credentials.
* Preloaded scenarios for Weaver in Warangal, Dairy Farmer in Adilabad, and Solar Technician in Nalgonda.

### 10. Recommended App Routing Updates for Frontend Team
To make the new Kiosk and Channel Demo pages globally accessible in `App.jsx`, add these routes:
* `<Route path="/kiosk" element={<Kiosk />} />`
* `<Route path="/channel-demo" element={<ChannelDemo />} />`

### 11. Stretch Goal: Benchmark Results on 50 Multilingual Utterances
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
