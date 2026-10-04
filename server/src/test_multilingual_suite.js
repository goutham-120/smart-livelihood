
const BASE_URL = 'http://localhost:5000/api/channels/simulate';

const FORBIDDEN_ENGLISH_PHRASES = [
  /tell\s+me\s+more\s+about/i,
  /tell\s+me\s+about\s+\d/i,
  /which\s+one\s+is\s+nearby/i,
  /would\s+you\s+like\s+more\s+details/i,
  /would\s+you\s+like\s+to\s+know/i,
  /here\s+are\s+some\s+options/i,
  /here\s+are\s+the\s+available/i,
  /for\s+more\s+information\s+reply/i,
  /please\s+select\s+one/i,
  /click\s+here\s+to/i,
  /enter\s+your\s+choice/i,
  /tell\s+me\s+your\s+location/i
];

const testCases = [
  // 1. The user's specific failing case
  {
    category: 'CRITICAL USER CASE - Hindi Scheme',
    input: 'मुझे स्वरोजगार के लिए सरकारी योजना चाहिए',
    expectedLang: 'hi',
    expectedSpeechCode: 'hi-IN',
    mustContain: ['योजना', 'लाभ', 'पात्रता'],
    forbidden: ['Tell me more about PMEGP', 'Which one is nearby', 'Would you like']
  },

  // 2. All 23 languages test matrix
  { name: 'English', input: 'I want tailoring training.', expectedLang: 'en', expectedSpeechCode: 'en-IN' },
  { name: 'Hindi', input: 'मुझे सिलाई की ट्रेनिंग चाहिए।', expectedLang: 'hi', expectedSpeechCode: 'hi-IN' },
  { name: 'Bengali', input: 'আমি দর্জির প্রশিক্ষণ চাই।', expectedLang: 'bn', expectedSpeechCode: 'bn-IN' },
  { name: 'Tamil', input: 'எனக்கு தையல் பயிற்சி வேண்டும்.', expectedLang: 'ta', expectedSpeechCode: 'ta-IN' },
  { name: 'Telugu', input: 'నాకు టైలరింగ్ శిక్షణ కావాలి.', expectedLang: 'te', expectedSpeechCode: 'te-IN' },
  { name: 'Kannada', input: 'ನನಗೆ ಟೈಲರಿಂಗ್ ತರಬೇತಿ ಬೇಕು.', expectedLang: 'kn', expectedSpeechCode: 'kn-IN' },
  { name: 'Malayalam', input: 'എനിക്ക് തയ്യൽ പരിശീലനം വേണം.', expectedLang: 'ml', expectedSpeechCode: 'ml-IN' },
  { name: 'Marathi', input: 'मला टेलरिंगचे प्रशिक्षण हवे आहे.', expectedLang: 'mr', expectedSpeechCode: 'mr-IN' },
  { name: 'Gujarati', input: 'મારે ટેલરિંગની તાલીમ જોઈએ છે.', expectedLang: 'gu', expectedSpeechCode: 'gu-IN' },
  { name: 'Punjabi', input: 'ਮੈਨੂੰ ਟੇਲਰਿੰਗ ਦੀ ਟ੍ਰੇਨਿੰਗ ਚਾਹੀਦੀ ਹੈ।', expectedLang: 'pa', expectedSpeechCode: 'pa-IN' },
  { name: 'Odia', input: 'ମୁଁ ଟେଲରିଂ ତାଲିମ ଚାହୁଁଛି।', expectedLang: 'or', expectedSpeechCode: 'od-IN' },
  { name: 'Assamese', input: 'মই দৰ্জীৰ প্ৰশিক্ষণ বিচাৰো।', expectedLang: 'as', expectedSpeechCode: 'as-IN' },
  { name: 'Urdu', input: 'مجھے درزی کی تربیت چاہیے۔', expectedLang: 'ur', expectedSpeechCode: 'ur-IN' },
  { name: 'Nepali', input: 'मलाई सिलाई तालिम चाहिन्छ।', expectedLang: 'ne', expectedSpeechCode: 'ne-IN' },
  { name: 'Konkani', input: 'म्हाका टेलरिंग प्रशिक्षण जाय।', expectedLang: 'kok', expectedSpeechCode: 'kok-IN' },
  { name: 'Kashmiri', input: 'میٚے چھُ ٹیلرِنگ ٹرینِنگ پَہیجے', expectedLang: 'ks', expectedSpeechCode: 'ks-IN' },
  { name: 'Sindhi', input: 'مون کي سिलाई جي تربيت گهرجي', expectedLang: 'sd', expectedSpeechCode: 'sd-IN' },
  { name: 'Sanskrit', input: 'अहं सूचीकर्म प्रशिक्षणम् इच्छामि।', expectedLang: 'sa', expectedSpeechCode: 'sa-IN' },
  { name: 'Santali', input: 'ᱤᱧ ᱴᱮᱞᱚᱨᱤᱝ ᱴᱨᱮᱱᱤᱝ ᱥᱟᱱᱟᱹᱧ ᱠᱟᱱᱟ', expectedLang: 'sat', expectedSpeechCode: 'sat-IN' },
  { name: 'Manipuri', input: 'ঐহাক্না টেলরিংগী ত্রেনিং লৌনিংই', expectedLang: 'mni', expectedSpeechCode: 'mni-IN' },
  { name: 'Bodo', input: 'आंनो टेलरिं फोरोंथाय नांगौ', expectedLang: 'brx', expectedSpeechCode: 'brx-IN' },
  { name: 'Maithili', input: 'हमरा सिलाई प्रशिक्षण चाही।', expectedLang: 'mai', expectedSpeechCode: 'mai-IN' },
  { name: 'Dogri', input: 'गी सिलाई दी ट्रेनिंग चाहिदी ऐ।', expectedLang: 'doi', expectedSpeechCode: 'doi-IN' },

  // 3. Romanized Indian Languages
  { name: 'Romanized Hindi', input: 'mujhe job chahiye', expectedLang: 'hi', expectedSpeechCode: 'hi-IN' },
  { name: 'Romanized Telugu', input: 'naaku job kavali', expectedLang: 'te', expectedSpeechCode: 'te-IN' },
  { name: 'Romanized Tamil', input: 'enakku training venum', expectedLang: 'ta', expectedSpeechCode: 'ta-IN' },
  { name: 'Romanized Kannada', input: 'nanage training beku', expectedLang: 'kn', expectedSpeechCode: 'kn-IN' },
  { name: 'Romanized Marathi', input: 'mala training pahije', expectedLang: 'mr', expectedSpeechCode: 'mr-IN' }
];

async function runTests() {
  console.log('====================================================');
  console.log('STARTING PM-AJAY WHATSAPP MULTILINGUAL VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const sampleResponses = [];

  for (const tc of testCases) {
    const title = tc.name || tc.category;
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          message: tc.input,
          phone: '9876500001',
          language: 'auto'
        })
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch (e) {
        console.error('Invalid JSON response:', res.status, text);
      }
      const detectedLang = data.language;
      const respLang = data.responseLanguage || data.speechCode;
      const reply = data.simulatedResponse || data.replyText || '';

      let hasLeakage = false;
      let leakedPhrase = '';
      if (tc.expectedLang !== 'en') {
        for (const p of FORBIDDEN_ENGLISH_PHRASES) {
          if (p.test(reply)) {
            hasLeakage = true;
            leakedPhrase = p.toString();
            break;
          }
        }
      }

      const langMatch = detectedLang === tc.expectedLang || respLang === tc.expectedSpeechCode;
      const pass = langMatch && !hasLeakage;

      if (pass) {
        passed++;
        console.log(`[PASS] ${title}`);
        console.log(`       Input: "${tc.input}"`);
        console.log(`       Detected Language: ${data.languageName} (${data.language})`);
        console.log(`       Response Language: ${respLang}`);
        console.log(`       English Leakage: ZERO LEAKAGE`);
        console.log(`       Snippet: ${reply.slice(0, 100).replace(/\n/g, ' ')}...\n`);
      } else {
        failed++;
        console.error(`[FAIL] ${title}`);
        console.error(`       Input: "${tc.input}"`);
        console.error(`       Expected: ${tc.expectedLang} / ${tc.expectedSpeechCode}`);
        console.error(`       Actual: ${detectedLang} / ${respLang}`);
        if (hasLeakage) {
          console.error(`       English Leakage Detected: ${leakedPhrase}`);
        }
        console.error(`       Reply: ${reply}\n`);
      }

      if (sampleResponses.length < 7) {
        sampleResponses.push({
          title,
          input: tc.input,
          detectedLang: data.language,
          responseLanguage: respLang,
          reply
        });
      }
    } catch (err) {
      failed++;
      console.error(`[ERROR] ${title}: ${err.message}`);
    }
  }

  // 4. Test Multi-Turn Dynamic Language Switching on a Fresh Session
  console.log('====================================================');
  console.log('TESTING MULTI-TURN DYNAMIC LANGUAGE SWITCHING');
  console.log('====================================================\n');

  const multiTurnPhone = '9876599999';
  const turns = [
    { turn: 1, input: 'I know tailoring.', expectedLang: 'en', expectedSpeechCode: 'en-IN' },
    { turn: 2, input: 'నాకు శిక్షణ కావాలి', expectedLang: 'te', expectedSpeechCode: 'te-IN' },
    { turn: 3, input: 'मुझे नौकरी चाहिए', expectedLang: 'hi', expectedSpeechCode: 'hi-IN' },
    { turn: 4, input: 'mujhe PMEGP ke baare mein batao', expectedLang: 'hi', expectedSpeechCode: 'hi-IN' }
  ];

  for (const t of turns) {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'whatsapp',
        message: t.input,
        phone: multiTurnPhone,
        language: 'auto'
      })
    });

    const data = await res.json();
    const detectedLang = data.language;
    const respLang = data.responseLanguage || data.speechCode;
    const reply = data.simulatedResponse || data.replyText || '';

    const pass = detectedLang === t.expectedLang;
    if (pass) {
      passed++;
      console.log(`[PASS] Turn ${t.turn}: "${t.input}" -> ${data.languageName} (${respLang})`);
      console.log(`       Reply snippet: ${reply.slice(0, 90).replace(/\n/g, ' ')}...\n`);
    } else {
      failed++;
      console.error(`[FAIL] Turn ${t.turn}: "${t.input}" -> Expected ${t.expectedLang}, got ${detectedLang}\n`);
    }
  }

  console.log('====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests();
