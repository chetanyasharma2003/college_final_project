# Abstract

The Unified Performance Dashboard brings together reported indicators for six Ministry of Rural Development scheme families: PMAY, MGNREGS, PMGSY, NRLM, DDU-GKY, and SAGY. It provides scheme and state/UT filters, comparisons, charts, maps, and report exports through a web application built with React, Node.js, Express, and PostgreSQL. Prisma manages database access, Redux handles frontend state, and JWT-based authentication protects account-specific features.

The application uses seven configured government data feeds; PMAY-G and PMAY-U are separate sources. Their reporting dates and geographic coverage differ. Most provide historical state/UT snapshots. District observations are available for PMGSY and for Karnataka in MGNREGS. The current data does not include block- or village-level KPI observations, and the feeds do not support a claim of real-time updates. The dashboard presents values with source context so users can interpret them within these limits.

## Original project scope

The submitted project brief called for a centralized cloud dashboard with real-time KPIs, multiple open datasets, graphs, heatmaps, and district/village drill-down analytics. It also listed these modules:

- Scheme Data Integration
- KPI Definition
- Performance Analytics
- Visualization Dashboard
- Comparative Analysis
- Report Generation
