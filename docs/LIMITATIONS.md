# Known Limitations & Technical Considerations
## SIH26097 PM-AJAY AI Voice Assistant

### 1. Synthetic Data Notice
- **Demand Projections & Job Openings**: Regional demand levels and specific employer job openings in the pilot demo are synthetic representations modeled on District Skill Development Plan (DSDP) trends and Periodic Labour Force Survey patterns. All synthetic records carry explicit `isSynthetic: true` flags.
- **Candidate Pool**: The 300 pre-seeded beneficiaries in Warangal, Adilabad, and Nalgonda are synthetic profiles designed for comprehensive end-to-end testing of placement funnels, dropout analytics, and officer workflows.

### 2. Speech Recognition & Vernacular Dialects
- While Sarvam AI and Web Speech APIs offer leading Indic speech processing, strong local tribal dialects (such as interior Gondi or Kolami in Adilabad) benefit from kiosk facilitator assistance or IVR numerical touch-tone fallback.

### 3. Telephony and SMS Sandbox Limitations
- In local development mode, Twilio WhatsApp messaging requires mobile numbers to join the Twilio Sandbox. In production deployment, a verified WhatsApp Business Account (WABA) and DLTR government SMS sender ID eliminate sandbox join steps.
