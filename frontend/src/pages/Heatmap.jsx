import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import IndiaHeatmap from '../components/IndiaHeatmap';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Heatmap() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-3">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
            🗺️ <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Geographic Heatmap</span>
          </h1>
          <p className="text-blue-200">Explore KPI observations at the geographic levels reported by each official source.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <IndiaHeatmap />
        </ErrorBoundary>
      </div>
    </div>
  );
}
