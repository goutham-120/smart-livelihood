import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Compass, TrendingUp, Sparkles, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhatIf = () => {
  const { t } = useTranslation();
  const [selectedSkills, setSelectedSkills] = useState(['sewing_machine_operation']);
  const [district, setDistrict] = useState('Warangal');
  const [employmentPreference, setEmploymentPreference] = useState('either');
  const [incomeGoal, setIncomeGoal] = useState(15000);
  const [travelRequired, setTravelRequired] = useState(true);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableSkills = [
    { key: 'sewing_machine_operation', name: 'Sewing Machine Operation' },
    { key: 'garment_pattern_cutting', name: 'Garment Pattern Cutting' },
    { key: 'solar_panel_installation', name: 'Solar PV Installation' },
    { key: 'house_wiring_electrical', name: 'House Wiring & Electrical' },
    { key: 'milking_machine_handling', name: 'Dairy & Milking Machine' },
    { key: 'cattle_feed_nutrition', name: 'Cattle Feed & Nutrition' },
    { key: 'pickle_jam_preservation', name: 'Food & Pickle Processing' },
    { key: 'retail_sales_customer_service', name: 'Retail Sales & POS' },
    { key: 'data_entry_vernacular_typing', name: 'Data Entry & Digital Services' },
    { key: 'general_duty_hospital_assistance', name: 'Healthcare & Patient Care' }
  ];

  const toggleSkill = (key) => {
    if (selectedSkills.includes(key)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== key));
    } else {
      setSelectedSkills([...selectedSkills, key]);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runWhatIf({
        skills: selectedSkills,
        district,
        employmentPreference,
        incomeGoal,
        travelRequired
      });
      setResults(res);
    } catch (err) {
      console.error('What-If simulation failed:', err);
      setError(err?.response?.data?.error || err?.message || 'Failed to run simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={24} color="var(--primary-600)" /> {t('whatIf.title', 'What-If Career and Skilling Simulator')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {t('whatIf.subtitle', 'Simulate acquiring new trade skills or adjusting employment preferences to unlock higher income livelihood pathways.')}
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>{t('whatIf.adjustLevers', 'Adjust Simulation Levers')}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('whatIf.targetDistrict', 'Target District Location')}</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="Warangal">Warangal, Telangana</option>
              <option value="Adilabad">Adilabad, Telangana</option>
              <option value="Nalgonda">Nalgonda, Telangana</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('whatIf.employmentPref', 'Employment Track Preference')}</label>
            <select
              value={employmentPreference}
              onChange={(e) => setEmploymentPreference(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="either">{t('dashboard.eitherTrack', 'Either Track (Wage or Micro Enterprise)')}</option>
              <option value="self">{t('dashboard.microEnterprise', 'Micro Enterprise (Self Employment)')}</option>
              <option value="wage">{t('dashboard.wagePlacement', 'Wage Placement')}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('whatIf.targetIncome', 'Target Monthly Income')}: ₹{incomeGoal.toLocaleString()}</label>
            <input
              type="range"
              min="8000"
              max="35000"
              step="1000"
              value={incomeGoal}
              onChange={(e) => setIncomeGoal(Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t('whatIf.travelMobility', 'Travel & Geographic Mobility')}</label>
            <select
              value={travelRequired ? 'yes' : 'no'}
              onChange={(e) => setTravelRequired(e.target.value === 'yes')}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="yes">Open to Travel / Relocation in District</option>
              <option value="no">Strictly Home Village / Local Block Only</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{t('whatIf.selectSkills', 'Select Hypothesized Trade Skills to Test')}</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableSkills.map((sk) => {
              const active = selectedSkills.includes(sk.key);
              return (
                <button
                  key={sk.key}
                  type="button"
                  onClick={() => toggleSkill(sk.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: active ? '1px solid var(--primary-600)' : '1px solid var(--border-medium)',
                    background: active ? 'var(--primary-50)' : '#fff',
                    color: active ? 'var(--primary-600)' : 'var(--text-main)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400
                  }}
                >
                  {active && '✓ '} {sk.name}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleSimulate} className="btn btn-primary" disabled={loading}>
          {loading ? t('whatIf.simulating', 'Simulating Impact...') : t('whatIf.runSimulation', 'Run What-If Simulation')}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {results.comparison && (
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={18} color="var(--accent-green)" /> Baseline vs Simulated Opportunity Score Comparison
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Baseline Average Alignment Fit</div>
                  <div style={{ background: '#e2e8f0', borderRadius: 'var(--radius-sm)', height: '24px', overflow: 'hidden' }}>
                    <div style={{ width: `${results.comparison.beforeAvgScore}%`, background: 'var(--text-muted)', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                      {results.comparison.beforeAvgScore}%
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Simulated Average Alignment Fit</div>
                  <div style={{ background: '#e2e8f0', borderRadius: 'var(--radius-sm)', height: '24px', overflow: 'hidden' }}>
                    <div style={{ width: `${results.comparison.afterAvgScore}%`, background: 'var(--primary-600)', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                      {results.comparison.afterAvgScore}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: results.comparison.impactGainPct >= 0 ? 'var(--accent-green)' : '#b91c1c', fontWeight: 600 }}>
                Net Opportunity Fit Gain: {results.comparison.impactGainPct >= 0 ? '+' : ''}{results.comparison.impactGainPct}% across district trade pathways.
              </div>
            </div>
          )}

          {results.unlockedOptions && results.unlockedOptions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)' }}>
                <Sparkles size={18} /> Newly Unlocked Career Pathways ({results.unlockedOptions.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {results.unlockedOptions.map((unlocked, idx) => (
                  <div key={idx} className="card" style={{ borderColor: 'var(--accent-gold)', background: '#fffbeb' }}>
                    <span className="badge badge-amber" style={{ marginBottom: '6px' }}>Unlocked Pathway</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{unlocked.title}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Sector: {unlocked.sector} | NSQF Level {unlocked.nsqfLevel}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700 }}>
                      Simulated Fit: {unlocked.matchScore}% (was {unlocked.baselineScore}%)
                    </div>
                    <Link to={`/roadmap?occ=${unlocked.occupationKey}`} className="btn btn-primary" style={{ fontSize: '11px', marginTop: '10px', width: '100%' }}>
                      Explore Roadmap
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Top Simulated Career Matches</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(results.topMatches || []).map((r, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{r.title}</h4>
                      <span className="badge badge-blue">NSQF Level {r.nsqfLevel}</span>
                      <span className={`badge ${r.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                        {r.track === 'self' ? 'Self Employment' : 'Wage Placement'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.sector}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Projected Income:</div>
                      <strong style={{ color: 'var(--accent-green)', fontSize: '15px' }}>₹{r.potentialMonthlyIncome?.toLocaleString()}/mo</strong>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 10px' }}>
                      {r.matchScore}% Match
                    </span>
                    <Link to={`/roadmap?occ=${r.occupationKey}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }}>
                      Explore &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
