# System Architecture & Technical Specification
## Project: SIH26097 - AI Voice Assistant for Livelihood Mapping and Skilling (PM-AJAY, GIA Component)

### 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph BeneficiaryChannels["Multi-Channel Access Layers"]
        WebClient["React + Vite Web App (Browser Speech)"]
        Kiosk["Village CSC / Panchayat Kiosk Mode"]
        WhatsApp["WhatsApp Bot (Twilio Webhook)"]
        IVR["IVR Telephony (Twilio Voice / DTMF)"]
    end

    subgraph SecurityGateway["Security & Ingress Gateway"]
        Helmet["Helmet Security Headers"]
        RateLimiter["Rate Limiting (Channel & Auth)"]
        TwilioVerify["Twilio X-Signature Verification"]
        AuthMiddleware["JWT & District Scoped Role Check"]
    end

    subgraph CoreBackend["Express + Mongoose ESM Server"]
        AuthRouter["Auth & OTP Engine"]
        ProfileRouter["Profile & Risk Scoring Engine"]
        AssistantRouter["AI Voice Dialogue Engine"]
        OpportunityRouter["NSQF Opportunity Matcher"]
        OfficerRouter["Officer Analytics & Assisted Portal"]
        AdminRouter["Admin Governance & Audit"]
        PlanRouter["Livelihood Action Plan Generator"]
    end

    subgraph AIIntegrations["AI & Speech Services"]
        GeminiLLM["Google Gemini 1.5 Flash (Empathetic Dialogue)"]
        SarvamAI["Sarvam AI Indic LLM & Speech API"]
        SchemaValidator["Strict JSON Schema & Skill Key Whitelist"]
    end

    subgraph DataPersistence["MongoDB Database Tier"]
        UsersDB[("Users & Roles")]
        ProfilesDB[("Profiles & Risk Scores")]
        MastersDB[("Skills, Occupations, Courses, Schemes")]
        PlacementsDB[("Placements & Dropout Tracker")]
        AuditDB[("Immutable Audit Logs")]
    end

    BeneficiaryChannels --> SecurityGateway
    SecurityGateway --> CoreBackend
    AssistantRouter --> AIIntegrations
    CoreBackend --> DataPersistence
```

### 2. Multi-Channel Dialogue Flow

```mermaid
sequenceDiagram
    autonumber
    actor Beneficiary as Beneficiary (Low Literacy / Rural)
    participant Channel as Channel (Voice / Kiosk / WhatsApp / IVR)
    participant Server as Express Backend
    participant AI as Gemini & Sarvam Indic AI
    participant DB as MongoDB

    Beneficiary->>Channel: Speaks in Regional Language (Telugu / Hindi)
    Channel->>Server: Transmits audio text / webhook payload
    Server->>DB: Loads Beneficiary Profile & District Demands
    Server->>AI: Prompts AI with Empathy Guidelines & Canonical Skills
    AI-->>Server: Returns Structured JSON (Reply, Extracted Skills)
    Server->>Server: Validates Output against Skill Key Whitelist
    Server->>DB: Updates Profile, Recalculates Dropout Risk Score
    Server-->>Channel: Delivers Empathetic Voice & Text Guidance
    Channel-->>Beneficiary: Speaks back in Native Dialect with Next Step
```

### 3. Core Security and Privacy Boundaries
1. **Zero-Caste Storage Guarantee**: Caste is never requested, collected, stored, or processed.
2. **District Scoping**: District Livelihood Officers can only view and manage records within their designated district.
3. **Strict AI Guardrails**: All generative outputs are validated against strict JSON schemas and validated skill master keys.
4. **Audit Immutability**: All read/export/delete actions on beneficiary data generate audit log entries.
