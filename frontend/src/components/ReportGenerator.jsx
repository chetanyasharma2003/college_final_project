import React, { useState } from 'react';
import { FileText, Download, Mail, AlertCircle, Loader } from 'lucide-react';
import client from '../api/client';

export default function ReportGenerator({ schemeCode = 'PMAY', schemeName = 'PMAY' }) {
  const [reportType, setReportType] = useState('executive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const reportTypes = [
    { id: 'executive', label: 'Executive Summary', icon: '📋', description: 'High-level overview (1-2 pages)' },
    { id: 'detailed', label: 'Detailed Report', icon: '📊', description: 'Complete analysis with recommendations' },
    { id: 'csv', label: 'CSV Export', icon: '📥', description: 'Spreadsheet format for analysis' },
    { id: 'comparison', label: 'Comparison Report', icon: '⚖️', description: 'Compare multiple schemes' },
  ];

  const SCHEME_ID_MAP = {
    'PMAY': 2, 'MGNREGS': 5, 'PMGSY': 1, 'NRLM': 3, 'DDU-GKY': 4, 'SAGY': 6
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const schemeId = SCHEME_ID_MAP[schemeCode] || 2;
      const timestamp = new Date().toISOString().split('T')[0];

      if (reportType === 'csv') {
        const response = await client.get(`/reports/csv/${schemeId}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${schemeCode}_report_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (reportType === 'executive') {
        const response = await client.get(`/reports/executive-summary/${schemeId}`);
        // Download the JSON report
        const dataStr = JSON.stringify(response.data.data || response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${schemeCode}_executive_summary_${timestamp}.json`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // For other report types, just fetch and show success
        await client.get(`/reports/${reportType}/${schemeId}`);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.response?.status === 429 ? 'Too many requests. Please wait a moment.' : (err.message || 'Failed to generate report'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-blue-400" />
        <div>
          <h3 className="text-2xl font-bold text-white">Report Generator</h3>
          <p className="text-gray-400 text-sm">Create comprehensive reports for {schemeName}</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-2 text-green-400">
          <span>✓</span>
          <span>Report generated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`p-4 rounded-lg border-2 transition text-left ${
              reportType === type.id
                ? 'bg-blue-500/20 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <div className="font-semibold mb-1">{type.label}</div>
            <div className="text-xs text-gray-400">{type.description}</div>
          </button>
        ))}
      </div>

      {/* Report Preview */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Report Details</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Scheme:</span>
            <span className="text-white font-semibold">{schemeName}</span>
          </div>
          <div className="flex justify-between">
            <span>Report Type:</span>
            <span className="text-white font-semibold">
              {reportTypes.find(t => t.id === reportType)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Generated:</span>
            <span className="text-white font-semibold">{new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Format:</span>
            <span className="text-white font-semibold">
              {reportType === 'csv' ? 'CSV' : 'JSON'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-semibold transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={20} />
              Generate Report
            </>
          )}
        </button>

        <button
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition disabled:opacity-50"
        >
          <Mail size={20} />
          Email Report
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">💡 Quick Actions</h4>
        <ul className="space-y-2 text-blue-100 text-sm">
          <li>• <strong>Executive Summary:</strong> Perfect for quick reviews and stakeholder updates</li>
          <li>• <strong>Detailed Report:</strong> Includes KPI analysis, trends, and recommendations</li>
          <li>• <strong>CSV Export:</strong> Use in Excel for custom analysis and visualizations</li>
          <li>• <strong>Comparison:</strong> Compare performance across multiple schemes</li>
        </ul>
      </div>
    </div>
  );
}
