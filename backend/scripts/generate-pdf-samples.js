import { createTextPDF } from '../src/services/pdf.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplesDir = path.join(__dirname, '../../report-samples');

function generatePDFFromSummary(summaryData, schemeCode) {
  const lines = [
    `Scheme: ${summaryData.scheme_name} (${summaryData.scheme_code})`,
    `Ministry: ${summaryData.ministry || 'Not provided'}`,
    `Period: ${summaryData.period}`,
    `Generated: ${summaryData.generated_date}`,
    `Source observations: ${summaryData.total_observations} across ${summaryData.indicator_count} indicators`,
    `On track: ${summaryData.on_track} | At risk: ${summaryData.at_risk} | Critical: ${summaryData.critical}`,
    '',
    'Key metrics:',
    ...summaryData.key_metrics.map((metric) => (
      metric.target == null
        ? `${metric.name}: ${metric.value} (no source target; ${metric.status})`
        : `${metric.name}: ${metric.value} / ${metric.target} (${Math.round(metric.completion || 0)}% complete; ${metric.status})`
    )),
  ];

  return createTextPDF(lines, { title: `${schemeCode} Executive Summary` });
}

async function generatePDFs() {
  console.log('📄 Generating PDF Report Samples...\n');

  try {
    const schemes = fs.readdirSync(samplesDir)
      .filter(file => file.endsWith('_summary.json'))
      .map(file => ({
        code: file.replace('_summary.json', ''),
        path: path.join(samplesDir, file)
      }));

    if (schemes.length === 0) {
      console.log('❌ No summary files found. Run generate-report-samples.js first.');
      process.exit(1);
    }

    for (const scheme of schemes) {
      try {
        const summaryData = JSON.parse(fs.readFileSync(scheme.path, 'utf8'));
        const pdfBuffer = generatePDFFromSummary(summaryData, scheme.code);
        const pdfPath = path.join(samplesDir, `${scheme.code}_sample.pdf`);

        fs.writeFileSync(pdfPath, pdfBuffer);
        console.log(`✅ ${scheme.code}_sample.pdf (${pdfBuffer.length} bytes)`);
      } catch (error) {
        console.error(`❌ Error generating PDF for ${scheme.code}: ${error.message}`);
      }
    }

    console.log(`\n✅ Generated ${schemes.length} PDF files successfully\n`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

generatePDFs();
