import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSchemes, useKPIs, useGeographic } from '../api/hooks';
import { setSchemes, setKPIValues, setSelectedScheme } from '../store/dataSlice';
import KPIDashboard from '../components/KPIDashboard';
import SchemeSelector from '../components/SchemeSelector';
import StateSelector from '../components/StateSelector';
import DateRangeSelector from '../components/DateRangeSelector';
import AppShell from '../components/AppShell';
import TrendChart from '../components/TrendChart';
import TopPerformers from '../components/TopPerformers';
import ErrorBoundary from '../components/ErrorBoundary';
import Chatbot from '../components/Chatbot';
import { Activity, Database, MapPin } from 'lucide-react';
import AdminMonitoring from '../components/AdminMonitoring';
import GeographicExplorer from '../components/GeographicExplorer';
import { toLocalDateInputValue } from '../utils/dates';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { schemes, selectedScheme } = useSelector((state) => state.data);
  const {
    schemes: schemesData,
    loading: schemesLoading,
    error: schemesError,
    fetchSchemes,
  } = useSchemes();
  const [selectedSchemeCode, setSelectedSchemeCode] = useState('');
  const [selectedSchemeName, setSelectedSchemeName] = useState('Official scheme data');
  const [selectedStateForFilter, setSelectedStateForFilter] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const end = new Date();
    return {
      startDate: '2020-01-01',
      endDate: toLocalDateInputValue(end),
    };
  });
  // Pass scheme code to useKPIs for proper scheme-specific filtering
  const { kpiValues: kpiValuesData, loading: kpiLoading } = useKPIs(selectedSchemeCode, selectedStateForFilter);
  const { states, loading: statesLoading, error: geographyError, fetchStates } = useGeographic();

  useEffect(() => {
    if (schemesData.length === 0) return;
    const sourceSchemes = schemesData.filter((scheme) => scheme.code !== 'PMAY');
    dispatch(setSchemes(sourceSchemes));

    if (!sourceSchemes.some((scheme) => scheme.id === selectedScheme)) {
      const preferred = sourceSchemes.find((scheme) => scheme.code === 'PMAY-U')
        || sourceSchemes.find((scheme) => scheme.code === 'PMAY-G')
        || sourceSchemes[0];
      dispatch(setSelectedScheme(preferred?.id || null));
    }
  }, [schemesData, selectedScheme, dispatch]);

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

  const filteredKPIValues = kpiValuesData;
  const schemeFamilyCount = new Set(schemes.map((scheme) => (
    scheme.code.startsWith('PMAY-') ? 'PMAY' : scheme.code
  ))).size;

  return (
    <AppShell
      title="Programme overview"
      description="Review official scheme indicators and compare the latest source-reported figures."
    >
      <div className="app-filter-panel">
        <div className="app-section-heading">
          <div>
            <h2>Filters</h2>
            <p>Choose the scheme and geography you want to review.</p>
          </div>
        </div>
        <div className="app-filter-grid">
          <div className="app-filter-field">
            <span>Scheme</span>
            <SchemeSelector schemes={schemes} isLoading={schemesLoading} />
          </div>
          <div className="app-filter-field">
            <span>State or union territory</span>
            <StateSelector
              states={states}
              isLoading={statesLoading}
              selected={selectedStateForFilter}
              onChange={setSelectedStateForFilter}
            />
          </div>
          <div className="app-filter-field">
            <span>Trend date range</span>
            <DateRangeSelector onDateRangeChange={setSelectedDateRange} />
          </div>
        </div>
      </div>

      <div className="app-stat-grid">
        <article className="app-stat-card">
          <span className="app-stat-icon"><Database size={18} /></span>
          <p>Official data feeds</p>
          <strong>{schemes.length}</strong>
          <small>Across {schemeFamilyCount} scheme families; PMAY has two feeds</small>
        </article>
        <article className="app-stat-card">
          <span className="app-stat-icon"><Activity size={18} /></span>
          <p>Source indicators</p>
          <strong>{filteredKPIValues.length}</strong>
          <small>Defined for the current scheme and geographic filter</small>
        </article>
        <article className="app-stat-card">
          <span className="app-stat-icon"><MapPin size={18} /></span>
          <p>States and union territories</p>
          <strong>{states.length}</strong>
          <small>Geography available across configured sources</small>
        </article>
      </div>

      {schemesError && (
        <div className="app-error-card mb-5" role="alert">
          <h2>Scheme feeds could not be loaded</h2>
          <p>{schemesError}</p>
          <button type="button" onClick={fetchSchemes}>Retry</button>
        </div>
      )}
      {geographyError && (
        <div className="app-error-card mb-5" role="alert">
          <h2>Geography list could not be loaded</h2>
          <p>{geographyError}</p>
          <button type="button" onClick={fetchStates}>Retry</button>
        </div>
      )}

      {user?.role === 'ADMIN' && <AdminMonitoring />}
        {/* Loading State */}
        {(schemesLoading || kpiLoading) && (
          <div className="app-loading-state">
            <div className="spinner" />
            <span>Loading source data…</span>
          </div>
        )}

        {/* Source-reported KPI dashboard by scheme */}
        {selectedSchemeCode && (
          <div className="mb-8">
            <ErrorBoundary>
              <KPIDashboard
                schemeCode={selectedSchemeCode}
                schemeName={selectedSchemeName}
                stateId={selectedStateForFilter}
              />
            </ErrorBoundary>
          </div>
        )}

        <div className="app-note mb-8">
          Target-based statuses appear only when a target is configured. Exploratory projections require at least three recent source dates with regular reporting intervals.
        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorBoundary>
            <TrendChart dateRange={selectedDateRange} stateId={selectedStateForFilter} />
          </ErrorBoundary>
          <ErrorBoundary>
            <TopPerformers schemeCode={selectedSchemeCode} />
          </ErrorBoundary>
        </div>

        <GeographicExplorer />

      {/* Data assistant */}
      <Chatbot />
    </AppShell>
  );
}
