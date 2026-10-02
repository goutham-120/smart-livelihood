/* BeneficiaryLayout.jsx: Bottom nav shell for beneficiaries
   SIH26097 PM-AJAY Livelihood Assistant */
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { LanguageSwitcher, ReadAloudButton } from '../components.jsx';
import { useLang } from '../lang.js';
import './BeneficiaryLayout.css';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: '🏠', key: 'home' },
  { to: '/assistant',     icon: '🎙️', key: 'assistant' },
  { to: '/opportunities', icon: '✨', key: 'opportunities' },
  { to: '/progress',      icon: '📈', key: 'progress' },
  { to: '/profile',       icon: '👤', key: 'profile' },
];

export default function BeneficiaryLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="blay-root" lang={lang}>
      {/* Top bar */}
      <header className="blay-header" role="banner">
        <div className="blay-brand">
          <span className="blay-logo" aria-hidden="true">🌱</span>
          <span className="blay-title">{t('appName')}</span>
        </div>
        <div className="blay-header-actions">
          <ReadAloudButton lang={lang} />
          <LanguageSwitcher />
          {user?.role === 'admin' || user?.role === 'officer' ? (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin')}
              id="btn-goto-admin"
            >
              {t('nav.admin')}
            </button>
          ) : null}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            id="btn-logout"
            aria-label={t('nav.logout')}
          >
            ⇥ {t('nav.logout')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="blay-main page-enter" id="main-content" role="main">
        <Outlet />
      </main>

      {/* Bottom navigation for mobile (44px touch targets) */}
      <nav className="blay-bottom-nav" role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `blay-nav-item${isActive ? ' active' : ''}`}
            id={`nav-${key}`}
            aria-label={t(`nav.${key}`)}
          >
            <span className="blay-nav-icon" aria-hidden="true">{icon}</span>
            <span className="blay-nav-label">{t(`nav.${key}`)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
