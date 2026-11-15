# APAR / ACR Management System — Deployment Guide

This repository contains the complete application source. It is **not** a frontend-only project:

- `frontend/` — React 18 + Vite + Tailwind UI
- `backend/` — Spring Boot 3 API (Java 17)
- `db/init/` — PostgreSQL schema and reference/demo data
- `vercel.json` — root-level Vercel build and SPA routing configuration

## 1. Replace the contents of your GitHub repository

1. Download and extract `APAR-ACR-Management-System.zip`.
2. Open the extracted `aparnextgen` folder. Its contents (`backend`, `frontend`, `db`, `vercel.json`, etc.) must sit directly in the repository root.
3. Back up your existing repository before replacing its application files.
4. Replace the old project files with the extracted project files. Keep the hidden `.git` directory in your local clone; do not upload `node_modules`, `dist`, `target`, local `.env` files, or the ZIP itself.
5. Commit and push the replacement to GitHub. For example, from a local clone:

   ```bash
   git add -A
   git commit -m "Replace with consolidated APAR ACR management system"
   git push origin main
   ```

   `git add -A` records removed legacy files as deletions as well as adding the new project. Do not delete `backend/`, `db/`, `frontend/`, `.github/`, `docker-compose.yml`, or either Vercel configuration file; they are required parts of the full-stack application.

## 2. Deploy PostgreSQL and the Spring Boot API

Vercel is used for the React frontend. The Java API and PostgreSQL database must run on a backend/container host such as Railway.

1. Create a PostgreSQL service in Railway.
2. Create a backend service from the same GitHub repository and branch.
3. Set the service root/build context to the repository root (`.`), and set the Dockerfile path to `backend/Dockerfile`.
4. Configure these backend service variables:

   | Variable | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` (adjust `Postgres` to the exact database service name) |
   | `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` |
   | `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
   | `APP_JWT_SECRET` | A unique random secret of at least 32 bytes; generate with `openssl rand -base64 48` |
   | `APP_CORS_ORIGINS` | Your exact Vercel site origin, e.g. `https://your-project.vercel.app` |
   | `APAR_LOAD_DEMO_SEED` | `false` |
   | `PORT` | `8080` (or let Railway provide its port) |

   Store secrets only in Railway's encrypted Variables panel. Do not commit them to GitHub.

5. Set the backend health-check path to `/api/health` and deploy.
6. Confirm the health endpoint responds successfully at `https://YOUR-BACKEND-DOMAIN/api/health`.

On first startup, the container initializes an empty database with `db/init/01_schema.sql` and `db/init/02_reference_data.sql`. Do not run `db/init/02_seed.sql` on a real/production database: it is for local demonstrations only and contains demo accounts and sample records. Do not change `APAR_LOAD_DEMO_SEED` to `true` in production.

### Production data setup before real users sign in

- Configure the approved assessment year and due date in `tran.acr_cycle`. Use the actual authorized reporting period and date; do not leave placeholders in production.
- Provision the first `AUTHORITY` account through a controlled database-administration process. Public self-registration creates an inactive `EMPLOYEE` account, not an authority account. Store only a BCrypt password hash in `tran.user_account.password_hash`; never store a plaintext password or publish an initial password in the repository.
- Once the authority account is provisioned, it can approve/activate employee registrations and manage the APAR cycle.

Example assessment-cycle statement (replace both values first):

```sql
INSERT INTO tran.acr_cycle (assessment_year, due_date, is_open)
VALUES ('YYYY-YYYY', DATE 'YYYY-MM-DD', TRUE)
ON CONFLICT (assessment_year) DO UPDATE
SET due_date = EXCLUDED.due_date,
    is_open = EXCLUDED.is_open;
```

Only one assessment cycle can be open at a time.

## 3. Deploy the frontend to Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Set **Root Directory** to the repository root (`.`), not `frontend`. The root `vercel.json` contains the correct install/build/output settings.
3. Use Node.js 22.
4. Add these environment variables for **Production** and **Preview**:

   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://YOUR-BACKEND-DOMAIN/api` |
   | `VITE_SHOW_DEMO_ACCOUNTS` | `false` |

5. Deploy. The root Vercel configuration runs `npm ci --prefix frontend`, builds with `npm --prefix frontend run build`, serves `frontend/dist`, and rewrites application routes to the React entry point.
6. Copy the final Vercel domain/origin into the backend's `APP_CORS_ORIGINS` value, then redeploy the backend if that value changed.
7. Redeploy the frontend after changing `VITE_API_BASE_URL`; Vite embeds this variable at build time.

Do not set the Vercel project root to `backend/`. Do not expect Vercel to run the Spring Boot service or PostgreSQL database from this repository.

## 4. Verify the live application

After both services are deployed:

1. Open the Vercel site and check the login and registration pages.
2. Confirm the API health endpoint responds at `/api/health`.
3. Sign in using the authority account that was provisioned securely.
4. Verify the assessment cycle and deadline, activate a test employee, send an APAR reminder, submit a test APAR, review it, and check notification delivery.
5. Remove any test employee/APAR data created during verification before opening the system to real users.

A green frontend deployment alone does not prove the API, database, login flow, or email/notification behavior is working. Verify both services and the complete workflow.

## 5. Local development

With Docker installed:

```bash
docker compose up --build
```

Open `http://localhost:5173`. Local Compose enables the demo seed for development only. Stop with `Ctrl+C`; `docker compose down -v` also deletes the local database volume.

For manual development, see the commands in the main `README.md`.
