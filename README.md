# APAR / ACR Management System — NIC Tripura

A secure full-stack Annual Performance Assessment Report (APAR / ACR) portal built on the NIC SPARROW-style `tran` schema.

**Stack:** React 18 + Vite + Tailwind · Spring Boot 3 / Java 17 · PostgreSQL 16+ · JWT · Docker

## Deployment

This is a full-stack application. **Deploy the React frontend to Vercel and the Spring Boot API plus PostgreSQL to a Java/container host such as Railway.** Vercel serves the static Vite frontend; it does not run this Spring Boot application as a normal Vite project.

### 1. Deploy the backend and database

Create a PostgreSQL service and a backend service from this repository on Railway.

Configure the backend service:
- **Repository:** `tathagatalaskar/aparnextgen`
- **Branch:** `fix/vercel-deployment-and-hardening` (or the release branch you approve)
- **Root directory:** repository root
- **Dockerfile path:** `backend/Dockerfile`
- **Health check path:** `/api/health`
- **Port:** `8080` (Railway also supplies `PORT`)

Set these environment variables on the backend service:

| Variable | Required | Meaning |
|---|---:|---|
| `SPRING_DATASOURCE_URL` | Yes | Private PostgreSQL URL in JDBC form, e.g. `jdbc:postgresql://DB_PRIVATE_HOST:5432/DB_NAME` |
| `SPRING_DATASOURCE_USERNAME` | Yes | PostgreSQL user |
| `SPRING_DATASOURCE_PASSWORD` | Yes | PostgreSQL password |
| `APP_JWT_SECRET` | Yes | Unique random secret, at least 32 bytes |
| `APP_CORS_ORIGINS` | Yes | Comma-separated exact Vercel origin(s) |
| `PORT` | No | Defaults to `8080` |
| `APP_JWT_EXPIRATION_MS` | No | Defaults to `3600000` (one hour) |

On first startup, the backend waits for PostgreSQL and creates the `tran` schema and required reference data using `db/init/01_schema.sql` and `db/init/02_reference_data.sql` if the APAR schema is absent. It does not load demo seed data in a hosted environment. Keep `APAR_LOAD_DEMO_SEED` unset or `false` in production.

**Never run `db/init/02_seed.sql` against a real production database.** It inserts publicly documented demo accounts, sample employee records, and test ACR data for local demonstrations only.

After deployment, an authorized administrator must configure the approved assessment cycle and due date. Replace both placeholders with the real reporting period and deadline before running:

```sql
INSERT INTO tran.acr_cycle (assessment_year, due_date, is_open)
VALUES ('YYYY-YYYY', DATE 'YYYY-MM-DD', TRUE)
ON CONFLICT (assessment_year) DO UPDATE
SET due_date = EXCLUDED.due_date,
    is_open = EXCLUDED.is_open;
```

Do not leave placeholder values in the live database. Only one cycle should be open at a time.

Generate a strong JWT secret with `openssl rand -base64 48`. Store it only in the backend host's encrypted environment variables.

The backend URL must be publicly reachable over HTTPS. Its API base path is `/api`; for example `https://your-backend.example.com/api`.

### 2. Deploy the frontend to Vercel

1. Import this GitHub repository into Vercel.
2. Set **Root Directory** to the repository root (`.`). The root `vercel.json` installs and builds the Vite app inside `frontend`.
3. Use the root build settings: install `npm ci --prefix frontend`, build `npm --prefix frontend run build`, output directory `frontend/dist`, plus the SPA rewrite.
4. Add `VITE_API_BASE_URL` with the real public backend URL ending in `/api`. Add it to both Preview and Production environments.
5. Set `VITE_SHOW_DEMO_ACCOUNTS=false` for Preview and Production.
6. Add the exact Vercel frontend origin(s) to the backend's `APP_CORS_ORIGINS`, then redeploy the backend if you change that variable.
7. Redeploy the frontend after setting its API URL so Vite includes the correct endpoint in the production bundle.

The Vercel rewrite routes direct visits to React Router pages (for example `/register` and `/acr/123`) back to `index.html`. Vercel hosts the React frontend only; the Java API and PostgreSQL run separately. The readiness endpoint is `/api/health`.

### 3. Local development with Docker

```bash
docker compose up --build
```

Open `http://localhost:5173`. The backend initializes an empty local database and loads the local-only demo seed once. The seeded demo password is `Password@123`; never use those accounts or the local fallback secrets in production.

Stop with `Ctrl+C`. Remove local database data with `docker compose down -v`.

### 4. Local development without Docker

```bash
createdb apar_db
psql -d apar_db -f db/init/01_schema.sql
psql -d apar_db -f db/init/02_reference_data.sql
psql -d apar_db -f db/init/02_seed.sql
cd backend && APP_JWT_SECRET=local_dev_only_change_to_a_random_secret_of_at_least_32_bytes mvn spring-boot:run
# In a second terminal:
cd frontend && npm ci && npm run dev
```

For a local frontend build, set `VITE_API_BASE_URL=http://localhost:8080/api`. The development Vite server defaults to this URL. For the manual backend command above, provide a temporary local-only JWT secret; production deployments must use a separately generated secret.

## Roles and workflow

| Role | Capabilities |
|---|---|
| Employee | Submit a registration request, sign in after authority activation, submit APAR when unlocked, view own reports, edit contact details, receive notifications |
| Authority | Review submitted reports, grade/remark/flag, manage employees, send notifications and APAR reminders |

Self-registration creates an inactive employee and login account pending authority approval. The authority reviews the directory entry and activates it before the employee can sign in. Deactivation also disables the login immediately, including sessions with previously issued JWTs.

The APAR form is locked until an authority sends a reminder. Employees can only access their own reports and notifications; these ownership checks are enforced by the backend.

## Security notes

- JWT stateless authentication and BCrypt password hashes.
- Role checks enforced on server endpoints and service operations.
- CORS uses a comma-separated list of exact frontend origins; whitespace around entries is trimmed.
- Production startup requires `APP_JWT_SECRET`; do not rely on local development defaults.
- Demo credentials are hidden in production unless `VITE_SHOW_DEMO_ACCOUNTS=true` is explicitly set.
- Contact email in the employee profile is HR contact information; it does not change the account's login email.

## Continuous integration

GitHub Actions builds the Vite frontend, builds the backend container, and runs Maven verification for the backend on pushes and pull requests.

## API base paths

The backend uses the `/api` servlet context path. Main routes include:

- `POST /api/auth/login`, `POST /api/auth/register`
- `GET /api/v1/meta/departments`, `GET /api/v1/meta/offices`
- `GET/POST/PUT/DELETE /api/v1/employees` (authority)
- `GET /api/v1/acr`, `GET /api/v1/acr/{statusId}`, `POST /api/v1/acr/submit`
- `GET /api/v1/notifications`, `POST /api/v1/notifications/send`
- `GET/PUT /api/v1/me`

See the controllers in `backend/src/main/java/gov/nic/apar/controller` for the complete route contract.
