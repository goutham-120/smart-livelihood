/* Profile.jsx: Beneficiary profile review, education, mobility constraints, skills
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { SkeletonCard, RiskBadge, ReadAloudButton } from '../components.jsx';
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
  const auth = useAuth?.();
  const user = auth?.user || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('pmajay_user') || 'null'));
  const toastCtx = useToast?.();
  const toast = toastCtx?.addToast || ((msg) => console.log(msg));
  const { lang } = useLang();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data?.profile || res.data || {};
        setProfile(p);
        setForm({
          state: p.state || 'Telangana',
          district: p.district || 'Warangal',
          block: p.block || '',
          village: p.village || '',
          familyOccupation: p.familyOccupation || '',
          currentLivelihood: p.currentLivelihood || '',
          education: p.education || 'Secondary (10th)',
          employmentPreference: p.employmentPreference || 'both',
          incomeGoal: p.incomeGoal || 15000,
          weeklyHours: p.weeklyHours || 40,
          mobilityConstraints: p.mobilityConstraints || [],
          experienceYears: p.experienceYears || 0,
          channel: p.channel || 'web',
          skills: (p.skills || []).join(', '),
        });
      })
      .catch(() => toast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleMobility = (opt) => {
    const arr = form.mobilityConstraints || [];
    set('mobilityConstraints', arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
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
      };
      const res = await putProfile(payload);
      setProfile(res.data?.profile || payload);
      toast(t ? t('profile.saved', 'Profile updated successfully!') : 'Profile updated successfully!', 'success');
    } catch {
      toast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="profile-root"><SkeletonCard rows={6} /></div>;

  return (
    <div className="profile-root page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t ? t('profile.title', 'My Profile & Preferences') : 'My Profile & Preferences'}</h1>
          <p className="text-muted text-sm mt-1">Review and manage your skilling profile, location, and livelihood goals</p>
        </div>
        <ReadAloudButton lang={lang} />
      </div>

      {profile && <div className="mb-4"><RiskBadge score={profile.riskScore} /></div>}

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
          />
        </Field>
      </Section>

      {/* Location */}
      <Section title="Location" icon="📍">
        <Field label="State">
          <input id="inp-state" className="input" value={form.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
        <Field label="District">
          <input id="inp-district" className="input" value={form.district} onChange={(e) => set('district', e.target.value)} />
        </Field>
        <Field label="Block / Mandal">
          <input id="inp-block" className="input" value={form.block} onChange={(e) => set('block', e.target.value)} />
        </Field>
        <Field label="Village / Ward">
          <input id="inp-village" className="input" value={form.village} onChange={(e) => set('village', e.target.value)} />
        </Field>
      </Section>

      {/* Livelihood */}
      <Section title="Livelihood & Skills" icon="🏘">
        <Field label="Family Occupation">
          <input id="inp-fam-occ" className="input" value={form.familyOccupation} onChange={(e) => set('familyOccupation', e.target.value)} placeholder="e.g. Farming, Weaving..." />
        </Field>
        <Field label="Current Livelihood">
          <input id="inp-livelihood" className="input" value={form.currentLivelihood} onChange={(e) => set('currentLivelihood', e.target.value)} placeholder="e.g. Daily wage labour..." />
        </Field>
        <div style={{ gridColumn: 'span 2' }}>
          <Field label="Identified Skills">
            <input
              id="inp-skills"
              className="input"
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
              placeholder="e.g. Tailoring, Mobile Repair (comma separated)"
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
                onClick={() => set('employmentPreference', value)}
                aria-pressed={form.employmentPreference === value}
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
          />
        </Field>

        <Field label="Preferred Interface Channel">
          <select
            id="inp-channel"
            className="input select"
            value={form.channel}
            onChange={(e) => set('channel', e.target.value)}
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
              onClick={() => toggleMobility(opt)}
              aria-pressed={(form.mobilityConstraints || []).includes(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Save button */}
      <button
        id="btn-profile-save"
        className="btn btn-primary btn-lg w-full"
        onClick={handleSave}
        disabled={saving}
        aria-busy={saving}
      >
        {saving ? 'Saving...' : '💾 Save Profile & Preferences'}
      </button>
    </div>
  );
}

export default Profile;
