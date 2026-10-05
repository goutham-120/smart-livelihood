import React, { useState } from 'react';
import {
  X, CheckCircle, Clock, AlertCircle, FileText, MapPin, Building,
  Calendar, Check, ArrowRight, ShieldCheck, Phone, Navigation, RefreshCw, Upload,
  AlertTriangle, Paperclip, Trash2, FileCheck, Sparkles, FolderUp
} from 'lucide-react';
import { api } from '../api';
import { useLang } from '../lang';

const ENROLLMENT_MODAL_I18N = {
  en: {
    applyTitle: 'Apply for Training',
    applySubtitle: 'Review your training details, attach required documents, and submit your enrollment request',
    trainingDetails: 'TRAINING PROGRAM DETAILS',
    yourDetails: 'YOUR BENEFICIARY DETAILS',
    docsRequired: 'Documents Required for Verification',
    docsSubtitle: 'Upload or attach original copies for district center verification',
    noticeText: 'Before submitting, verify that your information is correct and documents are attached. Submitting sends an official enrollment request to the district training center.',
    cancelBtn: 'Cancel',
    submitBtn: 'Submit Enrollment Request',
    submittingBtn: 'Submitting Request...',
    applicationSubmittedTitle: 'Enrollment Request Submitted',
    appIdLabel: 'Application ID',
    statusLabel: 'Current Status',
    nextActionLabel: 'Next Action',
    timelineTitle: 'Application & Training Milestone Timeline',
    closeBtn: 'Close',
    viewDirections: 'Get Directions',
    callCenter: 'Call Training Center',
    uploadActionBtn: 'Upload Required Document',
    uploadingActionBtn: 'Uploading...',
    simulateTitle: 'Simulation & Testing Controls (Reviewer Sandbox)',
    simulateDesc: 'Test how the beneficiary UI responds across all official application lifecycle stages:',
    duplicateError: 'You already have an active application for this training program.',
    infoUnavailable: 'Information unavailable',
    providedBadge: 'Uploaded',
    missingBadge: 'Not Uploaded',
    notRequiredBadge: 'Not Required',
    chooseFile: 'Choose File',
    changeFile: 'Change',
    removeFile: 'Remove',
    attachDemoDocs: 'Auto-Attach Sample Documents (Demo)',
    clearDocs: 'Clear All',
    fileHint: 'Supports JPG, PNG, PDF up to 5MB',
    docsUploadCount: (uploaded, total) => `${uploaded} of ${total} documents attached`,
    docsMissingNotice: 'You can submit your application now. Any missing documents can be submitted later if requested by the training coordinator.',
    statusMap: {
      DRAFT: 'Draft Application',
      SUBMITTED: 'Application Submitted',
      UNDER_REVIEW: 'Training Center Review',
      ACTION_REQUIRED: 'Action Required',
      ACCEPTED: 'Application Accepted',
      REJECTED: 'Application Not Accepted',
      TRAINING_STARTED: 'Training Started',
      TRAINING_COMPLETED: 'Training Completed',
      ASSESSMENT_PENDING: 'Assessment Pending',
      CERTIFIED: 'Certified & Placed'
    }
  },
  hi: {
    applyTitle: 'प्रशिक्षण हेतु आवेदन करें',
    applySubtitle: 'अपने प्रशिक्षण विवरण की समीक्षा करें, आवश्यक दस्तावेज़ संलग्न करें और आवेदन दर्ज करें',
    trainingDetails: 'प्रशिक्षण कार्यक्रम विवरण',
    yourDetails: 'आपका लाभार्थी विवरण',
    docsRequired: 'सत्यापन हेतु आवश्यक दस्तावेज़',
    docsSubtitle: 'ज़िला प्रशिक्षण केंद्र के सत्यापन हेतु प्रतियां अपलोड या संलग्न करें',
    noticeText: 'जमा करने से पहले जांच लें कि आपकी जानकारी सही है और दस्तावेज़ संलग्न हैं। आवेदन करने पर ज़िला प्रशिक्षण केंद्र को आधिकारिक अनुरोध भेजा जाएगा।',
    cancelBtn: 'रद्द करें',
    submitBtn: 'नामांकन अनुरोध जमा करें',
    submittingBtn: 'अनुरोध दर्ज हो रहा है...',
    applicationSubmittedTitle: 'नामांकन अनुरोध सफलतापूर्वक दर्ज',
    appIdLabel: 'आवेदन संख्या (ID)',
    statusLabel: 'वर्तमान स्थिति',
    nextActionLabel: 'अगली कार्रवाई',
    timelineTitle: 'आवेदन एवं प्रशिक्षण प्रगति समयरेखा',
    closeBtn: 'बंद करें',
    viewDirections: 'दिशा-निर्देश देखें',
    callCenter: 'प्रशिक्षण केंद्र पर कॉल करें',
    uploadActionBtn: 'आवश्यक दस्तावेज़ अपलोड करें',
    uploadingActionBtn: 'अपलोड हो रहा है...',
    simulateTitle: 'सिमुलेशन एवं परीक्षण नियंत्रण (समीक्षक सैंडबॉक्स)',
    simulateDesc: 'जांचें कि विभिन्न आधिकारिक चरणों में लाभार्थी को कैसा इंटरफ़ेस दिखता है:',
    duplicateError: 'इस प्रशिक्षण कार्यक्रम के लिए आपका आवेदन पहले से सक्रिय है।',
    infoUnavailable: 'जानकारी उपलब्ध नहीं',
    providedBadge: 'अपलोड पूर्ण',
    missingBadge: 'अपलोड नहीं',
    notRequiredBadge: 'आवश्यक नहीं',
    chooseFile: 'फ़ाइल चुनें',
    changeFile: 'बदलें',
    removeFile: 'हटाएं',
    attachDemoDocs: 'नमूना दस्तावेज़ स्वतः जोड़ें (डेमो)',
    clearDocs: 'सभी हटाएं',
    fileHint: 'JPG, PNG, या PDF (अधिकतम 5MB)',
    docsUploadCount: (uploaded, total) => `${total} में से ${uploaded} दस्तावेज़ संलग्न`,
    docsMissingNotice: 'आप अभी आवेदन कर सकते हैं। शेष दस्तावेज़ प्रशिक्षण समन्वयक के अनुरोध पर बाद में भी दिए जा सकते हैं।',
    statusMap: {
      DRAFT: 'ड्राफ़्ट आवेदन',
      SUBMITTED: 'आवेदन जमा हो गया',
      UNDER_REVIEW: 'प्रशिक्षण केंद्र समीक्षा',
      ACTION_REQUIRED: 'कार्रवाई आवश्यक',
      ACCEPTED: 'आवेदन स्वीकृत',
      REJECTED: 'आवेदन अस्वीकृत',
      TRAINING_STARTED: 'प्रशिक्षण प्रारंभ',
      TRAINING_COMPLETED: 'प्रशिक्षण पूर्ण',
      ASSESSMENT_PENDING: 'मूल्यांकन लंबित',
      CERTIFIED: 'प्रमाणित एवं स्थापित'
    }
  },
  te: {
    applyTitle: 'శిక్షణ కొరకు దరఖాస్తు చేయండి',
    applySubtitle: 'మీ శిక్షణా వివరాలను పరిశీలించి, అవసరమైన పత్రాలను అప్‌లోడ్ చేసి నమోదు అభ్యర్థనను సమర్పించండి',
    trainingDetails: 'శిక్షణా కార్యక్రమ వివరాలు',
    yourDetails: 'మీ లబ్ధిదారు వివరాలు',
    docsRequired: 'ధృవీకరణ కొరకు అవసరమైన పత్రాలు',
    docsSubtitle: 'జిల్లా శిక్షణ కేంద్రం ధృవీకరణ కొరకు ఒరిజినల్ లేదా స్కాన్ పత్రాలను అప్‌లోడ్ చేయండి',
    noticeText: 'సమర్పించే ముందు మీ సమాచారం సరైనదేనని నిర్ధారించుకోండి. దరఖాస్తు చేయడంతో జిల్లా కేంద్రానికి అధికారిక అభ్యర్థన పంపబడుతుంది.',
    cancelBtn: 'రద్దు చేయి',
    submitBtn: 'నమోదు అభ్యర్థనను సమర్పించండి',
    submittingBtn: 'సమర్పిస్తోంది...',
    applicationSubmittedTitle: 'నమోదు అభ్యర్థన సమర్పించబడింది',
    appIdLabel: 'దరఖాస్తు సంఖ్య (ID)',
    statusLabel: 'ప్రస్తుత స్థితి',
    nextActionLabel: 'తదుపరి చర్య',
    timelineTitle: 'దరఖాస్తు & శిక్షణ పురోగతి కాలక్రమం',
    closeBtn: 'మూసివేయి',
    viewDirections: 'రూట్ మ్యాప్ పొందండి',
    callCenter: 'శిక్షణ కేంద్రానికి కాల్ చేయండి',
    uploadActionBtn: 'అవసరమైన పత్రాన్ని అప్‌లోడ్ చేయండి',
    uploadingActionBtn: 'అప్‌లోడ్ అవుతోంది...',
    simulateTitle: 'సిమ్యులేషన్ నియంత్రణలు (పరిశీలన కొరకు)',
    simulateDesc: 'వివిధ అధికారిక దశలలో లబ్ధిదారునికి ఎలా కనిపిస్తుందో పరీక్షించండి:',
    duplicateError: 'ఈ శిక్షణ కొరకు మీ దరఖాస్తు ఇప్పటికే సక్రియంగా ఉంది.',
    infoUnavailable: 'సమాచారం అందుబాటులో లేదు',
    providedBadge: 'అప్‌లోడ్ అయింది',
    missingBadge: 'అప్‌లోడ్ కాలేదు',
    notRequiredBadge: 'అవసరం లేదు',
    chooseFile: 'ఫైల్ ఎంచుకోండి',
    changeFile: 'మార్చు',
    removeFile: 'తొలగించు',
    attachDemoDocs: 'నమూనా పత్రాలను జతచేయి (డెమో)',
    clearDocs: 'అన్నీ తొలగించు',
    fileHint: 'JPG, PNG, లేదా PDF (గరిష్టంగా 5MB)',
    docsUploadCount: (uploaded, total) => `${total} లో ${uploaded} పత్రాలు జతచేయబడ్డాయి`,
    docsMissingNotice: 'మీరు ఇప్పుడే దరఖాస్తు చేసుకోవచ్చు. మిగిలిన పత్రాలను కేంద్ర కోఆర్డినేటర్ కోరినప్పుడు తర్వాత సమర్పించవచ్చు.',
    statusMap: {
      DRAFT: 'డ్రాఫ్ట్ దరఖాస్తు',
      SUBMITTED: 'దరఖాస్తు సమర్పించబడింది',
      UNDER_REVIEW: 'కేంద్రం పరిశీలనలో ఉంది',
      ACTION_REQUIRED: 'చర్య అవసరం',
      ACCEPTED: 'దరఖాస్తు ఆమోదించబడింది',
      REJECTED: 'దరఖాస్తు తిరస్కరించబడింది',
      TRAINING_STARTED: 'శిక్షణ ప్రారంభమైంది',
      TRAINING_COMPLETED: 'శిక్షణ పూర్తయింది',
      ASSESSMENT_PENDING: 'పరీక్ష పెండింగ్‌లో ఉంది',
      CERTIFIED: 'సర్టిఫైడ్ & ఉపాధి'
    }
  }
};

export const EnrollmentModal = ({
  isOpen,
  onClose,
  initialMode = 'apply', // 'apply' | 'view'
  courseInfo,
  trainingCenter,
  beneficiaryProfile,
  existingApplication,
  onApplicationCreated,
  onApplicationUpdated
}) => {
  const { lang } = useLang();
  const t = ENROLLMENT_MODAL_I18N[lang] || ENROLLMENT_MODAL_I18N.en;

  const [mode, setMode] = useState(initialMode);
  const [currentApp, setCurrentApp] = useState(existingApplication || null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const bName = beneficiaryProfile?.name || 'Venkat';
  const bDistrict = beneficiaryProfile?.district || 'Warangal';
  const bState = beneficiaryProfile?.state || 'Telangana';
  const bEducation = beneficiaryProfile?.education || '12th Standard';
  const bSkills = beneficiaryProfile?.skills || ['Farming', 'Farm machinery', 'Pump maintenance'];

  const courseTitle = courseInfo?.title || 'Tractor Mechanic and Operator Training';
  const qpCode = courseInfo?.qpCode || 'AGR/Q1101';
  const nsqfLevel = courseInfo?.nsqfLevel || 3;
  const durationMonths = courseInfo?.durationMonths || 3;
  const centerName = trainingCenter?.name || 'Government ITI Warangal (ASCI Accredited)';
  const centerLocation = `${trainingCenter?.district || bDistrict}, ${trainingCenter?.state || bState}`;
  const centerContact = trainingCenter?.contact || '+91 870 245 9811';

  // State for interactive document uploads
  const [documentsList, setDocumentsList] = useState([
    {
      key: 'aadhaar',
      name: 'Aadhaar Card',
      detail: 'Proof of Identity (UIDAI biometric registration on Skill India)',
      status: 'missing',
      fileName: '',
      fileSize: '',
      notes: ''
    },
    {
      key: 'bank_passbook',
      name: 'Bank Passbook / DBT Linkage',
      detail: 'Required for direct stipend credit and government DBT grant',
      status: 'missing',
      fileName: '',
      fileSize: '',
      notes: ''
    },
    {
      key: 'passport_photo',
      name: 'Passport-size Photographs (4)',
      detail: 'Required for official training center badge & admission record',
      status: 'missing',
      fileName: '',
      fileSize: '',
      notes: ''
    },
    {
      key: 'education_certificate',
      name: 'Educational Certificate (10th/12th/School)',
      detail: `Proof of minimum school qualification (${bEducation || '10th/12th Standard'})`,
      status: 'missing',
      fileName: '',
      fileSize: '',
      notes: ''
    }
  ]);

  // Sync mode and existing app
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  React.useEffect(() => {
    if (existingApplication) {
      setCurrentApp(existingApplication);
    }
  }, [existingApplication]);

  if (!isOpen) return null;

  // Handle uploading a document
  const handleDocFileUpload = (docKey, event) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setDocumentsList((prev) =>
      prev.map((doc) => {
        if (doc.key === docKey) {
          return {
            ...doc,
            status: 'provided',
            fileName: file.name,
            fileSize: formattedSize,
            notes: `Attached by candidate (${formattedSize})`
          };
        }
        return doc;
      })
    );
  };

  // Remove uploaded document
  const handleRemoveDoc = (docKey) => {
    setDocumentsList((prev) =>
      prev.map((doc) => {
        if (doc.key === docKey) {
          return {
            ...doc,
            status: 'missing',
            fileName: '',
            fileSize: '',
            notes: ''
          };
        }
        return doc;
      })
    );
  };

  // Quick helper: Attach sample verified demo documents
  const handleAttachDemoDocs = () => {
    setDocumentsList([
      {
        key: 'aadhaar',
        name: 'Aadhaar Card',
        detail: 'Proof of Identity (UIDAI biometric registration on Skill India)',
        status: 'provided',
        fileName: 'aadhaar_card_front_back.pdf',
        fileSize: '1.4 MB',
        notes: 'Verified via DigiLocker / e-Aadhaar'
      },
      {
        key: 'bank_passbook',
        name: 'Bank Passbook / DBT Linkage',
        detail: 'Required for direct stipend credit and government DBT grant',
        status: 'provided',
        fileName: 'sbi_bank_passbook_scan.pdf',
        fileSize: '820 KB',
        notes: 'Aadhaar DBT linked account'
      },
      {
        key: 'passport_photo',
        name: 'Passport-size Photographs (4)',
        detail: 'Required for official training center badge & admission record',
        status: 'provided',
        fileName: 'passport_photo_candidate.jpg',
        fileSize: '340 KB',
        notes: 'Recent candidate portrait photo'
      },
      {
        key: 'education_certificate',
        name: 'Educational Certificate (10th/12th/School)',
        detail: `Proof of minimum school qualification (${bEducation || '10th/12th Standard'})`,
        status: 'provided',
        fileName: 'intermediate_12th_certificate.pdf',
        fileSize: '1.1 MB',
        notes: 'Board of Intermediate Education certificate'
      }
    ]);
  };

  // Clear all attached documents to test blank/missing state
  const handleClearDocs = () => {
    setDocumentsList((prev) =>
      prev.map((d) => ({
        ...d,
        status: 'missing',
        fileName: '',
        fileSize: '',
        notes: ''
      }))
    );
  };

  const uploadedCount = documentsList.filter((d) => d.status === 'provided').length;

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        occupationKey: courseInfo?.occupationKey || 'tractor_operator',
        occupationTitle: courseInfo?.occupationTitle || courseTitle,
        courseKey: courseInfo?.key || courseInfo?.courseKey || courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        courseTitle,
        qpCode,
        nsqfLevel,
        durationMonths,
        trainingCenter: {
          id: trainingCenter?.id || 'center_warangal_iti',
          name: centerName,
          district: trainingCenter?.district || bDistrict,
          state: trainingCenter?.state || bState,
          contact: centerContact,
          location: centerLocation
        },
        documents: documentsList
      };

      const res = await api.createEnrollment(payload);
      if (res?.application) {
        setCurrentApp(res.application);
        setMode('view');
        if (onApplicationCreated) {
          onApplicationCreated(res.application);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMsg(t.duplicateError);
        if (err.response?.data?.existingApplication) {
          setCurrentApp(err.response.data.existingApplication);
        }
      } else {
        setErrorMsg(err.response?.data?.error || 'Unable to submit your application right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateStatus = async (targetStatus, customMsg) => {
    if (!currentApp?.applicationId) return;
    setActionLoading(true);
    try {
      const res = await api.updateEnrollmentStatus(currentApp.applicationId, {
        status: targetStatus,
        providerMessage: customMsg
      });
      if (res?.application) {
        setCurrentApp(res.application);
        if (onApplicationUpdated) onApplicationUpdated(res.application);
      }
    } catch (err) {
      console.error('Failed to simulate status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionUpload = async (docKey = 'passport_photo', file = null) => {
    if (!currentApp?.applicationId) return;
    setActionLoading(true);
    try {
      const fileName = file ? file.name : 'passport_photo_candidate.jpg';
      const fileSize = file
        ? (file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`)
        : '340 KB';

      const res = await api.submitEnrollmentAction(currentApp.applicationId, {
        documentKey: docKey,
        fileName,
        fileSize,
        actionNote: 'Photograph uploaded and verified by applicant'
      });
      if (res?.application) {
        setCurrentApp(res.application);
        if (onApplicationUpdated) onApplicationUpdated(res.application);
      }
    } catch (err) {
      console.error('Failed to submit action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="badge badge-amber" style={{ fontSize: '13px', fontWeight: 800 }}>🟠 {t.statusMap[status] || status}</span>;
      case 'ACTION_REQUIRED':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '13px', fontWeight: 800 }}>⚠ {t.statusMap[status] || status}</span>;
      case 'ACCEPTED':
        return <span className="badge badge-green" style={{ fontSize: '13px', fontWeight: 800 }}>🎉 {t.statusMap[status] || status}</span>;
      case 'REJECTED':
        return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '13px', fontWeight: 800 }}>❌ {t.statusMap[status] || status}</span>;
      case 'TRAINING_STARTED':
      case 'TRAINING_COMPLETED':
      case 'CERTIFIED':
        return <span className="badge badge-blue" style={{ fontSize: '13px', fontWeight: 800 }}>✓ {t.statusMap[status] || status}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(79, 55, 40, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'var(--surface-card)',
          borderColor: 'var(--border-warm)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'var(--surface-subtle)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-main)'
          }}
        >
          <X size={20} />
        </button>

        {/* ========================================================================= */}
        {/* MODE 1: APPLY CONFIRMATION MODAL                                          */}
        {/* ========================================================================= */}
        {mode === 'apply' && (
          <div>
            <div style={{ paddingRight: '40px', marginBottom: '20px' }}>
              <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                PM-AJAY GIA Skilling
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 6px 0' }}>
                {t.applyTitle}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                {t.applySubtitle}
              </p>
            </div>

            {errorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <div style={{ flex: 1 }}>{errorMsg}</div>
                {currentApp && (
                  <button
                    onClick={() => setMode('view')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    View Existing
                  </button>
                )}
              </div>
            )}

            {/* TRAINING PROGRAM DETAILS */}
            <div style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-700)', letterSpacing: '0.5px', marginBottom: '8px' }}>
                {t.trainingDetails}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                {courseTitle}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Qualification:</span>
                  <strong>{qpCode} — NSQF Level {nsqfLevel}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Training Center:</span>
                  <strong>{centerName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Location:</span>
                  <strong>{centerLocation}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Duration:</span>
                  <strong>{durationMonths} Months (360 Hours Practical)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Course Fee:</span>
                  <strong style={{ color: 'var(--status-success)' }}>₹0 (100% Free Govt. Grant)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Next Batch:</span>
                  <strong style={{ color: 'var(--primary-800)' }}>15th of next month</strong>
                </div>
              </div>
            </div>

            {/* BENEFICIARY DETAILS */}
            <div style={{ background: '#fff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-700)', letterSpacing: '0.5px', marginBottom: '8px' }}>
                {t.yourDetails}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '13px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Name:</span>
                  <strong>{bName || t.infoUnavailable}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Education:</span>
                  <strong>{bEducation || t.infoUnavailable}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Location:</span>
                  <strong>{bDistrict ? `${bDistrict}, ${bState}` : t.infoUnavailable}</strong>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', marginBottom: '4px' }}>Relevant Skills:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {bSkills && bSkills.length > 0 ? (
                    bSkills.map((sk, idx) => (
                      <span key={idx} className="badge badge-amber" style={{ fontSize: '11px' }}>
                        • {sk}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.infoUnavailable}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* INTERACTIVE DOCUMENTS UPLOAD SPACE                                        */}
            {/* ========================================================================= */}
            <div style={{ background: '#FEFCF6', padding: '18px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-warm)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={18} color="var(--primary-600)" /> {t.docsRequired}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.docsSubtitle}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={uploadedCount === documentsList.length ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: '11px', fontWeight: 800 }}>
                    {t.docsUploadCount(uploadedCount, documentsList.length)}
                  </span>
                  <button
                    type="button"
                    onClick={handleAttachDemoDocs}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--primary-600)', color: 'var(--primary-700)' }}
                    title="Quickly attach sample verified files for demonstration"
                  >
                    <Sparkles size={12} /> {t.attachDemoDocs}
                  </button>
                  {uploadedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearDocs}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: '4px 6px' }}
                    >
                      {t.clearDocs}
                    </button>
                  )}
                </div>
              </div>

              {/* DOCUMENT CARDS WITH FILE UPLOADERS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {documentsList.map((doc) => {
                  const isUploaded = doc.status === 'provided';

                  return (
                    <div
                      key={doc.key}
                      style={{
                        padding: '12px 14px',
                        background: isUploaded ? '#f0fdf4' : '#fff',
                        borderRadius: 'var(--radius-sm)',
                        border: isUploaded ? '1px solid #86efac' : '1px solid var(--border-warm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isUploaded ? (
                              <CheckCircle size={16} color="var(--status-success)" />
                            ) : (
                              <AlertTriangle size={16} color="#d97706" />
                            )}
                            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{doc.name}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', marginLeft: '22px' }}>
                            {doc.detail}
                          </div>
                        </div>

                        {/* UPLOAD STATUS BADGE */}
                        <span
                          className={isUploaded ? 'badge badge-green' : 'badge badge-amber'}
                          style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                        >
                          {isUploaded ? `✓ ${t.providedBadge}` : `⚠ ${t.missingBadge}`}
                        </span>
                      </div>

                      {/* UPLOAD CONTROLS OR ATTACHED FILE METADATA */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: isUploaded ? '#ffffff' : 'var(--surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginTop: '2px' }}>
                        {isUploaded ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                            <Paperclip size={14} color="var(--primary-600)" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                              {doc.fileName || 'document_scan.pdf'}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              ({doc.fileSize || '1.2 MB'})
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            📄 {t.fileHint}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* HIDDEN FILE INPUT */}
                          <input
                            type="file"
                            id={`file-input-${doc.key}`}
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload(doc.key, e)}
                            style={{ display: 'none' }}
                          />

                          {/* ACTION BUTTON */}
                          <label
                            htmlFor={`file-input-${doc.key}`}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '11px',
                              padding: '5px 12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginBottom: 0
                            }}
                          >
                            <Upload size={12} /> {isUploaded ? t.changeFile : t.chooseFile}
                          </label>

                          {isUploaded && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(doc.key)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '11px',
                                padding: '5px 10px',
                                color: '#dc2626',
                                borderColor: '#fca5a5',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                              title={t.removeFile}
                            >
                              <Trash2 size={12} /> {t.removeFile}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {uploadedCount < documentsList.length && (
                <div style={{ fontSize: '11px', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: '12px' }}>
                  ℹ️ {t.docsMissingNotice}
                </div>
              )}
            </div>

            {/* NOTICE */}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              ℹ️ {t.noticeText}
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '10px 20px' }}
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '10px 24px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spin" /> {t.submittingBtn}
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> {t.submitBtn}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: APPLICATION STATUS & TRACKING VIEW                                */}
        {/* ========================================================================= */}
        {mode === 'view' && currentApp && (
          <div>
            <div style={{ paddingRight: '40px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span className="badge badge-amber" style={{ fontSize: '12px', fontWeight: 800 }}>
                  {t.appIdLabel}: {currentApp.applicationId}
                </span>
                {getStatusBadge(currentApp.status)}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 4px 0' }}>
                {currentApp.courseTitle}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {currentApp.trainingCenter?.name} • Submitted on {new Date(currentApp.submittedAt || currentApp.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* STATUS ALERT & NEXT ACTION CARD */}
            <div
              style={{
                background:
                  currentApp.status === 'ACCEPTED'
                    ? '#f0fdf4'
                    : currentApp.status === 'ACTION_REQUIRED'
                    ? '#fffbeb'
                    : currentApp.status === 'REJECTED'
                    ? '#fef2f2'
                    : 'var(--surface-subtle)',
                border:
                  currentApp.status === 'ACCEPTED'
                    ? '2px solid #86efac'
                    : currentApp.status === 'ACTION_REQUIRED'
                    ? '2px solid #fde68a'
                    : currentApp.status === 'REJECTED'
                    ? '2px solid #fca5a5'
                    : '1px solid var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>
                  {currentApp.status === 'ACCEPTED' ? '🎉' : currentApp.status === 'ACTION_REQUIRED' ? '⚠' : currentApp.status === 'REJECTED' ? '❌' : '🟠'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {t.nextActionLabel}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {currentApp.nextAction || 'Wait for the training provider to review your application.'}
                  </div>

                  {currentApp.providerMessage && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '10px' }}>
                      "{currentApp.providerMessage}"
                    </div>
                  )}

                  {/* ACTION REQUIRED: BENEFICIARY ACTION BUTTON */}
                  {currentApp.status === 'ACTION_REQUIRED' && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="file"
                        id="action-required-upload"
                        accept="image/*,.pdf"
                        onChange={(e) => handleActionUpload('passport_photo', e.target.files?.[0])}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="action-required-upload"
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer', marginBottom: 0 }}
                      >
                        <Upload size={14} /> {actionLoading ? t.uploadingActionBtn : t.uploadActionBtn}
                      </label>
                    </div>
                  )}

                  {/* ACCEPTED: ORIENTATION DETAILS */}
                  {currentApp.status === 'ACCEPTED' && (
                    <div style={{ marginTop: '10px', background: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📅 <strong>Orientation / Reporting Date:</strong> {currentApp.orientationDate || '15th of next month, 10:00 AM'}</div>
                      <div>📍 <strong>Venue:</strong> {currentApp.orientationVenue || `${currentApp.trainingCenter?.name}, Main Workshop Block`}</div>
                      <div>📞 <strong>Coordinator Contact:</strong> {currentApp.trainingCenter?.contact}</div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentApp.trainingCenter?.name + ' ' + currentApp.trainingCenter?.district)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Navigation size={12} /> {t.viewDirections}
                        </a>
                        <a
                          href={`tel:${currentApp.trainingCenter?.contact}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Phone size={12} /> {t.callCenter}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* REJECTED: WHAT CAN YOU DO NEXT? */}
                  {currentApp.status === 'REJECTED' && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a href="/opportunities" className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
                        Explore Other Opportunities
                      </a>
                      <a href="/training" className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>
                        Browse Alternative Courses
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 8-STAGE TIMELINE */}
            <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--primary-600)" /> {t.timelineTitle}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(currentApp.timeline || []).map((step, idx) => {
                  const isDone = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* Timeline Dot */}
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: '2px',
                          background: isDone ? '#16a34a' : isCurrent ? 'var(--primary-600)' : '#e2e8f0',
                          color: isDone || isCurrent ? '#fff' : '#64748b',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(202, 102, 3, 0.2)' : 'none'
                        }}
                      >
                        {isDone ? '✓' : isCurrent ? '●' : '○'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: isCurrent ? 800 : isDone ? 700 : 500, color: isCurrent ? 'var(--primary-700)' : isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {step.title}
                          </span>
                          <span className={isDone ? 'badge badge-green' : isCurrent ? 'badge badge-amber' : 'badge'} style={{ fontSize: '10px' }}>
                            {isDone ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                          </span>
                        </div>
                        {step.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {step.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DOCUMENTS STATUS & UPLOAD IN TRACKING MODE */}
            <div style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={16} color="var(--primary-600)" /> Verified Documents for Training Enrollment
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(currentApp.documents || []).map((doc, idx) => {
                  const isProvided = doc.status === 'provided';
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        border: isProvided ? '1px solid #bbf7d0' : '1px solid #fed7aa'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isProvided ? <Check size={14} color="#16a34a" /> : <AlertTriangle size={14} color="#d97706" />}
                          <strong>{doc.name}</strong>
                        </div>
                        {doc.fileName && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', marginLeft: '20px' }}>
                            📎 {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={isProvided ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: '10px', fontWeight: 700 }}>
                          {isProvided ? `✓ ${t.providedBadge}` : `⚠ ${t.missingBadge}`}
                        </span>

                        {!isProvided && (
                          <>
                            <input
                              type="file"
                              id={`upload-tracking-${doc.key}`}
                              accept="image/*,.pdf"
                              onChange={(e) => handleActionUpload(doc.key, e.target.files?.[0])}
                              style={{ display: 'none' }}
                            />
                            <label
                              htmlFor={`upload-tracking-${doc.key}`}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '10px', padding: '3px 8px', fontWeight: 700, cursor: 'pointer', marginBottom: 0 }}
                            >
                              <Upload size={10} /> Upload
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BENEFICIARY APPLICATION INFO CALLOUT */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ℹ️ Official status updates, document requests, and batch seat confirmations are issued by the accredited training center.
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '10px 24px', fontWeight: 700 }}
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentModal;
