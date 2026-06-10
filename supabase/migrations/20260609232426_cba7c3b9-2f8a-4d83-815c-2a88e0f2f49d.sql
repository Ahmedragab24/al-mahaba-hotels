-- ============ SECTION 17: REPORTS & DASHBOARDS ============

CREATE TABLE public.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  report_key text NOT NULL CHECK (report_key IN ('executive','sales','bookings','suppliers','receivables','profit','operational','financial','tax')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  created_by uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_templates TO authenticated;
GRANT ALL ON public.report_templates TO service_role;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY rpt_tpl_read ON public.report_templates FOR SELECT TO authenticated
  USING (is_shared OR created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));
CREATE POLICY rpt_tpl_insert ON public.report_templates FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY rpt_tpl_update ON public.report_templates FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]))
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));
CREATE POLICY rpt_tpl_delete ON public.report_templates FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TABLE public.report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.report_templates(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
  export_format text NOT NULL DEFAULT 'pdf' CHECK (export_format IN ('pdf','excel','csv')),
  recipients text,
  next_run_at timestamptz,
  last_run_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_schedules TO authenticated;
GRANT ALL ON public.report_schedules TO service_role;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY rpt_sch_read ON public.report_schedules FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));
CREATE POLICY rpt_sch_write ON public.report_schedules FOR ALL TO authenticated
  USING (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]))
  WITH CHECK (created_by = auth.uid() OR has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TRIGGER trg_rpt_tpl_updated BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rpt_sch_updated BEFORE UPDATE ON public.report_schedules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rpt_tpl_audit AFTER INSERT OR UPDATE OR DELETE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE TRIGGER trg_rpt_sch_audit AFTER INSERT OR UPDATE OR DELETE ON public.report_schedules FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();