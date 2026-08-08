import React, { useState, useEffect } from 'react';
import axios from '../api/client';
import './AnomalyDetection.css';

export default function AnomalyDetection({ kpiId, kpiName }) {
  const [anomalies, setAnomalies] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('anomalies');

  useEffect(() => {
    if (!kpiId) return;
    fetchAnalytics();
  }, [kpiId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [anomRes, patternRes] = await Promise.all([
        axios.get(`/ml-analytics/anomalies/${kpiId}`),
        axios.get(`/ml-analytics/patterns/${kpiId}`),
      ]);
      setAnomalies(anomRes.data.data);
      setPatterns(patternRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="anomaly-loading">Loading analytics...</div>;
  if (error) return <div className="anomaly-error">{error}</div>;

  return (
    <div className="anomaly-container">
      <div className="anomaly-header">
        <h3>📊 {kpiName} Analytics</h3>
        <button className="refresh-btn" onClick={fetchAnalytics} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <div className="anomaly-tabs">
        <button
          className={`tab ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          Anomalies ({anomalies?.anomalies?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          Patterns & Insights
        </button>
      </div>

      {activeTab === 'anomalies' && (
        <div className="anomaly-content">
          {anomalies?.anomalies?.length > 0 ? (
            <div className="anomaly-list">
              <div className="anomaly-stats">
                <div className="stat">
                  <span className="label">Mean Value</span>
                  <span className="value">{anomalies.mean?.toFixed(2)}</span>
                </div>
                <div className="stat">
                  <span className="label">Std Dev</span>
                  <span className="value">{anomalies.stdDev?.toFixed(2)}</span>
                </div>
                <div className="stat">
                  <span className="label">Total Anomalies</span>
                  <span className="value">{anomalies.count}</span>
                </div>
                <div className={`stat severity-${anomalies.severity?.toLowerCase()}`}>
                  <span className="label">Severity</span>
                  <span className="value">{anomalies.severity}</span>
                </div>
              </div>

              {anomalies.anomalies.map((anom, idx) => (
                <div key={idx} className={`anomaly-item severity-${anom.severity?.toLowerCase()}`}>
                  <div className="anomaly-date">
                    {new Date(anom.date).toLocaleDateString()}
                  </div>
                  <div className="anomaly-details">
                    <span className="value-badge">{anom.value?.toFixed(2)}</span>
                    <span className={`zscore z-${anom.zscore > 3 ? 'extreme' : anom.zscore > 2.5 ? 'high' : 'medium'}`}>
                      Z-Score: {anom.zscore?.toFixed(2)}
                    </span>
                  </div>
                  <div className={`severity-badge ${anom.severity?.toLowerCase()}`}>
                    {anom.severity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="anomaly-empty">✓ No anomalies detected in recent data</div>
          )}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="anomaly-content">
          {patterns?.status === 'error' || !patterns ? (
            <div className="anomaly-empty">Unable to analyze patterns</div>
          ) : patterns?.status === 'insufficient_data' ? (
            <div className="anomaly-empty">Need more data for pattern analysis</div>
          ) : (
            <div className="patterns-analysis">
              <div className="pattern-card">
                <h4>Current Performance</h4>
                <div className="metric-display">
                  <div className="metric">
                    <span className="label">Current Value</span>
                    <span className="value">{patterns.current_value?.toFixed(2)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Target</span>
                    <span className="value">{patterns.target_value?.toFixed(2)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Achievement</span>
                    <span className={`value achievement-${patterns.achievement_rate > 80 ? 'good' : patterns.achievement_rate > 50 ? 'medium' : 'low'}`}>
                      {patterns.achievement_rate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pattern-card">
                <h4>Trend Analysis</h4>
                <div className="trend-display">
                  <div className="trend-status">
                    <span className="trend-label">Status</span>
                    <span className={`trend-badge ${patterns.trend?.toLowerCase()}`}>
                      {patterns.trend?.toUpperCase()}
                    </span>
                  </div>
                  <div className="trend-rate">
                    <span className="trend-label">Rate</span>
                    <span className="trend-value">{patterns.trend_rate}</span>
                  </div>
                </div>
              </div>

              {patterns.recommendations?.length > 0 && (
                <div className="pattern-card">
                  <h4>📋 Recommendations</h4>
                  <div className="recommendations-list">
                    {patterns.recommendations.map((rec, idx) => (
                      <div key={idx} className={`recommendation ${rec.severity?.toLowerCase()}`}>
                        <div className="rec-header">
                          <span className={`severity-badge ${rec.severity?.toLowerCase()}`}>
                            {rec.severity}
                          </span>
                        </div>
                        <div className="rec-message">{rec.message}</div>
                        <div className="rec-action">💡 {rec.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
