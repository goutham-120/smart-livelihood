import { Skill } from '../models/Skill.js';

export const extractSkillsFromText = async (text) => {
  if (!text || typeof text !== 'string') return [];

  const lowerText = text.toLowerCase();
  const allSkills = await Skill.find();
  const matched = [];

  for (const skill of allSkills) {
    // Check aliases
    const hasAlias = (skill.aliases || []).some((alias) => lowerText.includes(alias.toLowerCase()));
    // Check direct key or names
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
