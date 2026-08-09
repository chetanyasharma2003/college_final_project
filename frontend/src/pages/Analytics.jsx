import React from 'react';
import { useSelector } from 'react-redux';
import SchemeComparison from '../components/SchemeComparison';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Analytics() {
  const { user } = useSelector(state => state.auth);

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

        {/* Insights Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-2">✓ Achievements</h4>
            <ul className="text-green-100 text-sm space-y-1">
              <li>• 6 schemes fully integrated</li>
              <li>• 31 KPI metrics tracked</li>
              <li>• Real-time data updates</li>
              <li>• 6 states covered</li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-amber-400 mb-2">⚠️ Areas to Watch</h4>
            <ul className="text-amber-100 text-sm space-y-1">
              <li>• Completion Rate: 23.5% vs 80% target</li>
              <li>• Budget Allocation: Below target in 2 schemes</li>
              <li>• Placement Rate: 67.79% vs 70% target</li>
              <li>• Village Adoption: 0% (No data loaded)</li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">📈 Recommendations</h4>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• Focus on housing completion rates</li>
              <li>• Increase skill training placements</li>
              <li>• Accelerate SAGY village adoption</li>
              <li>• Optimize budget allocation strategy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
