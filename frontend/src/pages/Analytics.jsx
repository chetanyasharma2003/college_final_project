import SchemeComparison from '../components/SchemeComparison';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Analytics & Insights</span>
          </h1>
          <p className="text-blue-200">Deep analysis of scheme performance across regions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Scheme Comparison Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Scheme Performance Comparison</h2>
          <ErrorBoundary>
            <SchemeComparison />
          </ErrorBoundary>
        </div>

      </div>
    </div>
  );
}
