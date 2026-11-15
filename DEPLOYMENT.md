# Deployment

The project has a React/Vite frontend and a Node/Express API on Render. PostgreSQL is hosted on Neon. The URLs below were checked on 4 November 2026; check the Render dashboard before relying on them because a direct deploy of an unmerged commit was also recorded.

- Frontend: <https://frontend-ae3v.onrender.com>
- Backend API: <https://college-final-project-backend-m86r.onrender.com/api/v1>
- Backend health: <https://college-final-project-backend-m86r.onrender.com/health>

## Render service settings

Confirm the connected repository, branch, root directory, and latest deploy in Render before making a release. The recorded production setup uses the `frontend` directory for the static site and the repository root for the backend service.

### Frontend static site

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- `VITE_API_URL`: `https://college-final-project-backend-m86r.onrender.com/api/v1`

### Backend web service

- Build command: `cd backend && npm ci && npm run build`
- Start command: `cd backend && npm start`
- Set `DATABASE_URL` to the private Neon pooled connection string.
- Set unique `JWT_SECRET` and `JWT_REFRESH_SECRET` values in Render's private environment settings.
- Set `CORS_ORIGIN` to the production frontend origin. Add localhost origins only when needed for local development.
- Keep production credentials out of this repository, screenshots, and chat.

Database migrations are run with `cd backend && npm run migrate`. Before applying migrations to production, check the migration and make sure a current database backup is available.

## Release checks

1. Review the exact commit and ensure unrelated local changes are not included.
2. Confirm the intended branch and Render service mappings. Do not assume a direct deploy from a feature commit has merged into `main`.
3. Wait for the required GitHub CI checks and Render deployment to finish.
4. Check the frontend URL and backend `/health` endpoint.
5. Sign in and verify the affected dashboard flow. A public health response does not verify authenticated reports, analytics, admin tools, or heatmap interactions.
6. Record the commit, CI result, deployment result, and checks performed in [WORK_UPDATE.md](./WORK_UPDATE.md).

## Data imports

The configured sources are historical snapshots and have no verified common update cadence. The latest recorded import ran from the configured local operations environment and completed seven feeds with 888 records. Render's outbound connection to data.gov.in was not confirmed in the recorded checks. The local seven-day polling interval is a retry cadence; it does not mean the source data update weekly or in real time.

Do not trigger a production import unless the configured environment and target database have been checked. Never put the data.gov.in key or database credentials in a committed file.

## Verification record and limits

On 4 November 2026, recorded checks returned HTTP 200 for the frontend and backend health endpoint. Public scheme and geography endpoints also returned HTTP 200. Some authenticated endpoints returned HTTP 401 when checked without a session, so those responses only confirmed the authentication gate. The signed-in state of every dashboard feature and the exact currently deployed commit need a fresh check.

For source coverage, local development, and project status, see [README.md](./README.md), [DOCKER_README.md](./DOCKER_README.md), and [WORK_UPDATE.md](./WORK_UPDATE.md).
