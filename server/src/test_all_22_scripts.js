import { normalizeVoiceTranscript } from './channels/transliteration.js';

const testCases = [
  { lang: 'hi-IN', text: 'Mujhe teacher ki naukri chahiye', expectedScript: 'Deva' },
  { lang: 'te-IN', text: 'Naaku udyogam kavali', expectedScript: 'Telu' },
  { lang: 'ta-IN', text: 'Enakku velai venum', expectedScript: 'Taml' },
  { lang: 'bn-IN', text: 'Aamar chakri dorkar', expectedScript: 'Beng' },
  { lang: 'gu-IN', text: 'Mane nokari joiye', expectedScript: 'Gujr' },
  { lang: 'kn-IN', text: 'Nanage kelasa beku', expectedScript: 'Knda' },
  { lang: 'ml-IN', text: 'Enikku joli venam', expectedScript: 'Mlym' },
  { lang: 'mr-IN', text: 'Mala naukari havi ahe', expectedScript: 'Deva' },
  { lang: 'pa-IN', text: 'Mainu naukri chahidi hai', expectedScript: 'Guru' },
  { lang: 'od-IN', text: 'Mate chakiri darkar', expectedScript: 'Orya' },
  { lang: 'as-IN', text: 'Muk sakori lage', expectedScript: 'Beng' },
  { lang: 'ur-IN', text: 'Mujhe mulazmat chahiye', expectedScript: 'Arab' },
  { lang: 'ne-IN', text: 'Malai jagir chahiyeko chha', expectedScript: 'Deva' },
  { lang: 'kok-IN', text: 'Mhaka nokri zai', expectedScript: 'Deva' },
  { lang: 'ks-IN', text: 'Me che nokri pazan', expectedScript: 'Arab' },
  { lang: 'sd-IN', text: 'Munkhe nokari khapandee', expectedScript: 'Arab' },
  { lang: 'sa-IN', text: 'Mahyam udyogam avashyakam', expectedScript: 'Deva' },
  { lang: 'sat-IN', text: 'Ing kami sanang kana', expectedScript: 'Olck' },
  { lang: 'mni-IN', text: 'Eikhoi thabak pammi', expectedScript: 'Beng' },
  { lang: 'brx-IN', text: 'Aano chakri nanggau', expectedScript: 'Deva' },
  { lang: 'mai-IN', text: 'Hamra nokri chahi', expectedScript: 'Deva' },
  { lang: 'doi-IN', text: 'Migi naukri chahidi ae', expectedScript: 'Deva' },
  { lang: 'en-IN', text: 'I want a government job', expectedScript: 'Latn' }
];

async function run() {
  console.log('Testing native script transliteration across all 22 Indian languages + English:\n');
  let passed = 0;
  for (const tc of testCases) {
    const res = await normalizeVoiceTranscript({
      rawTranscript: tc.text,
      detectedLanguage: tc.lang
    });
    const isScriptMatch = res.script === tc.expectedScript;
    const isNotEmpty = res.displayTranscript && res.displayTranscript.length > 0;
    const isNotRoman = tc.lang === 'en-IN' ? res.script === 'Latn' : res.script !== 'Latn';
    const isOk = isScriptMatch && isNotEmpty && isNotRoman;
    if (isOk) passed++;
    console.log(`[${isOk ? 'PASS' : 'FAIL'}] ${tc.lang.padEnd(7)} (${res.script}): "${tc.text}" -> "${res.displayTranscript}"`);
  }
  console.log(`\nResult: ${passed} / ${testCases.length} PASSED`);
}

run();
