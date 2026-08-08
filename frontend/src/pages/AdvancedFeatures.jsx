import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportGenerator from '../components/ReportGenerator';
import Forecasting from '../components/Forecasting';
import Chatbot from '../components/Chatbot';
import ErrorBoundary from '../components/ErrorBoundary';
import { FileText, TrendingUp, Zap, MessageSquare } from 'lucide-react';

export default function AdvancedFeatures() {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('reports');

  const tabs = [
    { id: 'reports', label: 'Report Generation', icon: FileText },
    { id: 'forecasts', label: 'Predictive Forecasting', icon: TrendingUp },
    { id: 'alerts', label: 'Real-time Alerts', icon: Zap },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
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
              <ReportGenerator schemeCode="PMAY" schemeName="PMAY - Pradhan Mantri Awas Yojana" />
            </ErrorBoundary>
          )}

          {/* Forecasting Tab */}
          {activeTab === 'forecasts' && (
            <ErrorBoundary>
              <Forecasting schemeCode="PMAY" schemeName="PMAY" />
            </ErrorBoundary>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Alerts Configuration</h3>
                <p className="text-gray-400 mb-6">Set up notifications for KPI milestones and anomalies</p>
              </div>

              {/* Alert Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">🎯 Target Achievement Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">When KPI reaches 50% of target</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">When KPI reaches 80% of target</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">When KPI reaches 100% of target</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">⚠️ Risk Threshold Alerts</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Below 60% of target</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Sudden drop in value (&gt;10%)</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Anomaly detected by AI</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">📧 Notification Channels</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Email notifications</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Dashboard alerts</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-gray-300">SMS notifications (optional)</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">🔔 Alert Frequency</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="frequency" defaultChecked className="w-4 h-4" />
                      <span className="text-gray-300">Immediate</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="frequency" className="w-4 h-4" />
                      <span className="text-gray-300">Daily digest</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="frequency" className="w-4 h-4" />
                      <span className="text-gray-300">Weekly summary</span>
                    </label>
                  </div>
                </div>
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-semibold transition">
                Save Alert Configuration
              </button>
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Assistant Guide</h3>
                <p className="text-gray-400 mb-6">Ask the chatbot (bottom right) anything about scheme performance</p>
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
                  <li>✓ Natural language understanding - Ask questions in plain English</li>
                  <li>✓ Real-time data access - Gets latest KPI values and trends</li>
                  <li>✓ Contextual responses - Understands scheme/state context</li>
                  <li>✓ Predictive insights - Forecasts and trend analysis</li>
                  <li>✓ Comparative analysis - Ranks and compares schemes</li>
                  <li>✓ Recommendations - Provides actionable suggestions</li>
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
            <p className="text-sm text-blue-200">PDF/CSV export</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Forecasting</h4>
            <p className="text-sm text-green-200">30-90 day predictions</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-center">
            <Zap size={32} className="mx-auto mb-2 text-amber-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Alerts</h4>
            <p className="text-sm text-amber-200">Real-time notifications</p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 text-center">
            <MessageSquare size={32} className="mx-auto mb-2 text-purple-400" />
            <h4 className="text-lg font-semibold text-white mb-1">Chatbot</h4>
            <p className="text-sm text-purple-200">AI-powered Q&A</p>
          </div>
        </div>

        {/* Chatbot Widget */}
        <Chatbot />
      </div>
    </div>
  );
}
