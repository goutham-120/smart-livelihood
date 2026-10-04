/**
 * Channel Agnostic Conversation Engine State Machine
 * Manages 11 stage empathetic skilling dialogue across Web, Kiosk, WhatsApp, and IVR.
 * Supports officer assisted mode (forUserId), dialect hints, timeout guards, and corrections.
 */

import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Occupation } from '../models/Occupation.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { processDialogueWithLLM } from './llm.js';
import { STAGE_PROMPTS, SUPPORTED_LANGUAGES, detectLanguageFromText, normalizeLanguageCode } from '../channels/languages.js';

export const CONVERSATION_STAGES = [
  'greeting_consent',
  'family_occupation',
  'current_livelihood',
  'education',
  'skills',
  'interests',
  'mobility_constraints',
  'employment_preference',
  'location',
  'income_goal',
  'confirmation'
];

// In memory active conversation session cache with 1 hour TTL
const activeSessions = new Map();

/**
 * Get or create an active conversation session.
 */
export const getOrCreateSession = (sessionKey, initialData = {}) => {
  const existing = activeSessions.get(sessionKey);
  if (existing) {
    return existing;
  }

  const session = {
    key: sessionKey,
    startTime: Date.now(),
    lastActiveAt: Date.now(),
    currentStageIndex: 0,
    channel: initialData.channel || 'web',
    userId: initialData.userId || null,
    forUserId: initialData.forUserId || null,
    language: initialData.language || 'te',
    dialect: initialData.dialect || '',
    history: [],
    collectedData: {
      consentGiven: false,
      familyOccupation: '',
      currentLivelihood: '',
      education: '',
      skills: [],
      interests: [],
      mobilityConstraints: [],
      employmentPreference: 'either',
      district: initialData.district || 'Warangal',
      block: '',
      village: '',
      incomeGoal: 15000,
      experienceYears: 0
    },
    lastQuestionText: '',
    isComplete: false
  };

  activeSessions.set(sessionKey, session);
  return session;
};

/**
 * Remove session from memory.
 */
export const clearSession = (sessionKey) => {
  activeSessions.delete(sessionKey);
};

/**
 * Calculate dropout and livelihood vulnerability risk score.
 */
const computeRiskScore = (profileData) => {
  let score = 0;
  const reasons = [];

  if (profileData.mobilityConstraints && profileData.mobilityConstraints.length > 0) {
    score += 25;
    reasons.push('Restricted geographical mobility');
  }
  if (!profileData.education || profileData.education === 'None' || profileData.education === 'Primary School') {
    score += 20;
    reasons.push('Low formal literacy');
  }
  if (!profileData.skills || profileData.skills.length === 0) {
    score += 25;
    reasons.push('No verified trade skill');
  }
  if (profileData.weeklyHours && profileData.weeklyHours < 20) {
    score += 15;
    reasons.push('Limited weekly availability');
  }
  if (!profileData.currentLivelihood || profileData.currentLivelihood === 'Unemployed') {
    score += 15;
    reasons.push('Irregular current income');
  }

  return {
    riskScore: Math.min(score, 100),
    riskReasons: reasons
  };
};

/**
 * Fetch top matching NSQF opportunities for the final confirmation stage.
 */
const fetchTopOpportunities = async (district, userSkills = [], preference = 'either', collectedData = {}) => {
  try {
    const occupations = await Occupation.find();
    const demands = await RegionDemand.find({ district: new RegExp(`^${district}$`, 'i') });
    const demandMap = new Map();
    demands.forEach((d) => demandMap.set(d.occupationKey, d));

    const skillList = userSkills || [];
    const skillKeys = new Set(skillList.map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, '_').trim()));
    const skillWords = skillList.map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, ' ').trim());

    const backgroundText = [
      collectedData.familyOccupation || '',
      collectedData.currentLivelihood || '',
      ...skillWords
    ].join(' ').toLowerCase();

    const scored = occupations.map((occ) => {
      const demand = demandMap.get(occ.key) || { demandLevel: 3, openings: 15, avgIncome: 15000 };
      let skillMatch = 0;
      let matchedCount = 0;

      if (occ.requiredSkills && occ.requiredSkills.length > 0) {
        occ.requiredSkills.forEach((rs) => {
          const rNorm = rs.toLowerCase().replace(/[\s\-_]+/g, '_').trim();
          const rWord = rs.toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
          if (
            skillKeys.has(rNorm) ||
            skillWords.some((w) => w === rWord || w.includes(rWord) || rWord.includes(w))
          ) {
            matchedCount++;
          }
        });
        skillMatch = Math.round((matchedCount / occ.requiredSkills.length) * 100);
      }

      // Domain background synergy
      let domainSynergy = 0;
      if (occ.sector === 'Agriculture' && (backgroundText.includes('farm') || backgroundText.includes('tractor') || backgroundText.includes('agri') || backgroundText.includes('machinery'))) {
        domainSynergy = 100;
      } else if (occ.sector === 'Apparel & Handloom' && (backgroundText.includes('tailor') || backgroundText.includes('sew') || backgroundText.includes('garment') || backgroundText.includes('cloth'))) {
        domainSynergy = 100;
      } else if (occ.sector === 'Food Processing' && (backgroundText.includes('food') || backgroundText.includes('spice') || backgroundText.includes('pickle') || backgroundText.includes('baking'))) {
        domainSynergy = 100;
      } else if (occ.sector === 'Electronics & Hardware' && (backgroundText.includes('electric') || backgroundText.includes('appliance') || backgroundText.includes('mobile') || backgroundText.includes('solar'))) {
        domainSynergy = 100;
      } else if (occ.sector === 'Construction' && (backgroundText.includes('mason') || backgroundText.includes('weld') || backgroundText.includes('plumb'))) {
        domainSynergy = 100;
      }

      const demandScore = demand.demandLevel * 20;
      let prefScore = 70;
      if (preference === 'self' && occ.selfEmploymentViable) prefScore = 100;
      if (preference === 'wage' && !occ.travelRequired) prefScore = 90;

      let totalScore;
      if (skillList.length > 0) {
        if (skillMatch > 0) {
          totalScore = Math.round(skillMatch * 0.60 + domainSynergy * 0.20 + demandScore * 0.10 + prefScore * 0.10);
        } else if (domainSynergy >= 50) {
          totalScore = Math.round(25 + domainSynergy * 0.18 + demandScore * 0.10);
        } else {
          totalScore = Math.min(22, Math.round(demandScore * 0.10 + prefScore * 0.08));
        }
      } else {
        totalScore = Math.round((domainSynergy > 0 ? 35 : 15) + demandScore * 0.45 + prefScore * 0.40);
      }

      const track = occ.selfEmploymentViable && (preference === 'self' || preference === 'either') ? 'self' : 'wage';

      return {
        id: occ._id,
        occupationKey: occ.key,
        title: occ.title,
        titles: occ.titles,
        sector: occ.sector,
        nsqfLevel: occ.nsqfLevel,
        matchScore: Math.max(5, Math.min(100, totalScore)),
        matchedCount,
        track,
        demand: { level: demand.demandLevel, openings: demand.openings, avgIncome: demand.avgIncome }
      };
    });

    scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (b.matchedCount || 0) - (a.matchedCount || 0);
    });
    return scored.slice(0, 3);
  } catch (err) {
    return [];
  }
};

/**
 * Generate a spoken summary of the collected beneficiary profile for final confirmation.
 */
const generateReadbackSummary = (data, language = 'en') => {
  const skillsDisplay = (data.skills || []).map((s) => s.replace(/_/g, ' ')).join(', ') || 'General Work Experience';
  const trackDisplay = data.employmentPreference === 'self'
    ? 'Micro Enterprise and Self Employment'
    : data.employmentPreference === 'wage'
      ? 'Wage Employment Job'
      : 'Open to both Self Employment and Jobs';

  if (language === 'te') {
    return `ధన్యవాదాలు. మీరు చెప్పిన వివరాలు నమోదు చేశాను. మీ జిల్లా ${data.district}. మీ నైపుణ్యాలు ${skillsDisplay}. మీ కోరిక ${trackDisplay}. ఆశించిన ఆదాయం నెలకు ₹${data.incomeGoal?.toLocaleString() || '15000'}. ఇవన్నీ సరైనవే అయితే అవును అని చెప్పండి.`;
  }
  if (language === 'hi') {
    return `धन्यवाद. मैंने आपका विवरण दर्ज कर लिया है. आपका जिला ${data.district} है. आपका हुनर ${skillsDisplay} है. आपकी पसंद ${trackDisplay} है. लक्षित आमदनी ₹${data.incomeGoal?.toLocaleString() || '15000'} प्रति माह है. यदि यह सही है तो कृपया हाँ कहें.`;
  }
  return `Thank you. I have recorded your details. Your district is ${data.district}. Identified competencies are ${skillsDisplay}. Your preference is ${trackDisplay}. Target monthly income is ₹${data.incomeGoal?.toLocaleString() || '15000'}. If this is accurate please say yes to confirm.`;
};

/**
 * Channel Agnostic Conversation Engine
 * Processes a single dialogue turn and returns state machine progress.
 */
export const processConversationTurn = async ({
  text,
  lang = null,
  dialect = '',
  channel = 'web',
  userId = null,
  forUserId = null,
  sessionKey = null
}) => {
  // Determine language for this turn dynamically: NEVER lock or default to Telugu
  let activeLang = lang;
  if (!activeLang || activeLang === 'auto') {
    const detected = detectLanguageFromText(text);
    activeLang = detected.language;
  }
  const normLang = normalizeLanguageCode(activeLang);

  const effectiveSessionKey = sessionKey || (forUserId ? `officer_${forUserId}` : userId ? `user_${userId}` : `channel_${channel}_${Date.now()}`);
  const session = getOrCreateSession(effectiveSessionKey, { channel, userId, forUserId, language: normLang, dialect });

  session.language = normLang;
  session.dialect = dialect || session.dialect;
  session.lastActiveAt = Date.now();

  // Load existing profile if available and initialize prefilled fields
  const targetUserId = forUserId || userId;
  if (targetUserId && !session.profileLoaded) {
    try {
      const existingProfile = await Profile.findOne({ user: targetUserId });
      if (existingProfile) {
        session.collectedData.district = existingProfile.district || session.collectedData.district;
        session.collectedData.education = existingProfile.education || session.collectedData.education;
        session.collectedData.skills = existingProfile.skills || [];
        session.collectedData.familyOccupation = existingProfile.familyOccupation || '';
        session.collectedData.currentLivelihood = existingProfile.currentLivelihood || '';
        session.collectedData.employmentPreference = existingProfile.employmentPreference || 'either';
        session.collectedData.mobilityConstraints = existingProfile.mobilityConstraints || [];
        session.collectedData.incomeGoal = existingProfile.incomeGoal || 15000;
      }
      session.profileLoaded = true;
    } catch (err) {
      // Non fatal
    }
  }

  // 1. Timeout Check: Max 5 minutes (300,000 ms)
  const elapsedMs = Date.now() - session.startTime;
  const isTimeExceeded = elapsedMs > 300000;
  if (isTimeExceeded && session.currentStageIndex < CONVERSATION_STAGES.length - 1) {
    session.currentStageIndex = CONVERSATION_STAGES.length - 1; // Jump to confirmation
  }

  let currentStageName = CONVERSATION_STAGES[session.currentStageIndex];

  // 2. Call LLM for extraction, intent analysis, and response generation
  const llmResult = await processDialogueWithLLM({
    userMessage: text,
    stage: currentStageName,
    language: session.language,
    dialect: session.dialect,
    userContext: {
      district: session.collectedData.district,
      skills: session.collectedData.skills,
      employmentPreference: session.collectedData.employmentPreference,
      familyOccupation: session.collectedData.familyOccupation,
      currentLivelihood: session.collectedData.currentLivelihood,
      education: session.collectedData.education
    }
  });

  const intent = llmResult.intent;

  // 3. Handle Special User Intents

  // A. Repeat on request
  if (intent === 'repeat') {
    const repeatPrefix = session.language === 'te'
      ? 'మరొకసారి వినండి. '
      : session.language === 'hi'
        ? 'मैं दोबारा दोहराता हूँ. '
        : 'Let me repeat the question. ';
    return {
      replyText: `${repeatPrefix}${session.lastQuestionText || STAGE_PROMPTS[currentStageName][session.language] || STAGE_PROMPTS[currentStageName].en}`,
      stage: currentStageName,
      isComplete: false,
      extractedSkills: session.collectedData.skills,
      updatedProfile: session.collectedData,
      followUpQuestion: session.lastQuestionText
    };
  }

  // B. Handle Corrections (e.g. "actually 3 years", "no I want wage job")
  if (intent === 'correct' && llmResult.correctedField) {
    session.collectedData[llmResult.correctedField] = llmResult.correctedValue;
    const ackCorrection = session.language === 'te'
      ? `సరే, వివరాలు మార్చాను. `
      : session.language === 'hi'
        ? `ठीक है, मैंने बदलाव दर्ज कर लिया है. `
        : `Understood, updated your response. `;

    return {
      replyText: `${ackCorrection}${STAGE_PROMPTS[currentStageName][session.language] || STAGE_PROMPTS[currentStageName].en}`,
      stage: currentStageName,
      isComplete: false,
      extractedSkills: session.collectedData.skills,
      updatedProfile: session.collectedData
    };
  }

  // 4. Merge Extracted Data into Session State
  if (llmResult.extractedSkills && llmResult.extractedSkills.length > 0) {
    const currentSet = new Set(session.collectedData.skills);
    llmResult.extractedSkills.forEach((s) => currentSet.add(s));
    session.collectedData.skills = Array.from(currentSet);
  }

  if (llmResult.identifiedPreference) {
    session.collectedData.employmentPreference = llmResult.identifiedPreference;
  }

  const pFields = llmResult.profileFields || {};
  if (pFields.familyOccupation) session.collectedData.familyOccupation = pFields.familyOccupation;
  if (pFields.currentLivelihood) session.collectedData.currentLivelihood = pFields.currentLivelihood;
  if (pFields.education) session.collectedData.education = pFields.education;
  if (pFields.district) session.collectedData.district = pFields.district;
  if (pFields.block) session.collectedData.block = pFields.block;
  if (pFields.village) session.collectedData.village = pFields.village;
  if (pFields.incomeGoal) session.collectedData.incomeGoal = pFields.incomeGoal;
  if (pFields.experienceYears) session.collectedData.experienceYears = pFields.experienceYears;
  if (Array.isArray(pFields.mobilityConstraints) && pFields.mobilityConstraints.length > 0) {
    session.collectedData.mobilityConstraints = pFields.mobilityConstraints;
  }

  // 5. Stage Specific State Machine Transitions
  if (currentStageName === 'greeting_consent') {
    if (intent === 'deny') {
      const declineMsg = session.language === 'te'
        ? 'పర్వాలేదు. మీకు సహాయం కావాలనుకున్నప్పుడు మళ్లీ మాట్లాడవచ్చు. ధన్యవాదాలు.'
        : session.language === 'hi'
          ? 'कोई बात नहीं. जब भी आप चाहें, हम आपकी सहायता के लिए उपलब्ध हैं. धन्यवाद.'
          : 'Understood. Whenever you are ready, we are here to support your skilling journey. Thank you.';
      return {
        replyText: declineMsg,
        stage: 'greeting_consent',
        isComplete: false,
        extractedSkills: session.collectedData.skills,
        updatedProfile: session.collectedData,
        sessionEnded: true
      };
    }
    session.collectedData.consentGiven = true;
    session.currentStageIndex++;
  } else if (currentStageName === 'confirmation') {
    if (intent === 'confirm' || text.toLowerCase().includes('yes') || text.toLowerCase().includes('haan') || text.toLowerCase().includes('avunu')) {
      session.isComplete = true;

      // Save to database if user is known
      let savedRisk = { riskScore: 20, riskReasons: [] };
      if (targetUserId) {
        try {
          savedRisk = computeRiskScore(session.collectedData);
          await Profile.findOneAndUpdate(
            { user: targetUserId },
            {
              $set: {
                district: session.collectedData.district,
                block: session.collectedData.block,
                village: session.collectedData.village,
                familyOccupation: session.collectedData.familyOccupation,
                currentLivelihood: session.collectedData.currentLivelihood,
                education: session.collectedData.education || 'Middle School',
                skills: session.collectedData.skills,
                employmentPreference: session.collectedData.employmentPreference,
                mobilityConstraints: session.collectedData.mobilityConstraints,
                incomeGoal: session.collectedData.incomeGoal,
                language: session.language,
                dialect: session.dialect,
                channel,
                riskScore: savedRisk.riskScore,
                riskReasons: savedRisk.riskReasons
              }
            },
            { upsert: true, new: true }
          );

          await User.findByIdAndUpdate(targetUserId, {
            $set: {
              consent: {
                given: true,
                at: new Date(),
                version: '1.0',
                language: session.language
              }
            }
          });
        } catch (err) {
          // Continue to display opportunities
        }
      }

      const topOpportunities = await fetchTopOpportunities(
        session.collectedData.district,
        session.collectedData.skills,
        session.collectedData.employmentPreference,
        session.collectedData
      );

      const completionCelebration = session.language === 'te'
        ? `అద్భుతం! మీ వివరాలన్నీ విజయవంతంగా నిర్ధారించబడ్డాయి. మీ జిల్లా డిమాండ్‌కు అనుగుణంగా అగ్రశ్రేణి ఉపాధి మరియు శిక్షణా మార్గాలు సిద్ధంగా ఉన్నాయి. క్రింద చూడండి.`
        : session.language === 'hi'
          ? `शानदार! आपकी प्रोफ़ाइल सफलतापूर्वक पुष्ट हो गई है. आपके जिले की मांग के अनुसार उपयुक्त अवसर तैयार हैं. नीचे देखें.`
          : `Wonderful! Your profile has been confirmed. NSQF aligned livelihood opportunities matched with your local district demand are ready. See below.`;

      return {
        replyText: completionCelebration,
        stage: 'completed',
        isComplete: true,
        extractedSkills: session.collectedData.skills,
        updatedProfile: {
          ...session.collectedData,
          riskScore: savedRisk.riskScore,
          riskReasons: savedRisk.riskReasons
        },
        matchedOpportunities: topOpportunities
      };
    }
  } else {
    // Advance to next stage
    session.currentStageIndex++;
  }

  // 6. Skip Answered Stages Optimization
  while (session.currentStageIndex < CONVERSATION_STAGES.length - 1) {
    const nextStageName = CONVERSATION_STAGES[session.currentStageIndex];
    let isAlreadyAnswered = false;

    if (nextStageName === 'family_occupation' && session.collectedData.familyOccupation) isAlreadyAnswered = true;
    if (nextStageName === 'current_livelihood' && session.collectedData.currentLivelihood) isAlreadyAnswered = true;
    if (nextStageName === 'education' && session.collectedData.education) isAlreadyAnswered = true;
    if (nextStageName === 'skills' && session.collectedData.skills.length >= 2) isAlreadyAnswered = true;
    if (nextStageName === 'employment_preference' && session.collectedData.employmentPreference !== 'either') isAlreadyAnswered = true;
    if (nextStageName === 'income_goal' && session.collectedData.incomeGoal > 15000) isAlreadyAnswered = true;

    if (isAlreadyAnswered) {
      session.currentStageIndex++;
    } else {
      break;
    }
  }

  currentStageName = CONVERSATION_STAGES[session.currentStageIndex];

  // 7. Formulate Spoken Output for the next stage
  let nextSpokenText = '';
  if (currentStageName === 'confirmation') {
    nextSpokenText = generateReadbackSummary(session.collectedData, session.language);
  } else {
    const stagePromptObj = STAGE_PROMPTS[currentStageName] || STAGE_PROMPTS.greeting_consent;
    const stageDefault = stagePromptObj[session.language] || stagePromptObj.en;
    nextSpokenText = llmResult.replyText && llmResult.source === 'gemini'
      ? llmResult.replyText
      : stageDefault;
  }

  session.lastQuestionText = nextSpokenText;

  // Compute live risk score
  const liveRisk = computeRiskScore(session.collectedData);

  return {
    replyText: nextSpokenText,
    stage: currentStageName,
    isComplete: false,
    extractedSkills: session.collectedData.skills,
    followUpQuestion: nextSpokenText,
    updatedProfile: {
      ...session.collectedData,
      riskScore: liveRisk.riskScore,
      riskReasons: liveRisk.riskReasons
    }
  };
};
