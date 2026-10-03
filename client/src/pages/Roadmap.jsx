import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import {
  Clock, ArrowRight, MapPin, Building, IndianRupee, Award, Layers,
  Check, Sparkles, CheckCircle2, Circle
} from 'lucide-react';
import './Roadmap.css';

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\b([a-z0-9]+(?:_[a-z0-9]+)+)\b/gi, (match) => {
    return match.replace(/^crs_/, '').replace(/_/g, ' ');
  });
};

export const Roadmap = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Completed steps tracking (persistable in localStorage per occupation)
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    api.getRoadmap(occKey).then((res) => {
      setData(res);
      const stepsList = res?.roadmap?.steps || [];
      
      // Initialize completed steps from localStorage or default to step 1 (index 0)
      try {
        const stored = localStorage.getItem(`pmajay_roadmap_completed_${occKey}`);
        if (stored) {
          setCompletedSteps(JSON.parse(stored));
        } else if (stepsList.length > 0) {
          // Default: first step is completed if status indicates or default index 0
          const initialCompleted = [];
          stepsList.forEach((s, idx) => {
            if (s.status === 'completed' || s.status === 'done') {
              initialCompleted.push(idx);
            }
          });
          setCompletedSteps(initialCompleted.length > 0 ? initialCompleted : [0]);
        }
      } catch (e) {
        setCompletedSteps([0]);
      }

      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [occKey]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Building personalized career roadmap...
        </div>
      </div>
    );
  }

  const steps = data?.roadmap?.steps || [];
  const occupation = data?.occupation || {};
  const centers = data?.nearbyCenters || [];
  const baseReadiness = data?.readinessScore !== undefined ? Number(data.readinessScore) : 0;
  const totalMonths = data?.roadmap?.totalEstimatedMonths || 5;

  // Determine step statuses dynamically based on completion state
  const getStepStatus = (index) => {
    if (completedSteps.includes(index)) return 'completed';
    const firstUncompletedIndex = steps.findIndex((_, i) => !completedSteps.includes(i));
    if (index === firstUncompletedIndex) return 'current';
    return 'upcoming';
  };

  const currentStepIndex = steps.findIndex((_, i) => !completedSteps.includes(i));
  const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;
  const allCompleted = steps.length > 0 && completedSteps.length === steps.length;

  // Completion calculation
  const completionRatio = steps.length > 0 ? completedSteps.length / steps.length : 0;
  const dynamicReadiness = Math.min(100, Math.round(baseReadiness + completionRatio * (100 - baseReadiness)));
  const progressPct = Math.round(completionRatio * 100);

  const handleMarkCompleted = () => {
    if (currentStepIndex === -1) return;
    const updated = [...completedSteps, currentStepIndex];
    setCompletedSteps(updated);
    try {
      localStorage.setItem(`pmajay_roadmap_completed_${occKey}`, JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="page-container roadmap-page">
      {/* Page Header */}
      <div>
        <h1 className="roadmap-header-title">Livelihood & Skilling Roadmap</h1>
        <p className="roadmap-header-sub">
          Step-by-step milestone plan ordered by prerequisite graph and local market linkages
        </p>
      </div>

      {/* Target Outcome & Visual Readiness Banner */}
      <div className="roadmap-hero-card">
        <div className="roadmap-hero-main">
          <div>
            <div className="roadmap-target-tag">Target Livelihood Outcome</div>
            <h2 className="roadmap-target-title">
              {occupation.title || occKey.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <div className="roadmap-target-meta">
              <span>Sector: <strong>{occupation.sector || 'Apparel & Handloom'}</strong></span>
              <span>•</span>
              <span>Target NSQF Level: <strong>{occupation.nsqfLevel || 3}</strong></span>
              <span>•</span>
              <span>Est. Duration: <strong>{totalMonths} Months</strong></span>
            </div>
          </div>

          <div className="roadmap-readiness-box">
            <div className="roadmap-readiness-badge">
              Readiness Score: {dynamicReadiness}%
            </div>
            <div className="roadmap-readiness-bar-track">
              <div
                className="roadmap-readiness-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, dynamicReadiness))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Visual Journey Stepper Track */}
      {steps.length > 0 && (
        <div className="roadmap-journey-card">
          <div className="roadmap-journey-title">{t('roadmap.journeyTitle', 'Your Livelihood Journey')}</div>

          <div className="roadmap-stepper-track">
            <div className="roadmap-connector-line">
              <div
                className="roadmap-connector-progress"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {steps.map((step, idx) => {
              const status = getStepStatus(idx);
              return (
                <div key={step.step || idx} className="roadmap-stepper-node">
                  <div className={`roadmap-node-circle ${status}`}>
                    {status === 'completed' ? (
                      <Check size={18} />
                    ) : (
                      step.step || idx + 1
                    )}
                  </div>

                  <div className="roadmap-node-label">
                    {step.title}
                  </div>

                  <span className={`roadmap-node-badge ${status}`}>
                    {status === 'completed' ? `✓ ${t('roadmap.completed', 'COMPLETED')}` : status === 'current' ? t('roadmap.current', 'CURRENT') : t('roadmap.upcoming', 'UPCOMING')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Current Milestone Spotlight Panel */}
      {currentStep ? (
        <div className="roadmap-current-panel">
          <div className="roadmap-current-header">
            <div className="roadmap-current-tag">
              <Sparkles size={14} /> Current Milestone Spotlight
            </div>
            {currentStep.durationMonths > 0 && (
              <span className="badge badge-amber" style={{ fontSize: '12px' }}>
                <Clock size={14} /> Duration: {currentStep.durationMonths} Month{currentStep.durationMonths > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <h3 className="roadmap-current-title">{currentStep.title}</h3>
          <p className="roadmap-current-desc">{cleanText(currentStep.description)}</p>

          <div className="roadmap-grid-details">
            {currentStep.recommendedCourse && (
              <div className="roadmap-detail-item" style={{ gridColumn: '1 / -1' }}>
                <span className="roadmap-detail-label">Recommended Skilling Course</span>
                <span className="roadmap-detail-value" style={{ color: 'var(--primary-600)' }}>
                  {cleanText(currentStep.recommendedCourse)}
                </span>
              </div>
            )}

            {currentStep.nsqfProgression && (
              <div className="roadmap-detail-item">
                <span className="roadmap-detail-label">NSQF Level Progression</span>
                <span className="roadmap-detail-value">{cleanText(currentStep.nsqfProgression)}</span>
              </div>
            )}

            {currentStep.estimatedIncomeInr !== undefined && (
              <div className="roadmap-detail-item">
                <span className="roadmap-detail-label">Projected Stage Income</span>
                <span className="roadmap-detail-value" style={{ color: '#16a34a' }}>
                  ₹{currentStep.estimatedIncomeInr.toLocaleString()} / mo
                </span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              className="roadmap-mark-completed-btn"
              onClick={handleMarkCompleted}
            >
              <CheckCircle2 size={18} /> Mark as Completed
            </button>
          </div>
        </div>
      ) : allCompleted ? (
        <div className="roadmap-current-panel" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <CheckCircle2 size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-900)', margin: '0 0 6px' }}>
            All Roadmap Milestones Completed!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 16px' }}>
            You have successfully completed every stage for <strong>{occupation.title || occKey.replace(/_/g, ' ')}</strong>.
          </p>
          <Link to="/progress" className="btn btn-primary" style={{ fontSize: '13px' }}>
            View Certified Progress & Placements &rarr;
          </Link>
        </div>
      ) : null}

      {/* Accredited Centers Section */}
      {centers.length > 0 && (
        <div className="roadmap-centers-card">
          <h3 className="roadmap-centers-title">
            <Building size={18} color="var(--primary-600)" /> Accredited Centers for this Pathway
          </h3>
          <div className="roadmap-centers-grid">
            {centers.slice(0, 3).map((c, i) => (
              <div key={i} className="roadmap-center-item">
                <strong style={{ color: 'var(--primary-900)', fontSize: '13px' }}>{c.name}</strong>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{c.district}, {c.state}</div>
                <div style={{ color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>{c.contact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">&larr; Back to Opportunities</Link>
        <Link to="/progress" className="btn btn-primary">Track My Active Milestones &rarr;</Link>
      </div>
    </div>
  );
};
