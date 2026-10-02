/* App.jsx: Router shell with role-based layouts and route guards
   SIH26097 PM-AJAY Livelihood Assistant */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from './components.jsx';

/* Page imports */
const Login      = lazy(() => import('./pages/Login.jsx'));
const Dashboard  = lazy(() => import('./pages/Dashboard.jsx'));
const Profile    = lazy(() => import('./pages/Profile.jsx'));
const Progress   = lazy(() => import('./pages/Progress.jsx'));
const Consent    = lazy(() => import('./pages/Consent.jsx'));
const Assistant  = lazy(() => import('./pages/Assistant.jsx'));
const Opportunities = lazy(() => import('./pages/Opportunities.jsx'));

/* Admin pages */
const AdminOverview       = lazy(() => import('./pages/admin/Overview.jsx'));
const AdminBeneficiaries  = lazy(() => import('./pages/admin/Beneficiaries.jsx'));
const AdminPlacements     = lazy(() => import('./pages/admin/Placements.jsx'));
const AdminCoordination   = lazy(() => import('./pages/admin/Coordination.jsx'));
const AdminPlan           = lazy(() => import('./pages/admin/PerspectivePlan.jsx'));
const AdminDirectory      = lazy(() => import('./pages/admin/Directory.jsx'));

/* Layout shells */
import BeneficiaryLayout from './layouts/BeneficiaryLayout.jsx';
import AdminLayout       from './layouts/AdminLayout.jsx';

function PageFallback() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '60dvh' }}>
      <Spinner size={40} />
    </div>
  );
}

/* Route guard: redirect to /login if unauthenticated */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/* Route guard: admin or officer only */
function RequireStaff({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!['admin', 'officer'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/* Offline banner */
function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="offline-banner" role="alert">
      📡 {t('common.offline')}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Consent page (requires auth, shown before assistant if no consent) */}
          <Route
            path="/consent"
            element={
              <RequireAuth>
                <Consent />
              </RequireAuth>
            }
          />

          {/* Beneficiary layout routes */}
          <Route
            element={
              <RequireAuth>
                <BeneficiaryLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/profile"      element={<Profile />} />
            <Route path="/progress"     element={<Progress />} />
            <Route path="/assistant"    element={<Assistant />} />
            <Route path="/opportunities" element={<Opportunities />} />
          </Route>

          {/* Admin / officer layout routes */}
          <Route
            path="/admin"
            element={
              <RequireStaff>
                <AdminLayout />
              </RequireStaff>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview"      element={<AdminOverview />} />
            <Route path="beneficiaries" element={<AdminBeneficiaries />} />
            <Route path="placements"    element={<AdminPlacements />} />
            <Route path="coordination"  element={<AdminCoordination />} />
            <Route path="plan"          element={<AdminPlan />} />
            <Route path="directory"     element={<AdminDirectory />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
