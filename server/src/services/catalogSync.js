import { Occupation } from '../models/Occupation.js';
import { Skill } from '../models/Skill.js';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { occupationsData } from '../seed/occupationsData.js';
import { skillsData } from '../seed/skillsData.js';
import { coursesData } from '../seed/coursesData.js';
import { schemesData } from '../seed/schemesData.js';

/**
 * Synchronize Core Catalog data into MongoDB.
 * Ensures newly added occupations (like tractor_operator), updated skills and aliases,
 * courses, and schemes are always up to date in the database without wiping user profiles.
 */
export const syncCatalogData = async () => {
  try {
    for (const occ of occupationsData) {
      await Occupation.findOneAndUpdate(
        { key: occ.key },
        { $set: occ },
        { upsert: true, new: true }
      );
    }
    for (const sk of skillsData) {
      await Skill.findOneAndUpdate(
        { key: sk.key },
        { $set: sk },
        { upsert: true, new: true }
      );
    }
    for (const crs of coursesData) {
      await Course.findOneAndUpdate(
        { key: crs.key },
        { $set: crs },
        { upsert: true, new: true }
      );
    }
    for (const sch of schemesData) {
      await Scheme.findOneAndUpdate(
        { key: sch.key },
        { $set: sch },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Core catalog synchronized: occupations, skills, courses, schemes up to date.');
  } catch (err) {
    console.warn('Catalog sync notice:', err.message);
  }
};
