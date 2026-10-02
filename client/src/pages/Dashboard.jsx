import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { TrendingUp, Users, Award, AlertTriangle, ShieldCheck, BarChart3, Plus, FileText } from 'lucide-react';

export const Dashboard = ({ user }) => {
  const [district, setDistrict] = useState(user?.district || 'Warangal');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOfficerAnalytics(district).then((res) => {
      setAnalytics(res);
      setLoading(false);
    });
  }, [district]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>District Officer Command Cockpit</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>PM-AJAY GIA Skilling, Placement, and Dropout Governance</p>
        </div>

        {user?.role === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter District:</span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="Warangal">Warangal</option>
              <option value="Adilabad">Adilabad</option>
              <option value="Nalgonda">Nalgonda</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading district analytics...</div>
      ) : (
        <div>
          {/* 5-Stage Funnel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>1. REGISTERED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.registered || 100}</div>
              <div style={{ fontSize: '12px', color: '#4f46e5' }}>Beneficiaries Mobilized</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>2. SKILLS IDENTIFIED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.skillsIdentified || 95}</div>
              <div style={{ fontSize: '12px', color: '#0284c7' }}>Assessed via Voice AI</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>3. ENROLLED IN NSQF</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.trainingEnrolled || 78}</div>
              <div style={{ fontSize: '12px', color: '#d97706' }}>Active in Training</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>4. PLACED / ENTERPRISE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.placedOrSelfEmployed || 33}</div>
              <div style={{ fontSize: '12px', color: '#16a34a' }}>Placement Rate: {analytics?.placementRate}%</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>5. DROPOUTS FLAGGED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.dropouts || 14}</div>
              <div style={{ fontSize: '12px', color: '#dc2626' }}>Requires Intervention</div>
            </div>
          </div>

          {/* Dropout Risk Management */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#dc2626" /> Early Dropout Risk Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#b91c1c' }}>High Risk (Mobility/Literacy Gaps):</span>
                  <strong>{analytics?.dropoutRisk?.high || 18} candidates</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fef3c7', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#b45309' }}>Medium Risk:</span>
                  <strong>{analytics?.dropoutRisk?.medium || 34} candidates</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#dcfce7', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>Low Risk:</span>
                  <strong>{analytics?.dropoutRisk?.low || 48} candidates</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#4f46e5" /> Top Competencies in Demand
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics?.byTrade?.slice(0, 4).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ textTransform: 'capitalize' }}>{t.trade.replace(/_/g, ' ')}</span>
                    <span className="badge badge-blue">{t.count} candidates</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
