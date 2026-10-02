import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Skill } from '../models/Skill.js';
import { Occupation } from '../models/Occupation.js';
import { Course } from '../models/Course.js';
import { Scheme } from '../models/Scheme.js';
import { TrainingCenter } from '../models/TrainingCenter.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { JobOpening } from '../models/JobOpening.js';
import { Counselor } from '../models/Counselor.js';

import { skillsData } from './skillsData.js';
import { occupationsData } from './occupationsData.js';
import { coursesData } from './coursesData.js';
import { schemesData } from './schemesData.js';
import { trainingCentersData } from './trainingCentersData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const districts = ['Warangal', 'Adilabad', 'Nalgonda'];

export const seedCoreData = async () => {
  console.log('Seeding Verified Skills (60)...');
  await Skill.deleteMany({});
  await Skill.insertMany(skillsData);

  console.log('Seeding Verified Occupations (27)...');
  await Occupation.deleteMany({});
  await Occupation.insertMany(occupationsData);

  console.log('Seeding Verified Courses (40)...');
  await Course.deleteMany({});
  await Course.insertMany(coursesData);

  console.log('Seeding Verified Central Schemes (11)...');
  await Scheme.deleteMany({});
  await Scheme.insertMany(schemesData);

  console.log('Seeding Verified Training Centers (60 across 3 districts)...');
  await TrainingCenter.deleteMany({});
  await TrainingCenter.insertMany(trainingCentersData);

  console.log('Generating Synthetic Region Demand for 3 Districts x 27 Occupations...');
  await RegionDemand.deleteMany({});
  const demandRecords = [];

  const demandProfiles = {
    Warangal: {
      self_employed_tailor: 5,
      hand_embroiderer: 4,
      solar_pv_installer: 5,
      pickle_making_technician: 4,
      baking_technician: 4,
      spice_processing_technician: 5,
      dairy_farmer_entrepreneur: 4,
      retail_sales_associate: 5,
      general_duty_assistant: 4,
      domestic_data_entry_operator: 4,
      csc_village_level_entrepreneur: 5,
      general_mason: 4,
      plumber_general: 4
    },
    Adilabad: {
      organic_grower: 5,
      medicinal_crops_cultivator: 4,
      goat_sheep_farmer: 5,
      dairy_farmer_entrepreneur: 4,
      self_employed_tailor: 4,
      handloom_weaving: 4,
      grain_mill_operator: 4,
      tractor_operator: 4,
      home_health_aide: 4,
      csc_village_level_entrepreneur: 4
    },
    Nalgonda: {
      dairy_farmer_entrepreneur: 5,
      micro_irrigation_technician: 5,
      grain_mill_operator: 5,
      handloom_weaving: 5,
      solar_pv_installer: 4,
      field_technician_home_appliances: 4,
      micro_retailer_kirana_owner: 4,
      general_mason: 4,
      general_duty_assistant: 4
    }
  };

  districts.forEach((dist) => {
    occupationsData.forEach((occ) => {
      const distProfile = demandProfiles[dist] || {};
      const demandLevel = distProfile[occ.key] || Math.floor(Math.random() * 3) + 2; // 2 to 4 default
      const openings = demandLevel * 12 + Math.floor(Math.random() * 15);
      const avgIncome = Math.round((occ.incomeMin + occ.incomeMax) / 2);

      demandRecords.push({
        district: dist,
        state: 'Telangana',
        occupationKey: occ.key,
        demandLevel,
        openings,
        avgIncome,
        isSynthetic: true,
        source: 'District Skill Development Plan (DSDP) / LFS 2024 Projections'
      });
    });
  });
  await RegionDemand.insertMany(demandRecords);

  console.log('Seeding Synthetic Job Openings...');
  await JobOpening.deleteMany({});
  const sampleJobs = [
    { title: 'Apparel Sewing Operator', employer: 'Kakatiya Mega Textile Park', district: 'Warangal', occupationKey: 'apparel_sewing_operator', wage: 16000, openings: 35, requiredSkills: ['sewing_machine_operation'], isSynthetic: true },
    { title: 'Solar Installation Technician', employer: 'Telangana Green Energy Corp', district: 'Warangal', occupationKey: 'solar_pv_installer', wage: 22000, openings: 12, requiredSkills: ['solar_panel_installation'], isSynthetic: true },
    { title: 'General Duty Hospital Assistant', employer: 'MGM Hospital Network', district: 'Warangal', occupationKey: 'general_duty_assistant', wage: 15000, openings: 18, requiredSkills: ['general_duty_hospital_assistance'], isSynthetic: true },
    { title: 'Retail Store Associate', employer: 'Warangal Super Retail Ltd', district: 'Warangal', occupationKey: 'retail_sales_associate', wage: 14000, openings: 20, requiredSkills: ['retail_sales_customer_service'], isSynthetic: true },
    { title: 'Cotton Ginning Equipment Operator', employer: 'Adilabad Cotton Millers Assn', district: 'Adilabad', occupationKey: 'grain_mill_operator', wage: 15500, openings: 25, requiredSkills: ['grain_milling_processing'], isSynthetic: true },
    { title: 'Dairy Farm Supervisor', employer: 'Vijaya Dairy Cooperative', district: 'Adilabad', occupationKey: 'dairy_farmer_entrepreneur', wage: 18000, openings: 10, requiredSkills: ['milking_machine_handling'], isSynthetic: true },
    { title: 'Home Health Aide', employer: 'Sanjeevani Health Outreach', district: 'Adilabad', occupationKey: 'home_health_aide', wage: 16000, openings: 15, requiredSkills: ['elderly_patient_home_care'], isSynthetic: true },
    { title: 'Rice Mill Plant Assistant', employer: 'Miryalaguda Agro Industries', district: 'Nalgonda', occupationKey: 'grain_mill_operator', wage: 17000, openings: 40, requiredSkills: ['grain_milling_processing'], isSynthetic: true },
    { title: 'Handloom Cluster Finisher', employer: 'Pochampally Weavers Society', district: 'Nalgonda', occupationKey: 'hand_embroiderer', wage: 14500, openings: 15, requiredSkills: ['hand_embroidery'], isSynthetic: true },
    { title: 'Micro Irrigation Maintenance Field Worker', employer: 'Narmada Drip Systems', district: 'Nalgonda', occupationKey: 'micro_irrigation_technician', wage: 18000, openings: 14, requiredSkills: ['drip_irrigation_maintenance'], isSynthetic: true }
  ];
  await JobOpening.insertMany(sampleJobs);

  console.log('Seeding Synthetic Counselors...');
  await Counselor.deleteMany({});
  const counselors = [
    { name: 'Dr. V. Lavanya', district: 'Warangal', languages: ['te', 'en', 'hi'], contact: '+91 94401 22334', specialization: ['Apparel', 'Women Micro-Enterprise'], verified: true, isSynthetic: true },
    { name: 'K. Ramesh Rao', district: 'Warangal', languages: ['te', 'en'], contact: '+91 94402 33445', specialization: ['Solar Energy', 'Electronics'], verified: true, isSynthetic: true },
    { name: 'Smt. G. Sarada', district: 'Warangal', languages: ['te', 'hi'], contact: '+91 94403 44556', specialization: ['Food Processing', 'SHG Finance'], verified: true, isSynthetic: true },
    { name: 'B. Devender Naik', district: 'Adilabad', languages: ['te', 'hi', 'Gondi'], contact: '+91 94404 55667', specialization: ['Tribal Livelihoods', 'Forest Produce'], verified: true, isSynthetic: true },
    { name: 'Dr. M. Suneetha', district: 'Adilabad', languages: ['te', 'en'], contact: '+91 94405 66778', specialization: ['Organic Farming', 'Dairy'], verified: true, isSynthetic: true },
    { name: 'T. Srinivas Reddy', district: 'Adilabad', languages: ['te', 'hi'], contact: '+91 94406 77889', specialization: ['Rural Skilling', 'Masonry'], verified: true, isSynthetic: true },
    { name: 'N. Padma', district: 'Nalgonda', languages: ['te', 'en'], contact: '+91 94407 88990', specialization: ['Handloom Clusters', 'Weaving'], verified: true, isSynthetic: true },
    { name: 'Ch. Venkatramana', district: 'Nalgonda', languages: ['te', 'en', 'hi'], contact: '+91 94408 99001', specialization: ['Agro Processing', 'Micro Irrigation'], verified: true, isSynthetic: true },
    { name: 'S. Anjaneyulu', district: 'Nalgonda', languages: ['te'], contact: '+91 94409 10112', specialization: ['Dairy & Livestock', 'PMEGP Loans'], verified: true, isSynthetic: true }
  ];
  await Counselor.insertMany(counselors);

  console.log('Core seed completed successfully!');
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/livelihood';
  mongoose.connect(MONGO_URI).then(async () => {
    await seedCoreData();
    process.exit(0);
  }).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
