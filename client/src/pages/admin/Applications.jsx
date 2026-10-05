import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, CheckCircle, Clock, AlertTriangle, XCircle, Search, RefreshCw,
  Building, User, Phone, MapPin, Calendar, Check, X, Send, Sparkles, Filter,
  ArrowRight, ShieldCheck, Download, Paperclip, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { api } from '../../api.js';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    underReview: 0,
    actionRequired: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters
  const [selectedTab, setSelectedTab] = useState('ALL'); // ALL | REVIEW | ACTION | ACCEPTED | REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('ALL');

  // Modal State for Review Actions
  const [activeModal, setActiveModal] = useState(null); // 'accept' | 'action' | 'reject' | null
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields for Modals
  const [acceptMessage, setAcceptMessage] = useState('');
  const [actionDocKey, setActionDocKey] = useState('passport_photo');
  const [actionMessage, setActionMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Batch capacity reached for this session. Candidate advised to apply for the next upcoming cycle.');

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllEnrollmentApplications();
      setApplications(data.applications || []);
      setCounts(data.counts || {
        total: (data.applications || []).length,
        underReview: (data.applications || []).filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length,
        actionRequired: (data.applications || []).filter(a => a.status === 'ACTION_REQUIRED').length,
        accepted: (data.applications || []).filter(a => ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(a.status)).length,
        rejected: (data.applications || []).filter(a => a.status === 'REJECTED').length
      });
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to fetch applications. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Seed sample demo applications
  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      await api.seedDemoApplications();
      showToast('Sample training applications loaded successfully!');
      await fetchApplications();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
      setError('Failed to seed demo applications.');
      setLoading(false);
    }
  };

  // Trigger Accept Modal
  const openAcceptModal = (app) => {
    setSelectedApp(app);
    setAcceptMessage(`Congratulations ${app.beneficiaryName || 'Candidate'}! Your enrollment request has been approved. A seat is reserved in the upcoming batch starting ${app.orientationDate || '15th of next month'}.`);
    setActiveModal('accept');
  };

  // Trigger Action Required Modal
  const openActionModal = (app) => {
    setSelectedApp(app);
    // Find first missing document if any
    const missing = (app.documents || []).find(d => d.status === 'missing');
    const targetKey = missing ? missing.key : 'passport_photo';
    setActionDocKey(targetKey);
    setActionMessage('The training center coordinator has requested your passport-size photograph to finalize your badge.');
    setActiveModal('action');
  };

  // Trigger Reject Modal
  const openRejectModal = (app) => {
    setSelectedApp(app);
    setRejectionReason('Batch capacity reached for this session. Candidate advised to apply for the next upcoming cycle.');
    setActiveModal('reject');
  };

  // Submit Accept
  const handleConfirmAccept = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await api.updateEnrollmentStatus(selectedApp.applicationId || selectedApp._id, {
        status: 'ACCEPTED',
        providerMessage: acceptMessage
      });
      showToast(`Application ${selectedApp.applicationId} accepted! Seat confirmed.`);
      setActiveModal(null);
      await fetchApplications();
    } catch (err) {
      console.error('Failed to accept application:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Action Required
  const handleConfirmAction = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await api.updateEnrollmentStatus(selectedApp.applicationId || selectedApp._id, {
        status: 'ACTION_REQUIRED',
        providerMessage: actionMessage,
        requestedDocument: actionDocKey
      });
      showToast(`Action request sent to ${selectedApp.beneficiaryName || 'beneficiary'}.`);
      setActiveModal(null);
      await fetchApplications();
    } catch (err) {
      console.error('Failed to request action:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Rejection
  const handleConfirmReject = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await api.updateEnrollmentStatus(selectedApp.applicationId || selectedApp._id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason,
        providerMessage: rejectionReason
      });
      showToast(`Application ${selectedApp.applicationId} marked not accepted.`);
      setActiveModal(null);
      await fetchApplications();
    } catch (err) {
      console.error('Failed to reject application:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick move to Under Review
  const handleSetUnderReview = async (app) => {
    try {
      await api.updateEnrollmentStatus(app.applicationId || app._id, {
        status: 'UNDER_REVIEW',
        providerMessage: 'Training coordinator is actively reviewing candidate documents.'
      });
      showToast(`Application ${app.applicationId} moved to Under Review.`);
      await fetchApplications();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Centers for filter dropdown
  const centerNames = useMemo(() => {
    const set = new Set();
    applications.forEach(a => {
      if (a.trainingCenter?.name) set.add(a.trainingCenter.name);
    });
    return Array.from(set);
  }, [applications]);

  // Filtered List
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Tab filter
      if (selectedTab === 'REVIEW' && !['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)) return false;
      if (selectedTab === 'ACTION' && app.status !== 'ACTION_REQUIRED') return false;
      if (selectedTab === 'ACCEPTED' && !['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(app.status)) return false;
      if (selectedTab === 'REJECTED' && app.status !== 'REJECTED') return false;

      // Center filter
      if (selectedCenter !== 'ALL' && app.trainingCenter?.name !== selectedCenter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (app.beneficiaryName || '').toLowerCase().includes(q);
        const matchId = (app.applicationId || '').toLowerCase().includes(q);
        const matchCourse = (app.courseTitle || '').toLowerCase().includes(q);
        const matchPhone = (app.beneficiaryPhone || '').includes(q);
        const matchDistrict = (app.beneficiaryDistrict || '').toLowerCase().includes(q);
        return matchName || matchId || matchCourse || matchPhone || matchDistrict;
      }

      return true;
    });
  }, [applications, selectedTab, selectedCenter, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800 }}>🟠 Under Review</span>;
      case 'ACTION_REQUIRED':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '11px', fontWeight: 800 }}>⚠ Action Required</span>;
      case 'ACCEPTED':
        return <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 800 }}>✓ Accepted</span>;
      case 'REJECTED':
        return <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '11px', fontWeight: 800 }}>✕ Not Accepted</span>;
      case 'TRAINING_STARTED':
        return <span className="badge badge-blue" style={{ fontSize: '11px', fontWeight: 800 }}>📘 In Training</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px 48px 20px' }}>
      {/* TOAST ALERT */}
      {successToast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, background: '#16a34a', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
          <CheckCircle size={18} /> {successToast}
        </div>
      )}

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
              Training Provider Portal
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Warangal District Accredited Centers
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            Training Applications & Admissions Desk
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '700px' }}>
            Review incoming beneficiary applications, verify biometric & education credentials, issue batch seat confirmations, or request missing documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleSeedDemo}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'var(--primary-600)', color: 'var(--primary-700)' }}
            title="Populate demo applications across different stages for testing"
          >
            <Sparkles size={14} /> Seed Demo Candidates
          </button>
          <a
            href="/roadmap"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            View Beneficiary Portal <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ background: '#fff', borderColor: 'var(--border-warm)', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Applications</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {counts.total}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across Warangal Centers</div>
        </div>

        <div className="card" style={{ background: '#fff', borderColor: '#fde68a', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Pending Review</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
            {counts.underReview}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Awaiting Coordinator Decision</div>
        </div>

        <div className="card" style={{ background: '#fff', borderColor: '#fed7aa', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600 }}>Action Required</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ea580c', margin: '4px 0' }}>
            {counts.actionRequired}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Missing / Blurry Documents</div>
        </div>

        <div className="card" style={{ background: '#fff', borderColor: '#bbf7d0', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Seats Confirmed</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
            {counts.accepted}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upcoming Batch Allocated</div>
        </div>

        <div className="card" style={{ background: '#fff', borderColor: '#fecaca', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 600 }}>Not Accepted</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
            {counts.rejected}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capacity or Criteria</div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="card" style={{ background: '#fff', borderColor: 'var(--border-warm)', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedTab('ALL')}
              className={`btn btn-sm ${selectedTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setSelectedTab('REVIEW')}
              className={`btn btn-sm ${selectedTab === 'REVIEW' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Under Review ({counts.underReview})
            </button>
            <button
              onClick={() => setSelectedTab('ACTION')}
              className={`btn btn-sm ${selectedTab === 'ACTION' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Action Required ({counts.actionRequired})
            </button>
            <button
              onClick={() => setSelectedTab('ACCEPTED')}
              className={`btn btn-sm ${selectedTab === 'ACCEPTED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Accepted ({counts.accepted})
            </button>
            <button
              onClick={() => setSelectedTab('REJECTED')}
              className={`btn btn-sm ${selectedTab === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {/* Search & Center Filter */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1', minWidth: '280px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {centerNames.length > 0 && (
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '12px', background: '#fff', maxWidth: '240px' }}
              >
                <option value="ALL">All Accredited Centers</option>
                {centerNames.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            )}

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search candidate or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* APPLICATIONS LIST */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--primary-600)' }} />
          Loading applications data from database...
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card" style={{ padding: '50px 20px', textAlign: 'center', background: '#fff', borderColor: 'var(--border-warm)' }}>
          <FileText size={40} style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0' }}>No applications match the current filter</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Try clearing search filters or seed sample candidate applications to test the workflow.
          </p>
          <button onClick={handleSeedDemo} className="btn btn-primary btn-sm">
            <Sparkles size={14} style={{ marginRight: '6px' }} /> Seed Sample Demo Applications
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredApplications.map((app) => {
            const isAccepted = ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(app.status);
            const isActionReq = app.status === 'ACTION_REQUIRED';
            const isRejected = app.status === 'REJECTED';
            const isReview = ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status);

            const totalDocs = app.documents?.length || 4;
            const uploadedDocs = (app.documents || []).filter(d => d.status === 'provided').length;

            return (
              <div
                key={app.applicationId || app._id}
                className="card"
                style={{
                  background: '#fff',
                  borderColor: isAccepted ? '#86efac' : isActionReq ? '#fde68a' : isRejected ? '#fca5a5' : 'var(--border-warm)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                {/* CARD HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-800)', background: 'var(--surface-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                      {app.applicationId}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {app.beneficiaryName}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Submitted {new Date(app.submittedAt || app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* DETAILS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
                  {/* Candidate Info */}
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Applicant Information
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="var(--primary-600)" />
                        <a href={`tel:${app.beneficiaryPhone}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>
                          {app.beneficiaryPhone || '+91 Not Provided'}
                        </a>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color="var(--primary-600)" />
                        <span>District: <strong>{app.beneficiaryDistrict || 'Warangal'}</strong></span>
                      </div>
                      <div>
                        Education: <strong>{app.beneficiaryEducation || '10th Standard'}</strong>
                      </div>
                      {app.beneficiarySkills && app.beneficiarySkills.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trade Skills: </span>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {app.beneficiarySkills.map((sk, idx) => (
                              <span key={idx} className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {sk.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Program Applied */}
                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Training Program & Center
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {app.courseTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Qualification: <strong>{app.qpCode} (NSQF Level {app.nsqfLevel})</strong> • Duration: {app.durationMonths || 3} Months
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <Building size={13} color="var(--primary-600)" />
                      <strong>{app.trainingCenter?.name || 'Accredited Center'}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Next Batch: <strong>{app.orientationDate || '15th of next month'}</strong>
                    </div>
                  </div>
                </div>

                {/* DOCUMENTS VERIFICATION ROW */}
                <div style={{ background: '#fdfcf9', border: '1px solid var(--border-warm)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                      Credential Verification Checklist ({uploadedDocs} of {totalDocs} Attached)
                    </span>
                    <span className={uploadedDocs === totalDocs ? 'badge badge-green' : 'badge badge-amber'} style={{ fontSize: '10px' }}>
                      {uploadedDocs === totalDocs ? 'All Docs Verified' : `${totalDocs - uploadedDocs} Missing`}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '12px' }}>
                    {(app.documents || []).map((doc) => {
                      const isUploaded = doc.status === 'provided';
                      return (
                        <div
                          key={doc.key}
                          style={{
                            padding: '6px 10px',
                            background: isUploaded ? '#f0fdf4' : '#fffbeb',
                            border: isUploaded ? '1px solid #bbf7d0' : '1px solid #fde68a',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: isUploaded ? '#166534' : '#92400e' }}>
                              {doc.name}
                            </div>
                            {doc.fileName && (
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                📎 {doc.fileName} {doc.fileSize && `(${doc.fileSize})`}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: isUploaded ? '#16a34a' : '#d97706' }}>
                            {isUploaded ? '✓ Uploaded' : '⚠ Missing'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CURRENT PROVIDER MESSAGE */}
                {app.providerMessage && (
                  <div style={{ fontSize: '12px', background: 'var(--surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-600)', marginBottom: '14px', color: 'var(--text-muted)' }}>
                    <strong>Message shown to candidate:</strong> "{app.providerMessage}"
                  </div>
                )}

                {/* ACTION BUTTONS ROW */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  {!isReview && (
                    <button
                      onClick={() => handleSetUnderReview(app)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '5px 12px' }}
                    >
                      Move to Under Review
                    </button>
                  )}

                  <button
                    onClick={() => openActionModal(app)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '5px 12px', borderColor: '#d97706', color: '#b45309', fontWeight: 700 }}
                  >
                    ⚠ Request Action / Documents
                  </button>

                  <button
                    onClick={() => openRejectModal(app)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '5px 12px', borderColor: '#dc2626', color: '#dc2626', fontWeight: 700 }}
                  >
                    ✕ Reject Application
                  </button>

                  <button
                    onClick={() => openAcceptModal(app)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '11px', padding: '5px 14px', fontWeight: 700, background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    ✓ Accept Application
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACCEPT APPLICATION                                                 */}
      {/* ========================================================================= */}
      {activeModal === 'accept' && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={22} color="#16a34a" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Accept Enrollment Application</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              You are approving <strong>{selectedApp.beneficiaryName}</strong> for <strong>{selectedApp.courseTitle}</strong> at {selectedApp.trainingCenter?.name}.
            </p>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '12px' }}>
              <div>Next Batch: <strong>{selectedApp.orientationDate || '15th of next month, 10:00 AM'}</strong></div>
              <div>Venue: <strong>{selectedApp.orientationVenue || 'Main Workshop Block'}</strong></div>
              <div style={{ color: '#16a34a', marginTop: '4px', fontWeight: 700 }}>✓ 100% Free Govt. Grant (PM-AJAY Stipend linked via Aadhaar)</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Confirmation Message to Candidate:
              </label>
              <textarea
                rows={3}
                value={acceptMessage}
                onChange={(e) => setAcceptMessage(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={actionLoading}>
                Cancel
              </button>
              <button onClick={handleConfirmAccept} className="btn btn-primary btn-sm" style={{ background: '#16a34a', borderColor: '#16a34a' }} disabled={actionLoading}>
                {actionLoading ? 'Allocating Seat...' : 'Confirm Seat & Notify Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUEST ACTION / DOCUMENTS                                         */}
      {/* ========================================================================= */}
      {activeModal === 'action' && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={22} color="#d97706" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Request Action / Missing Documents</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Specify the document or clarification required from <strong>{selectedApp.beneficiaryName}</strong>. The application status will shift to <strong>Action Required</strong> in their portal with an upload prompt.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Select Requested Document:
              </label>
              <select
                value={actionDocKey}
                onChange={(e) => {
                  setActionDocKey(e.target.value);
                  const docNames = {
                    passport_photo: 'passport-size photograph',
                    aadhaar: 'clear Aadhaar card copy',
                    bank_passbook: 'Aadhaar-linked bank passbook scan',
                    education_certificate: '10th/12th educational marksheet'
                  };
                  setActionMessage(`The training coordinator has requested your ${docNames[e.target.value] || 'document'} to proceed with verification.`);
                }}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '13px' }}
              >
                <option value="passport_photo">Passport-size Photographs (4)</option>
                <option value="aadhaar">Aadhaar Card (Biometric ID)</option>
                <option value="bank_passbook">Bank Passbook / DBT Linkage</option>
                <option value="education_certificate">Educational Certificate (10th/12th)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Instruction Message to Candidate:
              </label>
              <textarea
                rows={3}
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={actionLoading}>
                Cancel
              </button>
              <button onClick={handleConfirmAction} className="btn btn-primary btn-sm" style={{ background: '#d97706', borderColor: '#d97706' }} disabled={actionLoading}>
                {actionLoading ? 'Sending...' : 'Send Request to Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT APPLICATION                                                 */}
      {/* ========================================================================= */}
      {activeModal === 'reject' && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={22} color="#dc2626" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#dc2626' }}>Reject Application</h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Are you sure you want to mark <strong>{selectedApp.beneficiaryName}</strong>'s application as not accepted?
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Rejection Reason / Guidance:
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', fontSize: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={actionLoading}>
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="btn btn-primary btn-sm" style={{ background: '#dc2626', borderColor: '#dc2626' }} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
