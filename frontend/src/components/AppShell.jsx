import { Landmark } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UserProfile from './UserProfile';

const navigation = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/analytics', label: 'Analytics' },
  { to: '/heatmap', label: 'Geography' },
  { to: '/features', label: 'Reports & tools' },
];

export default function AppShell({ title, description, children }) {
  return (
    <div className="app-theme min-h-screen">
      <Helmet>
        <title>{title} | Unified Performance Dashboard</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <NavLink to="/dashboard" className="app-brand" aria-label="Unified Performance Dashboard overview">
            <span className="app-brand-mark"><Landmark size={19} strokeWidth={1.8} /></span>
            <span className="app-brand-copy">
              <strong>Unified Performance Dashboard</strong>
              <small>MoRD scheme monitoring</small>
            </span>
          </NavLink>

          <nav className="app-navigation" aria-label="Main navigation">
            {navigation.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="app-account"><UserProfile /></div>
        </div>
      </header>

      <main className="app-content">
        <section className="app-page-heading">
          <div>
            <p className="app-eyebrow">PROGRAMME MONITORING</p>
            <h1>{title}</h1>
            {description && <p className="app-page-description">{description}</p>}
          </div>
        </section>
        {children}
        <footer className="app-footer">
          Data and geographic coverage vary by official source. Values are shown with their reported dates.
        </footer>
      </main>
    </div>
  );
}
