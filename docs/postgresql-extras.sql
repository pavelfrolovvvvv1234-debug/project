# PostgreSQL extras for production / ПМ11 report
# Run after Prisma migrate on PostgreSQL:
#   psql $DATABASE_URL -f docs/postgresql-extras.sql

-- View: link matrix summary
CREATE OR REPLACE VIEW v_network_link_matrix AS
SELECT
  n.id AS network_id,
  n.name AS network_name,
  fs.domain AS from_domain,
  ts.domain AS to_domain,
  sl.anchor_text,
  sl.link_type,
  sl.created_at
FROM site_links sl
JOIN networks n ON n.id = sl.network_id
JOIN sites fs ON fs.id = sl.from_site_id
JOIN sites ts ON ts.id = sl.to_site_id;

-- Function: average SEO score per network
CREATE OR REPLACE FUNCTION recalculate_network_seo_avg(p_network_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_score INTEGER;
BEGIN
  SELECT ROUND(AVG(ss.seo_score))::INTEGER
  INTO avg_score
  FROM seo_snapshots ss
  JOIN sites s ON s.id = ss.site_id
  WHERE s.network_id = p_network_id;

  RETURN COALESCE(avg_score, 0);
END;
$$;

-- Trigger: prevent self-links
CREATE OR REPLACE FUNCTION prevent_self_site_link()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.from_site_id = NEW.to_site_id THEN
    RAISE EXCEPTION 'Cannot create link from site to itself';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_link ON site_links;
CREATE TRIGGER trg_prevent_self_link
  BEFORE INSERT OR UPDATE ON site_links
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_site_link();

-- Backup command (document in report):
-- pg_dump $DATABASE_URL > backup_sitenet_$(date +%Y%m%d).sql
