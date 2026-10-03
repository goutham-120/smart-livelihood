import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Skill } from '../models/Skill.js';
import { attachRegionalDataToOpportunity, getRegionalDataForDistrict } from './regional.js';
import { getEmbeddingSimilarity } from './embeddings.js';

export const calculateOpportunityMatchV2 = async (occ, profile = {}, district = 'Warangal', regionalData = null) => {
  const userSkillsList = (profile.skills || []).map((s) => s.toLowerCase());
  const userSkillSet = new Set(userSkillsList);
  const userPref = profile.employmentPreference || 'either';
  const userIncomeGoal = profile.incomeGoal || 15000;
  const userEducation = profile.education || 'Middle School';
  const userMobility = profile.mobilityConstraints || [];

  const allSkills = await Skill.find();
  const skillMap = new Map();
  allSkills.forEach((sk) => skillMap.set(sk.key.toLowerCase(), sk));

  const reqSkills = occ.requiredSkills || [];
  const matched = [];
  const missing = [];
  let totalSkillCredit = 0;

  if (reqSkills.length > 0) {
    for (const rSkill of reqSkills) {
      const rLower = rSkill.toLowerCase();
      if (userSkillSet.has(rLower)) {
        matched.push(rSkill);
        totalSkillCredit += 1.0;
        continue;
      }

      const skDoc = skillMap.get(rLower);
      let prereqMatched = false;
      if (skDoc && skDoc.prerequisites && skDoc.prerequisites.length > 0) {
        for (const pre of skDoc.prerequisites) {
          if (userSkillSet.has(pre.toLowerCase())) {
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

      let bestSim = 0;
      for (const uSk of userSkillsList) {
        const sim = await getEmbeddingSimilarity(uSk, rLower);
        if (sim > bestSim) bestSim = sim;
      }

      if (bestSim >= 0.7) {
        matched.push(`${rSkill} (similar skill)`);
        totalSkillCredit += bestSim;
      } else {
        missing.push(rSkill);
      }
    }
  }

  const skillFitScore = reqSkills.length > 0
    ? Math.min(100, Math.round((totalSkillCredit / reqSkills.length) * 100))
    : 100;

  const regData = regionalData || await getRegionalDataForDistrict(district);
  const regionalInfo = attachRegionalDataToOpportunity(occ, district, regData);
  const demand = regionalInfo.demand;
  const demandScore = demand.level * 20;

  let preferenceScore = 70;
  if (userPref === 'self' && occ.selfEmploymentViable) preferenceScore = 100;
  else if (userPref === 'wage' && !occ.selfEmploymentViable) preferenceScore = 100;
  else if (userPref === 'either') preferenceScore = 90;

  let incomeGoalScore = 60;
  if (occ.incomeMax >= userIncomeGoal) incomeGoalScore = 100;

  let mobilityScore = 100;
  if (occ.travelRequired && userMobility.length > 0) mobilityScore = 50;

  let educationScore = 100;
  if (occ.minEducation === 'High School' && (userEducation === 'Primary School' || userEducation === 'None')) {
    educationScore = 50;
  }

  const matchScore = Math.round(
    skillFitScore * 0.35 +
    demandScore * 0.25 +
    preferenceScore * 0.15 +
    incomeGoalScore * 0.10 +
    ((mobilityScore + educationScore) / 2) * 0.15
  );

  const track = occ.selfEmploymentViable && (userPref === 'self' || userPref === 'either')
    ? 'self'
    : 'wage';

  const breakdown = [
    {
      factor: 'Skill Alignment',
      score: skillFitScore,
      weight: '35%',
      note: `${skillFitScore}% match with verified skills, prerequisites and embeddings`
    },
    {
      factor: 'Local Demand',
      score: demandScore,
      weight: '25%',
      note: `Level ${demand.level} market demand in ${district}`
    },
    {
      factor: 'Pathway Preference',
      score: preferenceScore,
      weight: '15%',
      note: `Suits your preference for ${track === 'self' ? 'self employment' : 'wage placement'}`
    },
    {
      factor: 'Income Target',
      score: incomeGoalScore,
      weight: '10%',
      note: `Target income ₹${userIncomeGoal.toLocaleString()}/mo vs earning potential ₹${occ.incomeMax.toLocaleString()}/mo`
    },
    {
      factor: 'Mobility and Education',
      score: Math.round((mobilityScore + educationScore) / 2),
      weight: '15%',
      note: `Education level and travel requirements suitability`
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
  const occ = await Occupation.findOne({ key: occupationKey });
  if (!occ) return null;

  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const required = occ.requiredSkills || [];

  const acquired = required.filter((s) => userSkillSet.has(s.toLowerCase()));
  const missing = required.filter((s) => !userSkillSet.has(s.toLowerCase()));

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
        ? 'Access PM Vishwakarma or PMEGP collateral free loan and toolkit subsidy for micro enterprise setup.'
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
