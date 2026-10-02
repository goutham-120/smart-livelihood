import { TrainingCenter } from '../models/TrainingCenter.js';
import { Scheme } from '../models/Scheme.js';
import { RegionDemand } from '../models/RegionDemand.js';

export const getRegionalDataForDistrict = async (district = 'Warangal') => {
  const districtRegex = new RegExp(`^${district}$`, 'i');
  
  const centers = await TrainingCenter.find({ district: districtRegex });
  const demands = await RegionDemand.find({ district: districtRegex });
  const schemes = await Scheme.find();

  const demandMap = new Map();
  demands.forEach((d) => demandMap.set(d.occupationKey, d));

  return { centers, schemes, demandMap };
};

export const attachRegionalDataToOpportunity = (occ, district = 'Warangal', regionalData = {}) => {
  const { centers = [], schemes = [], demandMap = new Map() } = regionalData;
  const occKey = occ.key || occ.occupationKey;

  const demand = demandMap.get(occKey) || {
    demandLevel: 3,
    openings: 15,
    avgIncome: Math.round(((occ.incomeMin || 10000) + (occ.incomeMax || 20000)) / 2),
    isSynthetic: true
  };

  const matchedCenters = centers.filter((c) => {
    const tradeMatch = c.trades && c.trades.some((t) =>
      t.toLowerCase().includes(occKey.toLowerCase()) ||
      (occ.sector && occ.sector.toLowerCase().includes(t.toLowerCase()))
    );
    return tradeMatch;
  });

  const matchedSchemes = schemes.filter((s) => {
    if (!s.targetTrades || s.targetTrades.length === 0) return true;
    return s.targetTrades.some((t) =>
      t.toLowerCase() === occKey.toLowerCase() ||
      (occ.sector && t.toLowerCase() === occ.sector.toLowerCase())
    );
  });

  return {
    demand: {
      level: demand.demandLevel,
      openings: demand.openings,
      avgIncome: demand.avgIncome,
      isSynthetic: demand.isSynthetic !== undefined ? demand.isSynthetic : true
    },
    centers: matchedCenters,
    schemes: matchedSchemes
  };
};
