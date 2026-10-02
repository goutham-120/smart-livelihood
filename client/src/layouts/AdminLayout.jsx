/* AdminLayout.jsx: Sidebar shell for officer and admin roles
   SIH26097 PM-AJAY Livelihood Assistant */
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { LanguageSwitcher, ReadAloudButton } from '../components.jsx';
import { useLang } from '../lang.js';
import './AdminLayout.css';

const ADMIN_NAV = [
  { to: '/admin/overview',      icon: '📊', key: 'overview' },
  { to: '/admin/beneficiaries', icon: '👥', key: 'beneficiaries' },
  { to: '/admin/placements',    icon: '🏆', key: 'placements' },
  { to: '/admin/coordination',  icon: '🤝', key: 'coordination' },
  { to: '/admin/plan',          icon: '🗺️',  key: 'plan' },
  { to: '/admin/directory',     icon: '📚', key: 'directory' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="alay-root" lang={lang}>
      {/* Sidebar */}
      <aside className="alay-sidebar" role="complementary" aria-label="Admin navigation">
        <div className="alay-sidebar-top">
          <div className="alay-brand">
            <span className="alay-logo" aria-hidden="true">🌱</span>
            <div>
              <div className="alay-title">{t('appName')}</div>
              <div className="alay-subtitle" style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role === 'admin' ? 'Admin Portal' : `Officer · ${user?.district || ''}`}
              </div>
            </div>
          </div>

          <nav aria-label="Admin pages">
            {ADMIN_NAV.map(({ to, icon, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `alay-nav-item${isActive ? ' active' : ''}`}
                id={`admin-nav-${key}`}
                aria-label={t(`admin.${key}`)}
              >
                <span className="alay-nav-icon" aria-hidden="true">{icon}</span>
                <span className="alay-nav-label">{t(`admin.${key}`)}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="alay-sidebar-bottom">
          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={() => navigate('/dashboard')}
            id="btn-switch-to-beneficiary"
            style={{ justifyContent: 'flex-start' }}
          >
            ← Beneficiary View
          </button>
          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={handleLogout}
            id="btn-admin-logout"
            style={{ justifyContent: 'flex-start' }}
          >
            ⇥ {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="alay-content-wrap">
        <header className="alay-topbar" role="banner">
          <div />
          <div className="flex items-center gap-3">
            <ReadAloudButton lang={lang} />
            <LanguageSwitcher />
          </div>
        </header>
        <main className="alay-main page-enter" id="main-content" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
