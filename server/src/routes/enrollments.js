import express from 'express';
import { EnrollmentApplication } from '../models/EnrollmentApplication.js';
import { Profile } from '../models/Profile.js';
import { Journey } from '../models/Journey.js';
import { Occupation } from '../models/Occupation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { sanitizeString } from '../middleware/security.js';

const router = express.Router();

/**
 * Generate a unique, professional Application ID
 * Format: JP-YYYY-XXXXXX (e.g., JP-2026-004821)
 */
const generateApplicationId = async () => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const candidateId = `JP-${year}-${randomNum}`;
    const exists = await EnrollmentApplication.findOne({ applicationId: candidateId });
    if (!exists) return candidateId;
  }
  return `JP-${year}-${Date.now().toString().slice(-6)}`;
};

/**
 * Default 8-stage timeline for livelihood skilling journey
 */
const buildInitialTimeline = (submittedDate = new Date()) => [
  {
    stage: 'CREATED',
    title: 'Application Created',
    status: 'completed',
    timestamp: submittedDate,
    notes: 'Applicant details prepared and verified'
  },
  {
    stage: 'SUBMITTED',
    title: 'Application Submitted',
    status: 'completed',
    timestamp: submittedDate,
    notes: 'Submitted to district training center'
  },
  {
    stage: 'UNDER_REVIEW',
    title: 'Training Center Review',
    status: 'current',
    timestamp: null,
    notes: 'Training center coordinator is reviewing applicant eligibility and documents'
  },
  {
    stage: 'ACCEPTED',
    title: 'Application Accepted',
    status: 'upcoming',
    timestamp: null,
    notes: 'Batch seat allocated, reporting instructions issued'
  },
  {
    stage: 'TRAINING_STARTED',
    title: 'Training Started',
    status: 'upcoming',
    timestamp: null,
    notes: 'Orientation completed, practical workshop training ongoing'
  },
  {
    stage: 'TRAINING_COMPLETED',
    title: 'Training Completed',
    status: 'upcoming',
    timestamp: null,
    notes: 'Required 360 practical training hours fulfilled'
  },
  {
    stage: 'ASSESSMENT',
    title: 'Practical Assessment',
    status: 'upcoming',
    timestamp: null,
    notes: 'Independent evaluation by Sector Skill Council assessor'
  },
  {
    stage: 'CERTIFICATION',
    title: 'Certification & Placement',
    status: 'upcoming',
    timestamp: null,
    notes: 'Official NSQF digital certificate & placement linkage'
  }
];

// Active statuses that prevent duplicate application for the same course
const ACTIVE_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'ACCEPTED', 'TRAINING_STARTED'];

/**
 * POST /api/enrollments
 * Create a new training enrollment application
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      occupationKey,
      occupationTitle,
      courseKey,
      courseTitle,
      qpCode,
      nsqfLevel,
      durationMonths,
      trainingCenter,
      documents
    } = req.body;

    if (!courseTitle) {
      return res.status(400).json({ error: 'Training course information is required.' });
    }

    const cleanOccKey = sanitizeString(occupationKey, 80) || 'tractor_operator';
    const cleanCourseKey = sanitizeString(courseKey, 100) || cleanOccKey;

    // Check for existing active application for this user and course
    const existingActive = await EnrollmentApplication.findOne({
      user: req.user._id,
      courseKey: cleanCourseKey,
      status: { $in: ACTIVE_STATUSES }
    });

    if (existingActive) {
      return res.status(409).json({
        error: 'You already have an active application for this training program.',
        existingApplication: existingActive
      });
    }

    // Retrieve beneficiary profile for verification
    const profile = await Profile.findOne({ user: req.user._id });
    const beneficiaryName = profile?.name || req.user.name || 'Beneficiary';
    const beneficiaryDistrict = profile?.district || req.user.district || 'Warangal';
    const beneficiaryPhone = profile?.phone || req.user.phone || '';
    const beneficiaryEducation = profile?.education || '12th Standard';
    const beneficiarySkills = Array.isArray(profile?.skills) ? profile.skills : [];

    // Documents check
    const preparedDocs = Array.isArray(documents) && documents.length > 0
      ? documents.map((doc) => ({
          key: sanitizeString(doc.key, 60),
          name: sanitizeString(doc.name, 120),
          status: ['provided', 'missing', 'not_required'].includes(doc.status) ? doc.status : 'missing',
          fileName: sanitizeString(doc.fileName, 200) || undefined,
          fileSize: sanitizeString(doc.fileSize, 50) || undefined,
          uploadedAt: doc.status === 'provided' ? (doc.uploadedAt || new Date()) : undefined,
          notes: sanitizeString(doc.notes, 200) || (doc.status === 'provided' ? 'Uploaded by candidate' : 'Pending upload')
        }))
      : [
          { key: 'aadhaar', name: 'Aadhaar Card', status: 'missing', notes: 'Pending upload by candidate' },
          { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'missing', notes: 'Required for PM-AJAY stipend deposit' },
          { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'For official training identity card' },
          { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'missing', notes: 'School / 10th / 12th certificate proof' }
        ];

    const applicationId = await generateApplicationId();
    const timeline = buildInitialTimeline();

    const application = await EnrollmentApplication.create({
      applicationId,
      user: req.user._id,
      beneficiaryName,
      beneficiaryDistrict,
      beneficiaryPhone,
      beneficiaryEducation,
      beneficiarySkills,
      occupationKey: cleanOccKey,
      occupationTitle: sanitizeString(occupationTitle, 120) || cleanOccKey.replace(/_/g, ' '),
      courseKey: cleanCourseKey,
      courseTitle: sanitizeString(courseTitle, 140),
      qpCode: sanitizeString(qpCode, 60) || 'AGR/Q1101',
      nsqfLevel: Number(nsqfLevel) || 3,
      durationMonths: Number(durationMonths) || 3,
      trainingCenter: {
        id: trainingCenter?.id || 'center_warangal_iti',
        name: trainingCenter?.name || 'Government ITI Warangal (ASCI Accredited)',
        district: trainingCenter?.district || beneficiaryDistrict,
        state: trainingCenter?.state || 'Telangana',
        contact: trainingCenter?.contact || '+91 870 245 9811',
        location: trainingCenter?.location || `${beneficiaryDistrict}, Telangana`
      },
      status: 'SUBMITTED',
      submittedAt: new Date(),
      providerMessage: 'Your application has been received and queued for review.',
      nextAction: 'Wait for the training provider to review your application.',
      documents: preparedDocs,
      timeline,
      orientationDate: '15th of next month, 10:00 AM',
      orientationVenue: `${trainingCenter?.name || 'Government ITI Warangal'}, Main Workshop Block`
    });

    // Sync with User's Journey milestone
    try {
      await Journey.findOneAndUpdate(
        { user: req.user._id },
        {
          $set: {
            currentStage: 'training_enrolled',
            targetOccupation: cleanOccKey,
            enrolledCourse: application.courseTitle
          },
          $addToSet: {
            notes: {
              text: `Submitted enrollment application ${application.applicationId} for ${application.courseTitle}`,
              at: new Date()
            }
          }
        },
        { upsert: true }
      );

      // Update the NSQF Course Enrollment milestone to in_progress
      await Journey.updateOne(
        { user: req.user._id, 'milestones.name': 'NSQF Course Enrollment' },
        { $set: { 'milestones.$.status': 'in_progress' } }
      );
    } catch (jErr) {
      console.warn('Non-fatal: Journey sync error:', jErr.message);
    }

    return res.status(201).json({
      message: 'Enrollment application submitted successfully.',
      application
    });
  } catch (err) {
    console.error('Error submitting enrollment application:', err);
    return res.status(500).json({ error: 'Unable to submit your application right now. Please try again.' });
  }
});

/**
 * Seed realistic applications helper for demo provider dashboard
 */
const seedRealisticApplications = async (fallbackUserId) => {
  const sampleApps = [
    {
      applicationId: 'JP-2026-004821',
      user: fallbackUserId,
      beneficiaryName: 'Ramesh Goud',
      beneficiaryDistrict: 'Warangal',
      beneficiaryPhone: '+91 98765 43210',
      beneficiaryEducation: '12th Standard',
      beneficiarySkills: ['tractor_operation', 'basic_mechanics'],
      occupationKey: 'tractor_operator',
      occupationTitle: 'Tractor and Farm Machinery Operator',
      courseKey: 'tractor_operator',
      courseTitle: 'Tractor & Agricultural Machinery Operation & Maintenance',
      qpCode: 'AGR/Q1101',
      nsqfLevel: 3,
      durationMonths: 3,
      trainingCenter: {
        id: 'center_warangal_iti',
        name: 'Government ITI Warangal (ASCI Accredited)',
        district: 'Warangal',
        state: 'Telangana',
        contact: '+91 870 245 9811',
        location: 'Warangal, Telangana'
      },
      status: 'UNDER_REVIEW',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      providerMessage: 'Training coordinator is validating documents and candidate eligibility.',
      nextAction: 'Wait for training coordinator review.',
      documents: [
        { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'ramesh_aadhaar_front_back.pdf', fileSize: '1.4 MB', uploadedAt: new Date() },
        { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'sbi_warangal_passbook.pdf', fileSize: '850 KB', uploadedAt: new Date() },
        { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'provided', fileName: 'candidate_photo.jpg', fileSize: '320 KB', uploadedAt: new Date() },
        { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: 'intermediate_12th_board.pdf', fileSize: '1.1 MB', uploadedAt: new Date() }
      ],
      timeline: buildInitialTimeline(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
      orientationDate: '15th of next month, 10:00 AM',
      orientationVenue: 'Government ITI Warangal, Main Workshop Block'
    },
    {
      applicationId: 'JP-2026-003914',
      user: fallbackUserId,
      beneficiaryName: 'Kavitha Madan',
      beneficiaryDistrict: 'Warangal',
      beneficiaryPhone: '+91 94401 23899',
      beneficiaryEducation: '10th Standard',
      beneficiarySkills: ['solar_installation', 'electrical_safety'],
      occupationKey: 'solar_technician',
      occupationTitle: 'Solar PV System Installation & Service Technician',
      courseKey: 'solar_technician',
      courseTitle: 'Suryamitra Solar PV Installer & Maintenance Specialist',
      qpCode: 'SGJ/Q0101',
      nsqfLevel: 4,
      durationMonths: 3,
      trainingCenter: {
        id: 'center_warangal_kvk',
        name: 'Krishi Vigyan Kendra Warangal Training Wing',
        district: 'Warangal',
        state: 'Telangana',
        contact: '+91 870 242 1200',
        location: 'Warangal, Telangana'
      },
      status: 'ACTION_REQUIRED',
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      providerMessage: 'The training center coordinator has requested your passport-size photograph.',
      nextAction: 'Please upload your passport-size photograph to proceed.',
      documents: [
        { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'kavitha_aadhaar.pdf', fileSize: '1.2 MB', uploadedAt: new Date() },
        { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'andhra_bank_passbook.pdf', fileSize: '920 KB', uploadedAt: new Date() },
        { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Photograph requested by center coordinator' },
        { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: 'ssc_10th_memo.pdf', fileSize: '980 KB', uploadedAt: new Date() }
      ],
      timeline: buildInitialTimeline(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
      orientationDate: '15th of next month, 10:00 AM',
      orientationVenue: 'KVK Warangal Training Wing, Hall 2'
    },
    {
      applicationId: 'JP-2026-002150',
      user: fallbackUserId,
      beneficiaryName: 'Suresh Kumar',
      beneficiaryDistrict: 'Warangal',
      beneficiaryPhone: '+91 98850 77412',
      beneficiaryEducation: 'ITI / Diploma',
      beneficiarySkills: ['domestic_wiring', 'appliance_repair'],
      occupationKey: 'assistant_electrician',
      occupationTitle: 'Assistant Electrician & Domestic Wireman',
      courseKey: 'assistant_electrician',
      courseTitle: 'Domestic Electrical Wireman & Power Safety Technician',
      qpCode: 'ELE/Q6001',
      nsqfLevel: 3,
      durationMonths: 2,
      trainingCenter: {
        id: 'center_warangal_iti',
        name: 'Government ITI Warangal (ASCI Accredited)',
        district: 'Warangal',
        state: 'Telangana',
        contact: '+91 870 245 9811',
        location: 'Warangal, Telangana'
      },
      status: 'ACCEPTED',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      providerMessage: 'Congratulations! Your enrollment request has been accepted. Seat reserved in upcoming batch.',
      nextAction: 'Attend orientation at Government ITI Warangal on 15th of next month, 10:00 AM.',
      documents: [
        { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'suresh_aadhaar.pdf', fileSize: '1.5 MB', uploadedAt: new Date() },
        { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'bank_of_baroda_passbook.pdf', fileSize: '1.1 MB', uploadedAt: new Date() },
        { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'provided', fileName: 'suresh_photo.jpg', fileSize: '410 KB', uploadedAt: new Date() },
        { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: 'iti_electrical_cert.pdf', fileSize: '1.8 MB', uploadedAt: new Date() }
      ],
      timeline: buildInitialTimeline(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      orientationDate: '15th of next month, 10:00 AM',
      orientationVenue: 'Government ITI Warangal, Electrical Workshop Block B'
    },
    {
      applicationId: 'JP-2026-001099',
      user: fallbackUserId,
      beneficiaryName: 'Lakshmi Bai',
      beneficiaryDistrict: 'Warangal',
      beneficiaryPhone: '+91 97011 55663',
      beneficiaryEducation: '8th Standard',
      beneficiarySkills: ['basic_stitching', 'handloom_weaving'],
      occupationKey: 'sewing_machine_operator',
      occupationTitle: 'Commercial Sewing & Garment Tailoring Specialist',
      courseKey: 'sewing_machine_operator',
      courseTitle: 'Industrial Garment Construction & Advanced Tailoring',
      qpCode: 'AMH/Q0301',
      nsqfLevel: 4,
      durationMonths: 3,
      trainingCenter: {
        id: 'center_warangal_drda',
        name: 'District Rural Development Agency (DRDA) Training Center',
        district: 'Warangal',
        state: 'Telangana',
        contact: '+91 870 257 8890',
        location: 'Warangal, Telangana'
      },
      status: 'SUBMITTED',
      submittedAt: new Date(),
      providerMessage: 'Your application has been received and queued for review.',
      nextAction: 'Wait for the training provider to review your application.',
      documents: [
        { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'lakshmi_aadhaar.pdf', fileSize: '1.3 MB', uploadedAt: new Date() },
        { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'telangana_grameena_bank.pdf', fileSize: '790 KB', uploadedAt: new Date() },
        { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Pending upload by candidate' },
        { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'missing', notes: 'Pending upload by candidate' }
      ],
      timeline: buildInitialTimeline(),
      orientationDate: '15th of next month, 10:00 AM',
      orientationVenue: 'DRDA Training Center, Apparel Hall'
    }
  ];

  for (const app of sampleApps) {
    const exists = await EnrollmentApplication.findOne({ applicationId: app.applicationId });
    if (!exists) {
      await EnrollmentApplication.create(app);
    }
  }
};

/**
 * GET /api/enrollments/my
 * Fetch all applications of the logged in user + active application
 */
router.get('/my', authenticate, async (req, res) => {
  try {
    const applications = await EnrollmentApplication.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Find the latest active application
    const activeApplication = applications.find((app) => ACTIVE_STATUSES.includes(app.status)) || applications[0] || null;

    return res.json({
      applications,
      activeApplication,
      hasActiveApplication: Boolean(activeApplication && ACTIVE_STATUSES.includes(activeApplication.status))
    });
  } catch (err) {
    console.error('Error fetching my enrollments:', err);
    return res.status(500).json({ error: 'Failed to retrieve your training applications.' });
  }
});

/**
 * Demo sample applications for training provider review
 */
const DEMO_APPLICATIONS = [
  {
    applicationId: 'JP-2026-004821',
    courseKey: 'tractor_operator',
    courseTitle: 'Tractor Mechanic & Operator Certification',
    occupationKey: 'tractor_operator',
    providerName: 'Warangal Krishi Vigyan Kendra (KVK)',
    trainingCenter: 'Warangal District Agri-Tech Center, Hunter Road',
    trainingBatch: 'Batch #2026-Q2-AGRI',
    durationWeeks: 8,
    stipendMonthly: 3000,
    status: 'UNDER_REVIEW',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reviewedAt: null,
    providerMessage: 'Application received. Coordinator verifying candidate profile and documents.',
    nextAction: 'Wait for training center coordinator verification.',
    beneficiaryName: 'Ramesh Goud',
    beneficiaryDistrict: 'Warangal Rural',
    beneficiaryPhone: '+91 98480 12345',
    beneficiaryEducation: '10th Standard',
    beneficiarySkills: ['Tractor Driving', 'Basic Machinery Maintenance'],
    documents: [
      { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'ramesh_aadhaar_card.pdf', fileSize: '1.4 MB', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'Verified by applicant' },
      { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'sbi_passbook_scan.pdf', fileSize: '2.1 MB', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'DBT linked account verified' },
      { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Pending upload by candidate' },
      { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: '10th_memo.pdf', fileSize: '850 KB', uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: '10th SSC Memo' }
    ],
    timeline: buildInitialTimeline(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
  },
  {
    applicationId: 'JP-2026-003914',
    courseKey: 'organic_farming',
    courseTitle: 'Organic Farming & Natural Manure Specialist',
    occupationKey: 'organic_farmer',
    providerName: 'District Agriculture Training Institute',
    trainingCenter: 'Subedari Skill Complex, Hanamkonda',
    trainingBatch: 'Batch #2026-Q2-ORG',
    durationWeeks: 6,
    stipendMonthly: 2500,
    status: 'ACTION_REQUIRED',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    providerMessage: 'The training center coordinator has requested your passport-size photograph.',
    nextAction: 'Please upload your passport-size photograph to proceed.',
    beneficiaryName: 'Kavitha Madan',
    beneficiaryDistrict: 'Warangal Urban',
    beneficiaryPhone: '+91 94401 56789',
    beneficiaryEducation: 'Intermediate (12th)',
    beneficiarySkills: ['Crop Cultivation', 'Composting'],
    documents: [
      { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'kavitha_aadhaar.pdf', fileSize: '1.1 MB', uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Uploaded' },
      { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'andhra_bank_passbook.pdf', fileSize: '1.8 MB', uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'DBT Verified' },
      { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Action Required: Training desk requested 4 passport-size photographs' },
      { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: 'intermediate_pass.pdf', fileSize: '950 KB', uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Intermediate certificate' }
    ],
    timeline: buildInitialTimeline(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
  },
  {
    applicationId: 'JP-2026-002180',
    courseKey: 'solar_pump_technician',
    courseTitle: 'Solar Pump Installation & Grid Servicing',
    occupationKey: 'solar_technician',
    providerName: 'National Skill Training Institute (NSTI)',
    trainingCenter: 'NIT Warangal Incubation Center, Kazipet',
    trainingBatch: 'Batch #2026-SOLAR-01',
    durationWeeks: 12,
    stipendMonthly: 3500,
    status: 'ACCEPTED',
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    providerMessage: 'Congratulations! Your enrollment request has been accepted. Seat reserved in upcoming batch.',
    nextAction: 'Attend orientation at Kazipet Center on Monday 9:00 AM with original documents.',
    beneficiaryName: 'Suresh Kumar',
    beneficiaryDistrict: 'Warangal Rural',
    beneficiaryPhone: '+91 99890 33445',
    beneficiaryEducation: 'ITI Electrical',
    beneficiarySkills: ['Basic Wiring', 'Solar Panel Mounting'],
    documents: [
      { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'suresh_aadhaar.pdf', fileSize: '1.2 MB', uploadedAt: new Date(), notes: 'Verified' },
      { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'canara_passbook.pdf', fileSize: '1.6 MB', uploadedAt: new Date(), notes: 'DBT Active' },
      { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'provided', fileName: 'suresh_photo.jpg', fileSize: '320 KB', uploadedAt: new Date(), notes: 'Photo Verified' },
      { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', fileName: 'iti_certificate.pdf', fileSize: '1.5 MB', uploadedAt: new Date(), notes: 'ITI Electrical Trade Certificate' }
    ],
    timeline: [
      { stage: 'CREATED', title: 'Application Created', status: 'completed', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { stage: 'SUBMITTED', title: 'Application Submitted', status: 'completed', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { stage: 'UNDER_REVIEW', title: 'Training Center Review', status: 'completed', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { stage: 'ACCEPTED', title: 'Application Accepted', status: 'completed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { stage: 'TRAINING_STARTED', title: 'Training Started', status: 'current', notes: 'Seat allocated in Batch #2026-SOLAR-01' }
    ]
  },
  {
    applicationId: 'JP-2026-001054',
    courseKey: 'drone_agriculture',
    courseTitle: 'Kisan Drone Pilot & Precision Spraying',
    occupationKey: 'drone_operator',
    providerName: 'Telangana Aviation & Remote Sensing Academy',
    trainingCenter: 'Mamnoor Airstrip Training Facility, Warangal',
    trainingBatch: 'Batch #2026-DRONE-B1',
    durationWeeks: 4,
    stipendMonthly: 4000,
    status: 'REJECTED',
    submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    rejectionReason: 'Candidate does not meet the minimum prerequisite requirement of 12th Standard with Science or ITI certification.',
    providerMessage: 'Candidate does not meet the minimum prerequisite requirement of 12th Standard with Science or ITI certification.',
    nextAction: 'Explore introductory vocational programs or re-apply after completing prerequisite certification.',
    beneficiaryName: 'Lakshmi Bai',
    beneficiaryDistrict: 'Warangal Rural',
    beneficiaryPhone: '+91 91234 56780',
    beneficiaryEducation: '8th Standard',
    beneficiarySkills: ['Farming', 'Field Maintenance'],
    documents: [
      { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', fileName: 'lakshmi_aadhaar.pdf', fileSize: '1.0 MB', uploadedAt: new Date(), notes: 'Verified' },
      { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', fileName: 'bank_passbook.pdf', fileSize: '1.3 MB', uploadedAt: new Date(), notes: 'Verified' },
      { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Missing' },
      { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'missing', notes: 'Prerequisite document missing' }
    ],
    timeline: buildInitialTimeline(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
  }
];

/**
 * GET /api/enrollments/admin/all
 * Retrieve all applications for the training provider / admissions review desk
 */
router.get('/admin/all', optionalAuth, async (req, res) => {
  try {
    let applications = await EnrollmentApplication.find().sort({ updatedAt: -1, createdAt: -1 });

    // Auto-seed demo applications if collection is completely empty
    if (!applications || applications.length === 0) {
      for (const demoApp of DEMO_APPLICATIONS) {
        await EnrollmentApplication.updateOne(
          { applicationId: demoApp.applicationId },
          { $setOnInsert: demoApp },
          { upsert: true }
        );
      }
      applications = await EnrollmentApplication.find().sort({ updatedAt: -1, createdAt: -1 });
    }

    const counts = {
      total: applications.length,
      underReview: applications.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
      actionRequired: applications.filter(a => a.status === 'ACTION_REQUIRED').length,
      accepted: applications.filter(a => ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(a.status)).length,
      rejected: applications.filter(a => a.status === 'REJECTED').length
    };

    return res.json({
      applications,
      counts
    });
  } catch (err) {
    console.error('Error fetching admin applications:', err);
    return res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

/**
 * POST /api/enrollments/admin/seed
 * Seed or reset realistic demo applications for testing
 */
router.post('/admin/seed', optionalAuth, async (req, res) => {
  try {
    for (const demoApp of DEMO_APPLICATIONS) {
      await EnrollmentApplication.updateOne(
        { applicationId: demoApp.applicationId },
        { $set: demoApp },
        { upsert: true }
      );
    }

    return res.json({
      message: 'Demo applications seeded successfully',
      count: DEMO_APPLICATIONS.length
    });
  } catch (err) {
    console.error('Error seeding demo applications:', err);
    return res.status(500).json({ error: 'Failed to seed applications' });
  }
});

/**
 * GET /api/enrollments/:id
 * Fetch a specific application by applicationId or MongoDB _id
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('JP-')
      ? { applicationId: id }
      : { _id: id };

    const application = await EnrollmentApplication.findOne(query);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Security check: ensure beneficiary only accesses their own application (unless admin/officer)
    if (
      application.user.toString() !== req.user._id.toString() &&
      !['officer', 'admin'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'Unauthorized to view this application.' });
    }

    return res.json({ application });
  } catch (err) {
    console.error('Error fetching application:', err);
    return res.status(500).json({ error: 'Failed to retrieve application details.' });
  }
});

/**
 * PATCH /api/enrollments/:id/action
 * Beneficiary fulfills an ACTION_REQUIRED request (e.g. uploading document)
 */
router.patch('/:id/action', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { documentKey, actionNote } = req.body;

    const query = id.startsWith('JP-')
      ? { applicationId: id, user: req.user._id }
      : { _id: id, user: req.user._id };

    const application = await EnrollmentApplication.findOne(query);

    if (!application) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    // Update document status if provided
    if (documentKey && application.documents) {
      const doc = application.documents.find((d) => d.key === documentKey);
      if (doc) {
        doc.status = 'provided';
        doc.fileName = sanitizeString(req.body.fileName, 200) || 'uploaded_document.pdf';
        doc.fileSize = sanitizeString(req.body.fileSize, 50) || '1.2 MB';
        doc.uploadedAt = new Date();
        doc.notes = actionNote || 'Document uploaded and verified by applicant';
      }
    }

    // Move status from ACTION_REQUIRED back to UNDER_REVIEW
    application.status = 'UNDER_REVIEW';
    application.providerMessage = 'Thank you for providing the required document. Your application is being re-reviewed.';
    application.nextAction = 'Wait for the training provider to complete verification.';

    // Update timeline
    const reviewStep = application.timeline.find((t) => t.stage === 'UNDER_REVIEW');
    if (reviewStep) {
      reviewStep.status = 'current';
      reviewStep.notes = 'Under final review after document submission';
    }

    await application.save();

    return res.json({
      message: 'Document submitted successfully. Status updated to Under Review.',
      application
    });
  } catch (err) {
    console.error('Error handling application action:', err);
    return res.status(500).json({ error: 'Failed to update application action.' });
  }
});

/**
 * PATCH /api/enrollments/:id/status
 * Update application status (provider review: Accept, Action Required, Reject, Under Review)
 */
router.patch('/:id/status', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, providerMessage, rejectionReason, requestedDocument } = req.body;

    let application = await EnrollmentApplication.findOne(
      id.startsWith('JP-') ? { applicationId: id } : { _id: id }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    application.status = status;
    application.reviewedAt = new Date();

    if (status === 'ACTION_REQUIRED') {
      application.providerMessage = providerMessage || 'The training center coordinator has requested your passport-size photograph.';
      application.nextAction = 'Please upload requested documents to proceed.';
      if (requestedDocument && application.documents) {
        const doc = application.documents.find((d) => d.key === requestedDocument);
        if (doc) doc.status = 'missing';
      }
    } else if (status === 'ACCEPTED') {
      application.providerMessage = providerMessage || 'Congratulations! Your enrollment request has been accepted. Seat reserved in upcoming batch.';
      application.nextAction = 'Attend the orientation / report to the training center on the batch start date.';
      
      // Update timeline
      application.timeline.forEach((step) => {
        if (['CREATED', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED'].includes(step.stage)) {
          step.status = 'completed';
          if (!step.timestamp) step.timestamp = new Date();
        }
        if (step.stage === 'TRAINING_STARTED') {
          step.status = 'current';
        }
      });

      // Update journey milestone to completed for applicant
      const targetUserId = application.user || req.user?._id;
      if (targetUserId) {
        await Journey.updateOne(
          { user: targetUserId, 'milestones.name': 'NSQF Course Enrollment' },
          { $set: { 'milestones.$.status': 'completed', 'milestones.$.completedAt': new Date() } }
        ).catch(() => {});
      }
    } else if (status === 'REJECTED') {
      application.rejectionReason = rejectionReason || providerMessage || 'Batch seats are currently full for this session.';
      application.providerMessage = application.rejectionReason;
      application.nextAction = 'Explore alternative accredited training programs or next batch dates.';
    } else if (status === 'UNDER_REVIEW') {
      application.providerMessage = providerMessage || 'The training center coordinator is reviewing your application.';
      application.nextAction = 'Wait for the training provider to review your application.';
    } else if (status === 'TRAINING_STARTED') {
      application.providerMessage = 'Your practical training is underway at the training workshop.';
      application.nextAction = 'Maintain 80%+ workshop attendance and complete daily logbooks.';
      application.timeline.forEach((step) => {
        if (['CREATED', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'TRAINING_STARTED'].includes(step.stage)) {
          step.status = 'completed';
        }
        if (step.stage === 'TRAINING_COMPLETED') step.status = 'current';
      });
    }

    await application.save();

    return res.json({
      message: `Status updated to ${status}`,
      application
    });
  } catch (err) {
    console.error('Error updating application status:', err);
    return res.status(500).json({ error: 'Failed to update application status.' });
  }
});

export default router;
