import { Skill } from '../models/Skill.js';

export const extractSkillsFromText = async (text) => {
  if (!text || typeof text !== 'string') return [];

  const lowerText = text.toLowerCase();
  const allSkills = await Skill.find();
  const matched = [];

  for (const skill of allSkills) {
    const hasAlias = (skill.aliases || []).some((alias) => lowerText.includes(alias.toLowerCase()));
    const hasName =
      lowerText.includes(skill.name.toLowerCase()) ||
      (skill.names?.hi && lowerText.includes(skill.names.hi.toLowerCase())) ||
      (skill.names?.te && lowerText.includes(skill.names.te.toLowerCase()));

    if (hasAlias || hasName) {
      matched.push(skill.key);
    }
  }

  return Array.from(new Set(matched));
};

export const extractLivelihoodProfile = async (text) => {
  if (!text || typeof text !== 'string') return {};

  const lowerText = text.toLowerCase();
  const result = {};

  // Extract skills via aliases & keywords
  const skills = await extractSkillsFromText(text);
  if (skills.length > 0) {
    result.skills = skills;
  }

  // Extract Education
  if (lowerText.includes('10th') || lowerText.includes('tenth') || lowerText.includes('high school') || lowerText.includes('10th pass')) {
    result.education = 'High School';
  } else if (lowerText.includes('7th') || lowerText.includes('8th') || lowerText.includes('middle school') || lowerText.includes('elementary')) {
    result.education = 'Middle School';
  } else if (lowerText.includes('primary') || lowerText.includes('5th') || lowerText.includes('read write')) {
    result.education = 'Primary School';
  } else if (lowerText.includes('graduate') || lowerText.includes('degree') || lowerText.includes('bachelor') || lowerText.includes('college')) {
    result.education = 'Graduate';
  } else if (lowerText.includes('diploma') || lowerText.includes('iti') || lowerText.includes('polytechnic')) {
    result.education = 'Diploma';
  }

  // Extract Employment Preference
  if (lowerText.includes('self') || lowerText.includes('own business') || lowerText.includes('my own shop') || lowerText.includes('micro enterprise') || lowerText.includes('start business')) {
    result.employmentPreference = 'self';
  } else if (lowerText.includes('job') || lowerText.includes('wage') || lowerText.includes('salary') || lowerText.includes('company work') || lowerText.includes('factory')) {
    result.employmentPreference = 'wage';
  }

  // Extract Mobility Constraints
  const mobility = [];
  if (lowerText.includes('don\'t want to travel') || lowerText.includes('cannot travel') || lowerText.includes('no travel') || lowerText.includes('home village') || lowerText.includes('from home') || lowerText.includes('at home')) {
    mobility.push('no_travel');
  }
  if (lowerText.includes('no night shift') || lowerText.includes('day time only') || lowerText.includes('day shift')) {
    mobility.push('night_shift_restricted');
  }
  if (mobility.length > 0) {
    result.mobilityConstraints = mobility;
  }

  // Extract Income Goal
  const incomeMatch = lowerText.match(/(?:rupees|rs|\u20b9)?\s*(\d{4,6})\s*(?:rupees|rs|\u20b9)?/i);
  if (incomeMatch && incomeMatch[1]) {
    const val = parseInt(incomeMatch[1], 10);
    if (val >= 5000 && val <= 100000) {
      result.incomeGoal = val;
    }
  }

  // Extract Experience Years
  const expMatch = lowerText.match(/(\d{1,2})\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
  if (expMatch && expMatch[1]) {
    result.experienceYears = parseInt(expMatch[1], 10);
  }

  // Extract Current Livelihood
  if (lowerText.includes('grocery') || lowerText.includes('kirana')) {
    result.currentLivelihood = 'family grocery store';
  } else if (lowerText.includes('farm') || lowerText.includes('agriculture')) {
    result.currentLivelihood = 'farming';
  } else if (lowerText.includes('weld') || lowerText.includes('welding')) {
    result.currentLivelihood = 'welding';
  } else if (lowerText.includes('tailor') || lowerText.includes('sewing') || lowerText.includes('stitching')) {
    result.currentLivelihood = 'tailoring';
  } else if (lowerText.includes('repair') || lowerText.includes('mobile')) {
    result.currentLivelihood = 'electronics repair';
  }

  return result;
};

export const extractProfileAttributes = (text, stage) => {
  if (!text || typeof text !== 'string') return {};
  const lowerText = text.toLowerCase();
  const result = {};

  if (lowerText.includes('10th') || lowerText.includes('tenth') || lowerText.includes('high school') || lowerText.includes('10th pass')) {
    result.education = 'High School';
  } else if (lowerText.includes('7th') || lowerText.includes('8th') || lowerText.includes('middle school') || lowerText.includes('elementary')) {
    result.education = 'Middle School';
  } else if (lowerText.includes('primary') || lowerText.includes('5th') || lowerText.includes('read write')) {
    result.education = 'Primary School';
  } else if (lowerText.includes('graduate') || lowerText.includes('degree') || lowerText.includes('bachelor') || lowerText.includes('college')) {
    result.education = 'Graduate';
  } else if (lowerText.includes('diploma') || lowerText.includes('iti') || lowerText.includes('polytechnic')) {
    result.education = 'Diploma';
  }

  if (lowerText.includes('self') || lowerText.includes('own business') || lowerText.includes('my own shop') || lowerText.includes('micro enterprise') || lowerText.includes('start business')) {
    result.employmentPreference = 'self';
  } else if (lowerText.includes('job') || lowerText.includes('wage') || lowerText.includes('salary') || lowerText.includes('company work') || lowerText.includes('factory')) {
    result.employmentPreference = 'wage';
  }

  const mobility = [];
  if (lowerText.includes('don\'t want to travel') || lowerText.includes('cannot travel') || lowerText.includes('no travel') || lowerText.includes('home village') || lowerText.includes('from home') || lowerText.includes('at home')) {
    mobility.push('no_travel');
  }
  if (lowerText.includes('no night shift') || lowerText.includes('day time only') || lowerText.includes('day shift')) {
    mobility.push('night_shift_restricted');
  }
  if (mobility.length > 0) {
    result.mobilityConstraints = mobility;
  }

  const incomeMatch = lowerText.match(/(?:rupees|rs|\u20b9)?\s*(\d{4,6})\s*(?:rupees|rs|\u20b9)?/i);
  if (incomeMatch && incomeMatch[1]) {
    const val = parseInt(incomeMatch[1], 10);
    if (val >= 5000 && val <= 100000) {
      result.incomeGoal = val;
    }
  }

  const expMatch = lowerText.match(/(\d{1,2})\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i);
  if (expMatch && expMatch[1]) {
    result.experienceYears = parseInt(expMatch[1], 10);
  }

  if (lowerText.includes('grocery') || lowerText.includes('kirana')) {
    result.currentLivelihood = 'family grocery store';
  } else if (lowerText.includes('farm') || lowerText.includes('agriculture')) {
    result.currentLivelihood = 'farming';
  } else if (lowerText.includes('weld') || lowerText.includes('welding')) {
    result.currentLivelihood = 'welding';
  } else if (lowerText.includes('tailor') || lowerText.includes('sewing') || lowerText.includes('stitching')) {
    result.currentLivelihood = 'tailoring';
  } else if (lowerText.includes('repair') || lowerText.includes('mobile')) {
    result.currentLivelihood = 'electronics repair';
  }

  return result;
};

export const detectUserIntent = (text) => {
  if (!text || typeof text !== 'string') return { intent: 'answer', correctedField: null, correctedValue: null };
  const lower = text.toLowerCase();
  let intent = 'answer';
  let correctedField = null;
  let correctedValue = null;

  if (lower.includes('don\'t know') || lower.includes('not sure') || lower.includes('no idea')) {
    intent = 'dont_know';
  } else if (lower.includes('repeat') || lower.includes('say again') || lower.includes('pardon')) {
    intent = 'repeat';
  } else if (lower.includes('actually') || lower.includes('instead of') || lower.includes('meant')) {
    intent = 'correct';
  } else if (lower.includes('yes') || lower.includes('correct') || lower.includes('agree')) {
    intent = 'confirm';
  } else if (lower.includes('no') || lower.includes('wrong') || lower.includes('incorrect')) {
    intent = 'deny';
  }

  return { intent, correctedField, correctedValue };
};

