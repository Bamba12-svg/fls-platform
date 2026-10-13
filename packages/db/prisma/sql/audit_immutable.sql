-- Journal d'audit non modifiable : toute tentative de UPDATE ou DELETE est refusée par la base.
CREATE OR REPLACE FUNCTION fls_audit_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Le journal d''audit est en lecture seule (opération % refusée).', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_immutable ON "AuditLog";
CREATE TRIGGER audit_log_immutable BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION fls_audit_immutable();
