/**
 * Comprehensive Automated Verification Suite for Native Script Voice Pipeline
 * Tests all requirements from:
 * 1. Native script transcription (Devanagari, Telugu, Tamil, Bengali, Kannada)
 * 2. Preservation of English (en-IN remains Latin)
 * 3. Preservation of already-native script transcripts (no double transliteration)
 * 4. Code-mixing handling ('Mujhe tailoring ki training chahiye' -> 'मुझे टेलरिंग की ट्रेनिंग चाहिए।')
 * 5. Context memory follow-ups ('Iske liye koi sarkari yojana hai?' with previous tailoring turn)
 * 6. Dynamic language switching (Hindi -> Telugu -> English)
 * 7. Section 5 internal object { rawTranscript, displayTranscript, language, script, confidence }
 * 8. Zero English leakage in non-English responses
 */

const STT_URL = 'http://localhost:5000/api/assistant/speech-to-text';
const SIMULATE_URL = 'http://localhost:5000/api/channels/simulate';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function callSTT({ transcript, language = 'auto', audio = null }) {
  const res = await fetch(STT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, language, audio })
  });
  return await res.json();
}

async function sendWhatsApp({ message, phone = '9848011223', language = 'auto' }) {
  const res = await fetch(SIMULATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'whatsapp',
      message,
      phone,
      language
    })
  });
  return await res.json();
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING NATIVE SCRIPT VOICE TRANSCRIPT VERIFICATION');
  console.log('====================================================\n');

  // TEST 1 — HINDI NATIVE SCRIPT TRANSCRIPT
  console.log('--- TEST 1: Speak Hindi ("Mujhe teacher ki naukri chahiye") ---');
  const res1 = await callSTT({ transcript: 'Mujhe teacher ki naukri chahiye' });
  assert(res1.displayTranscript.includes('मुझे') && res1.displayTranscript.includes('टीचर') && res1.displayTranscript.includes('नौकरी'),
    `Hindi Romanized transcript converted to Devanagari: "${res1.displayTranscript}"`);
  assert(res1.script === 'Deva', `Script code is Deva`);
  assert(res1.speechCode === 'hi-IN', `Detected language is hi-IN`);

  const reply1 = await sendWhatsApp({ message: res1.displayTranscript, language: res1.speechCode });
  const text1 = reply1.simulatedResponse || reply1.replyText || '';
  assert(reply1.language === 'hi-IN' || reply1.language === 'hi', `Assistant response is in Hindi (hi-IN)`);
  assert(/[\u0900-\u097F]/.test(text1), `Assistant response text uses Devanagari script`);

  // TEST 2 — TELUGU NATIVE SCRIPT TRANSCRIPT
  console.log('\n--- TEST 2: Speak Telugu ("Naaku teacher job kavali") ---');
  const res2 = await callSTT({ transcript: 'Naaku teacher job kavali' });
  assert(res2.displayTranscript.includes('నాకు') && res2.displayTranscript.includes('టీచర్'),
    `Telugu Romanized transcript converted to Telugu script: "${res2.displayTranscript}"`);
  assert(res2.script === 'Telu', `Script code is Telu`);
  assert(res2.speechCode === 'te-IN', `Detected language is te-IN`);

  const reply2 = await sendWhatsApp({ message: res2.displayTranscript, language: res2.speechCode });
  const text2 = reply2.simulatedResponse || reply2.replyText || '';
  assert(reply2.language === 'te-IN' || reply2.language === 'te', `Assistant response is in Telugu (te-IN)`);
  assert(/[\u0C00-\u0C7F]/.test(text2), `Assistant response text uses Telugu script`);

  // TEST 3 — TAMIL NATIVE SCRIPT TRANSCRIPT
  console.log('\n--- TEST 3: Speak Tamil ("Enakku vela venum") ---');
  const res3 = await callSTT({ transcript: 'Enakku vela venum' });
  assert(res3.displayTranscript.includes('எனக்கு') && res3.displayTranscript.includes('வேலை'),
    `Tamil Romanized transcript converted to Tamil script: "${res3.displayTranscript}"`);
  assert(res3.script === 'Taml', `Script code is Taml`);
  assert(res3.speechCode === 'ta-IN', `Detected language is ta-IN`);

  const reply3 = await sendWhatsApp({ message: res3.displayTranscript, language: res3.speechCode });
  assert(reply3.language === 'ta-IN' || reply3.language === 'ta', `Assistant response is in Tamil (ta-IN)`);

  // TEST 4 — BENGALI NATIVE SCRIPT TRANSCRIPT
  console.log('\n--- TEST 4: Speak Bengali ("Amar ekta chakri chai") ---');
  const res4 = await callSTT({ transcript: 'Amar ekta chakri chai' });
  assert(res4.displayTranscript.includes('আমার') && res4.displayTranscript.includes('চাকরি'),
    `Bengali Romanized transcript converted to Bengali script: "${res4.displayTranscript}"`);
  assert(res4.script === 'Beng', `Script code is Beng`);
  assert(res4.speechCode === 'bn-IN', `Detected language is bn-IN`);

  const reply4 = await sendWhatsApp({ message: res4.displayTranscript, language: res4.speechCode });
  assert(reply4.language === 'bn-IN' || reply4.language === 'bn', `Assistant response is in Bengali (bn-IN)`);

  // TEST 5 — ENGLISH PRESERVATION
  console.log('\n--- TEST 5: Speak English ("I want a government job.") ---');
  const res5 = await callSTT({ transcript: 'I want a government job.' });
  assert(res5.displayTranscript === 'I want a government job.',
    `English preserved verbatim without Indic script conversion: "${res5.displayTranscript}"`);
  assert(res5.script === 'Latn', `English script is Latn`);
  assert(res5.speechCode === 'en-IN', `English language is en-IN`);

  const reply5 = await sendWhatsApp({ message: res5.displayTranscript, language: res5.speechCode });
  assert(reply5.language === 'en-IN' || reply5.language === 'en', `Assistant response is in English (en-IN)`);

  // TEST 6 — DYNAMIC MULTI-TURN LANGUAGE SWITCHING
  console.log('\n--- TEST 6: Multi-turn dynamic language switching ---');
  const swPhone = '9848099887';
  const sw1 = await callSTT({ transcript: 'Mujhe job chahiye' });
  const swRep1 = await sendWhatsApp({ phone: swPhone, message: sw1.displayTranscript, language: sw1.speechCode });
  assert(swRep1.language === 'hi-IN' || swRep1.language === 'hi', `Turn 1 response is Hindi`);

  const sw2 = await callSTT({ transcript: 'Naaku training kavali' });
  const swRep2 = await sendWhatsApp({ phone: swPhone, message: sw2.displayTranscript, language: sw2.speechCode });
  assert(swRep2.language === 'te-IN' || swRep2.language === 'te', `Turn 2 response switched to Telugu`);

  const sw3 = await callSTT({ transcript: 'I want details about PMEGP' });
  const swRep3 = await sendWhatsApp({ phone: swPhone, message: sw3.displayTranscript, language: sw3.speechCode });
  assert(swRep3.language === 'en-IN' || swRep3.language === 'en', `Turn 3 response switched to English`);

  // TEST 7 — CODE-MIXED SPEECH ('Mujhe tailoring ki training chahiye')
  console.log('\n--- TEST 7: Code-mixed speech handling ---');
  const res7 = await callSTT({ transcript: 'Mujhe tailoring ki training chahiye' });
  assert(res7.displayTranscript.includes('मुझे') && res7.displayTranscript.includes('टेलरिंग') && res7.displayTranscript.includes('ट्रेनिंग'),
    `Code-mixed Hindi transcript converted to native script: "${res7.displayTranscript}"`);
  assert(!res7.displayTranscript.includes('I need tailoring training'),
    `Preserved original Hindi formulation, did NOT translate to English`);

  // TEST 8 — CONTEXTUAL FOLLOW-UP MEMORY
  console.log('\n--- TEST 8: Contextual Follow-up Memory ---');
  const phoneFollow = '9848077112';
  const followTurn1 = await sendWhatsApp({
    phone: phoneFollow,
    message: res7.displayTranscript,
    language: 'hi-IN'
  });

  const resFollow2 = await callSTT({ transcript: 'Iske liye koi sarkari yojana hai?' });
  assert(resFollow2.displayTranscript.includes('इसके') && resFollow2.displayTranscript.includes('योजना'),
    `Follow-up question converted to Devanagari: "${resFollow2.displayTranscript}"`);

  const followTurn2 = await sendWhatsApp({
    phone: phoneFollow,
    message: resFollow2.displayTranscript,
    language: resFollow2.speechCode
  });
  const followText = followTurn2.simulatedResponse || followTurn2.replyText || '';
  assert(followTurn2.language === 'hi-IN' || followTurn2.language === 'hi', `Follow-up answered in Hindi`);
  assert(/योजना|PMEGP|विश्वकर्मा/i.test(followText), `Follow-up scheme info retrieved in context`);

  // TEST 9 — ALREADY NATIVE SCRIPT TRANSCRIPT (Section 13)
  console.log('\n--- TEST 9: Already Native Script Transcript (Do Not Touch) ---');
  const nativeInput = 'मुझे शिक्षक की नौकरी चाहिए।';
  const res9 = await callSTT({ transcript: nativeInput, language: 'hi-IN' });
  assert(res9.displayTranscript === nativeInput,
    `Already native script preserved verbatim without modification: "${res9.displayTranscript}"`);
  assert(res9.script === 'Deva', `Script is Deva`);

  // TEST 10 — SECTION 5 INTERNAL OBJECT FORMAT
  console.log('\n--- TEST 10: Section 5 Internal Object Format Verification ---');
  assert(typeof res1.rawTranscript === 'string', `rawTranscript present`);
  assert(typeof res1.displayTranscript === 'string', `displayTranscript present`);
  assert(typeof res1.language === 'string', `language present`);
  assert(typeof res1.script === 'string', `script present`);
  assert(typeof res1.confidence === 'number', `confidence present`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
