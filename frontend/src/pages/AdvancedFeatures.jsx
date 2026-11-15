import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReportGenerator from '../components/ReportGenerator';
import Forecasting from '../components/Forecasting';
import Chatbot from '../components/Chatbot';
import KPIAlerts from '../components/KPIAlerts';
import { useKPIs } from '../api/hooks';
import ErrorBoundary from '../components/ErrorBoundary';
import { FileText, TrendingUp, Zap, MessageSquare } from 'lucide-react';
import AppShell from '../components/AppShell';

export default function AdvancedFeatures() {
  const { schemes, selectedScheme } = useSelector(state => state.data);
  const [activeTab, setActiveTab] = useState('reports');
  const activeScheme = schemes.find(scheme => scheme.id === selectedScheme)
    || null;
  const schemeCode = activeScheme?.code || '';
  const schemeName = activeScheme?.name || '';
  const schemeIds = schemes.map(scheme => scheme.id);
  const { kpiValues, loading: kpisLoading } = useKPIs(schemeCode, activeScheme ? null : undefined);

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    document.getElementById(`tools-tab-${tabs[nextIndex].id}`)?.focus();
  };

  const tabs = [
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Zap },
    { id: 'chatbot', label: 'Data assistant', icon: MessageSquare },
  ];

  return (
    <AppShell
      title="Reports and tools"
      description="Download source reports, review exploratory projections, and inspect reported KPI statuses."
    >
        {/* Tabs */}
        <div className="app-feature-tabs" role="tablist" aria-label="Reports and tools" aria-orientation="horizontal">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tools-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, tabs.indexOf(tab))}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="tools-tab-panel"
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`app-feature-tab${activeTab === tab.id ? ' is-active' : ''}`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div id="tools-tab-panel" className="app-feature-content" role="tabpanel" aria-labelledby={`tools-tab-${activeTab}`}>
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ErrorBoundary>
              {activeScheme
                ? <ReportGenerator schemeId={activeScheme.id} schemeIds={schemeIds} schemeCode={schemeCode} schemeName={schemeName} />
                : <div className="app-empty-state"><h2>Select a scheme first</h2><p>Choose a scheme from the Overview page to build a report.</p></div>}
            </ErrorBoundary>
          )}

          {/* Forecasting Tab */}
          {activeTab === 'forecasts' && (
            <ErrorBoundary>
              {activeScheme
                ? <Forecasting schemeCode={schemeCode} schemeName={schemeName} />
                : <div className="app-empty-state"><h2>Select a scheme first</h2><p>Choose a scheme from the Overview page to inspect its available source history.</p></div>}
            </ErrorBoundary>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">KPI alerts</h3>
                <p className="text-gray-400 mb-6">
                  {activeScheme ? `Alerts use the latest available KPI values for ${schemeName}.` : 'Select a scheme to review its reported KPI statuses.'}
                </p>
              </div>
              {activeScheme
                ? <><KPIAlerts kpiValues={kpiValues} loading={kpisLoading} /><p className="text-sm text-gray-400">Email and SMS delivery are not configured.</p></>
                : <div className="app-empty-state"><h2>Select a scheme first</h2><p>Choose a scheme from the Overview page to inspect its reported statuses.</p></div>}
            </div>
          )}

          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Data assistant</h3>
                <p className="text-gray-400 mb-6">Ask questions about scheme and KPI records available in this dashboard.</p>
              </div>

              <div className="app-prompt-group">
                <h4 className="text-base font-semibold mb-3">Example questions</h4>
                <ul className="space-y-2 text-sm">
                  <li>What indicators are available for PMAY-U in Maharashtra?</li>
                  <li>Compare reported PMAY-G and MGNREGS values.</li>
                  <li>Which states have the highest reported PMGSY values?</li>
                  <li>What is the latest available NRLM data?</li>
                </ul>
              </div>

              <div className="app-note">
                <h4 className="text-base font-semibold mb-3">How answers are produced</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>The assistant uses rule-based matching against records stored in this application.</li>
                  <li>Answers are limited to supported query types, source dates, and configured geography.</li>
                  <li>Different scheme indicators are not combined into a shared performance score.</li>
                </ul>
              </div>
              <Chatbot embedded />
            </div>
          )}
        </div>

        {/* Assistant widget */}
        {activeTab !== 'chatbot' && <Chatbot />}
    </AppShell>
  );
}
