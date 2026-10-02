import React, { useState } from 'react';
import { api } from '../api';
import { Compass, Sparkles, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhatIf = () => {
  const [selectedSkills, setSelectedSkills] = useState(['sewing_machine_operation']);
  const [district, setDistrict] = useState('Warangal');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await api.runWhatIf(selectedSkills, district);
      setResults(res.topMatches || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={24} color="#4f46e5" /> What-If Career & Skilling Simulator
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Simulate acquiring new skills or changing your district to see how your livelihood opportunities and income potential expand.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="Warangal">Warangal, Telangana</option>
              <option value="Adilabad">Adilabad, Telangana</option>
              <option value="Nalgonda">Nalgonda, Telangana</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select Hypothesized Skills to Test</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
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
                    border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                    background: active ? '#eef2ff' : '#fff',
                    color: active ? '#4338ca' : '#475569',
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
          {loading ? 'Simulating Impact...' : 'Simulate Opportunity Impact'}
        </button>
      </div>

      {results && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={18} color="#16a34a" /> Projected Top Career Matches
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((r, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{r.title}</h4>
                    <span className="badge badge-blue">NSQF Level {r.nsqfLevel}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{r.sector}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Projected Income:</div>
                    <strong style={{ color: '#15803d', fontSize: '15px' }}>₹{r.potentialMonthlyIncome?.toLocaleString()}/mo</strong>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 10px' }}>
                    {r.readinessScore}% Match
                  </span>
                  <Link to={`/roadmap?occ=${r.occupationKey}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }}>
                    Explore &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
