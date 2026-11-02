import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportGenerator from '../components/ReportGenerator';
import Forecasting from '../components/Forecasting';
import Chatbot from '../components/Chatbot';
import KPIAlerts from '../components/KPIAlerts';
import { useKPIs } from '../api/hooks';
import ErrorBoundary from '../components/ErrorBoundary';
import { FileText, TrendingUp, Zap, MessageSquare } from 'lucide-react';

export default function AdvancedFeatures() {
  const { schemes, selectedScheme } = useSelector(state => state.data);
  const [activeTab, setActiveTab] = useState('reports');
  const activeScheme = schemes.find(scheme => scheme.id === selectedScheme)
    || schemes.find(scheme => scheme.code === 'PMAY');
  const schemeCode = activeScheme?.code || 'PMAY';
  const schemeName = activeScheme?.name || 'PMAY';
  const schemeIds = schemes.map(scheme => scheme.id);
  const { kpiValues } = useKPIs(schemeCode, activeScheme ? null : undefined);

  const tabs = [
    { id: 'reports', label: 'Report Generation', icon: FileText },
    { id: 'forecasts', label: 'Predictive Forecasting', icon: TrendingUp },
    { id: 'alerts', label: 'Dashboard Alerts', icon: Zap },
    { id: 'chatbot', label: 'Performance Assistant', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚡ <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Advanced Features</span>
          </h1>
          <p className="text-blue-200">Reports, predictions, alerts, and AI-powered insights</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-400 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ErrorBoundary>
              <ReportGenerator schemeId={activeScheme?.id} schemeIds={schemeIds} schemeCode={schemeCode} schemeName={schemeName} />
            </ErrorBoundary>
          )}

          {/* Forecasting Tab */}
          {activeTab === 'forecasts' && (
            <ErrorBoundary>
              <Forecasting schemeCode={schemeCode} schemeName={schemeName} />
            </ErrorBoundary>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">KPI Alerts</h3>
                <p className="text-gray-400 mb-6">Alerts are generated from the latest available KPI values for {schemeName}.</p>
              </div>
              <KPIAlerts kpiValues={kpiValues} />
              <p className="text-sm text-gray-400">Email and SMS delivery are not configured.</p>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Assistant Guide</h3>
                <p className="text-gray-400 mb-6">Ask questions about stored scheme performance data</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-4">📊 Performance Queries</h4>
                  <ul className="space-y-2 text-blue-100 text-sm">
                    <li>• "How is PMAY performing?"</li>
                    <li>• "Show MGNREGS status in Maharashtra"</li>
                    <li>• "What's the completion rate?"</li>
                    <li>• "Compare scheme performance"</li>
                  </ul>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-400 mb-4">📈 Analysis Queries</h4>
                  <ul className="space-y-2 text-purple-100 text-sm">
                    <li>• "Show top performing states"</li>
                    <li>• "Which KPIs need attention?"</li>
                    <li>• "Analyze performance gaps"</li>
                    <li>• "Show trend analysis"</li>
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-400 mb-4">🔮 Prediction Queries</h4>
                  <ul className="space-y-2 text-green-100 text-sm">
                    <li>• "Will PMAY reach its target?"</li>
                    <li>• "Forecast next quarter results"</li>
                    <li>• "Predict completion date"</li>
                    <li>• "Show growth projections"</li>
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-amber-400 mb-4">💡 Insight Queries</h4>
                  <ul className="space-y-2 text-amber-100 text-sm">
                    <li>• "What are key recommendations?"</li>
                    <li>• "Identify risk areas"</li>
                    <li>• "Show improvement opportunities"</li>
                    <li>• "Compare performance metrics"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">🤖 AI Assistant Capabilities</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Rule-based matching for common performance questions</li>
                  <li>✓ Reads stored scheme and KPI records</li>
                  <li>✓ Supports basic scheme comparisons and state rankings</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Feature Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
            <FileText size={32} className="mx-auto mb-2 text-blue-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Reports</h4>
            <p className="text-sm text-blue-200">JSON/CSV export</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Forecasting</h4>
            <p className="text-sm text-green-200">Historical-data forecasts</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-center">
            <Zap size={32} className="mx-auto mb-2 text-amber-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Alerts</h4>
            <p className="text-sm text-amber-200">In-dashboard threshold alerts</p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
            <MessageSquare size={32} className="mx-auto mb-2 text-purple-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Chatbot</h4>
            <p className="text-sm text-purple-200">Rule-based data Q&amp;A</p>
          </div>
        </div>

        {/* Chatbot Widget */}
        <Chatbot />
      </div>
    </div>
  );
}
