import express from 'express';
import { EnrollmentApplication } from '../models/EnrollmentApplication.js';
import { Profile } from '../models/Profile.js';
import { Journey } from '../models/Journey.js';
import { Occupation } from '../models/Occupation.js';
import { authenticate } from '../middleware/auth.js';
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
 * Update application status (lifecycle progression / simulation for testing all states)
 * Supports: UNDER_REVIEW, ACTION_REQUIRED, ACCEPTED, REJECTED, TRAINING_STARTED, TRAINING_COMPLETED, CERTIFIED
 */
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, providerMessage, rejectionReason, requestedDocument } = req.body;

    const query = id.startsWith('JP-')
      ? { applicationId: id, user: req.user._id }
      : { _id: id, user: req.user._id };

    const application = await EnrollmentApplication.findOne(query);

    if (!application) {
      return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    application.status = status;
    application.reviewedAt = new Date();

    if (status === 'ACTION_REQUIRED') {
      application.providerMessage = providerMessage || 'The training center coordinator has requested your passport-size photograph.';
      application.nextAction = 'Please upload your passport-size photograph to proceed.';
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

      // Update journey milestone to completed
      await Journey.updateOne(
        { user: req.user._id, 'milestones.name': 'NSQF Course Enrollment' },
        { $set: { 'milestones.$.status': 'completed', 'milestones.$.completedAt': new Date() } }
      ).catch(() => {});
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
