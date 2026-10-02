import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateDropoutRisk } from '../src/services/dropout.js';

test('Dropout Risk Scoring: low distance and aligned language returns low risk', () => {
  const result = calculateDropoutRisk({
    distanceKm: 5,
    preferredTrack: 'wage',
    courseTrack: 'wage',
    userEducation: 'High School',
    minEducation: 'High School',
    userLanguage: 'te',
    courseLanguage: 'te',
    incomeGoal: 10000,
    hasPriorDropout: false
  });

  assert.equal(result.riskLevel, 'low');
  assert.ok(result.riskScore < 30);
  assert.equal(result.isSynthetic, true);
});

test('Dropout Risk Scoring: long distance, language mismatch, and prior dropout produces high risk', () => {
  const result = calculateDropoutRisk({
    distanceKm: 25,
    preferredTrack: 'self',
    courseTrack: 'wage',
    userEducation: 'Primary School',
    minEducation: 'High School',
    userLanguage: 'te',
    courseLanguage: 'en',
    incomeGoal: 25000,
    hasPriorDropout: true
  });

  assert.equal(result.riskLevel, 'high');
  assert.ok(result.riskScore >= 60);
  assert.ok(result.riskReasons.length >= 3);
});

test('Roadmap Prerequisite Ordering: missing skills ordered correctly', async () => {
  const skillPrereqMap = new Map([
    ['garment_pattern_cutting', ['sewing_machine_operation']],
    ['sewing_machine_operation', []]
  ]);

  const missing = ['garment_pattern_cutting', 'sewing_machine_operation'];

  const orderedMissing = [...missing].sort((a, b) => {
    const aPrereqs = skillPrereqMap.get(a.toLowerCase()) || [];
    const bPrereqs = skillPrereqMap.get(b.toLowerCase()) || [];
    if (aPrereqs.includes(b.toLowerCase())) return 1;
    if (bPrereqs.includes(a.toLowerCase())) return -1;
    return 0;
  });

  assert.equal(orderedMissing[0], 'sewing_machine_operation');
  assert.equal(orderedMissing[1], 'garment_pattern_cutting');
});
