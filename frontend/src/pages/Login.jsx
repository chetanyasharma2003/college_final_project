import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/hooks';
import { Landmark, LockKeyhole } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: sessionLoading } = useAuth();

  useEffect(() => {
    if (user && !sessionLoading) navigate('/dashboard', { replace: true });
  }, [user, sessionLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <Helmet>
        <title>Sign in | Unified Performance Dashboard</title>
        <meta name="description" content="Sign in to review dated, source-reported scheme indicators." />
      </Helmet>
      <section className="login-intro">
        <div className="login-brand"><span><Landmark size={20} /></span> MoRD scheme dashboard</div>
        <div className="login-intro-copy">
          <p className="login-kicker">UNIFIED PERFORMANCE DASHBOARD</p>
          <h1>Scheme data, in one place.</h1>
          <p>Review reported indicators for rural development programmes across available states and districts.</p>
          <ul className="login-scheme-list" aria-label="Schemes covered">
            <li>PMAY</li><li>MGNREGS</li><li>PMGSY</li><li>NRLM</li><li>DDU-GKY</li><li>SAGY</li>
          </ul>
          <p className="login-source-note">Source dates and geographic coverage vary by scheme.</p>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-card">
          <span className="login-card-icon"><LockKeyhole size={18} /></span>
          <p className="login-kicker">ACCOUNT ACCESS</p>
          <h2>Sign in</h2>
          <p className="login-help">Use your dashboard account to continue.</p>

          {error && <div role="alert" aria-live="polite" className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading || sessionLoading} className="login-submit">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="login-footer">Unified Performance Dashboard · 2026–27</p>
      </section>
    </div>
  );
}
