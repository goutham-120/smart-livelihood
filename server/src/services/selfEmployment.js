import { Occupation } from '../models/Occupation.js';
import { Scheme } from '../models/Scheme.js';
import { Counselor } from '../models/Counselor.js';
import { Task } from '../models/Task.js';

export const getSelfEmploymentGuide = async (occupationKey, district = 'Warangal', language = 'en') => {
  const occ = await Occupation.findOne({ key: occupationKey.toLowerCase() });
  if (!occ) return null;

  const districtRegex = new RegExp(`^${district}$`, 'i');

  const schemes = await Scheme.find({
    type: { $in: ['loan', 'subsidy', 'composite'] }
  }).limit(5);

  const counselors = await Counselor.find({
    district: districtRegex,
    verified: true
  }).limit(4);

  const startupCostInr = Math.round(occ.incomeMin * 3.5);

  const businessPlan = {
    occupationTitle: occ.title,
    summary: `Micro enterprise operational roadmap for establishing a sustainable ${occ.title} business under PM-AJAY GIA support.`,
    keySteps: [
      `Complete NSQF Level ${occ.nsqfLevel} technical and business management module`,
      `Apply for PM Vishwakarma or PMEGP collateral free loan and seed grant`,
      `Acquire essential tooling equipment and setup workspace in ${district}`,
      `Link with local trade cooperatives and digital buyer channels`
    ],
    estimatedMonthlyRevenue: Math.round(occ.incomeMax * 1.3),
    breakevenMonths: 3,
    workingCapitalRequirement: Math.round(occ.incomeMin * 1.5)
  };

  return {
    occupationKey: occ.key,
    title: occ.title,
    nsqfLevel: occ.nsqfLevel,
    businessPlan,
    startupCostInr,
    schemes,
    counselors
  };
};

export const createFinancialCounselorTask = async (userId, district = 'Warangal', counselorId = null, titleNote = '') => {
  const taskTitle = titleNote
    ? `Financial Counseling Session: ${titleNote}`
    : 'Financial Counseling for Self-Employment Startup';

  const task = await Task.create({
    title: taskTitle,
    description: `Beneficiary requested consultation with financial counselor in ${district} for PM-AJAY micro enterprise loan processing.`,
    assignedOrg: 'corporation',
    district: district,
    beneficiary: userId,
    status: 'open',
    priority: 'high',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: userId
  });

  return task;
};
