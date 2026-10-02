/**
 * Automated Evaluation Script for 50 Multilingual Utterances
 * Measures extraction precision, recall, and overall accuracy across Telugu, Hindi, and English.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { BENCHMARK_UTTERANCES } from './utteranceDataset.js';
import { extractSkillsFromText, extractProfileAttributes } from '../services/extract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const runBenchmark = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/livelihood';
  await mongoose.connect(mongoUri);

  console.log('\n=============================================================');
  console.log('STARTING BENCHMARK: 50 MULTILINGUAL UTTERANCES ACCURACY TEST');
  console.log('Language Coverage: Telugu (Telangana/Rayalaseema), Hindi (Standard/Bhojpuri), English/Hinglish');
  console.log('=============================================================\n');

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalCases = BENCHMARK_UTTERANCES.length;
  let correctPreferenceCount = 0;
  let preferenceTestCases = 0;

  for (const item of BENCHMARK_UTTERANCES) {
    const extractedSkills = await extractSkillsFromText(item.text);
    const attributes = extractProfileAttributes(item.text);

    const expectedSet = new Set(item.expectedSkills);
    const extractedSet = new Set(extractedSkills);

    // Evaluate skill extraction
    for (const exp of expectedSet) {
      if (extractedSet.has(exp)) {
        truePositives++;
      } else {
        falseNegatives++;
      }
    }

    for (const ext of extractedSet) {
      if (!expectedSet.has(ext)) {
        falsePositives++;
      }
    }

    // Evaluate preference extraction if present
    if (item.expectedPreference) {
      preferenceTestCases++;
      if (attributes.employmentPreference === item.expectedPreference) {
        correctPreferenceCount++;
      }
    }
  }

  const precision = truePositives + falsePositives > 0 ? (truePositives / (truePositives + falsePositives)) * 100 : 100;
  const recall = truePositives + falseNegatives > 0 ? (truePositives / (truePositives + falseNegatives)) * 100 : 100;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 100;
  const preferenceAccuracy = preferenceTestCases > 0 ? (correctPreferenceCount / preferenceTestCases) * 100 : 100;

  console.log('--- BENCHMARK RESULTS ---');
  console.log(`Total Utterances Evaluated: ${totalCases}`);
  console.log(`True Positives: ${truePositives}`);
  console.log(`False Positives: ${falsePositives}`);
  console.log(`False Negatives: ${falseNegatives}`);
  console.log(`Skill Extraction Precision: ${precision.toFixed(1)}%`);
  console.log(`Skill Extraction Recall: ${recall.toFixed(1)}%`);
  console.log(`Skill Extraction F1 Score: ${f1Score.toFixed(1)}%`);
  console.log(`Preference Extraction Accuracy: ${preferenceAccuracy.toFixed(1)}% (${correctPreferenceCount}/${preferenceTestCases})`);
  console.log('=============================================================\n');

  await mongoose.disconnect();
  return { precision, recall, f1Score, preferenceAccuracy };
};

if (process.argv[1] && process.argv[1].endsWith('test-accuracy.js')) {
  runBenchmark().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Benchmark execution error:', err);
    process.exit(1);
  });
}

export { runBenchmark };
