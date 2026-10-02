# Responsible AI, Privacy by Design, and Ethical Safety
## SIH26097 PM-AJAY AI Voice Assistant

### 1. Privacy by Design: Zero Caste Storage Guarantee
- **Rule of Operation**: Caste or community identity is **never requested, collected, stored, or processed** at any level of the database or prompt layer.
- **Verification Decoupling**: Welfare entitlement eligibility is verified exclusively through formal scheme enrolment identifiers or authorized government nodal officer validation.

### 2. Explicit Multilingual Consent Framework
- Every beneficiary is presented with an audio/visual consent prompt in their selected regional language (Telugu, Hindi, English).
- **User Rights**:
  - `POST /api/consent`: Timestamped versioned consent record.
  - `GET /api/privacy/export`: Full portability export of stored profile data.
  - `DELETE /api/privacy/me`: Immediate right to erasure / data purge.

### 3. LLM Safety & Untrusted Output Sanitization
- **Strict Output Schema**: LLM outputs are forced into strict JSON format with typed schema validations.
- **Skill Key Whitelisting**: Extracted skills are matched against a pre-verified canonical database of 60+ NSQF skills; arbitrary or hallucinated skills are immediately discarded.
- **Empathetic & Non-Judgmental Guardrails**: Prompts explicitly forbid patronizing or discouraging language, maintaining warmth and encouragement for rural beneficiaries.

### 4. Granular Role-Based Access & District Scoping
- **Officers** are cryptographically restricted to data within their designated district.
- **Beneficiaries** can never access or modify another citizen's records.
- **Audit Logging**: Every read and mutation of beneficiary data is immutably logged with actor ID, timestamp, and district tag.
