ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_customer_type_check;
ALTER TABLE public.customers ADD CONSTRAINT customers_customer_type_check
  CHECK (customer_type IN ('corporate','individual','agency','government','agent','retail','vip'));