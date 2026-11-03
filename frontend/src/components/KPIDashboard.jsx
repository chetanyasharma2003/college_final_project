import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import client from '../api/client';
import KPICard from './KPICard';
import ExportButton from './ExportButton';

const SOURCE_URLS = {
  'PMAY-G': 'https://www.data.gov.in/resource/stateuts-wise-number-eligible-beneficiaries-pradhan-mantri-awaas-yojana-gramin-pmay-g-pmay',
  'PMAY-U': 'https://www.data.gov.in/resource/stateut-wise-number-houses-sanctioned-completed-and-occupied-under-pmay-u-and-pmay-u-20-22',
  MGNREGS: 'https://www.data.gov.in/resource/job-cards-issued-under-mgnregs-inception-10th-jan-2022',
  PMGSY: 'https://www.data.gov.in/resource/physical-financial-progress-pradhan-mantri-gram-sadak-yojna-pmgsy-date',
  NRLM: 'https://www.data.gov.in/resource/stateut-wise-details-funds-allocation-under-national-rural-livelihoods-mission-nrlm-2021',
  'DDU-GKY': 'https://www.data.gov.in/resource/state-wise-details-candidates-trained-and-placed-under-ddu-gky-2020-21-2023-24',
  SAGY: 'https://www.data.gov.in/resource/stateut-wise-gram-panchayats-identified-under-saansad-adarsh-gram-yojana-sagy-sagy-website',
};

export default function KPIDashboard({ schemeCode, schemeName, stateId = null }) {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schemeCode) {
      setKpiData([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    fetchAllKPIs();
    const interval = setInterval(fetchAllKPIs, 5 * 60 * 1000);
    window.addEventListener('kpi-data:updated', fetchAllKPIs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('kpi-data:updated', fetchAllKPIs);
    };
  }, [schemeCode, stateId]);

  const fetchAllKPIs = async () => {
    if (!schemeCode) {
      setKpiData([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = stateId
        ? `/kpis/status/${schemeCode}?stateId=${stateId}`
        : `/kpis/status/${schemeCode}`;
      const response = await client.get(url);
      setKpiData(response.data.kpi_status || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate stats
  const stats = {
    total: kpiData.length,
    achieved: kpiData.filter(k => k.status === 'achieved').length,
    on_track: kpiData.filter(k => k.status === 'on_track').length,
    at_risk: kpiData.filter(k => k.status === 'at_risk').length,
    no_data: kpiData.filter(k => k.status === 'no_data').length,
    no_target: kpiData.filter(k => k.status === 'no_target').length,
    avg_progress: kpiData.some(k => k.progress_percentage != null)
      ? Math.round(kpiData.filter(k => k.progress_percentage != null).reduce((sum, k) => sum + k.progress_percentage, 0) / kpiData.filter(k => k.progress_percentage != null).length)
      : null,
  };
  const latestSourceUpdate = kpiData
    .map(kpi => kpi.last_updated ? new Date(kpi.last_updated) : null)
    .filter(date => date && !Number.isNaN(date.getTime()))
    .reduce((latest, date) => (!latest || date > latest ? date : latest), null);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-3 text-red-400">
        <AlertCircle size={24} />
        <div>
          <h3 className="font-semibold">Error Loading KPIs</h3>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchAllKPIs}
            className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{schemeName}</h2>
          <p className="text-gray-400">Latest reported KPI status</p>
          {schemeCode === 'PMAY-G' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical snapshot only: Rajya Sabha answer dated 6 April 2022; data.gov.in published it on 20 September 2022.
              The underlying data cutoff is not stated, unmapped source states are excluded, and this is not current or real-time progress.
            </p>
          )}
          {schemeCode === 'PMAY-U' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical state/UT snapshot for PMAY-U and PMAY-U 2.0 as of 22 January 2026; published on data.gov.in on 24 September 2026.
              Subtotals are excluded to avoid double counting; locations missing from the configured geography are reported as unmapped.
              This is not current or real-time progress.
            </p>
          )}
          {schemeCode === 'MGNREGS' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical Karnataka district snapshot: cumulative job cards issued through 10 January 2022.
              District names come from the source; area and boundary data are not supplied. This is not person-days, current employment, or real-time progress.
            </p>
          )}
          {schemeCode === 'PMGSY' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              District-level PMGSY-I, II, and III physical/financial progress. The data.gov.in resource was updated on 2 November 2026;
              the API does not expose a precise record-level reporting cutoff. Only complete district groups in configured states are included; district names are source-derived, but district areas and boundaries are unavailable.
              No targets or performance ratings are inferred.
            </p>
          )}
          {schemeCode === 'NRLM' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical state/UT funds allocation for FY 2021-22, 2022-23, and 2023-24; data.gov.in last updated the resource on 10 September 2024.
              The source does not specify the monetary unit, so values are shown without currency conversion or performance ratings. Village-wise SHG metrics are not included because their API field schema could not be verified.
            </p>
          )}
          {schemeCode === 'DDU-GKY' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical state-wise counts of candidates trained and placed for FY 2020-21 through FY 2023-24; published on 4 April 2024.
              Unmatched rows are not assigned to configured states; the source national total is retained when provided. Values are annual counts, not current totals; no salary, retention, targets, or placement rates are inferred.
            </p>
          )}
          {schemeCode === 'SAGY' && (
            <p className="mt-2 max-w-3xl rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Historical counts of Gram Panchayats identified under SAGY Phases I-IV as of 3 March 2020; published on 18 February 2021 and last updated on 8 September 2021.
              Unmatched locations are excluded, and the source Grand Total is retained where provided. This is not a current adoption or development-performance measure.
            </p>
          )}
          {SOURCE_URLS[schemeCode] && (
            <a
              className="mt-2 inline-block text-sm text-blue-300 underline underline-offset-2 hover:text-blue-200"
              href={SOURCE_URLS[schemeCode]}
              target="_blank"
              rel="noreferrer"
            >
              Open official data.gov.in source
            </a>
          )}
        </div>
        <div className="flex gap-3">
          <ExportButton kpiData={kpiData} schemeName={schemeName} />
          <button
            onClick={fetchAllKPIs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Total KPIs</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-400 text-sm mb-1">Achieved</p>
          <p className="text-3xl font-bold text-green-400">{stats.achieved}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm mb-1">On Track</p>
          <p className="text-3xl font-bold text-blue-400">{stats.on_track}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 text-sm mb-1">At Risk</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.at_risk}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">No Data</p>
          <p className="text-3xl font-bold text-gray-300">{stats.no_data}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Not Rated</p>
          <p className="text-3xl font-bold text-gray-300">{stats.no_target}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-400 text-sm mb-1">Avg Progress</p>
          <p className="text-3xl font-bold text-purple-400">{stats.avg_progress == null ? 'N/A' : `${stats.avg_progress}%`}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && kpiData.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse h-48"></div>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      {!loading && kpiData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map(kpi => (
            <KPICard
              key={kpi.kpi_id}
              kpi={kpi}
              schemeCode={schemeCode}
              data={kpi}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && kpiData.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No official KPI definitions available</h3>
          <p className="text-gray-400 mb-4">
            This source has not been imported yet. An admin can run “Sync official source data” from the monitoring panel above.
          </p>
          <button
            onClick={fetchAllKPIs}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Footer */}
      {latestSourceUpdate && (
        <p className="text-xs text-gray-500 text-center">
          Latest source record: {latestSourceUpdate.toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
}
