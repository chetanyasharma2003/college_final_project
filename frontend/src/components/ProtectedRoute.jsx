import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../api/hooks';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-theme app-loading-page">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p>Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
