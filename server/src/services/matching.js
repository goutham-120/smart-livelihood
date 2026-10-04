import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Skill } from '../models/Skill.js';
import { attachRegionalDataToOpportunity, getRegionalDataForDistrict } from './regional.js';
import { getEmbeddingSimilarity } from './embeddings.js';

// Keyword vocabulary to detect beneficiary background affinity and sector alignment
const SECTOR_KEYWORDS = {
  'Agriculture': [
    'agri', 'farm', 'tractor', 'cultivat', 'crop', 'soil', 'irrigation', 'harvest',
    'compost', 'machinery', 'tiller', 'plow', 'plough', 'rotavator', 'pesticide',
    'polyhouse', 'nursery', 'seed', 'vermicompost', 'equipment'
  ],
  'Dairy & Animal Husbandry': [
    'dairy', 'cattle', 'cow', 'buffalo', 'milk', 'milking', 'goat', 'sheep',
    'poultry', 'livestock', 'animal', 'veterinary', 'insemination', 'feed'
  ],
  'Apparel & Handloom': [
    'tailor', 'sew', 'stitching', 'garment', 'pattern', 'embroidery', 'handloom',
    'textile', 'fabric', 'apparel', 'weaving', 'cloth'
  ],
  'Food Processing': [
    'food', 'pickle', 'chutney', 'baking', 'bakery', 'spice', 'grain', 'milling',
    'jam', 'preservation', 'flour', 'processing'
  ],
  'Electronics & Hardware': [
    'electric', 'electronic', 'appliance', 'wiring', 'motor', 'rewind', 'mobile',
    'smartphone', 'solar', 'pv', 'refrigerat', 'ac', 'cctv'
  ],
  'Construction': [
    'mason', 'brick', 'plumb', 'plumbing', 'sanitary', 'pipe', 'weld', 'welder',
    'welding', 'fabricat', 'carpenter', 'shuttering', 'paint', 'painting', 'tile', 'marble'
  ],
  'Retail & Commerce': [
    'retail', 'sales', 'customer', 'kirana', 'store', 'shop', 'pos', 'billing',
    'inventory', 'distributor', 'vending', 'market', 'ecommerce'
  ],
  'Digital & IT-ITeS': [
    'digital', 'computer', 'data entry', 'typing', 'vle', 'csc', 'crm', 'bpo',
    'voice associate', 'telecaller'
  ],
  'Healthcare Support': [
    'health', 'hospital', 'patient', 'elderly', 'nurse', 'aide', 'gda', 'nutrition',
    'poshan', 'sanitation', 'first aid', 'medical'
  ]
};

/**
 * Computes background synergy between candidate history and target occupation sector.
 */
export const computeDomainSynergy = (occSector, profile = {}, userSkillSectors = new Set(), userSkillWords = []) => {
  const occSec = occSector || '';

  // 1. Direct sector match from user's verified skills
  if (userSkillSectors.has(occSec)) {
    return 100;
  }

  // 2. Text background match from familyOccupation and currentLivelihood
  const backgroundText = [
    profile.familyOccupation || '',
    profile.currentLivelihood || '',
    ...userSkillWords
  ].join(' ').toLowerCase();

  const occKeywords = SECTOR_KEYWORDS[occSec] || [];
  let keywordHits = 0;
  for (const kw of occKeywords) {
    if (backgroundText.includes(kw)) {
      keywordHits++;
    }
  }

  if (keywordHits >= 2) return 95;
  if (keywordHits === 1) return 80;

  // 3. Allied sector transferability
  // Agriculture & Dairy/Animal Husbandry are naturally allied rural trades
  if (occSec === 'Agriculture' && (backgroundText.includes('dairy') || backgroundText.includes('cattle'))) return 50;
  if (occSec === 'Dairy & Animal Husbandry' && (backgroundText.includes('agri') || backgroundText.includes('farm'))) return 50;

  // Farm machinery repair & Mechanical/Electrical trades
  if ((backgroundText.includes('machinery') || backgroundText.includes('tractor')) &&
      (occSec === 'Construction' || occSec === 'Electronics & Hardware')) {
    return 40;
  }

  return 0;
};

export const calculateOpportunityMatchV2 = async (occ, profile = {}, district = 'Warangal', regionalData = null) => {
  const userPref = profile.employmentPreference || 'either';
  const userIncomeGoal = profile.incomeGoal || 15000;
  const userEducation = profile.education || 'Middle School';
  const userMobility = profile.mobilityConstraints || [];

  const rawSkills = Array.isArray(profile.skills)
    ? profile.skills
    : (profile.skills ? String(profile.skills).split(',').map((s) => s.trim()).filter(Boolean) : []);

  const allSkills = await Skill.find();
  const skillMap = new Map();
  allSkills.forEach((sk) => {
    skillMap.set(sk.key.toLowerCase(), sk);
    skillMap.set(sk.name.toLowerCase().replace(/[\s\-_]+/g, '_'), sk);
  });

  // Extract canonical keys, sectors, and token words for user's skills
  const userSkillKeys = new Set();
  const userSkillWords = [];
  const userSkillSectors = new Set();

  rawSkills.forEach((raw) => {
    const rawStr = String(raw || '').trim();
    if (!rawStr) return;
    const normKey = rawStr.toLowerCase().replace(/[\s\-_]+/g, '_').trim();
    const cleanWord = rawStr.toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
    userSkillKeys.add(normKey);
    userSkillWords.push(cleanWord);

    // Look up doc in skillMap
    const skDoc = skillMap.get(normKey) || skillMap.get(cleanWord.replace(/ /g, '_'));
    if (skDoc) {
      userSkillKeys.add(skDoc.key.toLowerCase());
      userSkillWords.push(skDoc.name.toLowerCase().replace(/[\s\-_]+/g, ' ').trim());
      if (skDoc.sector) userSkillSectors.add(skDoc.sector);
      (skDoc.aliases || []).forEach((al) => {
        userSkillWords.push(al.toLowerCase().replace(/[\s\-_]+/g, ' ').trim());
      });
    }
  });

  const reqSkills = occ.requiredSkills || [];
  const matched = [];
  const missing = [];
  let totalSkillCredit = 0;

  if (reqSkills.length > 0) {
    for (const rSkill of reqSkills) {
      const rLower = String(rSkill).toLowerCase();
      const rNormKey = rLower.replace(/[\s\-_]+/g, '_').trim();
      const rWords = rLower.replace(/[\s\-_]+/g, ' ').trim();

      // 1. Direct key match (with underscore/space tolerance)
      if (userSkillKeys.has(rNormKey) || userSkillKeys.has(rLower)) {
        matched.push(rSkill);
        totalSkillCredit += 1.0;
        continue;
      }

      // 2. Match by skill name or alias substring
      const skDoc = skillMap.get(rNormKey) || skillMap.get(rLower);
      let aliasMatched = false;
      if (skDoc) {
        const skNameWords = skDoc.name.toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
        for (const uWord of userSkillWords) {
          if (
            uWord === skNameWords ||
            uWord.includes(rWords) ||
            rWords.includes(uWord) ||
            (uWord.length > 5 && skNameWords.includes(uWord)) ||
            (skNameWords.length > 5 && uWord.includes(skNameWords))
          ) {
            aliasMatched = true;
            break;
          }
          if ((skDoc.aliases || []).some((al) => {
            const alW = al.toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
            return alW === uWord || uWord.includes(alW) || alW.includes(uWord);
          })) {
            aliasMatched = true;
            break;
          }
        }
      }

      if (aliasMatched) {
        matched.push(rSkill);
        totalSkillCredit += 1.0;
        continue;
      }

      // 3. Prerequisite match
      let prereqMatched = false;
      if (skDoc && skDoc.prerequisites && skDoc.prerequisites.length > 0) {
        for (const pre of skDoc.prerequisites) {
          const preNorm = pre.toLowerCase().replace(/[\s\-_]+/g, '_').trim();
          if (userSkillKeys.has(preNorm) || userSkillKeys.has(pre.toLowerCase())) {
            prereqMatched = true;
            break;
          }
        }
      }

      if (prereqMatched) {
        matched.push(`${rSkill} (prerequisite met)`);
        totalSkillCredit += 0.5;
        continue;
      }

      // 4. Semantic embedding similarity
      let bestSim = 0;
      for (const uSk of userSkillWords) {
        const sim = await getEmbeddingSimilarity(uSk, rWords);
        if (sim > bestSim) bestSim = sim;
      }

      if (bestSim >= 0.72) {
        matched.push(`${rSkill} (similar skill)`);
        totalSkillCredit += bestSim;
      } else {
        missing.push(rSkill);
      }
    }
  }

  const rawSkillScore = reqSkills.length > 0
    ? Math.min(100, Math.round((totalSkillCredit / reqSkills.length) * 100))
    : 100;

  const domainSynergyScore = computeDomainSynergy(occ.sector, profile, userSkillSectors, userSkillWords);

  const regData = regionalData || await getRegionalDataForDistrict(district);
  const regionalInfo = attachRegionalDataToOpportunity(occ, district, regData);
  const demand = regionalInfo.demand;
  const demandScore = Math.min(100, (demand?.level || 3) * 20);

  let preferenceScore = 70;
  if (userPref === 'self' && occ.selfEmploymentViable) preferenceScore = 100;
  else if (userPref === 'wage' && !occ.selfEmploymentViable) preferenceScore = 100;
  else if (userPref === 'either' || userPref === 'both') preferenceScore = 90;

  let incomeGoalScore = 60;
  if (occ.incomeMax >= userIncomeGoal) incomeGoalScore = 100;

  let mobilityScore = 100;
  if (occ.travelRequired && userMobility.length > 0) mobilityScore = 50;

  let educationScore = 100;
  if (occ.minEducation === 'High School' && (userEducation === 'Primary School' || userEducation === 'None')) {
    educationScore = 50;
  }

  const suitabilityScore = Math.round(
    demandScore * 0.35 +
    preferenceScore * 0.25 +
    incomeGoalScore * 0.20 +
    ((mobilityScore + educationScore) / 2) * 0.20
  );

  const hasUserSkills = rawSkills.length > 0;
  let matchScore;

  if (hasUserSkills) {
    if (rawSkillScore > 0) {
      // User has direct/prerequisite skill match
      const competence = Math.round(rawSkillScore * 0.75 + domainSynergyScore * 0.25);
      matchScore = Math.round(competence * 0.65 + suitabilityScore * 0.35);
    } else if (domainSynergyScore >= 50) {
      // Related domain/sector background (e.g. Agriculture domain for farm machinery worker), but new trade
      matchScore = Math.round(20 + (domainSynergyScore * 0.18) + (suitabilityScore * 0.18));
    } else {
      // Completely unrelated sector AND 0 skill match (e.g. Tailor for Tractor Mechanic)
      // Strictly suppress to 15-22% so it never appears in top recommendations
      matchScore = Math.min(22, Math.max(12, Math.round(10 + (demandScore * 0.06) + (preferenceScore * 0.05))));
    }
  } else {
    // Beneficiary hasn't recorded trade skills yet: rely on domain background + suitability
    const baselineComp = domainSynergyScore > 0 ? domainSynergyScore * 0.7 : 40;
    matchScore = Math.round(baselineComp * 0.40 + suitabilityScore * 0.60);
  }

  matchScore = Math.max(5, Math.min(100, matchScore));

  const track = occ.selfEmploymentViable && (userPref === 'self' || userPref === 'either' || userPref === 'both')
    ? 'self'
    : 'wage';

  const breakdown = [
    {
      factor: 'Skill Alignment',
      score: rawSkillScore,
      weight: '45%',
      note: rawSkillScore > 0
        ? `${rawSkillScore}% alignment with your verified competencies (${matched.join(', ')})`
        : hasUserSkills
          ? 'Requires enrolling in foundational NSQF skilling modules for this trade'
          : 'Complete voice assessment to map your trade competencies'
    },
    {
      factor: 'Domain & Experience Fit',
      score: domainSynergyScore,
      weight: '20%',
      note: domainSynergyScore >= 70
        ? `Strong alignment with your ${profile.currentLivelihood || profile.familyOccupation || occ.sector} background`
        : domainSynergyScore >= 30
          ? `Transferable technical and practical experience`
          : `Different sector from your current background (${occ.sector})`
    },
    {
      factor: 'Local Market Demand',
      score: demandScore,
      weight: '15%',
      note: `Level ${demand.level}/5 verified employment and enterprise demand in ${district}`
    },
    {
      factor: 'Pathway Preference',
      score: preferenceScore,
      weight: '10%',
      note: `Matches your preference for ${track === 'self' ? 'self employment & micro enterprise' : 'wage placement'}`
    },
    {
      factor: 'Income & Viability',
      score: Math.round((incomeGoalScore + ((mobilityScore + educationScore) / 2)) / 2),
      weight: '10%',
      note: `Earning potential ₹${occ.incomeMax.toLocaleString()}/mo vs ₹${userIncomeGoal.toLocaleString()} goal`
    }
  ];

  const notes = `${occ.title} is a ${track === 'self' ? 'self employment' : 'wage placement'} opportunity with ${matchScore}% overall fit score in ${district}.`;

  return {
    occupationKey: occ.key,
    occupation: occ,
    matchScore,
    matchPct: matchScore,
    matched,
    missing,
    breakdown,
    demand,
    nsqfLevel: occ.nsqfLevel,
    track,
    notes,
    centers: regionalInfo.centers,
    schemes: regionalInfo.schemes
  };
};

export const computeSkillGapsAndRoadmap = async (occupationKey, userSkills = [], district = 'Warangal') => {
  const occ = await Occupation.findOne({ key: occupationKey.toLowerCase() });
  if (!occ) return null;

  const normUserSkill = (s) => String(s || '').toLowerCase().replace(/[\s\-_]+/g, '_').trim();
  const normUserWords = (s) => String(s || '').toLowerCase().replace(/[\s\-_]+/g, ' ').trim();

  const userSkillKeys = new Set(userSkills.map(normUserSkill));
  const userSkillWords = userSkills.map(normUserWords);

  const required = occ.requiredSkills || [];

  const acquired = [];
  const missing = [];

  required.forEach((rs) => {
    const rNorm = normUserSkill(rs);
    const rWord = normUserWords(rs);
    if (userSkillKeys.has(rNorm) || userSkillWords.some((w) => w === rWord || w.includes(rWord) || rWord.includes(w))) {
      acquired.push(rs);
    } else {
      missing.push(rs);
    }
  });

  const allSkills = await Skill.find({ key: { $in: required.map((s) => s.toLowerCase()) } });
  const skillPrereqMap = new Map();
  allSkills.forEach((s) => skillPrereqMap.set(s.key.toLowerCase(), s.prerequisites || []));

  const orderedMissing = [...missing].sort((a, b) => {
    const aPrereqs = skillPrereqMap.get(a.toLowerCase()) || [];
    const bPrereqs = skillPrereqMap.get(b.toLowerCase()) || [];
    if (aPrereqs.includes(b.toLowerCase())) return 1;
    if (bPrereqs.includes(a.toLowerCase())) return -1;
    return 0;
  });

  const courses = await Course.find({
    skillsGained: { $in: missing.length > 0 ? missing : required }
  });

  const regData = await getRegionalDataForDistrict(district);
  const regionalInfo = attachRegionalDataToOpportunity(occ, district, regData);

  const baseDuration = courses[0]?.durationMonths || 3;
  const estimatedIncomeStage1 = Math.round(occ.incomeMin * 0.7);
  const estimatedIncomeStage2 = Math.round(occ.incomeMin);
  const estimatedIncomeStage3 = Math.round((occ.incomeMin + occ.incomeMax) / 2);

  const steps = [
    {
      step: 1,
      title: 'Prerequisite and Core Skill Training',
      description: orderedMissing.length > 0
        ? `Enroll in NSQF Level ${occ.nsqfLevel} courses targeting prioritized skills: ${orderedMissing.map((s) => s.replace(/_/g, ' ')).join(', ')}.`
        : `Verified competencies match NSQF Level ${occ.nsqfLevel} requirements.`,
      durationMonths: baseDuration,
      recommendedCourse: courses[0]?.title || 'NSQF Certified Skilling Course',
      estimatedIncomeInr: estimatedIncomeStage1,
      nsqfProgression: `NSQF Level ${Math.max(1, occ.nsqfLevel - 1)} to Level ${occ.nsqfLevel}`
    },
    {
      step: 2,
      title: 'Practical Assessment and Certification',
      description: 'Undergo practical assessment by Sector Skill Council to receive official digital credential.',
      durationMonths: 1,
      estimatedIncomeInr: estimatedIncomeStage2,
      nsqfProgression: `NSQF Level ${occ.nsqfLevel} Certified`
    },
    {
      step: 3,
      title: occ.selfEmploymentViable ? 'Enterprise Launch or Wage Placement' : 'Wage Placement and Onboarding',
      description: occ.selfEmploymentViable
        ? 'Access PM Vishwakarma, PM-AJAY GIA, or PMEGP collateral free loan and toolkit subsidy for micro enterprise setup.'
        : 'Direct interview scheduling with verified district employers and manufacturing units.',
      durationMonths: 1,
      estimatedIncomeInr: estimatedIncomeStage3,
      nsqfProgression: `NSQF Level ${occ.nsqfLevel} Active Practitioner`
    }
  ];

  const learnFirstList = orderedMissing.slice(0, 3);

  return {
    occupation: occ,
    readinessScore: required.length > 0 ? Math.round((acquired.length / required.length) * 100) : 100,
    skillsSummary: {
      required,
      acquired,
      missing,
      learnFirst: learnFirstList
    },
    recommendedCourses: courses,
    nearbyCenters: regionalInfo.centers,
    applicableSchemes: regionalInfo.schemes,
    localDemand: regionalInfo.demand,
    roadmap: {
      totalEstimatedMonths: baseDuration + 2,
      steps
    }
  };
};
