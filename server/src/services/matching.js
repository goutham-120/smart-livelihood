import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { TrainingCenter } from '../models/TrainingCenter.js';

export const computeSkillGapsAndRoadmap = async (occupationKey, userSkills = [], district = 'Warangal') => {
  const occ = await Occupation.findOne({ key: occupationKey });
  if (!occ) return null;

  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));
  const required = occ.requiredSkills || [];

  const acquired = required.filter((s) => userSkillSet.has(s.toLowerCase()));
  const missing = required.filter((s) => !userSkillSet.has(s.toLowerCase()));

  // Find courses bridging missing skills
  const courses = await Course.find({
    skillsGained: { $in: missing.length > 0 ? missing : required }
  });

  // Find centers in the district
  const centers = await TrainingCenter.find({
    district: new RegExp(`^${district}$`, 'i'),
    trades: new RegExp(occupationKey, 'i')
  });

  // Find relevant central schemes
  const schemes = await Scheme.find({
    $or: [{ targetTrades: occupationKey }, { targetTrades: { $size: 0 } }]
  });

  const demand = await RegionDemand.findOne({
    district: new RegExp(`^${district}$`, 'i'),
    occupationKey
  });

  const steps = [
    {
      step: 1,
      title: 'Foundation & Skill Gap Training',
      description: missing.length > 0
        ? `Enroll in NSQF Level ${occ.nsqfLevel} training for missing competencies: ${missing.join(', ')}.`
        : `Verified competencies match NSQF Level ${occ.nsqfLevel} requirements.`,
      durationMonths: courses[0]?.durationMonths || 3,
      recommendedCourse: courses[0]?.title || 'NSQF Certified Skilling Course'
    },
    {
      step: 2,
      title: 'Assessment & NSQF Certification',
      description: 'Undergo practical assessment by Sector Skill Council to receive official digital credential.',
      durationMonths: 1
    },
    {
      step: 3,
      title: occ.selfEmploymentViable ? 'Enterprise Launch or Wage Placement' : 'Wage Placement & Onboarding',
      description: occ.selfEmploymentViable
        ? 'Access PM Vishwakarma / PMEGP collateral-free loan & toolkit subsidy for micro-enterprise setup.'
        : 'Direct interview scheduling with verified district employers and manufacturing units.',
      durationMonths: 1
    }
  ];

  return {
    occupation: occ,
    readinessScore: required.length > 0 ? Math.round((acquired.length / required.length) * 100) : 100,
    skillsSummary: {
      required,
      acquired,
      missing
    },
    recommendedCourses: courses,
    nearbyCenters: centers,
    applicableSchemes: schemes,
    localDemand: demand || { demandLevel: 3, openings: 15, avgIncome: (occ.incomeMin + occ.incomeMax) / 2 },
    roadmap: {
      totalEstimatedMonths: (courses[0]?.durationMonths || 3) + 2,
      steps
    }
  };
};
