import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-theme app-error-page">
          <div className="app-error-card">
            <h1>Unable to display this section</h1>
            <p>
              This section hit an unexpected error. Refresh the dashboard; if it continues, share the details below with the project maintainer.
            </p>
            {this.state.error?.message && (
              <details className="mb-4 text-xs text-gray-500">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">{this.state.error.message}</pre>
              </details>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
