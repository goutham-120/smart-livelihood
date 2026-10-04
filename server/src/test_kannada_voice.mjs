// Replays the exact Kannada transcripts Chrome produced in the server logs,
// plus regression checks so other languages are not misdetected as Kannada.
const STT = 'http://localhost:5000/api/assistant/speech-to-text';
const SIM = 'http://localhost:5000/api/channels/simulate';

const cases = [
  { text: 'Nanagi shiksha Kara Wood yoga Bekagi de.', expect: 'kn' },
  { text: 'Then again, shikshakara udyoga bhi kagide.', expect: 'kn' },
  { text: 'Nanage shikshakara udyoga bekagide', expect: 'kn' },
  { text: 'Nanage tailoring tarabeti beku', expect: 'kn' },
  { text: 'ನನಗೆ ಶಿಕ್ಷಕರ ಉದ್ಯೋಗ ಬೇಕಾಗಿದೆ', expect: 'kn' },
  // regressions
  { text: 'Mujhe teacher ki naukri chahiye', expect: 'hi' },
  { text: 'Naaku udyogam kavali', expect: 'te' },
  { text: 'Enakku velai venum', expect: 'ta' },
  { text: 'Enikku joli venam', expect: 'ml' },
  { text: 'I want a government job', expect: 'en' }
];

let pass = 0;
for (const c of cases) {
  const stt = await (await fetch(STT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript: c.text })
  })).json();
  const sim = await (await fetch(SIM, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel: 'whatsapp', phone: '9000000077', message: stt.displayTranscript, language: stt.language })
  })).json();
  const ok = stt.language === c.expect && sim.language === c.expect;
  if (ok) pass++;
  console.log(`[${ok ? 'PASS' : 'FAIL'}] "${c.text}"\n   -> lang=${stt.language} script=${stt.script} display="${stt.displayTranscript}"\n   -> reply(${sim.language}): ${String(sim.replyText).split('\n')[0].slice(0, 80)}`);
}
console.log(`\n${pass}/${cases.length} PASSED`);
