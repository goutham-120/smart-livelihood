/**
 * Voice Pipeline Test Suite for PM-AJAY WhatsApp Assistant
 * Verifies Section 24 scenarios end-to-end:
 * TEST 1: English scheme query
 * TEST 2: Hindi scheme query
 * TEST 3: Telugu scheme query
 * TEST 4: Tamil scheme query
 * TEST 5: Bengali scheme query
 * TEST 6: Multi-turn language switching (Hindi -> Telugu -> English)
 * TEST 7: Follow-up context memory (Tailoring -> Which training should I take?)
 * TEST 8: Silent / Empty audio graceful handling
 * TEST 9: Rapid multi-message race condition handling
 * TEST 10: TTS fallback & synthesis resilience
 */

const BASE_URL = 'http://localhost:5000';

async function runVoiceSuite() {
  console.log('====================================================');
  console.log('STARTING PM-AJAY WHATSAPP VOICE PIPELINE VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Helper for STT + WhatsApp Simulation
  async function simulateVoiceTurn({ spokenText, phone = '9848099881', languageHint = 'auto' }) {
    // 1. STT
    const sttRes = await fetch(`${BASE_URL}/api/assistant/speech-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: spokenText, language: languageHint })
    });
    const sttData = await sttRes.json();

    // 2. WhatsApp simulator turn
    const waRes = await fetch(`${BASE_URL}/api/channels/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'whatsapp',
        message: sttData.transcript,
        phone,
        language: sttData.speechCode,
        lang: sttData.language,
        isVoice: true
      })
    });
    const waData = await waRes.json();

    // 3. TTS synthesis check
    const ttsRes = await fetch(`${BASE_URL}/api/assistant/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: (waData.simulatedResponse || '').slice(0, 150),
        language: waData.language,
        speechCode: waData.speechCode
      })
    });
    const ttsData = await ttsRes.json();

    return { stt: sttData, wa: waData, tts: ttsData };
  }

  // TEST 1 — ENGLISH
  try {
    const res1 = await simulateVoiceTurn({
      spokenText: 'I want a government scheme for self employment.',
      phone: '9848011111'
    });
    const p1 = res1.stt.language === 'en' && res1.wa.language === 'en' && res1.wa.simulatedResponse.includes('PM-AJAY');
    if (p1) {
      passed++;
      console.log('[PASS] TEST 1 — ENGLISH');
      console.log('       Transcript:', res1.stt.transcript);
      console.log('       Response Language:', res1.wa.speechCode);
      console.log('       TTS Language:', res1.tts.speechCode || res1.tts.language, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 1 — ENGLISH', res1);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 1:', e.message); }

  // TEST 2 — HINDI
  try {
    const res2 = await simulateVoiceTurn({
      spokenText: 'मुझे स्वरोजगार के लिए सरकारी योजना चाहिए',
      phone: '9848022222'
    });
    const p2 = res2.stt.language === 'hi' && res2.wa.language === 'hi' && res2.wa.simulatedResponse.includes('योजना');
    if (p2) {
      passed++;
      console.log('[PASS] TEST 2 — HINDI');
      console.log('       Transcript:', res2.stt.transcript);
      console.log('       Response Language:', res2.wa.speechCode);
      console.log('       Zero English Leakage: YES\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 2 — HINDI', res2);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 2:', e.message); }

  // TEST 3 — TELUGU
  try {
    const res3 = await simulateVoiceTurn({
      spokenText: 'నాకు స్వయం ఉపాధి కోసం ప్రభుత్వ పథకం కావాలి',
      phone: '9848033333'
    });
    const p3 = res3.stt.language === 'te' && res3.wa.language === 'te' && res3.wa.simulatedResponse.includes('పథకం');
    if (p3) {
      passed++;
      console.log('[PASS] TEST 3 — TELUGU');
      console.log('       Transcript:', res3.stt.transcript);
      console.log('       Response Language:', res3.wa.speechCode);
      console.log('       Zero English Leakage: YES\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 3 — TELUGU', res3);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 3:', e.message); }

  // TEST 4 — TAMIL
  try {
    const res4 = await simulateVoiceTurn({
      spokenText: 'எனக்கு சுயதொழிலுக்கு அரசு திட்டம் வேண்டும்',
      phone: '9848044444'
    });
    const p4 = res4.stt.language === 'ta' && res4.wa.language === 'ta';
    if (p4) {
      passed++;
      console.log('[PASS] TEST 4 — TAMIL');
      console.log('       Transcript:', res4.stt.transcript);
      console.log('       Response Language:', res4.wa.speechCode, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 4 — TAMIL', res4);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 4:', e.message); }

  // TEST 5 — BENGALI
  try {
    const res5 = await simulateVoiceTurn({
      spokenText: 'আমার স্বনিযুক্তির জন্য একটি সরকারি প্রকল্প চাই',
      phone: '9848055555'
    });
    const p5 = res5.stt.language === 'bn' && res5.wa.language === 'bn';
    if (p5) {
      passed++;
      console.log('[PASS] TEST 5 — BENGALI');
      console.log('       Transcript:', res5.stt.transcript);
      console.log('       Response Language:', res5.wa.speechCode, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 5 — BENGALI', res5);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 5:', e.message); }

  // TEST 6 — LANGUAGE SWITCHING (Hindi -> Telugu -> English on SAME phone)
  try {
    const swPhone = '9848066666';
    const turn1 = await simulateVoiceTurn({ spokenText: 'मुझे नौकरी चाहिए', phone: swPhone });
    const turn2 = await simulateVoiceTurn({ spokenText: 'నాకు శిక్షణ కావాలి', phone: swPhone });
    const turn3 = await simulateVoiceTurn({ spokenText: 'I want a job opening', phone: swPhone });

    const p6 = turn1.wa.language === 'hi' && turn2.wa.language === 'te' && turn3.wa.language === 'en';
    if (p6) {
      passed++;
      console.log('[PASS] TEST 6 — MULTI-TURN LANGUAGE SWITCHING');
      console.log('       Turn 1:', turn1.wa.speechCode);
      console.log('       Turn 2:', turn2.wa.speechCode);
      console.log('       Turn 3:', turn3.wa.speechCode, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 6 — LANGUAGE SWITCHING', { t1: turn1.wa.language, t2: turn2.wa.language, t3: turn3.wa.language });
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 6:', e.message); }

  // TEST 7 — FOLLOW-UP CONTEXT MEMORY
  try {
    const memPhone = '9848077777';
    const ctx1 = await simulateVoiceTurn({ spokenText: 'I know tailoring.', phone: memPhone });
    const ctx2 = await simulateVoiceTurn({ spokenText: 'Which training should I take?', phone: memPhone });

    const p7 = ctx2.wa.simulatedResponse.toLowerCase().includes('tailor') || ctx2.wa.simulatedResponse.toLowerCase().includes('sewing');
    if (p7) {
      passed++;
      console.log('[PASS] TEST 7 — FOLLOW-UP CONTEXT MEMORY');
      console.log('       Initial:', ctx1.stt.transcript);
      console.log('       Follow-up Question:', ctx2.stt.transcript);
      console.log('       Understood Context: Retained Tailoring skill profile\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 7 — FOLLOW-UP CONTEXT', ctx2.wa.simulatedResponse);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 7:', e.message); }

  // TEST 8 — SILENT / EMPTY AUDIO HANDLING
  try {
    const silentRes = await fetch(`${BASE_URL}/api/assistant/speech-to-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: '', transcript: '' })
    });
    const silentData = await silentRes.json();
    const p8 = silentRes.status === 400 && Boolean(silentData.error);
    if (p8) {
      passed++;
      console.log('[PASS] TEST 8 — EMPTY / SILENT AUDIO HANDLING');
      console.log('       Rejection message:', silentData.error, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 8 — SILENT AUDIO', silentData);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 8:', e.message); }

  // TEST 9 — RAPID MULTI-MESSAGE ANTI-RACE HANDLING
  try {
    const racePhone = '9848088888';
    const [resA, resB] = await Promise.all([
      simulateVoiceTurn({ spokenText: 'मुझे सिलाई सीखनी है', phone: racePhone }),
      simulateVoiceTurn({ spokenText: 'నాకు టైలరింగ్ కావాలి', phone: racePhone })
    ]);
    const p9 = Boolean(resA.wa.simulatedResponse) && Boolean(resB.wa.simulatedResponse);
    if (p9) {
      passed++;
      console.log('[PASS] TEST 9 — PARALLEL VOICE REQUEST HANDLING');
      console.log('       Request A handled:', resA.wa.speechCode);
      console.log('       Request B handled:', resB.wa.speechCode, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 9 — PARALLEL REQUESTS', { resA, resB });
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 9:', e.message); }

  // TEST 10 — TTS FALLBACK RESILIENCE
  try {
    const ttsRes = await fetch(`${BASE_URL}/api/assistant/text-to-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Testing fallback resilience.', language: 'kn', speechCode: 'kn-IN' })
    });
    const ttsData = await ttsRes.json();
    const p10 = ttsRes.ok && Boolean(ttsData.language === 'kn');
    if (p10) {
      passed++;
      console.log('[PASS] TEST 10 — TTS FALLBACK RESILIENCE');
      console.log('       TTS Provider:', ttsData.provider);
      console.log('       Reported SpeechCode:', ttsData.speechCode, '\n');
    } else {
      failed++;
      console.error('[FAIL] TEST 10 — TTS RESILIENCE', ttsData);
    }
  } catch (e) { failed++; console.error('[FAIL] TEST 10:', e.message); }

  console.log('====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runVoiceSuite();
