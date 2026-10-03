import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Card, Badge, Spinner } from '../components.jsx';
import { TrendingUp, Award, AlertTriangle, ArrowRight, Sparkles, CheckCircle, Briefcase, MapPin, Lock } from 'lucide-react';

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
        const p = profRes?.profile || null;
        setProfile(p);
        if (p?.voiceCompleted || (p?.skills && p.skills.length > 0 && localStorage.getItem('pmajay_voice_unlocked') === 'true')) {
          localStorage.setItem('pmajay_voice_unlocked', 'true');
          window.dispatchEvent(new Event('pmajay_voice_unlocked'));
        }
        setOpportunities(Array.isArray(oppRes?.opportunities) ? oppRes.opportunities : []);
        setLoading(false);
      }).catch((err) => {
        console.error('Beneficiary load error:', err);
        setLoading(false);
      });
    }
  }, [district, isOfficer]);

  const isUnlocked = isOfficer ||
    Boolean(profile?.voiceCompleted) ||
    (Boolean(profile?.skills && profile?.skills.length > 0) && localStorage.getItem('pmajay_voice_unlocked') === 'true');

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><Spinner size={32} /></div>;

  if (isOfficer) {
    return (
      <div className="page-container">
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
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.registered ?? 100}</div>
            <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Beneficiaries Mobilized</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-sky)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>2. SKILLS IDENTIFIED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.skillsIdentified ?? 95}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-sky)' }}>Assessed via Voice AI</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>3. ENROLLED IN NSQF</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.trainingEnrolled ?? 78}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Active in Training</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-success)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>4. PLACED / ENTERPRISE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.placedOrSelfEmployed ?? 33}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-success)' }}>Placement Rate: {analytics?.placementRate ?? 0}%</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-danger)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>5. DROPOUTS FLAGGED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.dropouts ?? 14}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-danger)' }}>Requires Intervention</div>
          </Card>
        </div>

        {/* Dropout Risk & Demand */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card title="Early Candidate Dropout Risk Distribution">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fee2e2', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b91c1c', fontSize: '13px' }}>High Risk (Mobility/Education Gaps):</span>
                <strong>{analytics?.dropoutRisk?.high ?? 18} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b45309', fontSize: '13px' }}>Medium Risk:</span>
                <strong>{analytics?.dropoutRisk?.medium ?? 34} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#dcfce7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#15803d', fontSize: '13px' }}>Low Risk:</span>
                <strong>{analytics?.dropoutRisk?.low ?? 48} candidates</strong>
              </div>
            </div>
          </Card>

          <Card title="Top Sector Trade Demand">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {(analytics?.byTrade || []).slice(0, 4).map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{String(t?.trade || '').replace(/_/g, ' ')}</span>
                  <Badge type="blue">{t?.count ?? 0} candidates</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Beneficiary Dashboard View
  const topOpportunity = (opportunities || [])[0];
  const userSkills = profile?.skills || [];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Greeting Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', border: 'none', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600, marginBottom: '4px' }}>
              Namaste, {user?.name || 'Friend'}!
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.25' }}>Let's continue your livelihood journey</h2>
            <p style={{ color: '#dbeafe', fontSize: '14px', marginTop: '6px' }}>
              Location: <strong>{profile?.district || 'Warangal'}, Telangana</strong> | Education: <strong>{profile?.education || 'High School'}</strong>
            </p>
          </div>
          <Link
            to="/assistant"
            className="btn"
            style={{
              background: '#fff',
              color: 'var(--primary-700)',
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Talk to AI Voice Assistant &rarr;
          </Link>
        </div>
      </Card>

      {/* Primary Action & Active Pathway */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left: Next Recommended Action */}
        <Card title="Next Recommended Action" style={{ minWidth: 0, position: 'relative' }}>
          {!isUnlocked ? (
            <div style={{ marginTop: '6px', position: 'relative', minHeight: '190px' }}>
              {/* Blurred preview content */}
              <div
                style={{
                  filter: 'blur(5px)',
                  opacity: 0.7,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  padding: '8px 0'
                }}
                aria-hidden="true"
              >
                <div style={{ background: 'var(--surface-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-green">85% Match Fit</span>
                    <span className="badge badge-blue">NSQF Level 3</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Self Employed Tailor</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Apparel & Handloom • Est. Income: ₹12,000 to ₹30,000/mo
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Bridge missing competencies with verified PM-AJAY skill training centers.
                </div>
              </div>

              {/* Consistent Lock Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(254, 243, 199, 0.95)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Lock size={18} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1c1917', marginBottom: '4px', maxWidth: '300px' }}>
                  Unlocks when you complete the 2-minute voice conversation
                </div>
                <p style={{ fontSize: '12px', color: '#44403c', maxWidth: '290px', marginBottom: '12px', fontWeight: 500, lineHeight: '1.4' }}>
                  Speak with our AI Assistant to map your trade skills and past experience.
                </p>
                <Link to="/assistant" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 700 }}>
                  Start Voice Assessment &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Bridge your missing competencies by enrolling in prerequisite skilling modules.
              </div>

              {topOpportunity ? (
                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="badge badge-green">{topOpportunity.matchScore || 85}% Match Fit</span>
                    <span className="badge badge-blue">NSQF Level {topOpportunity.nsqfLevel || 3}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{topOpportunity.title || 'Livelihood Pathway'}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Est. Income: ₹{topOpportunity?.incomeRange?.min != null ? topOpportunity.incomeRange.min.toLocaleString() : '10,000'} to ₹{topOpportunity?.incomeRange?.max != null ? topOpportunity.incomeRange.max.toLocaleString() : '18,000'}/mo
                  </div>
                </div>
              ) : null}

              <Link
                to="/opportunities"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                Explore Tailored Opportunities <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </Card>

        {/* Right: Your Identified Profile Competencies */}
        <Card title="Your Identified Profile Competencies" style={{ minWidth: 0, position: 'relative' }}>
          <div style={{ marginTop: '6px', position: 'relative', minHeight: '190px' }}>
            {!isUnlocked ? (
              <>
                {/* Blurred card contents */}
                <div
                  style={{
                    filter: 'blur(5px)',
                    opacity: 0.7,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    padding: '8px 0'
                  }}
                  aria-hidden="true"
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <Badge type="blue">Sewing Machine Operation</Badge>
                    <Badge type="blue">Garment Pattern Cutting</Badge>
                    <Badge type="blue">Handloom Weaving</Badge>
                    <Badge type="blue">Organic Vermicompost</Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Employment Preference: <strong>Micro-Enterprise / Self-Employment</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Target Monthly Income: <strong>₹15,000 / month</strong>
                  </div>
                </div>

                {/* Consistent Lock Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(3px)',
                  WebkitBackdropFilter: 'blur(3px)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(254, 243, 199, 0.95)',
                    color: '#b45309',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}>
                    <Lock size={18} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1c1917', marginBottom: '4px', maxWidth: '300px' }}>
                    Unlocks when you complete the 2-minute voice conversation
                  </div>
                  <p style={{ fontSize: '12px', color: '#44403c', maxWidth: '290px', marginBottom: '12px', fontWeight: 500, lineHeight: '1.4' }}>
                    Speak with our AI Assistant to automatically extract your trade skills and preferences.
                  </p>
                  <Link to="/assistant" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 700 }}>
                    Start Voice Assessment &rarr;
                  </Link>
                </div>
              </>
            ) : userSkills.length > 0 ? (
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {userSkills.map((s, idx) => (
                    <Badge key={idx} type="blue">{String(s || '').replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Employment Preference: <strong>{profile?.employmentPreference === 'self' ? 'Micro-Enterprise' : profile?.employmentPreference === 'wage' ? 'Wage Placement' : 'Either Track'}</strong>
                </div>
                {profile?.incomeGoal && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Target Monthly Income: <strong>₹{profile.incomeGoal.toLocaleString()}</strong>
                  </div>
                )}
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
      {(opportunities || []).length > 0 && (
        <div style={{ minWidth: 0, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Top Matched Livelihood Pathways</h3>
            {isUnlocked && (
              <Link to="/opportunities" style={{ color: 'var(--primary-600)', fontWeight: 600, fontSize: '13px' }}>View All ({opportunities.length}) &rarr;</Link>
            )}
          </div>

          {!isUnlocked ? (
            /* Blurred Pathways with Lock Overlay */
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              background: 'var(--surface-card)',
              overflow: 'hidden',
              padding: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', filter: 'blur(5px)', opacity: 0.7, pointerEvents: 'none', userSelect: 'none' }}>
                {opportunities.slice(0, 3).map((op, idx) => (
                  <Card key={idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, border: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Badge type="amber">Self-Employment</Badge>
                        <Badge type="blue">NSQF Level 3</Badge>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{op.title}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{op.sector}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-600)' }}>85% Match Fit Score</div>
                    </div>
                  </Card>
                ))}
              </div>

              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(254, 243, 199, 0.95)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Lock size={20} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1c1917', marginBottom: '4px' }}>
                  Unlocks when you complete the 2-minute voice conversation
                </div>
                <p style={{ fontSize: '13px', color: '#44403c', maxWidth: '440px', margin: 0, fontWeight: 500, lineHeight: '1.5' }}>
                  Complete the 2-minute conversation with our AI Assistant to generate personalized match scores tailored to your trade skills.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {opportunities.slice(0, 3).map((op, idx) => (
                <Card key={op.occupationKey || op.id || idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <Badge type={op.track === 'self' ? 'amber' : 'green'}>{op.track === 'self' ? 'Self-Employment' : 'Wage Placement'}</Badge>
                      <Badge type="blue">NSQF Level {op.nsqfLevel || 3}</Badge>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{op.title || 'Livelihood Pathway'}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{op.sector || 'Skilling'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-600)' }}>{op.matchScore || 85}% Match Fit Score</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    <Link to={`/skill-gaps?occ=${op.occupationKey || ''}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', flex: 1, minWidth: '100px', textAlign: 'center' }}>Skill Gaps</Link>
                    <Link to={`/roadmap?occ=${op.occupationKey || ''}`} className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 10px', flex: 1, minWidth: '100px', textAlign: 'center' }}>Roadmap &rarr;</Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
