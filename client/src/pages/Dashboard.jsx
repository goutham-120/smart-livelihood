import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Card, Badge, Spinner } from '../components.jsx';
import { TrendingUp, Award, AlertTriangle, ArrowRight, Sparkles, CheckCircle, Briefcase, MapPin } from 'lucide-react';

export const Dashboard = ({ user }) => {
  const [district, setDistrict] = useState(user?.district || 'Warangal');
  const [analytics, setAnalytics] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  useEffect(() => {
    setLoading(true);
    if (isOfficer) {
      api.getOfficerAnalytics(district).then((res) => {
        setAnalytics(res);
        setLoading(false);
      }).catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
    } else {
      Promise.all([
        api.getProfile().catch(() => ({ profile: null })),
        api.getOpportunities().catch(() => ({ opportunities: [] }))
      ]).then(([profRes, oppRes]) => {
        setProfile(profRes?.profile || null);
        setOpportunities(Array.isArray(oppRes?.opportunities) ? oppRes.opportunities : []);
        setLoading(false);
      }).catch((err) => {
        console.error('Beneficiary load error:', err);
        setLoading(false);
      });
    }
  }, [district, isOfficer]);


  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><Spinner size={32} /></div>;

  if (isOfficer) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>District Officer Command Cockpit</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>PM-AJAY GIA Skilling, Placement, and Dropout Governance</p>
          </div>

          {user?.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter District:</span>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
              >
                <option value="Warangal">Warangal</option>
                <option value="Adilabad">Adilabad</option>
                <option value="Nalgonda">Nalgonda</option>
              </select>
            </div>
          )}
        </div>

        {/* 5-Stage Funnel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>1. REGISTERED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.registered || 100}</div>
            <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Beneficiaries Mobilized</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-sky)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>2. SKILLS IDENTIFIED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.skillsIdentified || 95}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-sky)' }}>Assessed via Voice AI</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>3. ENROLLED IN NSQF</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.trainingEnrolled || 78}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Active in Training</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-success)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>4. PLACED / ENTERPRISE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.placedOrSelfEmployed || 33}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-success)' }}>Placement Rate: {analytics?.placementRate}%</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-danger)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>5. DROPOUTS FLAGGED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.dropouts || 14}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-danger)' }}>Requires Intervention</div>
          </Card>
        </div>

        {/* Dropout Risk & Demand */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card title="Early Candidate Dropout Risk Distribution">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fee2e2', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b91c1c', fontSize: '13px' }}>High Risk (Mobility/Education Gaps):</span>
                <strong>{analytics?.dropoutRisk?.high || 18} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b45309', fontSize: '13px' }}>Medium Risk:</span>
                <strong>{analytics?.dropoutRisk?.medium || 34} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#dcfce7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#15803d', fontSize: '13px' }}>Low Risk:</span>
                <strong>{analytics?.dropoutRisk?.low || 48} candidates</strong>
              </div>
            </div>
          </Card>

          <Card title="Top Sector Trade Demand">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {analytics?.byTrade?.slice(0, 4).map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{t.trade.replace(/_/g, ' ')}</span>
                  <Badge type="blue">{t.count} candidates</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Beneficiary Dashboard View
  const topOpportunity = opportunities[0];
  const userSkills = profile?.skills || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Greeting Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600, marginBottom: '4px' }}>
              Namaste, {user?.name || 'Friend'}!
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Let's continue your livelihood journey</h2>
            <p style={{ color: '#dbeafe', fontSize: '14px', marginTop: '4px' }}>
              Location: <strong>{profile?.district || 'Warangal'}, Telangana</strong> | Education: <strong>{profile?.education || 'High School'}</strong>
            </p>
          </div>
          <Link to="/assistant" className="btn" style={{ background: '#fff', color: 'var(--primary-700)', fontWeight: 700 }}>
            Talk to AI Voice Assistant &rarr;
          </Link>
        </div>
      </Card>

      {/* Primary Action & Active Pathway */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <Card title="Next Recommended Action">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {userSkills.length === 0
                ? 'Speak with our AI Voice Assistant to map your trade skills and past experience.'
                : 'Bridge your missing competencies by enrolling in prerequisite skilling modules.'}
            </div>

            {topOpportunity ? (
              <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge badge-green">{topOpportunity.matchScore}% Match Fit</span>
                  <span className="badge badge-blue">NSQF Level {topOpportunity.nsqfLevel}</span>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{topOpportunity.title}</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Est. Income: ₹{topOpportunity.incomeRange?.min?.toLocaleString()} to ₹{topOpportunity.incomeRange?.max?.toLocaleString()}/mo
                </div>
              </div>
            ) : null}

            <Link to={userSkills.length === 0 ? '/assistant' : '/opportunities'} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
              {userSkills.length === 0 ? 'Start Voice Assessment' : 'Explore Tailored Opportunities'} <ArrowRight size={16} />
            </Link>
          </div>
        </Card>

        <Card title="Your Identified Profile Competencies">
          <div style={{ marginTop: '6px' }}>
            {userSkills.length > 0 ? (
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {userSkills.map((s, idx) => (
                    <Badge key={idx} type="blue">{s.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Employment Preference: <strong>{profile?.employmentPreference === 'self' ? 'Micro-Enterprise' : profile?.employmentPreference === 'wage' ? 'Wage Placement' : 'Either Track'}</strong>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '12px 0' }}>
                No prior skills recorded yet. Complete your 2-minute voice conversation to unlock personalized recommendations.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Matched Pathways */}
      {opportunities.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Top Matched Livelihood Pathways</h3>
            <Link to="/opportunities" style={{ color: 'var(--primary-600)', fontWeight: 600, fontSize: '13px' }}>View All ({opportunities.length}) &rarr;</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {opportunities.slice(0, 3).map((op) => (
              <Card key={op.occupationKey || op.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Badge type={op.track === 'self' ? 'amber' : 'green'}>{op.track === 'self' ? 'Self-Employment' : 'Wage Placement'}</Badge>
                    <Badge type="blue">NSQF Level {op.nsqfLevel}</Badge>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{op.title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{op.sector}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-600)' }}>{op.matchScore}% Match Fit Score</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <Link to={`/skill-gaps?occ=${op.occupationKey}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }}>Skill Gaps</Link>
                  <Link to={`/roadmap?occ=${op.occupationKey}`} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 10px', flex: 1 }}>Roadmap &rarr;</Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
