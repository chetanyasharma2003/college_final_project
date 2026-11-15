import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <div className="app-theme app-not-found">
      <Helmet><title>Page not found | Unified Performance Dashboard</title></Helmet>
      <div>
        <p className="app-eyebrow">PAGE NOT FOUND</p>
        <h1>404</h1>
        <p>The page you requested is not available.</p>
        <Link
          to="/dashboard"
          className="app-back-link"
        >
          Return to overview
        </Link>
      </div>
    </div>
  );
}
