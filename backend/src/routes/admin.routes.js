import express from 'express';
import { verifyAuth, checkRole } from '../middleware/auth.middleware.js';
import prisma from '../config/prisma.js';
import { SCHEME_CONFIGS } from '../config/scheme-integrations.js';

const router = express.Router();

router.get('/overview', verifyAuth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const [schemes, states, users, latestImports] = await Promise.all([
      prisma.scheme.findMany({
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          _count: { select: { kpi_definitions: true, generic_data: true, data_imports: true } },
        },
      }),
      prisma.state.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.dataImport.findMany({
        orderBy: { imported_at: 'desc' },
        take: 12,
        select: {
          id: true,
          scheme_id: true,
          status: true,
          records_imported: true,
          records_failed: true,
          imported_at: true,
          scheme: { select: { code: true, name: true } },
        },
      }),
    ]);

    const dataSources = Object.entries(SCHEME_CONFIGS).map(([code, config]) => {
      const sourceConfigured = Boolean(
        process.env.DATA_GOV_API_KEY
        && config.resourceId
        && config.fieldMapping?.state
        && config.fieldMapping?.date
        && config.fieldMapping?.metrics
        && Object.keys(config.fieldMapping.metrics).length
        && !Array.isArray(config.fieldMapping.metrics)
        && Object.values(config.fieldMapping.metrics).every((field) => typeof field === 'string' && field.trim())
      );
      return {
        code,
        name: config.name,
        endpoint_host: new URL(config.apiEndpoint).host,
        schedule: config.syncFrequency,
        source_configured: sourceConfigured,
        resource_configured: Boolean(config.resourceId),
        field_mapping_configured: Boolean(config.fieldMapping?.state && config.fieldMapping?.date && config.fieldMapping?.metrics && Object.keys(config.fieldMapping.metrics).length),
        credentials_configured: Boolean(process.env.DATA_GOV_API_KEY),
      };
    });

    res.json({
      status: 'success',
      data: {
        generated_at: new Date().toISOString(),
        counts: { schemes: schemes.length, states, active_users: users },
        schemes: schemes.map(({ _count, ...scheme }) => ({ ...scheme, ..._count })),
        data_sources: dataSources,
        ready_data_sources: dataSources.filter((source) => source.source_configured).length,
        scheduler_enabled: process.env.ENABLE_DATA_SYNC_SCHEDULER === 'true' && dataSources.some((source) => source.source_configured),
        scheduler_requested: process.env.ENABLE_DATA_SYNC_SCHEDULER === 'true',
        latest_imports: latestImports,
        configuration: {
          database_url_configured: Boolean(process.env.DATABASE_URL),
          jwt_secret_configured: Boolean(process.env.JWT_SECRET),
          data_gov_api_key_configured: Boolean(process.env.DATA_GOV_API_KEY),
        },
      },
    });
  } catch (error) {
    console.error('Admin overview failed:', error.message);
    res.status(500).json({ status: 'error', message: 'Unable to load admin overview' });
  }
});

export default router;
