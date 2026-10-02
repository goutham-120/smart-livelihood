import { Profile } from '../models/Profile.js';

export const DROPOUT_WEIGHTS = {
  distanceToCenter: 0.20,
  interestMismatch: 0.20,
  educationGap: 0.15,
  languageMismatch: 0.15,
  incomePressure: 0.15,
  priorDropout: 0.15
};

export const calculateDropoutRisk = (candidateData = {}) => {
  const {
    distanceKm = 15,
    preferredTrack = 'either',
    courseTrack = 'wage',
    userEducation = 'Middle School',
    minEducation = 'High School',
    userLanguage = 'te',
    courseLanguage = 'en',
    incomeGoal = 15000,
    hasPriorDropout = false
  } = candidateData;

  const reasons = [];
  let scoreAccumulator = 0;

  const distanceFactor = Math.min(1, distanceKm / 30);
  if (distanceKm > 20) {
    reasons.push(`Long travel distance to center (${distanceKm} km)`);
  }
  scoreAccumulator += distanceFactor * DROPOUT_WEIGHTS.distanceToCenter;

  const mismatch = preferredTrack !== 'either' && preferredTrack !== courseTrack;
  if (mismatch) {
    reasons.push(`Mismatch between pathway preference (${preferredTrack}) and course track (${courseTrack})`);
  }
  scoreAccumulator += (mismatch ? 1 : 0) * DROPOUT_WEIGHTS.interestMismatch;

  const lowEdu = (userEducation === 'Primary School' || userEducation === 'None') && minEducation === 'High School';
  if (lowEdu) {
    reasons.push(`Education prerequisite gap (${userEducation} vs required ${minEducation})`);
  }
  scoreAccumulator += (lowEdu ? 1 : 0) * DROPOUT_WEIGHTS.educationGap;

  const langDiff = userLanguage.toLowerCase() !== courseLanguage.toLowerCase();
  if (langDiff) {
    reasons.push(`Medium of instruction mismatch (User: ${userLanguage}, Course: ${courseLanguage})`);
  }
  scoreAccumulator += (langDiff ? 1 : 0) * DROPOUT_WEIGHTS.languageMismatch;

  const highIncomePressure = incomeGoal >= 20000;
  if (highIncomePressure) {
    reasons.push('High immediate financial income requirement');
  }
  scoreAccumulator += (highIncomePressure ? 1 : 0) * DROPOUT_WEIGHTS.incomePressure;

  if (hasPriorDropout) {
    reasons.push('Recorded prior course non completion');
  }
  scoreAccumulator += (hasPriorDropout ? 1 : 0) * DROPOUT_WEIGHTS.priorDropout;

  const logit = scoreAccumulator * 8 - 2.5;
  const riskScore = Math.min(100, Math.max(0, Math.round(100 / (1 + Math.exp(-logit)))));

  let suggestedIntervention = 'Routine tracking by district officer';
  if (riskScore >= 60) {
    if (distanceKm > 20) suggestedIntervention = 'Provide transport stipend or enroll in nearby mobile training center';
    else if (langDiff) suggestedIntervention = 'Assign vernacular Telugu audio mentor and translation notes';
    else if (highIncomePressure) suggestedIntervention = 'Link with daily stipend scheme under PM-AJAY GIA';
    else suggestedIntervention = 'Schedule 1-on-1 counselor intervention with district officer';
  } else if (riskScore >= 30) {
    suggestedIntervention = 'Weekly progress check-in via automated WhatsApp reminder';
  }

  return {
    riskScore,
    riskLevel: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
    riskReasons: reasons,
    suggestedIntervention,
    isSynthetic: true,
    modelNote: 'Transparent logistic scoring calibrated on synthetic district data'
  };
};

export const updateProfileDropoutRisk = async (userId, candidateData = {}) => {
  const riskResult = calculateDropoutRisk(candidateData);
  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        riskScore: riskResult.riskScore,
        riskReasons: riskResult.riskReasons
      }
    },
    { new: true }
  );
  return { profile, riskResult };
};
