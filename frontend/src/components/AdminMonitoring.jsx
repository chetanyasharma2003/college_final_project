import { useEffect, useState } from 'react';
import client from '../api/client';

const dateLabel = (value) => value ? new Date(value).toLocaleString() : 'No import recorded';

export default function AdminMonitoring() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    client.get('/admin/overview')
      .then(({ data }) => { if (active) setOverview(data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Admin monitoring is unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <section aria-live="polite">Loading administration status…</section>;
  if (error) return <section role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-5 text-red-200">{error}</section>;
  if (!overview) return null;

  return (
    <section className="mb-8 rounded-2xl border border-white/15 bg-slate-900/70 p-5 text-white" aria-labelledby="admin-monitoring-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="admin-monitoring-title" className="text-xl font-bold">Admin system monitoring</h2>
        <span className="text-slate-300">{overview.ready_data_sources} official feeds configured</span>
      </div>
      <p className="mb-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        Official data imports are managed through the configured operations environment. This page shows the latest recorded imports; existing source data remains available between refreshes.
      </p>
      <p className="mb-4 text-sm text-slate-300">
        {overview.ready_data_sources} of {overview.data_sources.filter((source) => source.resource_configured).length} official data feeds configured · {overview.counts.states} states · {overview.counts.active_users} active users
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="border-b border-white/15 text-slate-300"><th className="p-2">Official feed</th><th className="p-2">KPIs</th><th className="p-2">Records</th><th className="p-2">Dataset</th><th className="p-2">Mapping</th><th className="p-2">Credential</th></tr></thead>
          <tbody>{overview.data_sources.filter((source) => source.resource_configured).map((source) => {
            const scheme = overview.schemes.find((item) => item.code === source.code);
            return <tr key={source.code} className="border-b border-white/10"><td className="p-2">{source.code}</td><td className="p-2">{scheme?.kpi_definitions || 0}</td><td className="p-2">{scheme?.generic_data || 0}</td><td className="p-2">{source.resource_configured ? 'Configured' : 'Missing'}</td><td className="p-2">{source.field_mapping_configured ? 'Configured' : 'Missing'}</td><td className="p-2">{source.credentials_configured ? 'Configured' : 'Missing'}</td></tr>;
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
