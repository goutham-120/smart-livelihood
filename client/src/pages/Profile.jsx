import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { SkeletonCard, ReadAloudButton } from '../components.jsx';
import { getProfile, putProfile, api } from '../api.js';
import { useLang } from '../lang.js';
import './Profile.css';

const EDUCATION_OPTIONS = [
  'Below Primary',
  'Primary (5th)',
  'Middle (8th)',
  'Secondary (10th)',
  'Higher Secondary (12th)',
  'Diploma / ITI',
  'Graduate',
  'Post Graduate',
  'Other',
];

const EMPLOYMENT_PREFS = [
  { value: 'both', label: '🤝 Both Wage & Self-Employment' },
  { value: 'wage', label: '💼 Wage Employment Only' },
  { value: 'self', label: '🏪 Self-Employment / Micro-enterprise' },
];

const MOBILITY_OPTIONS = [
  'Within Village Only',
  'Within Block',
  'Within District',
  'Anywhere in State',
  'Open to Relocate',
  'No Night Shifts',
  'Needs Daycare Nearby',
  'Physical Disability Friendly',
];

const CHANNEL_OPTIONS = [
  { value: 'web', label: '🌐 Web App' },
  { value: 'kiosk', label: '🖥️ Gram Panchayat Kiosk' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'ivr', label: '📞 Phone Call (IVR)' },
];

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: '1.25rem' }} aria-hidden="true">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="grid grid-2 gap-4">{children}</div>
    </section>
  );
}

export function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth?.();
  const user = auth?.user || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('pmajay_user') || 'null'));
  const toastCtx = useToast?.();
  const toast = toastCtx?.addToast || ((msg) => console.log(msg));
  const { lang } = useLang();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    state: '',
    district: '',
    block: '',
    village: '',
    familyOccupation: '',
    currentLivelihood: '',
    education: 'Secondary (10th)',
    employmentPreference: 'both',
    incomeGoal: 15000,
    weeklyHours: 40,
    mobilityConstraints: [],
    experienceYears: 0,
    channel: 'web',
    skills: '',
  });

  const formatSkillTitle = (s) => {
    if (!s || typeof s !== 'string') return '';
    return s
      .replace(/_/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const populateFormFromProfile = (p) => {
    const rawSkills = Array.isArray(p.skills) ? p.skills : (p.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
    let skillsArr = rawSkills
      .filter((s) => s && s.length >= 3 && !['d', 'ho', 'sma', 'null', 'undefined'].includes(s.toLowerCase().trim()))
      .map(formatSkillTitle);

    let defaultLiv = p.currentLivelihood || '';
    let defaultFam = p.familyOccupation || '';
    if (!defaultLiv || !defaultFam) {
      const skStr = skillsArr.join(' ').toLowerCase();
      if (skStr.includes('tractor') || skStr.includes('irrigation') || skStr.includes('compost')) {
        if (!defaultLiv) defaultLiv = 'Farm Machinery & Agricultural Support';
        if (!defaultFam) defaultFam = 'Agriculture & Farming';
      } else if (skStr.includes('smartphone') || skStr.includes('appliance') || skStr.includes('electric') || skStr.includes('wiring')) {
        if (!defaultLiv) defaultLiv = 'Electronics & Appliance Repair';
        if (!defaultFam) defaultFam = 'Electronics & Technical Trades';
      } else if (skStr.includes('sewing') || skStr.includes('tailor') || skStr.includes('embroidery')) {
        if (!defaultLiv) defaultLiv = 'Tailoring & Garment Work';
        if (!defaultFam) defaultFam = 'Tailoring & Crafts';
      } else if (skStr.includes('dairy') || skStr.includes('cattle')) {
        if (!defaultLiv) defaultLiv = 'Dairy & Animal Husbandry';
        if (!defaultFam) defaultFam = 'Animal Husbandry';
      } else if (skillsArr.length > 0) {
        if (!defaultLiv) defaultLiv = 'Technical & Trade Services';
        if (!defaultFam) defaultFam = 'Skilled Trades & Services';
      }
    }

    // If skills were corrupted or empty, deduce appropriate trade skills from current livelihood
    if (skillsArr.length === 0) {
      const livLower = (defaultLiv + ' ' + defaultFam).toLowerCase();
      if (livLower.includes('farm') || livLower.includes('machinery') || livLower.includes('agri')) {
        skillsArr = ['Tractor Farm Machinery', 'Drip Irrigation Maintenance', 'Home Appliance Repair', 'Smartphone Hardware Repair'];
      } else if (livLower.includes('tailor') || livLower.includes('garment') || livLower.includes('craft')) {
        skillsArr = ['Sewing Machine Operation', 'Garment Pattern Cutting', 'Hand Embroidery'];
      } else if (livLower.includes('electric') || livLower.includes('appliance') || livLower.includes('tech')) {
        skillsArr = ['Smartphone Hardware Repair', 'Home Appliance Repair', 'House Wiring Electrical'];
      } else if (livLower.includes('dairy') || livLower.includes('animal') || livLower.includes('cattle')) {
        skillsArr = ['Milking Machine Handling', 'Cattle Feed Nutrition'];
      }
    }

    setForm({
      state: p.state || 'Telangana',
      district: p.district || 'Warangal',
      block: p.block || '',
      village: p.village || '',
      familyOccupation: defaultFam,
      currentLivelihood: defaultLiv,
      education: p.education || 'Secondary (10th)',
      employmentPreference: p.employmentPreference || 'both',
      incomeGoal: p.incomeGoal || 15000,
      weeklyHours: p.weeklyHours || 40,
      mobilityConstraints: p.mobilityConstraints || [],
      experienceYears: p.experienceYears || 0,
      channel: p.channel || 'web',
      skills: skillsArr.join(', '),
    });
  };

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data?.profile || res.data || {};
        setProfile(p);
        populateFormFromProfile(p);
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleMobility = (opt) => {
    const arr = form.mobilityConstraints || [];
    set('mobilityConstraints', arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Revert form values back if cancelling edit
      if (profile) populateFormFromProfile(profile);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: typeof form.skills === 'string' ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : form.skills,
        incomeGoal: Number(form.incomeGoal),
        weeklyHours: Number(form.weeklyHours),
        experienceYears: Number(form.experienceYears),
        voiceCompleted: true
      };
      const res = await putProfile(payload);
      const updated = res.data?.profile || payload;
      setProfile(updated);
      populateFormFromProfile(updated);
      setIsEditing(false);
      localStorage.setItem('pmajay_voice_unlocked', 'true');
      window.dispatchEvent(new Event('pmajay_voice_unlocked'));
      toast('Profile changes saved successfully!', 'success');
      if (location.search.includes('verify=1')) {
        navigate('/dashboard');
      }
    } catch {
      toast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isVerificationMode = location.search.includes('verify=1') || !profile?.voiceCompleted;

  if (loading) return <div className="page-container"><SkeletonCard rows={6} /></div>;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">{t ? t('profile.title', 'My Profile & Preferences') : 'My Profile & Preferences'}</h1>
          <p className="text-muted text-sm mt-1">Review and manage your skilling profile, location, and livelihood goals</p>
        </div>
        <ReadAloudButton lang={lang} />
      </div>

      {isVerificationMode && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
          border: '1.5px solid #86efac',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✓</span> AI Voice Assessment Complete — Verify Your Profile
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#15803d' }}>
              Your trade skills and preferences have been identified from your voice conversation. Please verify the information below and click "Verify Profile & Unlock Dashboard" to access all tailored livelihood pathways.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontWeight: 700, padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            {saving ? 'Verifying...' : '✓ Verify & Unlock Dashboard \u2192'}
          </button>
        </div>
      )}

      {/* Edit Profile Action Bar above Personal Information */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '-6px'
      }}>
        <div>
          {isEditing ? (
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              Edit Mode Active — Update fields and click "Save Changes" at the bottom
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              🔒 Profile is view-only. Click <strong>Edit Profile</strong> on the right to edit.
            </span>
          )}
        </div>
        <button
          type="button"
          id="btn-edit-profile-toggle"
          onClick={handleToggleEdit}
          className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
          style={{
            fontWeight: 700,
            padding: '8px 18px',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {isEditing ? '✕ Cancel Edit' : '✏️ Edit Profile'}
        </button>
      </div>

      {/* Personal info */}
      <Section title="Personal Information" icon="👤">
        <div className="form-group">
          <label className="label">Name</label>
          <input className="input" value={user?.name || ''} disabled readOnly />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={user?.phone || ''} disabled readOnly />
        </div>
        <Field label="Education Level">
          <select
            id="inp-education"
            className="input select"
            value={form.education}
            onChange={(e) => set('education', e.target.value)}
            disabled={!isEditing}
          >
            {EDUCATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Years of Experience">
          <input
            id="inp-experience"
            type="number"
            min={0}
            max={50}
            className="input"
            value={form.experienceYears}
            onChange={(e) => set('experienceYears', e.target.value)}
            disabled={!isEditing}
          />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location" icon="📍">
        <Field label="State">
          <input id="inp-state" className="input" value={form.state} onChange={(e) => set('state', e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="District">
          <input id="inp-district" className="input" value={form.district} onChange={(e) => set('district', e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Block / Mandal">
          <input id="inp-block" className="input" value={form.block} onChange={(e) => set('block', e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Village / Ward">
          <input id="inp-village" className="input" value={form.village} onChange={(e) => set('village', e.target.value)} disabled={!isEditing} />
        </Field>
      </Section>

      {/* Livelihood */}
      <Section title="Livelihood & Skills" icon="🏘">
        <Field label="Family Occupation">
          <input id="inp-fam-occ" className="input" value={form.familyOccupation} onChange={(e) => set('familyOccupation', e.target.value)} placeholder="e.g. Farming, Weaving..." disabled={!isEditing} />
        </Field>
        <Field label="Current Livelihood">
          <input id="inp-livelihood" className="input" value={form.currentLivelihood} onChange={(e) => set('currentLivelihood', e.target.value)} placeholder="e.g. Daily wage labour..." disabled={!isEditing} />
        </Field>
        <div style={{ gridColumn: 'span 2' }}>
          <Field label="Identified Skills">
            <input
              id="inp-skills"
              className="input"
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
              placeholder="e.g. Tailoring, Mobile Repair (comma separated)"
              disabled={!isEditing}
            />
          </Field>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences & Targets" icon="⚙️">
        <Field label="Employment Preference">
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Employment preference">
            {EMPLOYMENT_PREFS.map(({ value, label }) => (
              <button
                key={value}
                id={`pref-${value}`}
                type="button"
                className={`btn btn-sm ${form.employmentPreference === value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => isEditing && set('employmentPreference', value)}
                disabled={!isEditing}
                aria-pressed={form.employmentPreference === value}
                style={{
                  opacity: !isEditing && form.employmentPreference !== value ? 0.6 : 1,
                  cursor: !isEditing ? 'not-allowed' : 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Target Monthly Income (₹)">
          <input
            id="inp-income-goal"
            type="number"
            min={0}
            step={500}
            className="input"
            value={form.incomeGoal}
            onChange={(e) => set('incomeGoal', e.target.value)}
            disabled={!isEditing}
          />
        </Field>

        <Field label="Preferred Interface Channel">
          <select
            id="inp-channel"
            className="input select"
            value={form.channel}
            onChange={(e) => set('channel', e.target.value)}
            disabled={!isEditing}
          >
            {CHANNEL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </Section>

      {/* Mobility constraints */}
      <section className="card mb-6">
        <h2 className="text-lg font-semibold mb-2">⚠️ Mobility & Availability Constraints</h2>
        <p className="text-sm text-muted mb-4">Select constraints to help match you to local, feasible training centers:</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mobility constraints">
          {MOBILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              id={`mob-${opt.replace(/\s+/g, '-')}`}
              type="button"
              className={`btn btn-sm ${(form.mobilityConstraints || []).includes(opt) ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => isEditing && toggleMobility(opt)}
              disabled={!isEditing}
              aria-pressed={(form.mobilityConstraints || []).includes(opt)}
              style={{
                opacity: !isEditing && !(form.mobilityConstraints || []).includes(opt) ? 0.6 : 1,
                cursor: !isEditing ? 'not-allowed' : 'pointer'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Save Changes button at bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          id="btn-profile-save"
          className="btn btn-primary btn-lg w-full"
          onClick={handleSave}
          disabled={saving || !isEditing}
          aria-busy={saving}
          style={{
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: 700,
            boxShadow: isEditing ? '0 4px 14px rgba(202, 102, 3, 0.35)' : 'none',
            transition: 'all 0.2s',
            cursor: !isEditing ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving Changes...' : '💾 Save Changes'}
        </button>
        {!isEditing && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Click <strong>"Edit Profile"</strong> at the top-right above Personal Information to enable editing and save changes.
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;

