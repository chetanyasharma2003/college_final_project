# College Final Project — Work Update

**Last updated:** 2026-11-03 19:25 IST
**Project:** Government Schemes Analytics Dashboard
**Purpose:** Current handoff for the next AI/developer. Read this file before continuing work and update it after each meaningful implementation, import, test, or deployment milestone.

## 1. College scope

The target is a centralized cloud dashboard for six scheme families: PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, and SAGY. It should integrate public datasets, show source-backed KPIs and analytics, support geographic drill-down where the source has that geography, provide visualizations/comparisons/reports, and use the React + Node/Express + PostgreSQL architecture described in the project abstract.

Important accuracy rule: **do not claim that every scheme is real-time, complete across every state/UT, or available to village level unless the source actually supports that claim.** The current geography table has 36 current state/UT records. PMAY-G, PMAY-U, MGNREGS, NRLM, DDU-GKY, and SAGY sources currently configured are historical snapshots; PMGSY has district data but its record-level reporting cutoff is not stated. The OGD catalog lists an NRLM village-wise SHG/member resource, but its API field schema and location mapping have not been verified for ingestion. The UI/docs should disclose each configured source's date and coverage. No missing targets, boundaries, metrics, or village data should be fabricated.

## 2. Current status at a glance

| Area | Status |
|---|---|
| React dashboard, charts, comparisons, geographic pages, CSV/PDF/reporting surfaces | Implemented; automated frontend build/tests pass |
| Express API, authentication/RBAC, KPI/analytics, drill-down, source monitoring | Implemented; backend tests pass |
| Verified source mappings | Seven feeds configured (PMAY-G and PMAY-U are separate feeds for the PMAY family); mappings and source limitations are documented in `README.md` |
| Official data import to Neon | **Complete for the seven configured source snapshots.** Latest import: 7/7 successful, 888 records, 0 failed. A later row-level provenance audit retained 8,241 KPI observations that exactly match these official raw records |
| All-scheme / all-state real-time coverage | **Not achieved and not supported by the configured source set.** Do not describe the dashboard as real-time |
| District/block/village data | 706 source-referenced districts remain; synthetic block/village rows were removed. An NRLM village-wise resource is listed by OGD but has not been schema-verified or integrated; no village KPI data are currently served |
| Scheduled imports | Render and GitHub-hosted runners cannot reach data.gov.in. A local sync on this Mac succeeded 7/7 (888 records, 0 failed). A macOS LaunchAgent is installed and polls every seven days through the reachable local network; the source update cadence remains unverified. |
| Production endpoints | Source-only cleanup commit `c514249`, frontend deploy commit `79cecd4`, Render automation commit `170548c`, UI safety commit `4b5e731`, local sync setup `f885959`, and screenshot fixes `9bfb910` passed main CI. Backend health returns HTTP 200 with database connected; frontend returns HTTP 200 and serves the screenshot fixes. Both Render services auto-deploy after CI checks pass. |
| Overall scope completion | Core application is deployed and authenticated viewer/admin API flows have been smoke-tested. Weekly local polling is configured, but real-time/all-scheme coverage remains unsupported and credential rotation remains open. No defensible completion percentage is claimed. |

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

### Merged report fix (PR #11)

- `backend/src/services/report.service.js` now filters executive, CSV, JSON, prediction, and comparative report data to KPI definitions mapped to official sources.
- Report completion stays unavailable when the source has no target, and comparative output distinguishes unrated/no-data schemes from low completion.
- `backend/src/utils/source-report-metrics.js` and `backend/tests/source-report-metrics.test.js` cover source filtering and no-target handling.
- PR [#11](https://github.com/chetanyasharma2003/college_final_project/pull/11) merged as `d2e674683035378ee2b61e1f245df1eb50cd4966`; its PR and main-branch CI checks passed. Its report source filter and no-target handling are included in the live PR #12 release.

### Merged historical snapshot report-window fix (PR #12)

- The configured feeds are mostly historical snapshots, but report defaults used rolling 30/90-day windows. That made the default executive, PDF, CSV, and JSON reports omit many available source records.
- The merged change uses all available source records when no date filter is requested and labels the executive/JSON period from actual record dates. Explicit date filters remain supported.
- PR [#12](https://github.com/chetanyasharma2003/college_final_project/pull/12) merged as `65b7164e6dea292966592b95001c0fe02c3522ce`; PR and main-branch CI passed, and Render deployed it.
- Production authenticated smoke: PMAY-U executive, JSON, and PDF reports returned all 108 source observations with date `2026-01-22`, no legacy KPI names, and no fabricated target/completion. The temporary viewer account and its audit rows were removed.
- The admin source-monitoring overview returned 8 schemes, 36 states/UTs, and 8 feed records. The temporary admin account and its audit rows were removed.

All three geography migrations were applied to the configured Neon database; it has 36 current state/UT rows. The private ignored local import config uses the Neon pooler; a connection probe passed. No credentials or connection strings belong in this file, commits, screenshots, or chat.

### Latest tests

- Root `npm test`: passed after allowing the Redis tests to open their temporary loopback servers.
- Local root `npm test` after PR #11: passed with 3 frontend tests and 48 backend tests, including report source-filter/no-target coverage.
- PR #11 required CI and merged-main CI both passed; the merged workflow runs the same root suite.
- PR #12 required CI and merged-main CI both passed.
- PR #12 and the final handoff commit passed the full root build/test suite in GitHub Actions.
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
- A review of protected report endpoints found they still included legacy KPI rows and substituted an arbitrary target of 100. PR #11 filters reports to source-mapped KPIs and leaves completion unrated when no source target exists.
- The report defaults also used recent rolling windows despite the historical snapshot dates. PR #12 now defaults to all available source data and labels its actual date coverage; the production report smoke check confirmed the result.

### Latest continuation (3 November 2026)

- `https://college-final-project-backend-m86r.onrender.com/health`: HTTP 200, `database: connected`, after the merge deployment.
- `https://college-final-project-backend-m86r.onrender.com/api/v1/schemes`: HTTP 200; returns only the seven feeds' source-mapped KPIs. Legacy demo KPI names are no longer exposed.
- `https://frontend-ae3v.onrender.com/`: HTTP 200. The documented `college-final-project.vercel.app` and older `frontend-eta-smoky-88.vercel.app` links returned 404; deployment docs use the active Render URL.
- An ephemeral viewer account verified login, profile, source KPIs, geography, and executive/JSON/PDF reporting; an ephemeral admin verified source monitoring. Both accounts and their audit rows were deleted after testing.
- PRs #10–#12 are merged and main CI passed. Refreshes remain manual because configured feeds have `syncFrequency: null` and Render access to data.gov.in previously failed.
- PR #12 is merged and deployed. Production health is HTTP 200 with the database connected; authenticated PMAY-U reports return 108 observations dated 22 January 2026, and the admin source-monitoring summary returns 8 schemes, 36 states/UTs, and 8 feeds.
- Final production checks: schemes API returns 8 entries with no legacy KPI names; geography API returns 36 state/UT entries; frontend returns HTTP 200; browser CORS preflight allows the active Render frontend.
- Temporary viewer/admin users and their associated audit rows were removed after the smoke checks.
- README and deployment docs now state that imports are manual. `ENABLE_DATA_SYNC_SCHEDULER=true` alone does not schedule these configured feeds because each has `syncFrequency: null`.

### Production source-only cleanup (3 November 2026)

- Audited every persisted KPI value against the matching configured official raw record, source field, geography, and reporting date.
- The guarded `backend/scripts/purge-synthetic-demo-data.js` dry run found 8,241 exact source matches among 24,657 KPI values. It identified 16,416 unmatched demo values, 18 non-source KPI definitions, 3 synthetic predictions, 108 generated blocks, and 324 generated villages.
- Applied the cleanup transaction to the configured Neon database. Post-transaction verification passed: exactly 8,241 source-matched KPI observations remain; non-source KPI definitions and predictions, blocks/villages, and unsourced area/population fields are absent. The 888 official generic source records and 706 source-referenced district records remain.
- Feed-matched KPI observation counts retained: PMAY-G 27, PMAY-U 108, MGNREGS 31, PMGSY 7,601, NRLM 105, DDU-GKY 244, SAGY 125.
- The cleanup command is reproducible and dry-run by default: `cd backend && npm run purge:synthetic -- --env-file=.env.real-data`. Applying it requires explicit `--apply --confirm-production-cleanup` flags.
- This database cleanup does not make snapshots real-time or integrate the NRLM village-wise resource. Source freshness remains historical/uncadenced, and the dashboard must disclose source dates and geographic coverage.
- Documentation and UI copy now describe source-reported dates and source-supported geography instead of real-time or generated sample coverage. Commit `c514249` is pushed to `main`; GitHub Actions passed and Render backend restarted with HTTP 200/database connected. The Render frontend was subsequently deployed through the API at commit `79cecd4` and serves the updated copy.

### Render deployment automation (3 November 2026)

- With the user's Render API key, listed workspace services without exposing or saving any secret values. Confirmed the existing `frontend` static site uses this repository, `main`, root directory `frontend`, and has auto-deploy enabled; the backend is also connected to `main` with auto-deploy enabled.
- Triggered frontend deploy `dep-dbktfvm7bikc73frgh30` for commit `79cecd4b6169662ebd46804023458645eff63416`. Render reported `live`.
- Live verification: frontend HTTP 200; the served JS chunks contain the updated “source-backed KPI observations” message and no longer contain the old “Detailed sample data covers” copy. Backend remains HTTP 200 with database connected. Main CI passed for commits `c514249` and `79cecd4`.
- The Render API key was supplied in chat and used only in memory; it was not written to repo files, logs, or this handoff. Rotate/revoke it after the deadline. Existing source imports remain manual: configured feeds have no verified refresh cadence, and Render previously could not reach data.gov.in.
- Updated both existing GitHub-backed Render services to `autoDeployTrigger: checksPass` through the Render API; GET/PATCH confirmed the setting. `render.yaml` now records the same setting for the backend. The current GitHub Actions CI is the gate for future service deployments.
- Commit `170548c` records this config and passed GitHub Actions. It changed only `render.yaml`/handoff paths, so Render did not create a new application deploy; backend remains live at `c514249`, and frontend remains live at `79cecd4`.
- Latest live check (3 November 2026): `/health` HTTP 200/database connected; schemes API HTTP 200 with 8 schemes and 31 source KPI definitions; geography API HTTP 200 with 36 states/UTs and 706 districts; blocks and villages both return count 0; frontend HTTP 200 with updated source-backed UI copy and no old sample-data wording; CORS preflight allows `https://frontend-ae3v.onrender.com`.
- Render API confirms both backend (`c514249`) and frontend (`79cecd4`) deploys are `live`, and both services use `autoDeployTrigger: checksPass`. Latest GitHub CI for `2c0f077` passed; repo `main` was clean after push.
- OGD lists the NRLM village-wise SHG/member resource, but the linked catalog API identifier is not a data resource endpoint (`Meta not found` when probed as one). Its actual fields and location mapping are still unverified; no village KPI data were fabricated or added.

### Render source-sync failure investigation (3 November 2026)

- The admin screenshot showed the 18:35 IST Render sync attempt failed for all seven feeds with `ECONNREFUSED`; it imported 0 records. These failures only add truthful import-history entries; source KPI/raw data remain unchanged.
- A direct request to the configured PMAY-U OGD resource from the private local environment returned HTTP 200 with one record (`total: 39`). This confirms the configured resource/key work from the local network and isolates the refusal to Render's outbound path.
- Updated `frontend/src/components/AdminMonitoring.jsx` to require a successful Render connectivity test before enabling the seven-feed sync action. A failed check now explains the Render network error, confirms that no source records were imported, and shows the verified local command `cd backend && npm run sync:official`.
- Commit `4b5e731` passed GitHub CI and Render frontend deploy `dep-dbktrsh7lnhs738avqt0` is `live`; production serves the new sync guard.
- After the user explicitly approved this destination and purpose, temporarily saved `DATABASE_URL` and `DATA_GOV_API_KEY` as encrypted GitHub Actions repository secrets. The hosted import run `41644507077` confirmed that GitHub-hosted runners also cannot access OGD (3 feeds returned `ECONNREFUSED`, 4 timed out; 0 records imported). Both unused secrets and the manual-only workflow were then removed.
- CI passed for commit `ccb2791`; `backend/scripts/sync-official-data.js` now also accepts process environment credentials when the ignored local file is absent.
- Ran `cd backend && npm run sync:official` from the Mac's network. All seven configured feeds succeeded and imported 888 records (PMAY-G 27, PMAY-U 36, MGNREGS 31, PMGSY 691, NRLM 35, DDU-GKY 31, SAGY 37).
- Added `backend/scripts/install-local-sync-agent.sh`, updated the README, and installed the macOS LaunchAgent `com.collegefinalproject.official-data-sync`. It runs `npm run sync:official` every 604800 seconds, using the ignored local `.env.real-data`; output goes to `~/Library/Logs/college-final-project-official-sync.log`. `launchctl print` confirms it is loaded. It requires this Mac to be logged in and able to access data.gov.in; the interval is polling only, not an official source cadence.
- Verified the installed LaunchAgent with `launchctl kickstart`: it exited 0 and imported the same seven feeds/888 records successfully.
- Removed the GitHub-hosted import workflow and the temporary `DATABASE_URL` / `DATA_GOV_API_KEY` Actions secrets after the hosted run confirmed that cloud egress to OGD is blocked. These secrets are not currently stored in GitHub.
- Updated the admin panel to distinguish the disabled Render scheduler from the local Mac schedule. Final commit `f885959` passed GitHub CI, Render frontend serves the new copy, and backend health returns HTTP 200 with the database connected. Working tree is clean after push.

### Dashboard screenshot follow-up (3 November 2026)

- Verified the latest seven Neon import-history rows are all `completed`, with PMAY-G 27, PMAY-U 36, MGNREGS 31, PMGSY 691, NRLM 35, DDU-GKY 31, and SAGY 37 records; all report 0 failures.
- Live Neon inspection confirmed PMAY-U's three source KPIs have actual values and null targets. The status API previously converted a missing target to numeric 0 even while returning `no_target`; it now returns null. KPI cards hide the false zero-target progress bar and explain that no source target exists; the aggregate reads “Not available.”
- Replaced the target-dependent empty state-ranking panel with a selectable source-value ranking. It reports the source date and coverage, aggregates district feeds using each district's latest value, and explicitly says larger source values are not better performance scores. Live-data logic returned 35 PMAY-U state/UT observations and 30 PMGSY state aggregates from 691 districts.
- Fixed national chart aggregation: use the official national total when supplied, otherwise sum the lowest available state/district rows, never average national and state subtotals together. PMAY-U national rows match the sum of their state rows. Removed the KPI history endpoint's per-row lookup and raised the safe cap to 10,000 so PMGSY's 7,601 observations are not truncated at 500.
- A one-date chart now identifies itself as a “Source snapshot” and says that one reporting date cannot make a trend. The top summary calls the seven items official data feeds across six scheme families (PMAY-G/U are separate feeds).
- Geographic drill-down now explains when the selected feed reports only state/UT values, so an empty district heatmap for those sources is clearly a source-coverage limit rather than an import error.
- Added unit tests for missing targets and source rankings; targeted run passed 3/3 and CI passed on commit `9bfb910`. The live Render frontend returns HTTP 200 and its bundles contain the target, raw-value ranking, source snapshot, feed-count, and geography explanations. Backend health returns HTTP 200 with Neon connected. Latest seven import rows remain 7/7 successful.

## 4. How to continue

1. **Refresh schedule.** The local LaunchAgent is installed. Check it with `launchctl print gui/$(id -u)/com.collegefinalproject.official-data-sync`; inspect `~/Library/Logs/college-final-project-official-sync.log` for counts or failures. Reinstall/update it with `cd backend && ./scripts/install-local-sync-agent.sh`.
2. **Credential hygiene.** Rotate/revoke the Render API key shared in chat after the deadline. API/database credentials were also exposed during prior troubleshooting; rotate those in private hosting/database settings. Do not write replacement values to this log.

## 5. Acceptance checklist to reach the college scope honestly

- [x] Core full-stack application and six scheme-family surfaces exist.
- [x] Official dataset/resource mappings are configured and source attribution/limitations are documented.
- [x] Dashboard avoids fabricated targets and unsupported geographic/real-time claims.
- [x] Analytics, comparisons, charts, authentication, report/export, and geographic UI have implementation coverage.
- [x] Full root build/test suite passes in GitHub Actions; the local suite also passed after PR #11.
- [x] Latest Neon import run: 7/7 feeds successful, 888 records, no failed rows.
- [x] Geographic aliases/territories are mapped; all non-total source geographies in configured feeds resolve.
- [x] Persisted row/KPI counts and import history are verified; repeated sync did not duplicate rows.
- [x] PMAY-U subtotal rows are excluded; historical merged-UT metrics preserve source breakdown and do not invent missing values.
- [x] PRs #10–#12 are merged; main CI passed and Render backend health/database and source-mapped schemes API are verified live.
- [x] Authenticated login/profile, source KPI list, geography heatmap, admin source monitoring, and executive/JSON/PDF report flows are smoke-tested; temporary accounts and their audit records were removed.
- [x] Weekly local polling is configured, documented as best-effort, and not described as an official source update cadence or real-time data.
- [x] Geography claims are limited to source-backed state and district records; the listed NRLM village-wise resource is disclosed as pending schema verification/integration.

## 6. Handoff rules

- Continue updating this file after important changes, especially import results, migration status, test outcomes, PR/deployment status, and newly found blockers.
- Keep secrets out of this file; include only names of private environment files when needed.
- Prefer source-backed, reproducible outputs over estimates. Clearly label unknown or unverified status.
- The older `PROJECT_WORK_LOG.md` in Downloads is a historical note and may be stale; this repository file is the current handoff.
