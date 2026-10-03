/**
 * Embeddings Service with In Memory Caching
 * Provides text embedding and cosine similarity calculations.
 * Used for semantic skill normalization and exported for downstream services.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const embeddingCache = new Map();
let geminiInstance = null;

const getEmbeddingModel = () => {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;
  if (!geminiInstance) {
    geminiInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiInstance.getGenerativeModel({ model: 'text-embedding-004' });
};

/**
 * Deterministic semantic vector fallback generator.
 * Produces a normalized 64 dimensional vector based on character n-grams and token weights.
 * Used when external API is unreachable or rate limited.
 */
const generateDeterministicVector = (text) => {
  const dim = 64;
  const vector = new Array(dim).fill(0);
  const normalized = String(text || '').toLowerCase().trim();
  if (!normalized) return vector;

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const pos = (code + i * 7) % dim;
    vector[pos] += 1;
  }

  for (let i = 0; i < normalized.length - 2; i++) {
    const trigramCode = normalized.charCodeAt(i) * 31 + normalized.charCodeAt(i + 1) * 17 + normalized.charCodeAt(i + 2);
    const pos = Math.abs(trigramCode) % dim;
    vector[pos] += 1.5;
  }

  // Normalize magnitude to 1
  let sumSq = 0;
  for (let j = 0; j < dim; j++) {
    sumSq += vector[j] * vector[j];
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  for (let j = 0; j < dim; j++) {
    vector[j] = vector[j] / magnitude;
  }

  return vector;
};

/**
 * Generate vector embedding for a given text snippet.
 * Checks in memory cache first before invoking API.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export const embed = async (text) => {
  const cleaned = String(text || '').trim().toLowerCase();
  if (!cleaned) {
    return new Array(64).fill(0);
  }

  if (embeddingCache.has(cleaned)) {
    return embeddingCache.get(cleaned);
  }

  try {
    const model = getEmbeddingModel();
    if (model) {
      const res = await model.embedContent(cleaned);
      if (res && res.embedding && res.embedding.values) {
        const values = res.embedding.values;
        embeddingCache.set(cleaned, values);
        return values;
      }
    }
  } catch (err) {
    // Fall through to deterministic vector fallback
  }

  const fallbackVector = generateDeterministicVector(cleaned);
  embeddingCache.set(cleaned, fallbackVector);
  return fallbackVector;
};

/**
 * Calculate cosine similarity between two numerical vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} Value between 0 and 1
 */
export const cosine = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }

  const len = Math.min(a.length, b.length);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) return 0;

  const sim = dotProduct / denominator;
  return Math.max(0, Math.min(1, sim));
};

/**
 * Clear or prune embedding cache when required.
 */
export const clearEmbeddingCache = () => {
  embeddingCache.clear();
};

/**
 * Calculate semantic similarity between two text strings.
 * @param {string} textA
 * @param {string} textB
 * @returns {Promise<number>} Value between 0 and 1
 */
export const getEmbeddingSimilarity = async (textA, textB) => {
  if (!textA || !textB) return 0;
  const a = String(textA).toLowerCase().replace(/_/g, ' ').trim();
  const b = String(textB).toLowerCase().replace(/_/g, ' ').trim();
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.85;

  try {
    const [vecA, vecB] = await Promise.all([embed(a), embed(b)]);
    return cosine(vecA, vecB);
  } catch (err) {
    return 0;
  }
};
