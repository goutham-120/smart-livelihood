import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Briefcase, Award, Phone, CheckCircle, ArrowRight, ShieldCheck, DollarSign, Building } from 'lucide-react';

export const SelfEmployment = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSelfEmployment(occKey);
        const payload = res?.data || res;
        setData(payload);
      } catch (err) {
        console.error('Failed to load self employment guide:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [occKey]);

  const handleTalkToCounselor = async () => {
    setRequesting(true);
    try {
      const res = await fetch('/api/opportunities/counselor-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('pmajay_token') ? { Authorization: `Bearer ${localStorage.getItem('pmajay_token')}` } : {})
        },
        body: JSON.stringify({
          district: data?.district || 'Warangal',
          titleNote: data?.title || occKey
        })
      });
      const body = await res.json();
      if (res.ok) {
        setRequestStatus(t('selfEmployment.consultationSubmitted', 'Consultation request submitted! A financial counselor will contact you.'));
      } else {
        setRequestStatus(body.error || t('selfEmployment.requestFailed', 'Failed to submit request.'));
      }
    } catch (err) {
      setRequestStatus(t('selfEmployment.requestFailed', 'Failed to submit request.'));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t('common.loading', 'Loading...')}</div>;
  if (!data) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t('selfEmployment.unavailable', 'Self employment guide unavailable.')}</div>;

  const plan = data.businessPlan || {};

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-amber" style={{ marginBottom: '8px' }}>{t('dashboard.microEnterprise', 'Micro Enterprise Track')}</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('selfEmployment.guideTitle', 'Business Startup Guide')}: {data.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {t('selfEmployment.subtitle', 'PM-AJAY GIA micro enterprise launch roadmap, collateral free financing, and district counselor support')}
        </p>
      </div>

      {requestStatus && (
        <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {requestStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'var(--primary-50)', borderColor: '#c7d2fe' }}>
          <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600 }}>{t('selfEmployment.estCapital', 'Estimated Capital Requirement')}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)', margin: '4px 0' }}>
            ₹{data.startupCostInr?.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t('selfEmployment.capitalNote', 'Includes equipment toolkit, working capital, and PM Vishwakarma / PMEGP grant eligibility')}
          </div>
        </div>

        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>{t('selfEmployment.monthlyRevenue', 'Projected Monthly Business Revenue')}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
            ₹{plan.estimatedMonthlyRevenue?.toLocaleString()}/mo
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t('selfEmployment.breakeven', 'Target breakeven period')}: {plan.breakevenMonths || 3} {t('training.months', 'Months')}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={18} color="var(--primary-600)" /> {t('selfEmployment.stepsHeading', 'Step-by-Step Business Setup Guide')}
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(plan.keySteps || []).map((step, idx) => (
            <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ background: 'var(--primary-600)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <span style={{ paddingTop: '2px' }}>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-gold)" /> {t('selfEmployment.govSchemes', 'Applicable Government Support Schemes')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {(data.schemes || []).map((scheme, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <span className="badge badge-amber" style={{ fontSize: '10px', marginBottom: '4px' }}>{scheme.type || 'Government Grant'}</span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0' }}>{scheme.name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{scheme.benefit || scheme.eligibilitySummary}</p>
              {scheme.link && (
                <a href={scheme.link} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  {t('selfEmployment.portalLink', 'Official Portal Link')} &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} color="var(--accent-green)" /> {t('selfEmployment.counselorsHeading', 'Verified District Financial Counselors')}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('selfEmployment.counselorsSub', 'Local mentors available for business plan formulation and loan paperwork')}</p>
          </div>
          <button onClick={handleTalkToCounselor} className="btn btn-primary" disabled={requesting}>
            {requesting ? t('common.loading', 'Submitting Request...') : t('selfEmployment.talkCounselor', 'Talk to a Financial Counselor')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {(data.counselors || []).map((counselor, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '14px', display: 'block' }}>{counselor.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('profile.district', 'District')}: {counselor.district}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('profile.languages', 'Languages')}: {(counselor.languages || []).join(', ')}</div>
              <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>{t('selfEmployment.contact', 'Contact')}: {counselor.contact}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/opportunities" className="btn btn-secondary">&larr; {t('common.back', 'Back to Opportunities')}</Link>
        <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">{t('dashboard.roadmapBtn', 'View Skilling Roadmap')} &rarr;</Link>
      </div>
    </div>
  );
};
