# SIH26097: AI Voice Assistant for Livelihood Mapping and Skilling (PM-AJAY, GIA Component)

A multilingual, empathetic voice assistant that interviews rural and low-literacy beneficiaries, recommends NSQF-aligned training and livelihood pathways using local demand, works across Web, Kiosk, WhatsApp, and IVR channels, and empowers district officers with planning, placement, and dropout control tools.

---

## 🚀 Key Features

- **Empathetic Multilingual Voice Assistant**: Powered by Google Gemini and Sarvam AI Indic models in Telugu, Hindi, and English.
- **NSQF-Aligned Skill Discovery**: Verified mapping with 60+ skills, 27+ occupations, 40+ courses, and 11+ central government schemes (PMKVY, PM Vishwakarma, PMEGP, PM MUDRA, PM-AJAY GIA).
- **Omni-Channel Architecture**: Unified API supporting Web, Kiosk mode, WhatsApp Bot (Twilio), and IVR Telephony.
- **District Officer Command Center**: Real-time 5-stage funnel analytics, dropout risk scoring, candidate-job matching, and automated district livelihood action plan generation.
- **Zero-Caste Policy & Responsible AI**: Strict privacy guarantees with explicit consent, data export, account deletion, and zero caste storage.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (ESM), Mongoose, MongoDB
- **AI & Speech**: `@google/generative-ai` (Gemini 1.5 Flash), `sarvamai` (Sarvam Indic LLM & Speech API)
- **Telephony & Messaging**: `twilio` (WhatsApp Sandbox & Voice IVR)
- **Security**: `helmet`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`

---

## ⚙️ Setup & Execution

### 1. Environment Configuration
Create `server/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/livelihood
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
ALLOW_DEMO=true
PUBLIC_BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# LLM & Speech
LLM_API_KEY=your_gemini_key
SPEECH_PROVIDER=sarvam
SARVAM_API_KEY=your_sarvam_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 2. Install & Seed
```bash
cd server
npm install
npm run seed:demo
```

### 3. Run Development Server
```bash
npm start
```

---

## 🔑 Demo Credentials (Seeded)

- **Admin**: `admin@demo.gov.in` / `Admin@123`
- **Officer (Warangal)**: `officer.warangal@demo.gov.in` / `Officer@123`
- **Officer (Adilabad)**: `officer.adilabad@demo.gov.in` / `Officer@123`
- **Officer (Nalgonda)**: `officer.nalgonda@demo.gov.in` / `Officer@123`
- **Beneficiary**: `beneficiary@demo.gov.in` (or OTP `123456` with phone `9876543210`) / `Demo@123`

---

## 📚 Documentation

- [Architecture Diagram & Spec](docs/ARCHITECTURE.md)
- [Problem Statement to Feature Mapping](docs/SLIDE_OUTLINE.md)
- [Impact Metrics & Unit Economics](docs/IMPACT_AND_METRICS.md)
- [Responsible AI & Privacy Policy](docs/RESPONSIBLE_AI_PRIVACY.md)
- [Known Limitations](docs/LIMITATIONS.md)
- [5-Minute Demo Video Script](docs/DEMO_VIDEO_SCRIPT.md)
