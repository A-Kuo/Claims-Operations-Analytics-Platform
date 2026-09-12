# Supabase integration

This directory manages the Postgres-native infrastructure for the claims analytics project.

## Purpose
- Version database schema changes with Supabase migrations.
- Seed reference lookup tables required by raw ingestion and downstream dbt models.
- Support remote Postgres loading for claims CSV extracts.

## Directory layout
- `migrations/`: schema creation, raw table DDL, indexes
- `seeds/`: lookup inserts only
- `config.toml`: Supabase CLI config for project + seed paths

## Local commands
```bash
supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
supabase db push
supabase db reset
```

## Notes
- Do not store credentials in this directory.
- Use GitHub Secrets or environment variables for connection strings.
- dbt transformations remain in the root `models/`, `macros/`, `tests/`, and `seeds/` directories.

## Local Postgres connection for dbt

The optional `dev_pg` dbt target (see the root `profiles.yml`) attaches this
Postgres database directly into DuckDB using the `postgres` extension, so
dbt can read `raw.claim_headers` as an ordinary source without a separate
Postgres adapter. It requires a `SUPABASE_DB_URL` environment variable
pointing at a real Postgres instance, in the standard connection-string
form:

    postgresql://<user>:<password>@<host>:<port>/<database>

Set this in your shell, or in a local `.env` file (gitignored — never
commit real credentials there) before running `dbt run --target dev_pg`.
It is not required for the default `dev` target, which never touches
Postgres.
