CREATE TABLE public.user_module_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_key text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_key)
);

GRANT SELECT, INSERT, DELETE ON public.user_module_blocks TO authenticated;
GRANT ALL ON public.user_module_blocks TO service_role;

ALTER TABLE public.user_module_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own blocks, super admin sees all"
ON public.user_module_blocks FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can block modules"
ON public.user_module_blocks FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  AND NOT public.has_role(user_id, 'super_admin')
);

CREATE POLICY "Super admin can unblock modules"
ON public.user_module_blocks FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trg_set_created_by BEFORE INSERT ON public.user_module_blocks
FOR EACH ROW EXECUTE FUNCTION public.set_created_by();