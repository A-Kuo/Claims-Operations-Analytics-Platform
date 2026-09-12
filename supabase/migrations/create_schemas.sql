CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS serving;
CREATE SCHEMA IF NOT EXISTS ml;

COMMENT ON SCHEMA raw IS 'Raw claims extracts loaded from generated CSVs via scripts/load_raw_to_postgres.py. Landing zone only; not read directly by any KPI today. One dbt model (stg_claim_headers_pg) reads raw.claim_headers as a proof of concept.';
COMMENT ON SCHEMA analytics IS 'Reserved for dimensional marts if the warehouse ever fully moves off DuckDB. Not populated today; the DuckDB marts under models/marts remain the source of truth for every KPI and dashboard number.';
COMMENT ON SCHEMA serving IS 'Reserved for a future app-facing layer exposed through Supabase''s auto-generated REST/GraphQL API, distinct from the analytics layer. Not populated today.';
COMMENT ON SCHEMA ml IS 'Reserved for a future feature-store schema of model-ready tables. Not populated today.';