import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { Journey } from '../models/Journey.js';

export const buildBeneficiaryContext = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) return null;

  const profile = await Profile.findOne({ user: userId });
  const journey = await Journey.findOne({ user: userId });

  return {
    user,
    profile: profile || {
      district: user.district || 'Warangal',
      language: 'en',
      skills: [],
      employmentPreference: 'either',
      education: 'Middle School'
    },
    journey: journey || {
      currentStage: 'discovery',
      milestones: []
    }
  };
};
