
CREATE TABLE public.hotel_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text,
  department text,
  email citext,
  phone text,
  mobile text,
  whatsapp text,
  is_primary boolean NOT NULL DEFAULT false,
  preferred_language public.app_language NOT NULL DEFAULT 'en',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_hotel_contacts_hotel ON public.hotel_contacts(hotel_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_contacts TO authenticated;
GRANT ALL ON public.hotel_contacts TO service_role;

ALTER TABLE public.hotel_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hc_read" ON public.hotel_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hc_write" ON public.hotel_contacts TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]));

CREATE TRIGGER trg_hotel_contacts_updated BEFORE UPDATE ON public.hotel_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_hotel_contacts_audit AFTER INSERT OR UPDATE OR DELETE ON public.hotel_contacts
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
