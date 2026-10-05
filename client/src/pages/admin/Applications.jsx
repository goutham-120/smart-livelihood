/* admin/Applications.jsx: Training Applications & Admissions Desk
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, EmptyState, SyntheticBadge } from '../../components.jsx';
import { getEnrollments, updateEnrollmentStatus, api } from '../../api.js';
import { useToast } from '../../ToastContext.jsx';
import { RefreshCw, Sparkles, CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight, Phone, MapPin, GraduationCap, Award, Building2, Calendar } from 'lucide-react';
import './Applications.css';

export default function Applications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  let toast;
  try {
    toast = useToast();
  } catch (err) {
    toast = (msg) => console.log(msg);
  }

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'ACCEPTED' | 'REJECTED'
  const [search, setSearch] = useState('');
  const [centerFilter, setCenterFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEnrollments();
      setApplications(res.applications || []);
    } catch (err) {
      if (typeof toast === 'function') {
        toast('Failed to load training applications.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const res = await api.post('/enrollments/seed-demo');
      setApplications(res.data.applications || []);
      toast('Demo candidate applications seeded successfully.', 'success');
    } catch (err) {
      toast('Failed to seed demo candidates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus, providerMsg = '') => {
    try {
      await updateEnrollmentStatus(appId, { status: newStatus, providerMessage: providerMsg });
      toast(`Application status updated to ${newStatus.replace(/_/g, ' ')}.`, 'success');
      fetchApplications();
    } catch (err) {
      toast('Failed to update status.', 'error');
    }
  };

  // Metrics calculations
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length;
  const actionRequiredCount = applications.filter((a) => a.status === 'ACTION_REQUIRED').length;
  const acceptedCount = applications.filter((a) => ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(a.status)).length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  // Filtering logic
  const filteredApps = applications.filter((app) => {
    // Status filter
    let matchStatus = true;
    if (statusFilter === 'UNDER_REVIEW') {
      matchStatus = ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status);
    } else if (statusFilter === 'ACTION_REQUIRED') {
      matchStatus = app.status === 'ACTION_REQUIRED';
    } else if (statusFilter === 'ACCEPTED') {
      matchStatus = ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(app.status);
    } else if (statusFilter === 'REJECTED') {
      matchStatus = app.status === 'REJECTED';
    }

    // Search filter
    const matchSearch =
      !search ||
      app.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
      app.beneficiaryName?.toLowerCase().includes(search.toLowerCase()) ||
      app.beneficiaryPhone?.includes(search) ||
      app.courseTitle?.toLowerCase().includes(search.toLowerCase());

    // Center filter
    const matchCenter =
      centerFilter === 'all' ||
      app.trainingCenter?.id === centerFilter ||
      app.trainingCenter?.name?.toLowerCase().includes(centerFilter.toLowerCase());

    return matchStatus && matchSearch && matchCenter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
      case 'TRAINING_STARTED':
      case 'TRAINING_COMPLETED':
      case 'CERTIFIED':
        return <span className="badge badge-green" style={{ fontSize: '12px', padding: '4px 10px' }}>🎉 Accepted</span>;
      case 'ACTION_REQUIRED':
        return <span className="badge badge-amber" style={{ fontSize: '12px', padding: '4px 10px' }}>⚠ Action Required</span>;
      case 'REJECTED':
        return <span className="badge badge-red" style={{ fontSize: '12px', padding: '4px 10px' }}>❌ Rejected</span>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
      default:
        return <span className="badge badge-amber" style={{ fontSize: '12px', padding: '4px 10px', background: '#ffe4e6', color: '#9f1239', border: '1px solid #fecdd3' }}>🟠 Under Review</span>;
    }
  };

  const districtName = user?.district || 'Warangal';

  return (
    <div className="app-page-container page-enter">
      {/* 1. TOP PAGE HEADER */}
      <div className="app-top-tag">
        <Building2 size={14} className="text-saffron" />
        <span>TRAINING PROVIDER PORTAL · {districtName} District Accredited Centers</span>
      </div>

      <h1 className="app-page-title">Training Applications & Admissions Desk</h1>
      
      <p className="app-page-subtitle">
        Review incoming beneficiary applications, verify biometric & education credentials, issue batch seat confirmations, or request missing documents.
      </p>

      <div className="app-header-actions">
        <button onClick={fetchApplications} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={handleSeedDemo} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600 }}>
          <Sparkles size={14} /> Seed Demo Candidates
        </button>
        <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, marginLeft: 'auto' }}>
          View Beneficiary Portal &rarr;
        </Link>
      </div>

      {/* 2. SUMMARY CARDS ROW (5 CARDS) */}
      <div className="app-summary-grid">
        <div className="app-summary-card">
          <div className="app-summary-title">Total Applications</div>
          <div className="app-summary-val">{totalCount}</div>
          <div className="app-summary-sub">Across {districtName} Centers</div>
        </div>

        <div className="app-summary-card">
          <div className="app-summary-title">Pending Review</div>
          <div className="app-summary-val" style={{ color: 'var(--primary-600, #CA6603)' }}>{pendingCount}</div>
          <div className="app-summary-sub">Awaiting Coordinator Decision</div>
        </div>

        <div className="app-summary-card">
          <div className="app-summary-title">Action Required</div>
          <div className="app-summary-val" style={{ color: '#d97706' }}>{actionRequiredCount}</div>
          <div className="app-summary-sub">Missing / Blurry Documents</div>
        </div>

        <div className="app-summary-card">
          <div className="app-summary-title">Seats Confirmed</div>
          <div className="app-summary-val" style={{ color: '#16a34a' }}>{acceptedCount}</div>
          <div className="app-summary-sub">Upcoming Batch Allocated</div>
        </div>

        <div className="app-summary-card">
          <div className="app-summary-title">Not Accepted</div>
          <div className="app-summary-val" style={{ color: '#dc2626' }}>{rejectedCount}</div>
          <div className="app-summary-sub">Capacity or Criteria</div>
        </div>
      </div>

      {/* 3. FILTER BAR */}
      <div className="app-filter-bar">
        <div className="app-filter-tabs">
          <button
            className={`app-filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={`app-filter-pill ${statusFilter === 'UNDER_REVIEW' ? 'active' : ''}`}
            onClick={() => setStatusFilter('UNDER_REVIEW')}
          >
            Under Review ({pendingCount})
          </button>
          <button
            className={`app-filter-pill ${statusFilter === 'ACTION_REQUIRED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTION_REQUIRED')}
          >
            Action Required ({actionRequiredCount})
          </button>
          <button
            className={`app-filter-pill ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACCEPTED')}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            className={`app-filter-pill ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="app-filter-controls">
          <select
            className="input select"
            style={{ height: '38px', fontSize: '13px', padding: '4px 10px', maxWidth: '200px' }}
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
          >
            <option value="all">All Accredited Centers</option>
            <option value="Government ITI Warangal">Government ITI Warangal</option>
            <option value="Warangal Solar">Warangal Solar Center</option>
            <option value="District Dairy">District Dairy Cooperative</option>
            <option value="Kashish Skill Academy">Kashish Skill Academy</option>
          </select>

          <input
            type="text"
            className="input app-search-input"
            placeholder="🔍 Search candidate or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 4. APPLICATION LIST */}
      {loading ? (
        <div className="app-card-list">
          <SkeletonCard height={240} />
          <SkeletonCard height={240} />
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No training applications match criteria"
          description="Adjust your search filters or click Seed Demo Candidates to load test applications."
          action={
            <button onClick={handleSeedDemo} className="btn btn-primary btn-sm mt-2">
              <Sparkles size={14} /> Seed Demo Candidates
            </button>
          }
        />
      ) : (
        <div className="app-card-list">
          {filteredApps.map((app) => {
            const submittedDateStr = app.submittedAt
              ? new Date(app.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '5 Oct 2026';

            const docs = app.documents || [
              { key: 'aadhaar', name: 'Aadhaar Card', status: 'provided', notes: 'Verified' },
              { key: 'bank_passbook', name: 'Bank Passbook / DBT Linkage', status: 'provided', notes: 'Verified' },
              { key: 'passport_photo', name: 'Passport-size Photographs (4)', status: 'missing', notes: 'Pending upload' },
              { key: 'education_certificate', name: 'Educational Certificate (10th/12th)', status: 'provided', notes: 'Verified' }
            ];

            return (
              <div key={app._id || app.applicationId} className="app-card">
                {/* TOP ROW: ID, Name, Submitted Date, Status Badge */}
                <div className="app-card-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="app-card-id-badge">{app.applicationId}</span>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main, #4F3728)' }}>
                      {app.beneficiaryName}
                    </span>
                    {app.isSynthetic && <SyntheticBadge />}
                    <span style={{ fontSize: '13px', color: 'var(--text-muted, #6b5240)' }}>
                      Submitted {submittedDateStr}
                    </span>
                  </div>

                  <div>{getStatusBadge(app.status)}</div>
                </div>

                {/* 5. TWO-COLUMN INFORMATION AREA */}
                <div className="app-two-col-grid">
                  {/* LEFT: APPLICANT INFORMATION */}
                  <div>
                    <div className="app-col-title">APPLICANT INFORMATION</div>
                    <div className="app-info-list">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} className="text-muted" />
                        <span><strong>Phone:</strong> {app.beneficiaryPhone || '9876543210'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} className="text-muted" />
                        <span><strong>District:</strong> {app.beneficiaryDistrict || districtName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <GraduationCap size={14} className="text-muted" />
                        <span><strong>Education:</strong> {app.beneficiaryEducation || 'Secondary (10th)'}</span>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Trade Skills:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {(app.beneficiarySkills || ['sewing machine operation', 'hand embroidery', 'garment pattern cutting', 'tractor farm machinery']).map((sk) => (
                            <span key={sk} className="app-skill-badge">{sk}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: TRAINING PROGRAM & CENTER */}
                  <div>
                    <div className="app-col-title">TRAINING PROGRAM & CENTER</div>
                    <div className="app-info-list">
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #4F3728)' }}>
                        {app.courseTitle || 'Tractor Mechanic and Operator Training'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--primary-700, #b35a02)', fontWeight: 600 }}>
                        Qualification: {app.qpCode || 'AGR/Q8341'} (NSQF Level {app.nsqfLevel || 3}) · Duration: {app.durationMonths || 3} Months
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Building2 size={14} className="text-muted" />
                        <span><strong>{app.trainingCenter?.name || 'Government ITI Warangal (Boys & Girls)'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} className="text-muted" />
                        <span><strong>Next Batch:</strong> {app.orientationDate || '15th of next month, 10:00 AM'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. CREDENTIAL VERIFICATION CHECKLIST */}
                <div className="app-doc-section">
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Credential Verification Checklist
                  </div>
                  <div className="app-doc-grid">
                    {docs.map((doc) => (
                      <div key={doc.key} className="app-doc-item">
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                          {doc.name}
                        </div>
                        {doc.status === 'provided' ? (
                          <span className="badge badge-green" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            ✓ Provided / Uploaded
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '11px', padding: '2px 8px', background: '#fef3c7', color: '#92400e' }}>
                            ⚠ Missing / Requested
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. MESSAGE / APPLICATION STATUS NOTICE */}
                {app.providerMessage && (
                  <div style={{ background: '#fff8f0', border: '1px solid #fce7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', fontSize: '13px', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                    <span><strong>Provider Note:</strong> {app.providerMessage}</span>
                  </div>
                )}

                {/* 8. ACTION BUTTONS & STATUS STATES */}
                <div className="app-action-bar">
                  {['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(app.status) ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Seat Confirmed & Allocated (Batch Start: {app.orientationDate || '15th of next month, 10:00 AM'})
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.applicationId, 'UNDER_REVIEW', 'Application moved back to Under Review.')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        Re-open for Review
                      </button>
                    </div>
                  ) : app.status === 'REJECTED' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <XCircle size={16} /> Application Not Granted ({app.rejectionReason || 'Batch capacity full'})
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(app._id || app.applicationId, 'UNDER_REVIEW', 'Application re-opened for review.')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        Re-open Application
                      </button>
                    </div>
                  ) : (
                    <>
                      {app.status === 'ACTION_REQUIRED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id || app.applicationId, 'UNDER_REVIEW', 'Application moved back to Under Review stage.')}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '12px', padding: '8px 14px', fontWeight: 600 }}
                        >
                          Move to Under Review
                        </button>
                      )}

                      {app.status !== 'ACTION_REQUIRED' && (
                        <button
                          onClick={() => handleUpdateStatus(app._id || app.applicationId, 'ACTION_REQUIRED', 'Please upload your passport-size photograph to proceed.')}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '12px', padding: '8px 14px', fontWeight: 600, color: '#d97706', borderColor: '#fef3c7' }}
                        >
                          Request Action / Documents
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(app._id || app.applicationId, 'REJECTED', 'Batch seats are currently full for this session.')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px', padding: '8px 14px', fontWeight: 600, color: '#dc2626', borderColor: '#fee2e2' }}
                      >
                        Reject Application
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(app._id || app.applicationId, 'ACCEPTED', 'Congratulations! Your enrollment request has been accepted.')}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 700 }}
                      >
                        Accept Application
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { Applications };
