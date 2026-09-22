CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS serving.claims_search (
    claim_id TEXT PRIMARY KEY,
    submission_date DATE,
    service_category TEXT,
    provider_group TEXT,
    provider_name TEXT,
    payer_type TEXT,
    status TEXT,
    turnaround_days INTEGER,
    billed_amount NUMERIC(14,2),
    paid_amount NUMERIC(14,2),
    risk TEXT CHECK (risk IN ('low', 'elevated', 'critical'))
);

COMMENT ON TABLE serving.claims_search IS 'Narrow, synthetic claim-level projection of the DuckDB fct_claims mart, loaded by scripts/load_serving_claims.py. Read only through public.search_claims; RLS is enabled with no policies, so direct API access is denied.';

ALTER TABLE serving.claims_search ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_claims_search_claim_id_trgm
    ON serving.claims_search USING gin (claim_id extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_claims_search_provider_group_trgm
    ON serving.claims_search USING gin (provider_group extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_claims_search_provider_name_trgm
    ON serving.claims_search USING gin (provider_name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_claims_search_submission_date
    ON serving.claims_search (submission_date DESC);

CREATE OR REPLACE FUNCTION public.search_claims(q TEXT, lim INTEGER DEFAULT 25)
RETURNS TABLE (
    claim_id TEXT,
    submission_date DATE,
    service_category TEXT,
    provider_group TEXT,
    provider_name TEXT,
    payer_type TEXT,
    status TEXT,
    turnaround_days INTEGER,
    billed_amount NUMERIC,
    paid_amount NUMERIC,
    risk TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    WITH needle AS (
        SELECT
            btrim(q) AS raw,
            '%' || replace(replace(replace(btrim(q), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%' AS pattern
    )
    SELECT
        c.claim_id, c.submission_date, c.service_category, c.provider_group, c.provider_name,
        c.payer_type, c.status, c.turnaround_days, c.billed_amount, c.paid_amount, c.risk
    FROM serving.claims_search AS c, needle AS n
    WHERE length(n.raw) >= 2
      AND (
        c.claim_id ILIKE n.pattern
        OR c.provider_group ILIKE n.pattern
        OR c.provider_name ILIKE n.pattern
        OR c.service_category ILIKE n.pattern
      )
    ORDER BY (upper(c.claim_id) = upper(n.raw)) DESC, c.submission_date DESC, c.claim_id
    LIMIT least(greatest(coalesce(lim, 25), 1), 25);
$$;

REVOKE ALL ON FUNCTION public.search_claims(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_claims(TEXT, INTEGER) TO anon, authenticated;
