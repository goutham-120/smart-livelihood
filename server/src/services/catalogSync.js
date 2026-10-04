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

    const { JobOpening } = await import('../models/JobOpening.js');
    const existingTractorJobs = await JobOpening.countDocuments({ occupationKey: 'tractor_operator' });
    if (existingTractorJobs === 0) {
      await JobOpening.insertMany([
        { title: 'Tractor & Farm Equipment Operator', employer: 'Warangal Agro Machinery Service Cluster / Rythu Seva Kendram', district: 'Warangal', occupationKey: 'tractor_operator', wage: 19500, openings: 18, requiredSkills: ['tractor_farm_machinery'], contact: '+91 870 245 9811', isSynthetic: true },
        { title: 'Agricultural Equipment Field Technician', employer: 'Telangana State Agro Industries Development Corp', district: 'Warangal', occupationKey: 'tractor_operator', wage: 22000, openings: 10, requiredSkills: ['tractor_farm_machinery'], contact: '+91 870 256 3410', isSynthetic: true },
        { title: 'Custom Hiring Center Machinery Specialist', employer: 'Mulkanoor Rural Cooperative Service Society', district: 'Warangal', occupationKey: 'tractor_operator', wage: 21000, openings: 8, requiredSkills: ['tractor_farm_machinery'], contact: '+91 870 288 7654', isSynthetic: true }
      ]);
    }
    const existingTailorJobs = await JobOpening.countDocuments({ occupationKey: 'self_employed_tailor' });
    if (existingTailorJobs === 0) {
      await JobOpening.insertMany([
        { title: 'Commercial Tailoring & Production Associate', employer: 'Kakatiya Mega Textile Park Garment Cluster', district: 'Warangal', occupationKey: 'self_employed_tailor', wage: 17500, openings: 25, requiredSkills: ['sewing_machine_operation', 'garment_pattern_cutting'], contact: '+91 870 244 5500', isSynthetic: true }
      ]);
    }

    console.log('✅ Core catalog synchronized: occupations, skills, courses, schemes, and jobs up to date.');
  } catch (err) {
    console.warn('Catalog sync notice:', err.message);
  }
};
