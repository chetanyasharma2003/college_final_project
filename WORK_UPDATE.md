# Work Update

**Updated:** 4 November 2026
**Project:** Unified Performance Dashboard for all MoRD Schemes
**Purpose:** Current project handoff. Add a short note here after meaningful code, data, verification, GitHub, or Render work. Never put credentials in this file.

## Project in brief

The app brings together KPI data for MoRD schemes in a React dashboard with a Node/Express API and PostgreSQL database. It includes scheme and geography filters, comparisons, charts, reports, and admin tools. The project brief describes broader real-time and village-level coverage, but the data currently connected to the app does not support those claims.

## Current implementation and data

- Seven official feeds are configured across six scheme families. PMAY-G and PMAY-U use separate feeds.
- The latest recorded official import completed all seven feeds: 888 source records, with no failed feeds. A separate provenance cleanup retained 8,241 KPI observations matched to official source records. These are historical snapshots; an import succeeding does not mean the source data are current or real-time.
- The database has 36 state/UT records. District observations are available for PMGSY and for Karnataka in MGNREGS. The other configured feeds do not currently provide district KPI observations in this database. There are no block- or village-level KPI observations.
- Most feeds do not provide official targets. Those values should remain unrated; do not infer a target or mark a KPI as failing without one.
- Trend charts need multiple dated observations. A single dated snapshot is not enough to claim a trend.
- The OGD catalog lists an NRLM village-wise resource, but its fields and geographic mapping have not been verified for this app.

## Team modules

The final assignments below follow the supplied SRS v2.1 Form-2 table. The module names describe the assignment; they do not by themselves prove who authored existing commits.

| Member | Form-2 module |
|---|---|
| Divyansh Tak (23ESKIT047) | Backend and APIs — User Authentication & Role Management |
| Chetanya Prakash Sharma (23ESKIT040) | Testing and Integration — Testing & Report Generation |
| Chitransh Jain (23ESKIT042) | Frontend Development — Dashboard & Data Visualization |
| Harshit Narayan Tripathi (23ESKIT057) | Database and Analytics — Scheme, State & KPI Data Management |

The detailed Form-2 tasks also assign profile management and report-generation APIs to Divyansh; KPI report generation, monitoring dashboard, and Postman API testing/documentation to Chetanya; dashboard view, trend charts, and responsive UI to Chitransh; and data filtering, caching, and KPI data entry to Harshit. Report generation appears in both assignments. The agreed practical split is that Divyansh handles report API implementation and Chetanya handles report testing, validation, and integration evidence.

## Latest recorded work

- Documentation/UI copy pass: rewrote `description.md` to separate implemented behavior from the original real-time/village-level brief; removed the stale week-by-week checklist and unmeasured performance promises from `README.md`; corrected its test commands and architecture notes; and replaced mixed Render/Vercel deployment steps with the current Render setup and dated caveats. Updated `completion status.md` to mark the exact current release as needing a fresh check. Replaced generic resource-allocation advice in the legacy performance-gap panel with interpretation notes and distinguished insufficient anomaly data from a clean result.
- The frontend was refreshed with shared navigation, source context, and a lighter visual style. Local production build and automated checks passed in the recorded run. Full page-by-page visual review was not completed.
- Dashboard response guards were added for unexpected API payload shapes. PR #14 was recorded as merged, with its CI passing and the frontend bundle later verified on Render.
- Heatmap work clarified when district drill-down is supported, added a visible action for eligible states, and handled a nullable district-area field. Several related PRs and deployments were recorded on 4 November. Because the older log contains conflicting intermediate states and a later direct deploy, recheck the current branch and live Render bundle before relying on the exact deployed commit.
- Admin wording was changed to explain that official imports run through the configured operations environment. Render's outbound connection to data.gov.in was not established by the recorded checks; the successful import ran from the configured local environment.
- The most recent recorded local import completed 7/7 feeds and imported 888 records. Do not repeat it without checking the import instructions and environment first.
- Restored `explain.md`, `chetanya.md`, `harshit.md`, and `chitransh.md` as concise Hinglish presentation notes. They distinguish Form-2 assignments from proof of individual authorship and flag unverified Postman, manual KPI-entry, responsive-audit, and live-deployment claims.

## GitHub history and attribution

The original repository's available commits were made under one Git identity. A separate private repository, `chetanyasharma2003/mord-schemes-dashboard-team`, was created and its 90-commit history was rewritten using the final Form-2 task areas. The rewrite used changed files and line counts to assign authorship and co-author credit; it is a reconstruction, not commit-by-commit evidence of who personally wrote each change. Do not present the resulting commit counts as measured workload or independent proof of authorship.

The rewritten history was pushed to the private repository. On 4 November, after re-authenticating GitHub, a fresh fetch found remote `main` at `9c0cb2e` before the team-role README update. The contributor API resolved four accounts and reported primary commit counts: Chetanya 58, Harshit 15, Chitransh 13, and Divyansh 4. GitHub's contributor stats endpoint also returned these four accounts; its totals differ because it uses contribution-graph data. The earlier screenshot showing one contributor was stale; refresh the page or open Insights → Contributors to see the recalculated view. These are GitHub attribution counts, not a measure of each member's hours or overall workload.

Added the Form-2 team roles and the agreed report split to the private repo README in PR #1. CI run `41848154104` passed, and PR #1 was squash-merged; remote `main` advanced to `62e10c4`. Updated the repo About text to “Unified Performance Dashboard for MoRD schemes. Team roles are listed in the README.” No Render deployment was triggered. The role-based commit history remains a reconstruction from task/file mapping, so its commit counts should not be presented as an independently audited workload breakdown.

Post-PR #1 contributor refresh (4 November): A fresh read-only GitHub API query returned Chetanya 59, Harshit 15, Chitransh 13, and Divyansh 4. The earlier Chetanya count of 58 was the pre-PR #1 snapshot; the new README commit raised the returned count to 59. Chetanya's itemized history includes setup and deployment work, code fixes, documentation/status records, and PR merge entries; this is not one feature repeated 59 times. These counts still reflect reconstructed commit attribution, not an independent measure of each member's personal workload.

Per-account commit-author dates from the private team's `main` history, queried 4 November 2026:

| Member | Form-2 module | GitHub-attributed commits by author date |
|---|---|---|
| Chetanya Prakash Sharma (`chetanyasharma2003`) | Testing & Report Generation | **59** — 8 Aug (2); 9 Aug (22); 10 Aug (5); 12 Oct (3); 13 Oct (1); 14 Oct (2); 28 Oct (1); 29 Oct (1); 2 Nov (1); 3 Nov (20); 4 Nov (1) |
| Harshit Narayan Tripathi (`harshittripathi274-ctrl`) | Scheme, State & KPI Data Management | **15** — 9 Aug (5); 28 Oct (1); 2 Nov (1); 3 Nov (8) |
| Chitransh Jain (`Chitransh0206`) | Dashboard & Data Visualization | **13** — 9 Aug (2); 10 Aug (4); 3 Nov (7) |
| Divyansh Tak (`Dev182004`) | User Authentication & Role Management | **4** — 10 Aug (2); 3 Nov (2) |

These dates and identities are as attributed by the reconstructed team-repo history; they do not independently verify original authorship or workload.

The private copy had a hard-coded data.gov.in key removed from its copied history. A credential had also appeared in the original public repository's history; revoke or rotate it if it is still active. Do not copy credentials into chat, source files, commits, or this handoff.

Form-3 date cross-check (4 November): The supplied Form-3A–D templates repeat 11 reporting date pairs from 24–25 July through 24–25 October 2026. A read-only query of the private team's `main` commit history found two commits on an exact listed date, 8 August (`d463682` and `f7641b7`), both attributed to Chetanya; no commits were recorded on the other listed dates. Do not backdate nearby commits or invent weekly progress. The form labels progress, mentor comments, marks, and signatures as mentor-filled; complete those fields only from dated evidence and mentor review.

## Deployment and verification notes

- Render frontend and backend health/bundle checks returned HTTP 200 in several recorded checks on 4 November. Some authenticated endpoints were not verified because the probes had no application session.
- Render-to-data.gov.in connectivity remained unverified or failed in the recorded checks. The local official-data import succeeding does not establish cloud connectivity.
- Several deployments were made on the same day, including a direct deploy of an unmerged commit. Recheck the live Render services and their branch/deploy settings before claiming that the latest local code is live.
- A successful build or CI run is not the same as full browser QA. The refreshed interface still needs a page-by-page review at desktop and mobile sizes.

## Remaining work

1. Recheck the current GitHub branch, CI state, Render service mappings, and live frontend/backend versions.
2. Review dashboard pages in a browser at desktop and mobile sizes; verify signed-in flows, especially reports, analytics, admin tools, and heatmap drill-down.
3. Keep the agreed report-generation split clear: Divyansh implements report APIs; Chetanya tests and validates report output and records integration evidence. Each member should describe work they can demonstrate.
4. Complete and retain API test evidence, including the planned Postman documentation.
5. Keep source dates, geography, and target limitations visible. Do not claim real-time updates, full state coverage, block/village data, or genuine trends without supporting records.
6. Revoke any exposed GitHub, Render, or data.gov.in credentials that remain active.

## Local working tree

The original checkout contains many uncommitted frontend/backend edits, deletions, and new files. They have not all been reviewed as one release and must be preserved. Do not stage or publish the whole working tree without first checking the exact diff and intended scope. This cleanup changed project descriptions, deployment notes, and presentation guides; no application tests were run for these documentation changes.
