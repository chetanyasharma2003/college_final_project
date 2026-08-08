import React, { useState, useEffect } from 'react';
import axios from '../api/client';
import './MLInsights.css';

export default function MLInsights({ schemeId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schemeId) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/ml-analytics/dashboard/${schemeId}`);
        setInsights(res.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [schemeId]);

  if (loading) return <div className="ml-insights-loading">Loading AI insights...</div>;
  if (error) return <div className="ml-insights-error">{error}</div>;
  if (!insights) return null;

  return (
    <div className="ml-insights-container">
      <h2>🤖 AI Analytics Insights</h2>

      {/* Performance Summary */}
      {insights.performance_summary && (
        <div className="insight-card performance-summary">
          <h3>Scheme Health Score</h3>
          <div className="health-score-circle">
            <div className="score">{insights.performance_summary.health_score}%</div>
          </div>
          <div className="status-breakdown">
            <div className="status on-track">
              ✓ On Track: {insights.performance_summary.status_distribution.on_track}
            </div>
            <div className="status at-risk">
              ⚠ At Risk: {insights.performance_summary.status_distribution.at_risk}
            </div>
            <div className="status critical">
              ❌ Critical: {insights.performance_summary.status_distribution.critical}
            </div>
          </div>
        </div>
      )}

      {/* Risk KPIs */}
      {insights.risk_analysis && insights.risk_analysis.length > 0 && (
        <div className="insight-card risk-kpis">
          <h3>⚠️ KPIs Requiring Attention</h3>
          <div className="risk-list">
            {insights.risk_analysis.map((kpi, idx) => (
              <div key={idx} className="risk-item">
                <div className="risk-header">
                  <span className="kpi-name">{kpi.kpi_name}</span>
                  <span className={`risk-score risk-${kpi.critical_count > 0 ? 'high' : 'medium'}`}>
                    Risk: {kpi.risk_score.toFixed(1)}
                  </span>
                </div>
                <div className="risk-details">
                  <span>Critical: {kpi.status_distribution.critical}</span>
                  <span>At Risk: {kpi.status_distribution.at_risk}</span>
                  <span>On Track: {kpi.status_distribution.on_track}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="insight-timestamp">
        Generated: {new Date(insights.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
