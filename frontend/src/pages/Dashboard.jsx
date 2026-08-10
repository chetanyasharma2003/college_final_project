import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSchemes, useKPIs, useGeographic, useKPIStatus } from '../api/hooks';
import { setSchemes, setKPIValues, setSelectedScheme } from '../store/dataSlice';
import KPIDashboard from '../components/KPIDashboard';
import SchemeSelector from '../components/SchemeSelector';
import StateSelector from '../components/StateSelector';
import DateRangeSelector from '../components/DateRangeSelector';
import UserProfile from '../components/UserProfile';
import TrendChart from '../components/TrendChart';
import TopPerformers from '../components/TopPerformers';
import ErrorBoundary from '../components/ErrorBoundary';
import Chatbot from '../components/Chatbot';
import MLInsights from '../components/MLInsights';
import KPIAlerts from '../components/KPIAlerts';
import KPIComparison from '../components/KPIComparison';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { schemes, selectedScheme, kpiValues } = useSelector((state) => state.data);
  const { schemes: schemesData, loading: schemesLoading } = useSchemes();
  const [selectedSchemeCode, setSelectedSchemeCode] = useState('PMAY');
  const [selectedSchemeName, setSelectedSchemeName] = useState('PMAY - Pradhan Mantri Awas Yojana');
  // Pass scheme code to useKPIs for proper scheme-specific filtering
  const { kpiValues: kpiValuesData, loading: kpiLoading } = useKPIs(selectedSchemeCode);
  const { states } = useGeographic();
  const [selectedStateForFilter, setSelectedStateForFilter] = useState(null);
  const { kpiStatus, loading: kpiStatusLoading } = useKPIStatus(selectedSchemeCode);

  useEffect(() => {
    if (schemesData.length > 0 && schemes.length === 0) {
      dispatch(setSchemes(schemesData));
      // Set default scheme to PMAY
      const pmayScheme = schemesData.find(s => s.code === 'PMAY');
      if (pmayScheme) {
        dispatch(setSelectedScheme(pmayScheme.id));
      }
    }
  }, [schemesData, schemes, dispatch]);

  // Update selected scheme code when scheme selection changes
  useEffect(() => {
    if (selectedScheme && schemes.length > 0) {
      const scheme = schemes.find(s => s.id === selectedScheme);
      if (scheme) {
        setSelectedSchemeCode(scheme.code);
        setSelectedSchemeName(scheme.name);
      }
    }
  }, [selectedScheme, schemes]);

  useEffect(() => {
    if (kpiValuesData.length > 0) {
      dispatch(setKPIValues(kpiValuesData));
    }
  }, [kpiValuesData, dispatch]);

  const filteredKPIValues = selectedStateForFilter
    ? kpiValuesData.filter((kpi) => kpi.state_id === selectedStateForFilter)
    : kpiValuesData;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header + Filters - Combined Sticky Section */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                {getGreeting()}, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.full_name?.split(' ')[0]}</span>
              </h1>
              <p className="text-blue-200 text-sm sm:text-base">Government Schemes Real-time Analytics</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to="/analytics"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-semibold transition text-xs sm:text-sm whitespace-nowrap"
              >
                <BarChart3 size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
              <Link
                to="/features"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-semibold transition text-xs sm:text-sm whitespace-nowrap"
              >
                <FileText size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Advanced</span>
              </Link>
              <div className="text-2xl sm:text-3xl lg:text-4xl">📊</div>
              <UserProfile />
            </div>
          </div>

          {/* Filters Inside Sticky Header */}
          <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-wrap pt-2 border-t border-white/10">
            <div className="flex-1 min-w-[120px] sm:flex-none">
              <SchemeSelector schemes={schemes} />
            </div>
            <div className="flex-1 min-w-[120px] sm:flex-none">
              <StateSelector
                states={states}
                selected={selectedStateForFilter}
                onChange={setSelectedStateForFilter}
              />
            </div>
            <div className="flex-1 min-w-[150px] sm:flex-none">
              <DateRangeSelector onDateRangeChange={(range) => {
                console.log('Date range selected:', range);
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Smart Alerts System */}
        <KPIAlerts kpiValues={filteredKPIValues} />

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-blue-200 text-xs sm:text-sm mb-2">Total Schemes</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">{schemes.length}</p>
            <p className="text-blue-300 text-xs mt-2">Active Government Programs</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6">
            <p className="text-purple-200 text-xs sm:text-sm mb-2">KPI Metrics</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">{filteredKPIValues.length}</p>
            <p className="text-purple-300 text-xs mt-2">Real-time Performance Indicators</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-pink-200 text-xs sm:text-sm mb-2">Geographic Reach</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">{states.length}</p>
            <p className="text-pink-300 text-xs mt-2">States Tracked</p>
          </div>
        </div>

        {/* Loading State */}
        {(schemesLoading || kpiLoading) && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <div className="text-4xl">⏳</div>
            </div>
            <span className="text-white ml-3">Loading data...</span>
          </div>
        )}

        {/* Real-time KPI Dashboard by Scheme */}
        <div className="mb-8">
          <ErrorBoundary>
            <KPIDashboard
              schemeCode={selectedSchemeCode}
              schemeName={selectedSchemeName}
              stateId={selectedStateForFilter}
            />
          </ErrorBoundary>
        </div>

        {/* Scheme Comparison */}
        <div className="mb-8">
          <ErrorBoundary>
            <KPIComparison />
          </ErrorBoundary>
        </div>

        {/* AI/ML Insights */}
        {selectedScheme && (
          <div className="mb-8">
            <ErrorBoundary>
              <MLInsights schemeId={selectedScheme} />
            </ErrorBoundary>
          </div>
        )}


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary>
            <TrendChart />
          </ErrorBoundary>
          <ErrorBoundary>
            <TopPerformers />
          </ErrorBoundary>
        </div>

        {/* Empty State */}
        {!kpiLoading && filteredKPIValues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-3">📈</p>
            <p className="text-blue-200 text-lg">No data available for selected filters</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting different schemes or states</p>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
