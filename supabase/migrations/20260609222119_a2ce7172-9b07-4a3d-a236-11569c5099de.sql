-- ============ MODULE 1: ATTACHMENTS ============
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice')),
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg','image/png')),
  file_size bigint NOT NULL CHECK (file_size > 0 AND file_size <= 26214400),
  storage_path text NOT NULL UNIQUE,
  uploaded_by uuid DEFAULT auth.uid(),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY att_read ON public.attachments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY att_insert ON public.attachments
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent','finance_manager','finance_agent']::app_role[]) AND uploaded_by = auth.uid());
CREATE POLICY att_update ON public.attachments
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager','finance_manager']::app_role[]) OR uploaded_by = auth.uid())
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager','finance_manager']::app_role[]) OR uploaded_by = auth.uid());
CREATE POLICY att_delete ON public.attachments
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TRIGGER trg_att_updated BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Named-action audit for attachments
CREATE OR REPLACE FUNCTION public.tg_attachment_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('upload', 'attachments', NEW.id::text, NULL, to_jsonb(NEW),
      jsonb_build_object('entity_type', NEW.entity_type, 'entity_id', NEW.entity_id, 'file', NEW.original_name));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN v_action := 'archive';
    ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN v_action := 'restore';
    ELSE v_action := 'update'; END IF;
    PERFORM public.log_audit(v_action, 'attachments', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW),
      jsonb_build_object('entity_type', NEW.entity_type, 'entity_id', NEW.entity_id, 'file', NEW.original_name));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit('delete', 'attachments', OLD.id::text, to_jsonb(OLD), NULL,
      jsonb_build_object('entity_type', OLD.entity_type, 'entity_id', OLD.entity_id, 'file', OLD.original_name));
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_att_audit AFTER INSERT OR UPDATE OR DELETE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.tg_attachment_audit();

-- Storage RLS for the private "attachments" bucket
CREATE POLICY "att_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');
CREATE POLICY "att_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent','finance_manager','finance_agent']::public.app_role[]));
CREATE POLICY "att_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager','finance_manager']::public.app_role[]));
CREATE POLICY "att_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

-- ============ MODULE 2: APPROVAL WORKFLOW ============
CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice')),
  entity_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','returned','archived')),
  submitted_by uuid,
  submitted_at timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  rejected_by uuid,
  rejected_at timestamptz,
  approval_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_approval_entity ON public.approval_requests(entity_type, entity_id);
-- one open request per entity
CREATE UNIQUE INDEX uq_approval_open ON public.approval_requests(entity_type, entity_id)
  WHERE status IN ('draft','submitted','returned');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_requests TO authenticated;
GRANT ALL ON public.approval_requests TO service_role;

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY apr_read ON public.approval_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY apr_insert ON public.approval_requests
  FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent','finance_manager','finance_agent']::app_role[]));
CREATE POLICY apr_update ON public.approval_requests
  FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent','finance_manager','finance_agent']::app_role[]));
CREATE POLICY apr_delete ON public.approval_requests
  FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TRIGGER trg_apr_updated BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Workflow state machine + role enforcement + actor stamping
CREATE OR REPLACE FUNCTION public.tg_approval_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE v_is_approver boolean;
BEGIN
  v_is_approver := has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager','finance_manager']::app_role[]);

  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft','submitted') THEN
      RAISE EXCEPTION 'APPROVAL_INVALID_INITIAL: new requests must start as draft or submitted';
    END IF;
    IF NEW.status = 'submitted' THEN
      NEW.submitted_by := auth.uid();
      NEW.submitted_at := now();
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('submitted','archived')) OR
      (OLD.status = 'submitted' AND NEW.status IN ('approved','rejected','returned')) OR
      (OLD.status = 'returned' AND NEW.status IN ('submitted','archived')) OR
      (OLD.status IN ('approved','rejected') AND NEW.status = 'archived')
    ) THEN
      RAISE EXCEPTION 'APPROVAL_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
    END IF;

    IF NEW.status IN ('approved','rejected','returned','archived') AND NOT v_is_approver THEN
      RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
    END IF;

    IF NEW.status = 'submitted' THEN
      NEW.submitted_by := auth.uid();
      NEW.submitted_at := now();
      NEW.approved_by := NULL; NEW.approved_at := NULL;
      NEW.rejected_by := NULL; NEW.rejected_at := NULL;
    ELSIF NEW.status = 'approved' THEN
      NEW.approved_by := auth.uid();
      NEW.approved_at := now();
    ELSIF NEW.status = 'rejected' THEN
      NEW.rejected_by := auth.uid();
      NEW.rejected_at := now();
    END IF;

    IF NEW.status IN ('rejected','returned') AND (NEW.approval_notes IS NULL OR btrim(NEW.approval_notes) = '') THEN
      RAISE EXCEPTION 'APPROVAL_NOTES_REQUIRED: notes are required when rejecting or returning a request';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_apr_workflow BEFORE INSERT OR UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_approval_workflow();

-- Named-action audit for approvals
CREATE OR REPLACE FUNCTION public.tg_approval_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := CASE WHEN NEW.status = 'submitted' THEN 'submit' ELSE 'create' END;
    PERFORM public.log_audit(v_action, 'approval_requests', NEW.id::text, NULL, to_jsonb(NEW),
      jsonb_build_object('entity_type', NEW.entity_type, 'entity_id', NEW.entity_id));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      v_action := CASE NEW.status
        WHEN 'submitted' THEN 'submit'
        WHEN 'approved' THEN 'approve'
        WHEN 'rejected' THEN 'reject'
        WHEN 'returned' THEN 'return'
        WHEN 'archived' THEN 'archive'
        ELSE 'update' END;
    ELSE
      v_action := 'update';
    END IF;
    PERFORM public.log_audit(v_action, 'approval_requests', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW),
      jsonb_build_object('entity_type', NEW.entity_type, 'entity_id', NEW.entity_id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit('delete', 'approval_requests', OLD.id::text, to_jsonb(OLD), NULL,
      jsonb_build_object('entity_type', OLD.entity_type, 'entity_id', OLD.entity_id));
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_apr_audit AFTER INSERT OR UPDATE OR DELETE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_approval_audit();