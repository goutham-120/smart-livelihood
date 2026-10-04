import { JobOpening } from '../models/JobOpening.js';
import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { Placement } from '../models/Placement.js';

export const rankCandidatesForJob = async (jobId, district = null) => {
  const job = await JobOpening.findById(jobId);
  if (!job) return null;

  const targetDistrict = district || job.district;
  const districtRegex = new RegExp(`^${targetDistrict}$`, 'i');

  const beneficiaries = await User.find({ role: 'beneficiary', district: districtRegex }).select('-passwordHash');
  const userIds = beneficiaries.map((b) => b._id);

  const profiles = await Profile.find({ user: { $in: userIds } });
  const placements = await Placement.find({ user: { $in: userIds } });

  const profileMap = new Map();
  profiles.forEach((p) => profileMap.set(p.user.toString(), p));

  const placementMap = new Map();
  placements.forEach((pl) => placementMap.set(pl.user.toString(), pl));

  const reqSkills = job.requiredSkills || [];

  const candidates = beneficiaries.map((u) => {
    const prof = profileMap.get(u._id.toString()) || {};
    const plac = placementMap.get(u._id.toString()) || null;

    const uSkills = new Set((prof.skills || []).map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, '_').trim()));
    const uWords = (prof.skills || []).map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, ' ').trim());
    let matchedSkillsCount = 0;

    if (reqSkills.length > 0) {
      reqSkills.forEach((rs) => {
        const rsNorm = String(rs).toLowerCase().replace(/[\s\-_]+/g, '_').trim();
        const rsWord = String(rs).toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
        if (uSkills.has(rsNorm) || uWords.some((w) => w === rsWord || w.includes(rsWord) || rsWord.includes(w))) {
          matchedSkillsCount++;
        }
      });
    }

    const skillScore = reqSkills.length > 0 ? Math.round((matchedSkillsCount / reqSkills.length) * 100) : 70;
    const trainingBonus = plac && (plac.status === 'completed' || plac.status === 'placed') ? 20 : 0;
    const candidateMatchScore = Math.min(100, skillScore + trainingBonus);

    return {
      user: {
        _id: u._id,
        name: u.name,
        phone: u.phone,
        district: u.district
      },
      profile: prof,
      placement: plac,
      matchScore: candidateMatchScore,
      matchedSkillsCount,
      totalRequiredSkills: reqSkills.length
    };
  });

  candidates.sort((a, b) => b.matchScore - a.matchScore);

  return {
    job,
    candidates
  };
};

export const rankJobsForBeneficiary = async (userId, district = null) => {
  const profile = await Profile.findOne({ user: userId });
  const userDistrict = district || (profile ? profile.district : 'Warangal');
  const districtRegex = new RegExp(`^${userDistrict}$`, 'i');

  const jobs = await JobOpening.find({ district: districtRegex, status: 'open' });
  const uSkills = new Set((profile ? profile.skills : []).map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, '_').trim()));
  const uWords = (profile ? profile.skills : []).map((s) => String(s).toLowerCase().replace(/[\s\-_]+/g, ' ').trim());

  const ranked = jobs.map((job) => {
    const reqSkills = job.requiredSkills || [];
    let matchCount = 0;
    reqSkills.forEach((rs) => {
      const rsNorm = String(rs).toLowerCase().replace(/[\s\-_]+/g, '_').trim();
      const rsWord = String(rs).toLowerCase().replace(/[\s\-_]+/g, ' ').trim();
      if (uSkills.has(rsNorm) || uWords.some((w) => w === rsWord || w.includes(rsWord) || rsWord.includes(w))) {
        matchCount++;
      }
    });

    const matchScore = reqSkills.length > 0
      ? Math.round((matchCount / reqSkills.length) * 100)
      : (job.occupationKey && uSkills.has(job.occupationKey.toLowerCase().replace(/[\s\-_]+/g, '_')) ? 90 : 50);

    return {
      job,
      matchScore
    };
  });

  ranked.sort((a, b) => b.matchScore - a.matchScore);

  return ranked;
};
