import { useEffect, useState } from 'react';
import client from '../api/client';

const dateLabel = (value) => value ? new Date(value).toLocaleString() : 'No import recorded';

export default function AdminMonitoring() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState('');

  const refreshOverview = async () => {
    const { data } = await client.get('/admin/overview');
    setOverview(data.data);
  };

  useEffect(() => {
    let active = true;
    client.get('/admin/overview')
      .then(({ data }) => { if (active) setOverview(data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Admin monitoring is unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const syncOfficialData = async () => {
    setSyncing(true);
    setSyncError('');
    setSyncResult(null);
    try {
      const { data } = await client.post('/data-sync/all');
      setSyncResult(data.data);
      await refreshOverview();
    } catch (requestError) {
      setSyncError(requestError.response?.data?.message || requestError.message || 'Official data sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <section aria-live="polite">Loading administration status…</section>;
  if (error) return <section role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">{error}</section>;
  if (!overview) return null;

  return (
    <section className="mb-8 rounded-2xl border border-white/15 bg-slate-900/70 p-5 text-white" aria-labelledby="admin-monitoring-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="admin-monitoring-title" className="text-xl font-bold">Admin system monitoring</h2>
        <span className={overview.scheduler_enabled ? 'text-emerald-300' : 'text-amber-200'}>
          Scheduled imports {overview.scheduler_enabled ? 'enabled' : 'disabled'} · {overview.ready_data_sources} source(s) configured
        </span>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={syncOfficialData}
          disabled={syncing || overview.ready_data_sources === 0}
          className="rounded-lg border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? 'Syncing official sources…' : 'Sync official source data'}
        </button>
        <p className="text-sm text-slate-300">
          Run this after configuring the data.gov.in API key. Imports can take a few minutes.
        </p>
      </div>
      {syncError && <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{syncError}</p>}
      {syncResult && (
        <div className="mb-5 rounded-lg border border-white/10 bg-white/5 p-4" aria-live="polite">
          <p className="mb-3 text-sm font-semibold">
            Sync finished: {syncResult.success} successful, {syncResult.failed} failed, {syncResult.totalRecords} records imported.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {Object.entries(syncResult.schemes || {}).map(([code, result]) => (
              <li key={code} className="border-b border-white/10 pb-2 last:border-0">
                <span className={result.status === 'success' ? 'text-emerald-300' : result.status === 'partial' ? 'text-amber-200' : 'text-red-300'}>
                  {code}: {result.status}
                </span>
                {' · '}{result.recordsLoaded || 0} records
                {result.error && ` · ${result.error}`}
                {result.errors?.length > 0 && ` · ${result.errors.join('; ')}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mb-4 text-sm text-slate-300">{overview.counts.schemes} schemes · {overview.counts.states} states · {overview.counts.active_users} active users</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
        <thead><tr className="border-b border-white/15 text-slate-300"><th className="p-2">Scheme</th><th className="p-2">KPIs</th><th className="p-2">Records</th><th className="p-2">Source host</th><th className="p-2">Dataset</th><th className="p-2">Mapping</th><th className="p-2">Credential</th></tr></thead>
          <tbody>{overview.schemes.map((scheme) => {
            const source = overview.data_sources.find((item) => item.code === scheme.code);
            return <tr key={scheme.code} className="border-b border-white/10"><td className="p-2">{scheme.code}</td><td className="p-2">{scheme.kpi_definitions}</td><td className="p-2">{scheme.generic_data}</td><td className="p-2">{source?.endpoint_host || 'Not configured'}</td><td className="p-2">{source?.resource_configured ? 'Configured' : 'Missing'}</td><td className="p-2">{source?.field_mapping_configured ? 'Configured' : 'Missing'}</td><td className="p-2">{source?.credentials_configured ? 'Configured' : 'Missing'}</td></tr>;
          })}</tbody>
        </table>
      </div>
      <h3 className="mb-2 mt-5 font-semibold">Recent data imports</h3>
      {overview.latest_imports.length ? <ul className="space-y-2 text-sm text-slate-300">
        {overview.latest_imports.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2">
          <span>{item.scheme.code}: {item.status} · {item.records_imported} imported, {item.records_failed} failed</span><time dateTime={item.imported_at}>{dateLabel(item.imported_at)}</time>
        </li>)}
      </ul> : <p className="text-sm text-slate-400">No import history is recorded.</p>}
      <p className="mt-4 text-xs text-slate-400">Status snapshot: {dateLabel(overview.generated_at)}. Secrets are never returned by this endpoint.</p>
    </section>
  );
}
