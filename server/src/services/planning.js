import { Plan } from '../models/Plan.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { Occupation } from '../models/Occupation.js';
import { Profile } from '../models/Profile.js';

export const generateDistrictPerspectivePlan = async ({
  district = 'Warangal',
  targetBeneficiaries = 500,
  budgetInr = 5000000,
  createdById
}) => {
  const districtRegex = new RegExp(`^${district}$`, 'i');

  const demands = await RegionDemand.find({ district: districtRegex })
    .sort({ demandLevel: -1, openings: -1 })
    .limit(6);

  const centers = await TrainingCenter.find({ district: districtRegex });
  const centerNames = centers.map((c) => c.name);

  const topOccKeys = demands.map((d) => d.occupationKey);
  const occupations = await Occupation.find({ key: { $in: topOccKeys } });
  const occMap = new Map();
  occupations.forEach((o) => occMap.set(o.key, o));

  const countPerTrade = Math.floor(targetBeneficiaries / (demands.length || 1));
  const budgetPerBeneficiary = Math.floor(budgetInr / targetBeneficiaries);

  const allocations = [];
  let totalWage = 0;
  let totalSelf = 0;
  let weightedIncomeSum = 0;

  demands.forEach((d) => {
    const occ = occMap.get(d.occupationKey) || {
      sector: 'General Skilling',
      title: d.occupationKey,
      incomeMin: 12000,
      incomeMax: 18000,
      selfEmploymentViable: true
    };

    const bCount = countPerTrade;
    const tradeBudget = bCount * budgetPerBeneficiary;
    const expectedPlacementCount = Math.round(bCount * 0.80);
    const avgInc = Math.round((occ.incomeMin + occ.incomeMax) / 2);

    if (occ.selfEmploymentViable) {
      totalSelf += Math.round(expectedPlacementCount * 0.4);
      totalWage += Math.round(expectedPlacementCount * 0.6);
    } else {
      totalWage += expectedPlacementCount;
    }

    weightedIncomeSum += avgInc * bCount;

    allocations.push({
      sector: occ.sector || 'Skilling',
      occupationKey: d.occupationKey,
      beneficiaryCount: bCount,
      allocatedBudgetInr: tradeBudget,
      expectedPlacements: expectedPlacementCount,
      trainingPartners: centerNames.slice(0, 2)
    });
  });

  const overallAvgIncome = targetBeneficiaries > 0 ? Math.round(weightedIncomeSum / targetBeneficiaries) : 15000;

  const projectedImpact = {
    avgMonthlyIncomeInr: overallAvgIncome,
    overallPlacementRatePct: 80,
    selfEmploymentCount: totalSelf,
    wageEmploymentCount: totalWage
  };

  const prioritizedTrades = allocations.map((a) => a.occupationKey);

  const timeline = [
    { phase: 'Phase 1: Mobilization and Intake', duration: 'Month 1', activity: 'Beneficiary registration, voice skill gap profiling, and batch allocation' },
    { phase: 'Phase 2: NSQF Skilling & Practical Labs', duration: 'Months 2 to 4', activity: 'Hands-on trade instruction at accredited training centers' },
    { phase: 'Phase 3: Assessment and Certification', duration: 'Month 5', activity: 'Sector Skill Council evaluation and digital badge issuance' },
    { phase: 'Phase 4: Placement & Micro Loan Dispersal', duration: 'Month 6', activity: 'Job fair interviews and PMEGP or PM Vishwakarma toolkit distribution' }
  ];

  const kpis = [
    `Enroll ${targetBeneficiaries} PM-AJAY beneficiaries across ${allocations.length} high demand sectors`,
    `Achieve 80% placement or micro enterprise establishment rate`,
    `Maintain average post training income of ₹${overallAvgIncome.toLocaleString()}/month`
  ];

  const assumptions = [
    'Training center capacity in district satisfies batch allocation requirements',
    'PM-AJAY GIA grant provides 100% tuition subsidy and candidate stipend',
    'Local employer demand remains stable over the 6 month implementation horizon'
  ];

  const planDoc = await Plan.create({
    district,
    targetBeneficiaries,
    budgetInr,
    allocations,
    status: 'draft',
    projectedImpact,
    createdBy: createdById
  });

  return {
    plan: planDoc,
    prioritizedTrades,
    timeline,
    kpis,
    assumptions
  };
};

export const getDistrictPlans = async (district = null) => {
  const query = {};
  if (district) {
    query.district = new RegExp(`^${district}$`, 'i');
  }
  return Plan.find(query).sort({ createdAt: -1 });
};
