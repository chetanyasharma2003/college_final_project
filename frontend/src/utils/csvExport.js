export const serializeCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0] || {});
  if (headers.length === 0) return '';

  const escapeField = (value) => {
    if (value == null) return '""';
    let text = String(value);
    if (typeof value === 'string' && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }
    return `"${text.replace(/"/g, '""')}"`;
  };

  return [
    headers.map(escapeField).join(','),
    ...data.map(row => headers.map(header => escapeField(row[header])).join(',')),
  ].join('\r\n');
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    const csvContent = serializeCSV(data);
    if (!csvContent) {
      alert('No data to export');
      return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Error exporting data: ' + err.message);
  }
};

export const exportKPIsToCSV = (kpiData, schemeName = 'KPIs') => {
  if (!kpiData || kpiData.length === 0) {
    alert('No KPI data to export');
    return;
  }

  try {
    const formattedData = kpiData.map(kpi => ({
      'Metric': kpi.kpi_name || kpi.metric_name || 'N/A',
      'Value': kpi.current_value || kpi.value || 0,
      'Target': kpi.target_value || kpi.target || 'N/A',
      'Progress %': kpi.progress_percentage ? Math.round(kpi.progress_percentage) : 'N/A',
      'Status': kpi.status || 'N/A'
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    exportToCSV(formattedData, `${schemeName}_KPIs_${dateStr}.csv`);
  } catch (err) {
    alert('Error preparing CSV: ' + err.message);
  }
};
