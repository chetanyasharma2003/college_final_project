# College Final Project — Work Update

**Last updated:** 2026-11-03 17:37 IST
**Project:** Government Schemes Analytics Dashboard
**Purpose:** Current handoff for the next AI/developer. Read this file before continuing work and update it after each meaningful implementation, import, test, or deployment milestone.

## 1. College scope

The target is a centralized cloud dashboard for six scheme families: PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, and SAGY. It should integrate public datasets, show source-backed KPIs and analytics, support geographic drill-down where the source has that geography, provide visualizations/comparisons/reports, and use the React + Node/Express + PostgreSQL architecture described in the project abstract.

Important accuracy rule: **do not claim that every scheme is real-time, complete across every state/UT, or available to village level unless the source actually supports that claim.** The current geography table has 36 current state/UT records. PMAY-G, PMAY-U, MGNREGS, NRLM, DDU-GKY, and SAGY sources currently configured are historical snapshots; PMGSY has district data but its record-level reporting cutoff is not stated. The UI/docs should disclose each source's date and coverage. No missing targets, boundaries, metrics, or village data should be fabricated.

## 2. Current status at a glance

| Area | Status |
|---|---|
| React dashboard, charts, comparisons, geographic pages, CSV/PDF/reporting surfaces | Implemented; automated frontend build/tests pass |
| Express API, authentication/RBAC, KPI/analytics, drill-down, source monitoring | Implemented; backend tests pass |
| Verified source mappings | Seven feeds configured (PMAY-G and PMAY-U are separate feeds for the PMAY family); mappings and source limitations are documented in `README.md` |
| Official data import to Neon | **Complete for the seven configured source snapshots.** Latest run: 7/7 successful, 888 records, 0 failed; repeat run retained exactly 888 generic records and 7,305 KPI observations |
| All-scheme / all-state real-time coverage | **Not achieved and not supported by the configured source set.** Do not describe the dashboard as real-time |
| District/block/village data | Only show levels present in source data. Source districts can be created for configured district feeds; no official village feed is currently established |
| Scheduled imports on Render | Disabled/Render outbound requests to data.gov.in previously failed (`ECONNREFUSED` / `EHOSTUNREACH`). Local `sync:official` is the current import path |
| Production endpoints | PR #10 is merged; main CI passed. Render backend health is HTTP 200 with the database connected, the schemes API filters legacy KPIs, and the active Render frontend returns HTTP 200. A follow-up report/export filter fix is implemented locally and awaits review/deployment. |
| Overall scope completion | Core application is deployed. Real-time/all-scheme coverage remains unsupported; report/export deployment, authenticated flow verification, and credential rotation remain open. No defensible completion percentage is claimed. |

## 3. Recent verified work

### Previously merged/deployed work

Prior session history records PRs #3–#9 as merged, covering source-attributed dashboard data, safe data-source error reporting, empty-scheme request guards, root/health response and legacy service-worker cleanup, and a local official-data import command. Confirm current GitHub/deployment state before relying on live behavior.

### Merged release (PR #10)

PR [#10](https://github.com/chetanyasharma2003/college_final_project/pull/10) was squash-merged into `main` as `d2048a1973add02e9c4b9a6dc7a58063a3b71eac` on 3 November 2026. The main-branch `Project CI` run passed.

Changes shipped:

- `backend/src/services/data-sync.service.js`
  - Preloads scheme KPI definitions instead of fetching them for every imported row.
  - Canonicalizes state aliases on both source names and database state names.
  - Uses a bounded worker pool (maximum 4) for district-aggregated feeds to speed up large imports.
- `backend/tests/scheme-integrations.test.js`
  - Adds a regression test for Andaman and Nicobar source spellings.
- `backend/prisma/migrations/20261103040000_add_andaman_nicobar_state/migration.sql`
  - Changes Andhra Pradesh's conflicting state code from `AN` to `AP`.
  - Adds the missing `Andaman and Nicobar Islands` state with code `AN`.
- `backend/prisma/migrations/20261103050000_add_chandigarh_ladakh_states/migration.sql`
  - Adds source-reported Chandigarh (`CH`) and Ladakh (`LA`), both missing from the DB.
- `backend/prisma/migrations/20261103060000_add_lakshadweep_and_merged_ut/migration.sql`
  - Adds Lakshadweep (`LD`) and the current merged Dadra and Nagar Haveli and Daman and Diu UT (`DN`).
- `backend/src/services/data-sync.service.js`
  - Maps source spelling `Keralam` to canonical `Kerala`.
  - Maps historical `Dadra and Nagar Haveli` / `Daman and Diu` rows to the merged UT; sums only metrics present for both and preserves original source values in the JSON record.
  - Filters PMAY-U subtotals using the actual mapped state field.
  - Replaces imported date snapshots transactionally with batched inserts rather than doing several DB round-trips per metric/record.
  - Uses bounded district-import concurrency and a longer transaction wait/timeout.
- `backend/scripts/seed-india.js`
  - Lists all 36 current states/UTs; population remains unspecified for new UTs rather than using invented values.
- `backend/src/services/schemes.service.js` and `backend/tests/scheme-integrations.test.js`
  - Filters legacy KPI definitions and performance summaries from scheme APIs so they expose only KPIs mapped to verified source fields.
- `README.md`, `DEPLOYMENT.md`, and `render.yaml`
  - Document that refreshes are manual, record the active Render URLs, remove the stale Vercel origin from the Render CORS manifest, and distinguish the current deployment from old Vercel links.
- `.github/workflows/ci.yml`
  - Replaces the permissive placeholder workflow with CI that installs root, frontend, and backend dependencies and runs `npm test`; Render remains responsible for deployment from `main`.

### Follow-up fix in progress

- `backend/src/services/report.service.js` now filters executive, CSV, JSON, prediction, and comparative report data to KPI definitions mapped to official sources.
- Report completion stays unavailable when the source has no target, and comparative output distinguishes unrated/no-data schemes from low completion.
- `backend/src/utils/source-report-metrics.js` and `backend/tests/source-report-metrics.test.js` cover source filtering and no-target handling.
- This follow-up is not deployed yet; it is being prepared for PR review and CI.

All three geography migrations were applied to the configured Neon database; it has 36 current state/UT rows. The private ignored local import config uses the Neon pooler; a connection probe passed. No credentials or connection strings belong in this file, commits, screenshots, or chat.

### Latest tests

- Root `npm test`: passed after allowing the Redis tests to open their temporary loopback servers.
- Latest root `npm test`: passed with 3 frontend tests and 48 backend tests, including report source-filter/no-target coverage.
- GitHub Actions `Project CI` on `main`: passed after merge.
- Frontend production build: passed.
- Frontend tests: 3 passed.
- Backend tests: 45 passed, including the scheme-summary filter regression test.
- `node backend/scripts/seed-india.js --dry-run`: passed with 36 states/UTs and 7,776 synthetic demo rows; no DB writes.
- `git diff --check`: passed after the final documentation edits.
- Backend `npm run lint` cannot run because the repository has no ESLint configuration; no config/tooling was added.

### Data import and verification

- An earlier import loaded 854 records, with one feed marked successful and six partial because the source referred to Andaman and Nicobar while Neon had no such state row. Those figures are **not a final/complete import result**.
- A source inventory audited the state/UT names in all six state-level feeds against Neon; after normalizing aliases and adding official territories, no non-total source geographies remain unresolved.
- A bulk-import run completed: **7/7 successful, 888 records imported, 0 failed**. Feed results: PMAY-G 27, PMAY-U 36 (subtotal rows excluded), MGNREGS 31, PMGSY 691, NRLM 35, DDU-GKY 31, SAGY 37. The two historical Dadra/Daman entries are represented as one merged UT row, while original source values are retained in the record.
- Neon records seven completed import-history rows. Stored totals after the run: 888 generic scheme records and 7,305 KPI observations across 36 current state/UT records.
- Repeated the sync; it again reported 7/7 successful and 888 imported. Post-repeat DB counts remained 888 generic records and 7,305 KPI observations, confirming snapshot replacement is idempotent.
- Direct Neon connections closed during the previous slow row-by-row import. Switching the private local import config to the user-provided pooler, and changing to transactional bulk replacement, resolved the import issue.
- Post-merge Render health returned HTTP 200 with the database connected; the backend restarted after merge. The schemes API no longer returns the legacy KPI names, confirming the source filter is deployed.
- A review of protected report endpoints found they still included legacy KPI rows and substituted an arbitrary target of 100. The follow-up code filters those reports and leaves completion unrated when no source target exists; deployment is pending PR #11.

### Latest continuation (3 November 2026)

- `https://college-final-project-backend-m86r.onrender.com/health`: HTTP 200, `database: connected`, after the merge deployment.
- `https://college-final-project-backend-m86r.onrender.com/api/v1/schemes`: HTTP 200; returns only the seven feeds' source-mapped KPIs. Legacy demo KPI names are no longer exposed.
- `https://frontend-ae3v.onrender.com/`: HTTP 200. The documented `college-final-project.vercel.app` and older `frontend-eta-smoky-88.vercel.app` links returned 404; deployment docs use the active Render URL.
- Authenticated login, source-monitoring, geography, and report/export flows were not tested because no authorized test account was available.
- PR #10 is merged and main CI passed. Refreshes remain manual because configured feeds have `syncFrequency: null` and Render access to data.gov.in previously failed.
- PR #11 should merge only after its required full-suite CI check passes; then recheck report/PDF output in production.
- README and deployment docs now state that imports are manual. `ENABLE_DATA_SYNC_SCHEDULER=true` alone does not schedule these configured feeds because each has `syncFrequency: null`.

## 4. How to continue

1. **Deliver report fix.** Review PR #11 and merge after CI passes; confirm Render deploys it.
2. **Authenticated smoke tests.** Use an authorized test account to check login, dashboard, source monitoring, geography, and report/export.
3. **Refresh schedule.** Imports remain manual because the feeds have no verified cadence and data.gov.in connectivity failed from Render previously. Do not imply automatic refresh is active.
4. **Credential hygiene.** API/database credentials were exposed during prior troubleshooting. Rotate them in the private hosting/database settings and verify only that new values work; never put them in this log.

## 5. Acceptance checklist to reach the college scope honestly

- [x] Core full-stack application and six scheme-family surfaces exist.
- [x] Official dataset/resource mappings are configured and source attribution/limitations are documented.
- [x] Dashboard avoids fabricated targets and unsupported geographic/real-time claims.
- [x] Analytics, comparisons, charts, authentication, report/export, and geographic UI have implementation coverage.
- [x] Regression/build/test suite passes locally.
- [x] Latest Neon import run: 7/7 feeds successful, 888 records, no failed rows.
- [x] Geographic aliases/territories are mapped; all non-total source geographies in configured feeds resolve.
- [x] Persisted row/KPI counts and import history are verified; repeated sync did not duplicate rows.
- [x] PMAY-U subtotal rows are excluded; historical merged-UT metrics preserve source breakdown and do not invent missing values.
- [x] PR #10 is merged; Render backend health/database and source-mapped schemes API are verified live.
- [ ] Authenticated login, dashboard, source-monitoring, geography, and report/export flows are smoke-tested with an authorized account.
- [x] Scheduled refresh is clearly described as unavailable/manual; do not imply it is active.
- [x] Geography claims are limited to source-backed state and district records; no official village feed is claimed.

## 6. Handoff rules

- Continue updating this file after important changes, especially import results, migration status, test outcomes, PR/deployment status, and newly found blockers.
- Keep secrets out of this file; include only names of private environment files when needed.
- Prefer source-backed, reproducible outputs over estimates. Clearly label unknown or unverified status.
- The older `PROJECT_WORK_LOG.md` in Downloads is a historical note and may be stale; this repository file is the current handoff.
