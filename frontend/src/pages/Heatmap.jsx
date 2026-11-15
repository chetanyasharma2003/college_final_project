import IndiaHeatmap from '../components/IndiaHeatmap';
import ErrorBoundary from '../components/ErrorBoundary';
import AppShell from '../components/AppShell';

export default function Heatmap() {
  return (
    <AppShell
      title="Geographic view"
      description="Explore KPI observations only at the locations reported by each source."
    >
      <ErrorBoundary>
        <IndiaHeatmap />
      </ErrorBoundary>
    </AppShell>
  );
}
