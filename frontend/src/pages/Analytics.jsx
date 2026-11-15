import SchemeComparison from '../components/SchemeComparison';
import ErrorBoundary from '../components/ErrorBoundary';
import AppShell from '../components/AppShell';

export default function Analytics() {
  return (
    <AppShell
      title="Scheme comparison"
      description="Compare source-reported indicators across the available scheme feeds."
    >
      <ErrorBoundary>
        <SchemeComparison />
      </ErrorBoundary>
    </AppShell>
  );
}
