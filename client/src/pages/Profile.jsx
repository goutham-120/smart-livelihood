/* Profile.jsx: All profile fields in sections with save
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { SkeletonCard, ReadAloudButton, RiskBadge } from '../components.jsx';
import { getProfile, putProfile } from '../api.js';
import { useLang } from '../lang.js';
import './Profile.css';

const EDUCATION_OPTIONS = [
  'None', 'Primary School', 'Middle School', 'High School (10th)',
  'Intermediate (12th)', 'Diploma / ITI', 'Graduate', 'Postgraduate',
];

const EMPLOYMENT_PREFS = [
  { value: 'self',  label: '🏪 Self Employed' },
  { value: 'wage',  label: '💼 Wage Employment' },
  { value: 'either', label: '🤝 Either' },
];

const MOBILITY_OPTIONS = [
  'Cannot relocate', 'No own transport', 'Family caregiver',
  'Health disability', 'Seasonal constraint',
];

const CHANNEL_OPTIONS = [
  { value: 'web',       label: '🌐 Web' },
  { value: 'kiosk',     label: '🖥 Kiosk' },
  { value: 'whatsapp',  label: '💬 WhatsApp' },
  { value: 'ivr',       label: '📞 IVR Call' },
];

function Section({ title, icon, children }) {
  return (
    <section className="card mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      <div className="profile-section-grid">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { lang } = useLang();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data.profile || {};
        setProfile(p);
        setForm({
          language: p.language || 'en',
          state: p.state || 'Telangana',
          district: p.district || '',
          block: p.block || '',
          village: p.village || '',
          familyOccupation: p.familyOccupation || '',
          currentLivelihood: p.currentLivelihood || '',
          employmentPreference: p.employmentPreference || 'either',
          mobilityConstraints: p.mobilityConstraints || [],
          incomeGoal: p.incomeGoal || 15000,
          weeklyHours: p.weeklyHours || 40,
          education: p.education || 'Middle School',
          experienceYears: p.experienceYears || 0,
          channel: p.channel || 'web',
          skills: (p.skills || []).join(', '),
        });
      })
      .catch(() => toast(t('common.error'), 'error'))
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
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        incomeGoal: Number(form.incomeGoal),
        weeklyHours: Number(form.weeklyHours),
        experienceYears: Number(form.experienceYears),
      };
      const res = await putProfile(payload);
      setProfile(res.data.profile);
      toast(t('profile.saved'), 'success');
    } catch {
      toast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonCard rows={6} />;

  return (
    <div className="profile-root page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        <ReadAloudButton lang={lang} />
      </div>

      {/* Risk badge */}
      {profile && <div className="mb-4"><RiskBadge score={profile.riskScore} /></div>}

      {/* Personal info (read-only from user) */}
      <Section title={t('profile.personalInfo')} icon="👤">
        <div className="form-group">
          <label className="label">Name</label>
          <input className="input" value={user?.name || ''} disabled readOnly />
        </div>
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" value={user?.phone || ''} disabled readOnly />
        </div>
        <div className="form-group">
          <label className="label">Email</label>
          <input className="input" value={user?.email || ''} disabled readOnly />
        </div>
        <Field label={t('profile.education')}>
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
      <Section title={t('profile.locationInfo')} icon="📍">
        <Field label={t('profile.state')}>
          <input id="inp-state" className="input" value={form.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
        <Field label={t('profile.district')}>
          <input id="inp-district" className="input" value={form.district} onChange={(e) => set('district', e.target.value)} />
        </Field>
        <Field label={t('profile.block')}>
          <input id="inp-block" className="input" value={form.block} onChange={(e) => set('block', e.target.value)} />
        </Field>
        <Field label={t('profile.village')}>
          <input id="inp-village" className="input" value={form.village} onChange={(e) => set('village', e.target.value)} />
        </Field>
      </Section>

      {/* Livelihood */}
      <Section title={t('profile.livelihood')} icon="🏘">
        <Field label={t('profile.familyOccupation')}>
          <input id="inp-fam-occ" className="input" value={form.familyOccupation} onChange={(e) => set('familyOccupation', e.target.value)} placeholder="e.g. Farming, Weaving..." />
        </Field>
        <Field label={t('profile.currentLivelihood')}>
          <input id="inp-livelihood" className="input" value={form.currentLivelihood} onChange={(e) => set('currentLivelihood', e.target.value)} placeholder="e.g. Daily wage labour..." />
        </Field>
        <Field label={t('profile.skills')}>
          <input
            id="inp-skills"
            className="input"
            value={form.skills}
            onChange={(e) => set('skills', e.target.value)}
            placeholder="e.g. Tailoring, Mobile Repair (comma separated)"
          />
        </Field>
      </Section>

      {/* Preferences */}
      <Section title={t('profile.preferences')} icon="⚙️">
        <Field label={t('profile.employmentPref')}>
          <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={t('profile.employmentPref')}>
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

        <Field label={`${t('profile.incomeGoal')} (₹)`}>
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

        <Field label={t('profile.weeklyHours')}>
          <input
            id="inp-weekly-hours"
            type="number"
            min={0}
            max={80}
            className="input"
            value={form.weeklyHours}
            onChange={(e) => set('weeklyHours', e.target.value)}
          />
        </Field>

        <Field label="Preferred Channel">
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
        <h2 className="text-lg font-semibold mb-4">⚠️ Mobility Constraints</h2>
        <p className="text-sm text-muted mb-4">Select any constraints that apply to you. This helps match you to nearby training.</p>
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
        {saving ? 'Saving...' : `💾 ${t('profile.saveChanges')}`}
      </button>
    </div>
  );
}
