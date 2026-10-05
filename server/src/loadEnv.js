import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Safe startup check (NEVER logs actual key values)
const isSarvamConfigured = Boolean(process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY.trim());
const isLlmConfigured = Boolean(process.env.LLM_API_KEY && process.env.LLM_API_KEY.trim());

console.log(`[CONFIG] SARVAM_API_KEY configured: ${isSarvamConfigured}`);
console.log(`[CONFIG] LLM_API_KEY configured: ${isLlmConfigured}`);
if (!isSarvamConfigured) {
  console.warn('[CONFIG WARNING] SARVAM_API_KEY is missing from server/.env. Add your Sarvam API key there and restart the backend.');
}
