import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Placement } from '../models/Placement.js';
import { Task } from '../models/Task.js';
import { seedCoreData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const firstNames = [
  'Anitha', 'Kavitha', 'Sunitha', 'Laxmi', 'Padma', 'Renuka', 'Swapna', 'Manjula', 'Saritha', 'Bhavani',
  'Ramesh', 'Suresh', 'Naresh', 'Raju', 'Mahesh', 'Srinivas', 'Venkat', 'Shekar', 'Ravinder', 'Ganesh',
  'Swathi', 'Jyothi', 'Roopa', 'Sravani', 'Lavanya', 'Divya', 'Deepa', 'Sujatha', 'Geetha', 'Pushpa',
  'Kalyan', 'Prashanth', 'Naveen', 'Sai', 'Vijay', 'Praveen', 'Santosh', 'Rajesh', 'Chandra', 'Shankar'
];

const lastNames = [
  'Goud', 'Yadav', 'Reddy', 'Madiga', 'Mala', 'Nayaka', 'Kuruma', 'Vaddera', 'Kummari', 'Medari',
  'Golagani', 'Bandi', 'Chiluka', 'Damera', 'Erugula', 'Ganta', 'Jaligama', 'Kondeti', 'Mamidala', 'Nalla'
];

const districts = ['Warangal', 'Adilabad', 'Nalgonda'];
const educationLevels = ['Primary School', 'Middle School', 'High School', 'Intermediate', 'None'];
const mobilityOptions = [
  [],
  ['Cannot travel beyond village'],
  ['Can travel up to block headquarters'],
  ['Home-based only due to eldercare']
];

const skillsPool = [
  ['sewing_machine_operation', 'garment_pattern_cutting'],
  ['hand_embroidery', 'fashion_accessory_making'],
  ['pickle_jam_preservation', 'food_packaging_hygiene'],
  ['commercial_baking', 'food_packaging_hygiene'],
  ['organic_compost_vermicompost', 'integrated_pest_management'],
  ['milking_machine_handling', 'cattle_feed_nutrition'],
  ['goat_sheep_rearing', 'cattle_feed_nutrition'],
  ['solar_panel_installation', 'house_wiring_electrical'],
  ['home_appliance_repair', 'house_wiring_electrical'],
  ['smartphone_hardware_repair'],
  ['masonry_bricklaying', 'sanitary_plumbing'],
  ['structural_arc_welding'],
  ['retail_sales_customer_service', 'pos_digital_billing'],
  ['micro_business_bookkeeping', 'pos_digital_billing'],
  ['data_entry_vernacular_typing'],
  ['csc_citizen_service_delivery', 'digital_banking_dbt_assistance'],
  ['general_duty_hospital_assistance', 'first_aid_emergency_response'],
  ['elderly_patient_home_care']
];

export const seedDemo = async () => {
  // First seed verified core data
  await seedCoreData();

  console.log('Clearing old user & placement records for fresh demo...');
  await User.deleteMany({});
  await Profile.deleteMany({});
  await Placement.deleteMany({});
  await Task.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Demo@123', 10);
  const officerPasswordHash = await bcrypt.hash('Officer@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  console.log('Creating Official Demo Logins...');

  // 1. Admin
  const adminUser = await User.create({
    name: 'Ministry Admin (PM-AJAY Directorate)',
    email: 'admin@demo.gov.in',
    phone: '9900000001',
    passwordHash: adminPasswordHash,
    role: 'admin',
    org: 'ministry',
    district: 'Warangal',
    consent: { given: true, at: new Date(), version: '1.0', language: 'en' },
    isSynthetic: true
  });

  // 2. Officers for each district
  const officers = [];
  for (const dist of districts) {
    const off = await User.create({
      name: `District Livelihood Officer (${dist})`,
      email: `officer.${dist.toLowerCase()}@demo.gov.in`,
      phone: `99000000${districts.indexOf(dist) + 2}`,
      passwordHash: officerPasswordHash,
      role: 'officer',
      org: 'department',
      district: dist,
      consent: { given: true, at: new Date(), version: '1.0', language: 'en' },
      isSynthetic: true
    });
    officers.push(off);
  }

  // 3. Demo Beneficiary
  const demoBeneficiary = await User.create({
    name: 'Lakshmi Goud (Demo Beneficiary)',
    email: 'beneficiary@demo.gov.in',
    phone: '9876543210',
    passwordHash: defaultPasswordHash,
    role: 'beneficiary',
    district: 'Warangal',
    consent: { given: true, at: new Date(), version: '1.0', language: 'te' },
    isSynthetic: true
  });

  await Profile.create({
    user: demoBeneficiary._id,
    language: 'te',
    dialect: 'Telangana Telugu',
    state: 'Telangana',
    district: 'Warangal',
    block: 'Hanamkonda',
    village: 'Gopalpuram',
    familyOccupation: 'Traditional Handloom & Agriculture',
    currentLivelihood: 'Informal daily wage tailoring and vegetable vending',
    employmentPreference: 'either',
    mobilityConstraints: ['Can travel within mandal'],
    incomeGoal: 18000,
    weeklyHours: 35,
    channel: 'kiosk',
    riskScore: 25,
    riskReasons: ['Restricted travel radius'],
    skills: ['sewing_machine_operation', 'hand_embroidery'],
    education: 'Middle School',
    experienceYears: 3,
    isSynthetic: true
  });

  await Placement.create({
    user: demoBeneficiary._id,
    district: 'Warangal',
    courseKey: 'crs_self_employed_tailor',
    status: 'enrolled',
    wage: 0,
    isSynthetic: true
  });

  console.log('Generating 300 Synthetic Beneficiaries across 3 Districts...');
  let beneficiaryCount = 0;

  for (let d = 0; d < districts.length; d++) {
    const dist = districts[d];
    const assigningOfficer = officers[d];

    for (let i = 0; i < 100; i++) {
      beneficiaryCount++;
      const fName = firstNames[(i + d * 13) % firstNames.length];
      const lName = lastNames[(i * 3 + d * 7) % lastNames.length];
      const name = `${fName} ${lName}`;
      const phone = `98${String(10000000 + beneficiaryCount).slice(1)}`;
      const email = `ben.${dist.toLowerCase()}.${i + 1}@synthetic.gov.in`;

      const user = await User.create({
        name,
        email,
        phone,
        passwordHash: defaultPasswordHash,
        role: 'beneficiary',
        district: dist,
        createdBy: assigningOfficer._id,
        consent: {
          given: true,
          at: new Date(Date.now() - (i * 86400000 * 2)),
          version: '1.0',
          language: i % 4 === 0 ? 'hi' : 'te'
        },
        isSynthetic: true
      });

      const skillSet = skillsPool[(i + d) % skillsPool.length];
      const pref = i % 3 === 0 ? 'self' : i % 3 === 1 ? 'wage' : 'either';
      const edu = educationLevels[i % educationLevels.length];
      const mob = mobilityOptions[i % mobilityOptions.length];

      // Calculate risk score
      let riskScore = 0;
      const riskReasons = [];
      if (mob.length > 0) {
        riskScore += 25;
        riskReasons.push('Mobility restriction');
      }
      if (edu === 'None' || edu === 'Primary School') {
        riskScore += 25;
        riskReasons.push('Low formal education');
      }
      if (i % 5 === 0) {
        riskScore += 20;
        riskReasons.push('Financial hardship / irregular income');
      }

      const profile = await Profile.create({
        user: user._id,
        language: i % 4 === 0 ? 'hi' : 'te',
        dialect: 'Telangana Telugu',
        state: 'Telangana',
        district: dist,
        block: `Block-${(i % 5) + 1}`,
        village: `Village-${(i % 12) + 1}`,
        familyOccupation: 'Agriculture and allied services',
        currentLivelihood: i % 4 === 0 ? 'Seasonal farm labour' : 'Unemployed',
        employmentPreference: pref,
        mobilityConstraints: mob,
        incomeGoal: 12000 + (i % 8) * 2000,
        weeklyHours: 30 + (i % 3) * 10,
        channel: ['web', 'kiosk', 'whatsapp', 'ivr'][i % 4],
        riskScore: Math.min(riskScore, 100),
        riskReasons,
        skills: skillSet,
        education: edu,
        experienceYears: i % 6,
        isSynthetic: true
      });

      // Synthetic placement tracking (enrolled, completed, placed, dropped)
      const statuses = ['enrolled', 'completed', 'placed', 'dropped'];
      const status = i % 7 === 0 ? 'dropped' : i % 3 === 0 ? 'placed' : i % 2 === 0 ? 'completed' : 'enrolled';
      const wage = status === 'placed' ? 14000 + (i % 6) * 1500 : 0;
      const employer = status === 'placed' ? `${dist} Skill Enterprises Ltd` : undefined;

      await Placement.create({
        user: user._id,
        district: dist,
        courseKey: 'crs_self_employed_tailor',
        status,
        employer,
        wage,
        at: new Date(Date.now() - (i * 86400000)),
        notes: status === 'dropped' ? 'Dropout due to transport constraints' : 'Regular participation',
        isSynthetic: true
      });
    }
  }

  // Create sample inter-departmental tasks
  console.log('Creating Sample Tasks for District Officers...');
  await Task.create([
    {
      title: 'Mobilize 50 Tailoring candidates for PMKVY Batch in Wardhannapet',
      description: 'Coordinate with local SHG federations and village sarpanch for beneficiary mobilization.',
      assignedOrg: 'department',
      assignedTo: officers[0]._id,
      district: 'Warangal',
      status: 'in_progress',
      priority: 'high',
      dueAt: new Date(Date.now() + 5 * 86400000),
      createdBy: adminUser._id
    },
    {
      title: 'Verify Tribal Artisan Toolkits distribution under PM Vishwakarma',
      description: 'Physical audit and Aadhaar-linked verification of 30 carpentry and masonry beneficiaries in Utnoor.',
      assignedOrg: 'corporation',
      assignedTo: officers[1]._id,
      district: 'Adilabad',
      status: 'open',
      priority: 'urgent',
      dueAt: new Date(Date.now() + 3 * 86400000),
      createdBy: adminUser._id
    },
    {
      title: 'Follow-up with 15 dropout candidates in Nalgonda dairy cluster',
      description: 'Conduct counselor home visits to resolve transport and schedule constraints.',
      assignedOrg: 'training_partner',
      assignedTo: officers[2]._id,
      district: 'Nalgonda',
      status: 'in_progress',
      priority: 'medium',
      dueAt: new Date(Date.now() + 7 * 86400000),
      createdBy: adminUser._id
    }
  ]);

  console.log('\n===========================================================');
  console.log('DEMO SEED COMPLETED SUCCESSFULLY!');
  console.log('Total Synthetic Beneficiaries Seeded: 300 (100 per district)');
  console.log('Demo Logins Available:');
  console.log('1. Admin: admin@demo.gov.in / Admin@123');
  console.log('2. Officer (Warangal): officer.warangal@demo.gov.in / Officer@123');
  console.log('3. Officer (Adilabad): officer.adilabad@demo.gov.in / Officer@123');
  console.log('4. Officer (Nalgonda): officer.nalgonda@demo.gov.in / Officer@123');
  console.log('5. Beneficiary: beneficiary@demo.gov.in (or OTP 123456 with phone 9876543210) / Demo@123');
  console.log('===========================================================\n');
};

if (process.argv[1] && process.argv[1].endsWith('seedDemo.js')) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/livelihood';
  mongoose.connect(MONGO_URI).then(async () => {
    await seedDemo();
    process.exit(0);
  }).catch((err) => {
    console.error('Demo seed error:', err);
    process.exit(1);
  });
}
