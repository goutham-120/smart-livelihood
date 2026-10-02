# Impact Metrics, Cost Modeling, and Scalability
## SIH26097 PM-AJAY AI Livelihood Assistant

### 1. Key Impact Targets & Projections
- **Target Beneficiary Group**: Low-literacy youth, women, and marginalized rural workers.
- **Skill Discovery Time Reduction**: From 14 days of manual offline surveys down to a **3-minute voice conversation**.
- **Placement & Self-Employment Rate**: Projected improvement from baseline 45% to **72%+** due to demand-aligned course matching.
- **Dropout Reduction**: Anticipated **35% reduction in training dropouts** via early-warning risk scoring and localized transport alignment.

### 2. Cost per Beneficiary Breakdown (Unit Economics)

| Component | Cost per Onboarding (INR) | Optimization Strategy |
| :--- | :--- | :--- |
| **LLM Inference (Gemini / Sarvam AI)** | ₹1.80 | Concise structured prompt engineering & response caching |
| **Speech-to-Text & TTS (Indic Voice)** | ₹4.20 | WebSpeech on browsers; Sarvam streaming on Kiosk & IVR |
| **Twilio WhatsApp / SMS Webhook** | ₹4.50 | Sandbox testing; bulk government SMS rates in production |
| **Cloud Hosting & DB Compute** | ₹2.00 | Stateless Node.js container on Kubernetes / Render with MongoDB Atlas |
| **Total Estimated Cost** | **₹12.50 per Beneficiary** | **>80% cheaper than traditional physical surveyor camps** |

### 3. Scalability Model
- **Horizontal Scalability**: Stateless API architecture allows auto-scaling container instances across multiple cloud zones.
- **District Multi-Tenancy**: Built-in indexing on `district` enables seamless scaling from 3 pilot districts to all 766 districts across India.
- **Offline & Low-Bandwidth Resilience**: Browser Web Speech API eliminates network speech latency on low-bandwidth rural connections.
