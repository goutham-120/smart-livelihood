require('dotenv').config();
const { SarvamAIClient } = require('sarvamai');

async function main() {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.error('Error: SARVAM_API_KEY is not set in environment or .env file.');
    process.exit(1);
  }

  const sarvam = new SarvamAIClient({ apiKey });

  const response = await sarvam.chat.completions({
    model: 'sarvam-105b-conversations',
    messages: [
      {
        role: 'user',
        content: 'Hello, what languages do you support?'
      }
    ]
  });

  console.log('Response:');
  console.log(response.choices[0].message.content);
}

main().catch(err => {
  console.error('API Error:', err.message || err);
});
