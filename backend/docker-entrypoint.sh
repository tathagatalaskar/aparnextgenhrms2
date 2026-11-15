#!/bin/sh
set -eu

: "${SPRING_DATASOURCE_URL:?SPRING_DATASOURCE_URL is required}"
: "${SPRING_DATASOURCE_USERNAME:?SPRING_DATASOURCE_USERNAME is required}"
: "${SPRING_DATASOURCE_PASSWORD:?SPRING_DATASOURCE_PASSWORD is required}"
: "${APP_JWT_SECRET:?APP_JWT_SECRET is required}"

PSQL_URL="$(printf '%s' "$SPRING_DATASOURCE_URL" | sed 's#^jdbc:##')"
export PGUSER="$SPRING_DATASOURCE_USERNAME"
export PGPASSWORD="$SPRING_DATASOURCE_PASSWORD"

echo "Waiting for PostgreSQL..."
attempt=0
until psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -tAc "SELECT 1" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 40 ]; then
    echo "PostgreSQL did not become ready after 120 seconds." >&2
    exit 1
  fi
  sleep 3
done

SCHEMA_EXISTS="$(psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -tAc \
  "SELECT to_regclass('tran.employee_details') IS NOT NULL")"

if [ "$SCHEMA_EXISTS" != "t" ]; then
  echo "Initializing APAR database schema and reference data..."
  psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -f /app/db/init/01_schema.sql
  psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -f /app/db/init/02_reference_data.sql
else
  echo "APAR database schema already exists; skipping first-run initialization."
fi

if [ "${APAR_LOAD_DEMO_SEED:-false}" = "true" ]; then
  DEMO_ACCOUNT_EXISTS="$(psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -tAc \
    "SELECT EXISTS (SELECT 1 FROM tran.user_account WHERE email = 'authority@nic.in')")"
  if [ "$DEMO_ACCOUNT_EXISTS" != "t" ]; then
    echo "Loading local-only demonstration records..."
    psql "$PSQL_URL" -X -v ON_ERROR_STOP=1 -f /app/db/init/02_seed.sql
  fi
fi

echo "Starting APAR API..."
exec java -jar /app/app.jar
