import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import {
  CheckCircle,
  AlertCircle,
  BookOpen,
  Building,
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  UserCheck,
  MapPin,
  Sparkles,
  Clock,
  ShieldCheck,
  PhoneCall,
  Video,
  Briefcase,
  FileCheck,
  ChevronRight
} from 'lucide-react';

export const SkillGaps = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkillGaps(occKey).then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [occKey]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
          {t('common.loading', 'Analyzing competency gaps and livelihood pathways...')}
        </div>
      </div>
    );
  }

  if (!data || !data.occupation) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertCircle size={48} color="var(--status-danger)" style={{ margin: '0 auto 16px auto' }} />
        <h2>{t('common.error', 'Occupation data not found.')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Please return to opportunities and select a valid trade pathway.
        </p>
        <Link to="/opportunities" className="btn btn-primary">
          {t('skillGaps.backToOpps', 'Back to Opportunities')}
        </Link>
      </div>
    );
  }

  const occ = data.occupation;
  const readiness = data.readinessScore || 0;
  const acquired = data.skillsSummary?.acquired || [];
  const missing = data.skillsSummary?.missing || [];
  const required = data.skillsSummary?.required || [...acquired, ...missing];
  const learnFirst = data.skillsSummary?.learnFirst || missing.slice(0, 3);
  const courses = data.recommendedCourses || [];
  const centers = data.nearbyCenters || [];
  const schemes = data.applicableSchemes || [];
  const demand = data.localDemand || {};
  const userProfile = data.userProfile || {};
  const userDistrict = userProfile.district || 'Warangal';

  // Build skill-by-skill detailed analysis list
  const skillAnalysis = required.map((skName) => {
    const isAcquired = acquired.some((s) => s.toLowerCase() === skName.toLowerCase());
    const isLearnFirst = learnFirst.some((s) => s.toLowerCase() === skName.toLowerCase());

    let status = 'gap';
    let currentPct = 20;
    let label = t('skillGaps.gap', 'Gap Required');
    let badgeClass = 'badge-amber';
    let icon = <AlertCircle size={14} color="#d97706" />;

    if (isAcquired) {
      status = 'proficient';
      currentPct = 100;
      label = t('skillGaps.proficient', 'Proficient');
      badgeClass = 'badge-green';
      icon = <CheckCircle size={14} color="#16a34a" />;
    } else if (isLearnFirst) {
      status = 'developing';
      currentPct = 50;
      label = t('skillGaps.developing', 'Developing');
      badgeClass = 'badge-blue';
      icon = <Clock size={14} color="#2563eb" />;
    }

    return {
      name: skName,
      status,
      currentPct,
      requiredPct: 100,
      gapPct: 100 - currentPct,
      label,
      badgeClass,
      icon
    };
  });

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Visual Journey Connection Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
        <Link to="/profile" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>PROFILE</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--primary-700)', fontWeight: 800 }}>SKILL GAP</span>
        <ChevronRight size={14} />
        <Link to={`/training?occ=${occKey}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>TRAINING</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-muted)' }}>PRACTICE</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-muted)' }}>CERTIFICATION</span>
        <ChevronRight size={14} />
        <Link to="/opportunities" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>OPPORTUNITIES</Link>
        <ChevronRight size={14} />
        <Link to={`/roadmap?occ=${occKey}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>ROADMAP</Link>
      </div>

      {/* 1. SKILL GAP OVERVIEW HEADER */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface-card), var(--bg-subtle))', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-amber">{t('dashboard.nsqfLevel', 'NSQF Level')} {occ.nsqfLevel}</span>
              <span className="badge badge-blue">{userDistrict}</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {t('skillGaps.title', 'Skill Gap & Competency Analysis')}: {occ.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {t('skillGaps.subtitle', 'Identify prerequisite skills, course modules, and target readiness score for your chosen trade pathway.')}
            </p>
          </div>

          <div style={{ background: 'var(--surface-subtle)', padding: '16px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', textAlign: 'center', minWidth: '160px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('skillGaps.overallReadiness', 'Overall Trade Readiness')}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: readiness >= 70 ? 'var(--status-success)' : readiness >= 40 ? 'var(--accent-gold)' : 'var(--status-danger)' }}>
              {readiness}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {acquired.length} of {required.length} Competencies Met
            </div>
          </div>
        </div>

        {/* Readiness Meter Bar */}
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            <span>{t('skillGaps.currentLevel', 'Current Level')}: {readiness}%</span>
            <span>{t('skillGaps.requiredLevel', 'Required Level')}: 100%</span>
          </div>
          <div style={{ height: '10px', background: 'var(--border-light)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${readiness}%`,
                background: readiness >= 70 ? 'var(--status-success)' : readiness >= 40 ? 'var(--accent-gold)' : 'var(--primary-600)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. SKILL-BY-SKILL ANALYSIS */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={20} color="var(--primary-600)" /> Skill-by-Skill Competency Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {skillAnalysis.map((item, idx) => (
            <div key={idx} style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                  {item.icon}
                  <span>{item.name.replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('skillGaps.currentLevel', 'Current')}: {item.currentPct}% | {t('skillGaps.requiredLevel', 'Required')}: {item.requiredPct}%
                  </span>
                  <span className={`badge ${item.badgeClass}`} style={{ fontSize: '11px' }}>
                    {item.label}
                  </span>
                </div>
              </div>

              {/* Individual Progress Bar */}
              <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${item.currentPct}%`,
                    background: item.status === 'proficient' ? '#16a34a' : item.status === 'developing' ? '#2563eb' : '#d97706',
                    borderRadius: '9999px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. WHY IS THIS A GAP? */}
      <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertCircle size={20} color="#b45309" /> {t('skillGaps.whyGapTitle', 'Why is this a Skill Gap?')}
        </h2>
        <div style={{ fontSize: '13px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {missing.length > 0 ? (
            missing.map((sk, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7' }}>
                <strong>• {sk.replace(/_/g, ' ')}:</strong>{' '}
                {userProfile.skills && userProfile.skills.length > 0
                  ? `Your profile indicates prior experience in ${userProfile.skills.map((s) => s.replace(/_/g, ' ')).join(', ')}, but no formal certification or verified practical completion for ${sk.replace(/_/g, ' ')}.`
                  : `Additional training or formal evaluation is required to meet Sector Skill Council standards for ${sk.replace(/_/g, ' ')}.`}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px', color: '#15803d' }}>
              ✓ Your verified skills match all core prerequisites for this trade pathway!
            </div>
          )}
        </div>
      </div>

      {/* 4. HOW TO CLOSE THIS GAP (Visual Actionable Stepper Pathway) */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--primary-600)" /> {t('skillGaps.howToCloseTitle', 'Actionable Pathway to Close Gap')}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Step-by-step roadmap to transform your skill gaps into certified trade readiness:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { step: '1', title: t('skillGaps.stepLearn', '1. Learn Theory'), desc: 'Review core domain concepts and safety guidelines.' },
            { step: '2', title: t('skillGaps.stepTrain', '2. Formal Training'), desc: 'Enroll in PM-AJAY sponsored certified skilling modules.' },
            { step: '3', title: t('skillGaps.stepPractice', '3. Practical Lab'), desc: 'Hands-on tool practice in accredited training centers.' },
            { step: '4', title: t('skillGaps.stepExperience', '4. On-Job Experience'), desc: 'Participate in local apprenticeships or workshops.' },
            { step: '5', title: t('skillGaps.stepCertify', '5. Assessment & Certification'), desc: 'Sector Skill Council evaluation and NSQF digital badge.' },
            { step: '6', title: t('skillGaps.stepReady', '6. Opportunity Ready'), desc: 'Direct wage placement or micro-enterprise grant approval.' }
          ].map((st, i) => (
            <div key={i} style={{ padding: '14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                  {st.step}
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{st.title}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {st.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WHERE CAN I LEARN? */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={20} color="var(--primary-600)" /> {t('skillGaps.whereToLearnTitle', 'Where Can I Learn?')}
        </h2>

        {centers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {centers.map((center, idx) => (
              <div key={idx} style={{ padding: '14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {center.name}
                </strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <MapPin size={12} /> {center.district}, {center.state}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginTop: '6px' }}>
                  <PhoneCall size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {center.contact || 'District Helpline: 1800-123-AJAY'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            {t('skillGaps.noCenters', 'No nearby training centers are currently listed for this district.')}
          </div>
        )}
      </div>

      {/* 6. PRACTICAL LEARNING & SKILL ACTIVITIES */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--primary-600)" /> {t('skillGaps.practicalLearningTitle', 'Practical Learning & Skill Activities')}
        </h2>

        {courses.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map((c) => (
              <div key={c._id || c.key} style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>{c.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Provider: {c.provider} • QP Code: {c.qpCode} • Duration: {c.durationMonths} Months • NSQF Level: {c.nsqfLevel || occ.nsqfLevel}
                  </div>
                  {c.skillsGained && c.skillsGained.length > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {c.skillsGained.map((sg, i) => (
                        <span key={i} className="badge badge-blue" style={{ fontSize: '10px' }}>
                          + {sg.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link to={`/training?occ=${occKey}`} className="btn btn-sm btn-primary">
                  {t('skillGaps.viewTrainingBtn', 'View Certified Training')}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            {t('skillGaps.noCourses', 'No matching prerequisite courses found for this specific trade.')}
          </div>
        )}
      </div>

      {/* 7. WHO CAN I MEET? */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={20} color="var(--primary-600)" /> {t('skillGaps.whoToMeetTitle', 'Who Can I Contact & Meet?')}
        </h2>

        {centers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {centers.map((cnt, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span className="badge badge-amber" style={{ fontSize: '10px', marginBottom: '4px' }}>
                  District Skill Counselor
                </span>
                <strong style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>{cnt.name} Coordinator</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location: {cnt.district}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>
                  Contact: {cnt.contact || '1800-123-AJAY'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            {t('skillGaps.noContacts', 'No relevant contact persons currently available.')}
          </div>
        )}
      </div>

      {/* 8. HANDS-ON EXPERIENCE */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} color="var(--primary-600)" /> {t('skillGaps.handsOnTitle', 'Hands-on Apprenticeship & Workplace Experience')}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Government supported stipends, practical toolkits, and industry exposure:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {schemes.length > 0 ? (
            schemes.map((sch, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <span className="badge badge-green" style={{ fontSize: '10px', marginBottom: '4px' }}>{sch.type || 'Government Subsidy'}</span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0' }}>{sch.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{sch.benefit || sch.eligibilitySummary}</p>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              Practical on-the-job apprenticeship options are coordinated directly at accredited training centers under PM-AJAY GIA guidelines.
            </div>
          )}
        </div>
      </div>

      {/* 9. CERTIFICATION / ASSESSMENT */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--accent-gold)" /> {t('skillGaps.certificationTitle', 'Formal NSQF Assessment & Certification')}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Sector Skill Council Digital Credential</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Certified NSQF Level {occ.nsqfLevel} credential upon completing practical trade assessment.
            </div>
          </div>
          <Link to={`/training?occ=${occKey}`} className="btn btn-primary">
            {t('skillGaps.viewTrainingBtn', 'View Certified Training')}
          </Link>
        </div>
      </div>

      {/* 10. CAREER IMPACT */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderColor: '#bbf7d0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14532d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} color="#16a34a" /> {t('skillGaps.careerImpactTitle', 'Career Impact & Unlocked Opportunities')}
        </h2>
        <p style={{ fontSize: '13px', color: '#166534', marginBottom: '14px' }}>
          Closing this skill gap expands your eligible opportunities in {userDistrict}:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET MONTHLY EARNINGS</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d', margin: '2px 0' }}>
              ₹{occ.incomeMin?.toLocaleString()} - ₹{occ.incomeMax?.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Projected monthly income</div>
          </div>

          <div style={{ padding: '12px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DISTRICT DEMAND LEVEL</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#14532d', margin: '2px 0' }}>
              Level {demand.level || 4} Market Demand
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{demand.notes || 'High employment absorption'}</div>
          </div>
        </div>
      </div>

      {/* 11. ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">
          &larr; {t('skillGaps.backToOpps', 'Back to Opportunities')}
        </Link>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to={`/training?occ=${occKey}`} className="btn btn-secondary">
            {t('skillGaps.viewTrainingBtn', 'View Certified Training')}
          </Link>
          <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">
            {t('skillGaps.viewRoadmapBtn', 'View Career Roadmap')} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillGaps;
