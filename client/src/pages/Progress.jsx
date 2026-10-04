/* Progress.jsx: Training journey timeline and milestones for beneficiaries
   PM-AJAY Livelihood Assistant */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SkeletonCard, EmptyState, ReadAloudButton } from '../components.jsx';
import { getPlacements, api } from '../api.js';
import { useLang } from '../lang.js';
import './Progress.css';

const PROGRESS_CONTENT = {
  en: {
    title: 'Active Livelihood Milestones',
    subtitle: 'Real-time tracking of PM-AJAY skilling, assessment, certification, and livelihood placement',
    readAloud: 'Active Livelihood Milestones. Track your progress across skilling, assessment, and placement.',
    stageLabel: 'CURRENT LIVELIHOOD STAGE',
    stages: {
      discovery: 'Trade Skill Discovery',
      'trade skill discovery': 'Trade Skill Discovery',
      enrolled: 'NSQF Training Enrolled',
      certified: 'Skill Assessment Certified',
      placed: 'Livelihood Enterprise Placed'
    },
    browseBtn: 'Browse New Pathways →',
    overallCompletion: 'Overall Milestone Completion',
    completedOf: (done, total, pct) => `${done} of ${total} Completed (${pct}%)`,
    milestonesTitle: 'Welfare & Certification Milestones',
    stepsDone: (done, total) => `${done} of ${total} Steps Done`,
    milestoneNames: {
      'Voice Assessment & Skill Identification': 'Voice Assessment & Skill Identification',
      'NSQF Course Enrollment': 'NSQF Course Enrollment',
      'Practical Assessment & Certification': 'Practical Assessment & Certification',
      'Placement / Enterprise Linkage': 'Placement / Enterprise Linkage'
    },
    statusTexts: {
      completed: 'Completed milestone',
      inProgress: 'Currently in active progression',
      pending: 'Scheduled after preceding milestones'
    },
    badgeTexts: {
      completed: 'Completed',
      inProgress: 'In Progress',
      pending: 'Pending'
    },
    statusMeta: {
      enrolled:  { icon: '📚', color: '#2563eb', bg: '#eff6ff', label: 'Enrolled Courses'  },
      completed: { icon: '🏅', color: '#d97706', bg: '#fffbeb', label: 'Completed Modules' },
      placed:    { icon: '✅', color: '#15803d', bg: '#f0fdf4', label: 'Placed or Linked'  },
      dropped:   { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', label: 'Flagged Follow-ups' }
    },
    timelineTitle: 'Certified Training & Placement Timeline',
    emptyTitle: 'No Active Training Enrollments Yet',
    emptyDesc: 'You have not enrolled in certified skilling programs yet. Explore NSQF accredited courses and government toolkit schemes tailored to your local district demand.',
    emptyAction: 'Explore Tailored Pathways',
    perMonth: '/ month',
    recent: 'Recent'
  },
  hi: {
    title: 'सक्रिय आजीविका मील के पत्थर',
    subtitle: 'PM-AJAY कौशल प्रशिक्षण, मूल्यांकन, प्रमाणन एवं रोजगार का रीयल-टाइम ट्रैकिंग',
    readAloud: 'सक्रिय आजीविका मील के पत्थर। कौशल, मूल्यांकन एवं रोजगार में अपनी प्रगति ट्रैक करें।',
    stageLabel: 'वर्तमान आजीविका चरण',
    stages: {
      discovery: 'व्यावसायिक कौशल खोज',
      'trade skill discovery': 'व्यावसायिक कौशल खोज',
      enrolled: 'NSQF प्रशिक्षण में नामांकित',
      certified: 'कौशल मूल्यांकन प्रमाणित',
      placed: 'आजीविका उद्यम में स्थापित'
    },
    browseBtn: 'नए आजीविका मार्ग देखें →',
    overallCompletion: 'कुल मील का पत्थर पूर्णता',
    completedOf: (done, total, pct) => `${total} में से ${done} पूर्ण (${pct}%)`,
    milestonesTitle: 'कल्याण एवं प्रमाणन मील के पत्थर',
    stepsDone: (done, total) => `${total} में से ${done} चरण पूर्ण`,
    milestoneNames: {
      'Voice Assessment & Skill Identification': 'ध्वनि मूल्यांकन एवं कौशल पहचान',
      'NSQF Course Enrollment': 'NSQF पाठ्यक्रम नामांकन',
      'Practical Assessment & Certification': 'व्यावहारिक मूल्यांकन एवं प्रमाणन',
      'Placement / Enterprise Linkage': 'रोजगार / सूक्ष्म उद्यम लिंकेज'
    },
    statusTexts: {
      completed: 'पूर्ण किया गया मील का पत्थर',
      inProgress: 'वर्तमान में प्रगति पर है',
      pending: 'पिछले चरणों के बाद निर्धारित'
    },
    badgeTexts: {
      completed: 'पूर्ण',
      inProgress: 'प्रगति में',
      pending: 'लंबित'
    },
    statusMeta: {
      enrolled:  { icon: '📚', color: '#2563eb', bg: '#eff6ff', label: 'नामांकित पाठ्यक्रम'  },
      completed: { icon: '🏅', color: '#d97706', bg: '#fffbeb', label: 'पूर्ण किए गए मॉड्यूल' },
      placed:    { icon: '✅', color: '#15803d', bg: '#f0fdf4', label: 'रोजगार / स्थापित'  },
      dropped:   { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', label: 'चिह्नित फॉलो-अप' }
    },
    timelineTitle: 'प्रमाणित प्रशिक्षण एवं प्लेसमेंट समयरेखा',
    emptyTitle: 'अभी तक कोई सक्रिय प्रशिक्षण नामांकन नहीं',
    emptyDesc: 'आपने अभी तक किसी प्रमाणित कौशल कार्यक्रम में नामांकन नहीं किया है। अपने स्थानीय ज़िले की मांग के अनुसार NSQF पाठ्यक्रमों और सरकारी योजनाओं को देखें।',
    emptyAction: 'अनुकूलित आजीविका मार्ग देखें',
    perMonth: '/ माह',
    recent: 'हाल ही में'
  },
  te: {
    title: 'క్రియాశీల జీవనోపాధి మైలురాళ్లు',
    subtitle: 'PM-AJAY నైపుణ్య శిక్షణ, అసెస్‌మెంట్, సర్టిఫికేషన్ మరియు ఉపాధి పురోగతిని ట్రాక్ చేయండి',
    readAloud: 'క్రియాశీల జీవనోపాధి మైలురాళ్లు. నైపుణ్య శిక్షణ, ధృవీకరణ మరియు ఉపాధి పురోగతిని చూడండి.',
    stageLabel: 'ప్రస్తుత జీవనోపాధి దశ',
    stages: {
      discovery: 'నైపుణ్యాల గుర్తింపు దశ',
      'trade skill discovery': 'నైపుణ్యాల గుర్తింపు దశ',
      enrolled: 'NSQF శిక్షణలో చేరారు',
      certified: 'నైపుణ్య ధృవీకరణ పొందారు',
      placed: 'జీవనోపాధి / వ్యాపారంలో అనుసంధానం'
    },
    browseBtn: 'కొత్త అవకాశాలను చూడండి →',
    overallCompletion: 'మొత్తం మైలురాళ్ల పూర్తి శాతం',
    completedOf: (done, total, pct) => `${total} లో ${done} పూర్తయ్యాయి (${pct}%)`,
    milestonesTitle: 'సంక్షేమ & ధృవీకరణ మైలురాళ్లు',
    stepsDone: (done, total) => `${total} లో ${done} దశలు పూర్తయ్యాయి`,
    milestoneNames: {
      'Voice Assessment & Skill Identification': 'వాయిస్ అసెస్‌మెంట్ & నైపుణ్యాల గుర్తింపు',
      'NSQF Course Enrollment': 'NSQF కోర్సు నమోదు',
      'Practical Assessment & Certification': 'ప్రాక్టికల్ అసెస్‌మెంట్ & సర్టిఫికేషన్',
      'Placement / Enterprise Linkage': 'ఉపాధి / సూక్ష్మ వ్యాపార అనుసంధానం'
    },
    statusTexts: {
      completed: 'పూర్తయిన మైలురాయి',
      inProgress: 'ప్రస్తుతం పురోగతిలో ఉంది',
      pending: 'మునుపటి దశల తర్వాత ప్రారంభమవుతుంది'
    },
    badgeTexts: {
      completed: 'పూర్తయింది',
      inProgress: 'పురోగతిలో ఉంది',
      pending: 'వేచి ఉంది'
    },
    statusMeta: {
      enrolled:  { icon: '📚', color: '#2563eb', bg: '#eff6ff', label: 'నమోదైన కోర్సులు'  },
      completed: { icon: '🏅', color: '#d97706', bg: '#fffbeb', label: 'పూర్తయిన మాడ్యూల్స్' },
      placed:    { icon: '✅', color: '#15803d', bg: '#f0fdf4', label: 'ఉపాధి / లింక్ చేయబడింది'  },
      dropped:   { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', label: 'ఫాలో-అప్ అవసరమైనవి' }
    },
    timelineTitle: 'సర్టిఫైడ్ శిక్షణ & ఉపాధి టైమ్‌లైన్',
    emptyTitle: 'ఇంకా యాక్టివ్ శిక్షణా నమోదులు లేవు',
    emptyDesc: 'మీరు ఇంకా గుర్తింపు పొందిన నైపుణ్య శిక్షణ కోర్సులలో నమోదు చేసుకోలేదు. మీ జిల్లా డిమాండ్‌కు అనుగుణంగా NSQF గుర్తింపు పొందిన కోర్సులు మరియు సాధనాల పథకాలను పరిశీలించండి.',
    emptyAction: 'అనుకూలమైన మార్గాలను అన్వేషించండి',
    perMonth: '/ నెల',
    recent: 'ఇటీవల'
  }
};

const formatCourseTitle = (key) => {
  if (!key) return 'Certified Skilling Program';
  return key
    .replace(/^crs_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function TimelineItem({ placement, isLast, t, lang }) {
  const meta = (t.statusMeta && t.statusMeta[placement.status]) || PROGRESS_CONTENT.en.statusMeta[placement.status] || PROGRESS_CONTENT.en.statusMeta.enrolled;
  const date = placement.at ? new Date(placement.at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : t.recent;

  return (
    <div className="timeline-item">
      <div className="timeline-connector">
        <div className="timeline-dot" style={{ borderColor: meta.color, background: meta.bg }}>
          <span aria-hidden="true">{meta.icon}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>
      <div className="timeline-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            {meta.label}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{date}</span>
        </div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          {placement.courseTitle || placement.title || formatCourseTitle(placement.courseKey)}
        </h4>
        {placement.employer && (
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            🏢 {placement.employer}
          </p>
        )}
        {placement.wage > 0 && (
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d', fontWeight: 700 }}>
            💰 ₹{placement.wage.toLocaleString()} {t.perMonth}
          </p>
        )}
        {placement.notes && (
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
            {placement.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export function Progress() {
  const { lang } = useLang();
  const t = PROGRESS_CONTENT[lang] || PROGRESS_CONTENT.en;
  const [placements, setPlacements] = useState([]);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPlacements().catch(() => ({ data: { placements: [] } })),
      api.getProgress().catch(() => ({ journey: null }))
    ]).then(([plRes, progRes]) => {
      setPlacements(plRes?.data?.placements || []);
      setJourney(progRes?.journey || null);
    }).finally(() => setLoading(false));
  }, []);

  const counts = { enrolled: 0, completed: 0, placed: 0, dropped: 0 };
  placements.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });

  const rawMilestones = journey?.milestones?.length > 0 ? journey.milestones : [
    { name: 'Voice Assessment & Skill Identification', status: 'completed' },
    { name: 'NSQF Course Enrollment', status: 'in_progress' },
    { name: 'Practical Assessment & Certification', status: 'pending' },
    { name: 'Placement / Enterprise Linkage', status: 'pending' }
  ];

  const milestones = rawMilestones.map(m => ({
    ...m,
    displayName: t.milestoneNames[m.name] || m.name
  }));

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPct = Math.round((completedCount / milestones.length) * 100);

  const rawStage = (journey?.currentStage || 'discovery').toLowerCase().replace(/_/g, ' ');
  const displayStage = t.stages[rawStage] || t.stages.discovery;

  if (loading) {
    return (
      <div className="progress-root page-enter">
        <SkeletonCard rows={5} />
      </div>
    );
  }

  return (
    <div className="progress-root page-enter">
      {/* Page Header */}
      <div className="progress-header">
        <div>
          <h1 className="progress-header-title">
            <Award size={28} color="#ea580c" />
            {t.title}
          </h1>
          <p className="progress-header-subtitle">
            {t.subtitle}
          </p>
        </div>
        <ReadAloudButton text={t.readAloud} />
      </div>

      {/* Hero Stage Banner */}
      <div className="progress-hero-banner">
        <div className="progress-hero-top">
          <div>
            <div className="progress-stage-label">
              <Sparkles size={14} /> {t.stageLabel}
            </div>
            <h2 className="progress-stage-title" style={{ textTransform: 'capitalize' }}>
              {displayStage}
            </h2>
          </div>
          <Link to="/opportunities" className="progress-hero-btn">
            {t.browseBtn}
          </Link>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-labels">
            <span>{t.overallCompletion}</span>
            <span>{t.completedOf(completedCount, milestones.length, progressPct)}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Welfare & Certification Milestones List */}
      <div className="milestones-card">
        <div className="milestones-header">
          <h3 className="milestones-title">
            <CheckCircle2 size={20} color="#2563eb" /> {t.milestonesTitle}
          </h3>
          <span className="milestones-counter">
            {t.stepsDone(completedCount, milestones.length)}
          </span>
        </div>

        <div className="milestones-list">
          {milestones.map((m, idx) => {
            const isDone = m.status === 'completed';
            const isInProg = m.status === 'in_progress';
            return (
              <div key={idx} className={`milestone-item ${m.status}`}>
                <div className="milestone-icon-wrap">
                  {isDone ? (
                    <CheckCircle2 size={22} color="#16a34a" />
                  ) : isInProg ? (
                    <Clock size={22} color="#d97706" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="milestone-content">
                  <h4 className="milestone-name">{m.displayName}</h4>
                  <div className="milestone-sub">
                    {isDone ? (
                      <span style={{ color: '#15803d', fontWeight: 600 }}>{t.statusTexts.completed}</span>
                    ) : isInProg ? (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>{t.statusTexts.inProgress}</span>
                    ) : (
                      <span>{t.statusTexts.pending}</span>
                    )}
                  </div>
                </div>

                <span className={`milestone-badge ${m.status}`}>
                  {isDone ? t.badgeTexts.completed : isInProg ? t.badgeTexts.inProgress : t.badgeTexts.pending}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="progress-stats-grid">
        {Object.entries(t.statusMeta).map(([key, meta]) => (
          <div key={key} className="progress-stat-card">
            <div className="progress-stat-icon" style={{ background: meta.bg }}>
              <span>{meta.icon}</span>
            </div>
            <div>
              <div className="progress-stat-num" style={{ color: meta.color }}>
                {counts[key]}
              </div>
              <div className="progress-stat-lbl">{meta.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Training & Placement Records Timeline */}
      <div className="timeline-card">
        <h3 className="milestones-title" style={{ marginBottom: '16px' }}>
          <Award size={20} color="#2563eb" /> {t.timelineTitle}
        </h3>
        {placements.length === 0 ? (
          <EmptyState
            title={t.emptyTitle}
            description={t.emptyDesc}
            action={
              <Link to="/opportunities" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> {t.emptyAction}
              </Link>
            }
          />
        ) : (
          <div className="timeline">
            {placements.map((p, i) => (
              <TimelineItem key={p._id || i} placement={p} isLast={i === placements.length - 1} t={t} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;
