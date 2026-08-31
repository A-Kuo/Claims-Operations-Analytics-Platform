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
