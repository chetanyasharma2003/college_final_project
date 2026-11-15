import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy-load all pages — splits each into its own JS chunk
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'));
const Heatmap = lazy(() => import('./pages/Heatmap'));
const NotFound = lazy(() => import('./pages/NotFound').catch(() => ({ default: () => <Navigate to="/dashboard" replace /> })));

// Full-screen spinner shown while a lazy chunk is loading
function PageLoader() {
  return (
    <div className="app-theme app-loading-page">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p>Loading dashboard…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heatmap"
          element={
            <ProtectedRoute>
              <Heatmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/features"
          element={
            <ProtectedRoute>
              <AdvancedFeatures />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
