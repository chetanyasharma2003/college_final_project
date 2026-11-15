import prisma from '../src/config/prisma.js';
import ReportService from '../src/services/report.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, '../../report-samples');

// Create directory if it doesn't exist
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

async function generateSamples() {
  console.log('📊 Generating Report Samples for All Schemes...\n');

  try {
    const schemes = await prisma.scheme.findMany({
      orderBy: { code: 'asc' }
    });

    if (schemes.length === 0) {
      console.log('❌ No schemes found in database');
      process.exit(1);
    }

    const reports = {
      timestamp: new Date().toISOString(),
      schemes: [],
      summary: {
        total_schemes: schemes.length,
        csv_generated: 0,
        pdf_generated: 0,
        json_generated: 0,
        total_records: 0
      }
    };

    for (const scheme of schemes) {
      console.log(`\n🔄 Processing: ${scheme.name} (${scheme.code})`);

      try {
        // Generate CSV
        const csvResult = await ReportService.generateCSV(scheme.id);
        const csvPath = path.join(reportsDir, `${scheme.code}_sample.csv`);
        const csvContent = fs.readFileSync(csvResult.filepath, 'utf8');
        fs.writeFileSync(csvPath, csvContent);
        console.log(`  ✅ CSV: ${csvResult.filename} (${csvResult.size} bytes)`);
        reports.summary.csv_generated++;

        // Generate JSON
        const jsonResult = await ReportService.generateJSON(scheme.id);
        const jsonPath = path.join(reportsDir, `${scheme.code}_sample.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonResult, null, 2));
        console.log(`  ✅ JSON: ${scheme.code}_sample.json (${JSON.stringify(jsonResult).length} bytes)`);
        reports.summary.json_generated++;

        // Generate Executive Summary (for PDF)
        const summaryResult = await ReportService.generateExecutiveSummary(scheme.id);
        const summaryPath = path.join(reportsDir, `${scheme.code}_summary.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(summaryResult, null, 2));
        console.log(`  ✅ PDF Summary: ${scheme.code}_summary.json`);
        reports.summary.pdf_generated++;

        reports.summary.total_records += (jsonResult.metadata?.total_records || 0);

        reports.schemes.push({
          scheme_id: scheme.id,
          scheme_code: scheme.code,
          scheme_name: scheme.name,
          csv_file: `${scheme.code}_sample.csv`,
          json_file: `${scheme.code}_sample.json`,
          pdf_summary_file: `${scheme.code}_summary.json`,
          records: jsonResult.metadata?.total_records || 0
        });

      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }

    // Generate summary report
    const summaryPath = path.join(reportsDir, 'REPORT_SAMPLES_INDEX.json');
    fs.writeFileSync(summaryPath, JSON.stringify(reports, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📈 REPORT GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ CSV Reports Generated: ${reports.summary.csv_generated}/${reports.summary.total_schemes}`);
    console.log(`✅ JSON Reports Generated: ${reports.summary.json_generated}/${reports.summary.total_schemes}`);
    console.log(`✅ PDF Summaries Generated: ${reports.summary.pdf_generated}/${reports.summary.total_schemes}`);
    console.log(`📊 Total Records Exported: ${reports.summary.total_records}`);
    console.log(`📁 Reports saved to: ${reportsDir}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

generateSamples().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
