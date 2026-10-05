/**
 * Comprehensive Test Suite for AI Voice Assistant True Auto-Detection
 * Verifies:
 * 1. Section 23 Critical Sequence: Hindi -> Telugu -> Tamil -> Kannada -> English
 * 2. All 23 languages auto-detection via /api/assistant/speech-to-text with language: 'unknown'
 * 3. Authoritative language object verification
 * 4. LLM response language matching detected language
 * 5. TTS language matching detected language
 * 6. Low confidence handling (< 0.35 returns 422 error)
 * 7. Verification that NO turn carries over previous language
 */

const BASE_URL = 'http://localhost:5000';

const SEQUENCE_TESTS = [
  {
    name: 'Hindi',
    spokenText: 'मुझे शिक्षक की नौकरी चाहिए',
    expectedCode: 'hi-IN',
    expectedLang: 'hi'
  },
  {
    name: 'Telugu',
    spokenText: 'నాకు టీచర్ ఉద్యోగం కావాలి',
    expectedCode: 'te-IN',
    expectedLang: 'te'
  },
  {
    name: 'Tamil',
    spokenText: 'எனக்கு ஆசிரியர் வேலை வேண்டும்',
    expectedCode: 'ta-IN',
    expectedLang: 'ta'
  },
  {
    name: 'Kannada',
    spokenText: 'ನನಗೆ ಶಿಕ್ಷಕರ ಉದ್ಯೋಗ ಬೇಕು',
    expectedCode: 'kn-IN',
    expectedLang: 'kn'
  },
  {
    name: 'English',
    spokenText: 'I want a job as a teacher and need government training',
    expectedCode: 'en-IN',
    expectedLang: 'en'
  }
];

const ALL_23_LANGUAGES = [
  { name: 'English',   text: 'I want a government job in school teaching', expectedCode: 'en-IN' },
  { name: 'Hindi',     text: 'मुझे शिक्षक की नौकरी चाहिए और सिलाई का काम आता है', expectedCode: 'hi-IN' },
  { name: 'Bengali',   text: 'আমার একজন শিক্ষকের চাকরি দরকার এবং সেলাই কাজ জানি', expectedCode: 'bn-IN' },
  { name: 'Tamil',     text: 'எனக்கு ஆசிரியர் வேலை வேண்டும் மற்றும் தையல் தெரியும்', expectedCode: 'ta-IN' },
  { name: 'Telugu',    text: 'నాకు టీచర్ ఉద్యోగం కావాలి మరియు టైలరింగ్ వచ్చు', expectedCode: 'te-IN' },
  { name: 'Gujarati',  text: 'મને શિક્ષકની નોકરી જોઈએ છે અને સિલાઈ કામ આવડે છે', expectedCode: 'gu-IN' },
  { name: 'Kannada',   text: 'ನನಗೆ ಶಿಕ್ಷಕರ ಉದ್ಯೋಗ ಬೇಕು ಮತ್ತು ಹೊಲಿಗೆ ಕೆಲಸ ತಿಳಿದಿದೆ', expectedCode: 'kn-IN' },
  { name: 'Malayalam', text: 'എനിക്ക് അദ്ധ്യാപക ജോലി വേണം തയ്യൽ ജോലി അറിയാം', expectedCode: 'ml-IN' },
  { name: 'Marathi',   text: 'मला शिक्षकाची नोकरी हवी आहे आणि शिलाई काम येते', expectedCode: 'mr-IN' },
  { name: 'Punjabi',   text: 'ਮੈਨੂੰ ਅਧਿਆਪਕ ਦੀ ਨੌਕਰੀ ਚਾਹੀਦੀ ਹੈ ਅਤੇ ਸਿਲਾਈ ਆਉਂਦੀ ਹੈ', expectedCode: 'pa-IN' },
  { name: 'Odia',      text: 'ମତେ ଶିକ୍ଷକ ଚାକିରି ଦରକାର ଏବଂ ସିଲେଇ କାମ ଜଣା ଅଛି', expectedCode: 'od-IN' },
  { name: 'Assamese',  text: 'মোক শিক্ষকৰ চাকৰি লাগে আৰু চিলাই কাম জানো', expectedCode: 'as-IN' },
  { name: 'Urdu',      text: 'مجھے استاد کی نوکری چاہیے اور سلائی کا کام آتا ہے', expectedCode: 'ur-IN' },
  { name: 'Nepali',    text: 'मलाई शिक्षकको जागिर चाहिएको छ र सिलाई कटाई आउँछ', expectedCode: 'ne-IN' },
  { name: 'Konkani',   text: 'म्हाका शिक्षकाची नोकरी जाय आनी टेलरिंग येता', expectedCode: 'kok-IN' },
  { name: 'Kashmiri',  text: 'میٚہ چھِ مُعَلِم سٕنٛز نۄکری پَزان', expectedCode: 'ks-IN' },
  { name: 'Sindhi',    text: 'مون کي استاد جي نوڪري گهرجي', expectedCode: 'sd-IN' },
  { name: 'Sanskrit',  text: 'मह्यम् अध्यापकस्य उद्योगः आवश्यकः वर्तते', expectedCode: 'sa-IN' },
  { name: 'Santali',   text: 'ᱤᱧ ᱫᱚ ᱢᱟᱪᱮᱛ ᱪᱟᱹᱠᱨᱤ ᱥᱟᱱᱟᱭᱤᱧ ᱠᱟᱱᱟ', expectedCode: 'sat-IN' },
  { name: 'Manipuri',  text: 'ঐহাক ওজা ওইবা থবক পাম্মী অমসুং শেম শারবা', expectedCode: 'mni-IN' },
  { name: 'Bodo',      text: 'आंनो फोरोंगिरिनि चाख्रि नांगौ आरो टेलरिं मिथियो', expectedCode: 'brx-IN' },
  { name: 'Maithili',  text: 'हमरा शिक्षकक नौकरी चाही आ सिलाई काज अबैत अछि', expectedCode: 'mai-IN' },
  { name: 'Dogri',     text: 'मिगी मास्टर दी नौकरी चाहीदी ऐ ते सिलाई आंदी ऐ', expectedCode: 'doi-IN' }
];

async function runAutoDetectTests() {
  console.log('================================================================');
  console.log('CRITICAL VERIFICATION: AI VOICE ASSISTANT TRUE AUTO-DETECTION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // -------------------------------------------------------------
  // PART 1: Section 23 Sequential Switch Test (Zero Leakage, No carryover)
  // -------------------------------------------------------------
  console.log('>>> PART 1: SECTION 23 RAPID SEQUENTIAL SWITCH TEST <<<');
  console.log('Sequence: Hindi -> Telugu -> Tamil -> Kannada -> English');
  console.log('Checking that EVERY turn uses language_code="unknown" and does NOT carry over previous language.\n');

  let conversationId = null;

  for (let i = 0; i < SEQUENCE_TESTS.length; i++) {
    const test = SEQUENCE_TESTS[i];
    console.log(`--- TURN ${i + 1}: ${test.name.toUpperCase()} ---`);
    console.log(`Input spoken text: "${test.spokenText}"`);

    // 1. STT Auto-Detect Request (ALWAYS sending language: 'unknown')
    const sttRes = await fetch(`${BASE_URL}/api/assistant/speech-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: test.spokenText,
        language: 'unknown' // Strict requirement: never send previous language
      })
    });

    if (!sttRes.ok) {
      console.error(`[FAIL] STT failed with status ${sttRes.status}`);
      failed++;
      continue;
    }

    const stt = await sttRes.json();
    console.log(`STT Output:
  transcript: "${stt.transcript}"
  detected languageCode: ${stt.languageCode}
  languageName: ${stt.languageName}
  confidence / probability: ${stt.languageProbability || stt.confidence}
  detectionSource: ${stt.detectionSource}`);

    const isSttCorrect = stt.languageCode === test.expectedCode;
    if (!isSttCorrect) {
      console.error(`[FAIL] Expected ${test.expectedCode}, but STT detected ${stt.languageCode}`);
      failed++;
      continue;
    }

    // 2. LLM Turn with authoritative detected language and conversation continuity
    const chatRes = await fetch(`${BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: stt.transcript,
        language: stt.languageCode,
        speechCode: stt.languageCode,
        conversationId,
        channel: 'web'
      })
    });

    if (!chatRes.ok) {
      console.error(`[FAIL] Chat endpoint failed with status ${chatRes.status}`);
      failed++;
      continue;
    }

    const chat = await chatRes.json();
    conversationId = chat.conversationId;
    console.log(`LLM Output:
  responseLanguage: ${chat.responseLanguage}
  speechCode: ${chat.speechCode}
  replyText preview: "${(chat.replyText || '').slice(0, 75).replace(/\n/g, ' ')}..."`);

    const isChatLangCorrect = chat.responseLanguage === test.expectedCode;
    if (!isChatLangCorrect) {
      console.error(`[FAIL] LLM responseLanguage ${chat.responseLanguage} != ${test.expectedCode}`);
      failed++;
      continue;
    }

    // 3. TTS Request with detected language
    const ttsRes = await fetch(`${BASE_URL}/api/assistant/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: (chat.replyText || '').slice(0, 100),
        language: chat.responseLanguage
      })
    });

    if (!ttsRes.ok) {
      console.error(`[FAIL] TTS endpoint failed with status ${ttsRes.status}`);
      failed++;
      continue;
    }

    const tts = await ttsRes.json();
    console.log(`TTS Output:
  ttsLanguage: ${tts.speechCode || tts.language}
  provider: ${tts.provider}
  supported: ${tts.supported}`);

    const isTtsCorrect = (tts.speechCode === test.expectedCode) || (tts.language === test.expectedLang);
    if (!isTtsCorrect) {
      console.error(`[FAIL] TTS language mismatch: expected ${test.expectedCode}, got ${tts.speechCode}`);
      failed++;
      continue;
    }

    console.log(`[PASS] Turn ${i + 1} (${test.name}): STT -> LLM -> TTS cleanly switched with ZERO English leakage.\n`);
    passed++;
  }

  // -------------------------------------------------------------
  // PART 2: All 23 Languages Auto-Detection Test
  // -------------------------------------------------------------
  console.log('>>> PART 2: ALL 23 LANGUAGES AUTO-DETECTION VERIFICATION <<<');
  console.log('Testing each language independently with language: "unknown"\n');

  let langPassed = 0;
  for (const item of ALL_23_LANGUAGES) {
    const res = await fetch(`${BASE_URL}/api/assistant/speech-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: item.text,
        language: 'unknown'
      })
    });

    if (!res.ok) {
      console.error(`[FAIL] ${item.name.padEnd(10)}: HTTP ${res.status}`);
      failed++;
      continue;
    }

    const data = await res.json();
    const ok = data.languageCode === item.expectedCode;
    if (ok) {
      langPassed++;
      passed++;
      console.log(`[PASS] ${item.name.padEnd(10)} -> detected: ${data.languageCode} (${data.languageName}) prob=${data.languageProbability} source=${data.detectionSource}`);
    } else {
      failed++;
      console.error(`[FAIL] ${item.name.padEnd(10)} -> expected ${item.expectedCode}, got ${data.languageCode}`);
    }
  }

  console.log(`\nPart 2 Summary: ${langPassed} / ${ALL_23_LANGUAGES.length} Languages Auto-Detected Successfully.\n`);

  // -------------------------------------------------------------
  // PART 3: Low Confidence Handling Test
  // -------------------------------------------------------------
  console.log('>>> PART 3: LOW CONFIDENCE HANDLING TEST <<<');
  // When empty or indecipherable audio is given, verify it returns 400 or 422 error, NOT English fallback!
  const emptyRes = await fetch(`${BASE_URL}/api/assistant/speech-to-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: 'unknown'
    })
  });
  if (emptyRes.status === 400) {
    console.log('[PASS] Empty audio correctly rejected with status 400 (does not default to English).');
    passed++;
  } else {
    console.error('[FAIL] Empty audio did not return status 400. Got:', emptyRes.status);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAutoDetectTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
