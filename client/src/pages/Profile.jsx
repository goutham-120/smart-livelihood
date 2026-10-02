import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Shield, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getProfile().then((res) => {
      setProfile(res.profile);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(false);
    const res = await api.updateProfile(profile);
    if (res.profile) {
      setProfile(res.profile);
      setSaved(true);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>;

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Beneficiary Profile</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Manage skilling parameters, mobility constraints, and income goals</p>
      </div>

      {saved && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={16} /> Profile preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>District</label>
            <input
              type="text"
              value={profile?.district || ''}
              onChange={(e) => setProfile({ ...profile, district: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Preferred Language</label>
            <select
              value={profile?.language || 'te'}
              onChange={(e) => setProfile({ ...profile, language: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Employment Preference</label>
          <select
            value={profile?.employmentPreference || 'either'}
            onChange={(e) => setProfile({ ...profile, employmentPreference: e.target.value })}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          >
            <option value="either">Open to Both (Self-Employment or Wage)</option>
            <option value="self">Micro-Enterprise / Self-Employment Only</option>
            <option value="wage">Wage Employment / Job Placement Only</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Target Monthly Income (INR)</label>
            <input
              type="number"
              value={profile?.incomeGoal || 15000}
              onChange={(e) => setProfile({ ...profile, incomeGoal: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Available Hours / Week</label>
            <input
              type="number"
              value={profile?.weeklyHours || 35}
              onChange={(e) => setProfile({ ...profile, weeklyHours: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Recorded Trade Skills</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {profile?.skills?.map((s, i) => (
              <span key={i} className="badge badge-blue">{s.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>CALCULATED RISK SCORE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <span className={`badge ${profile?.riskScore > 50 ? 'badge-red' : profile?.riskScore > 20 ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '14px', padding: '4px 10px' }}>
              {profile?.riskScore || 0} / 100
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {profile?.riskScore > 50 ? 'High Dropout Risk' : 'Healthy Engagement Profile'}
            </span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Save Profile Changes</button>
      </form>
    </div>
  );
};
