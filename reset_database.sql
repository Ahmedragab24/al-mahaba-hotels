-- ⚠️ DANGER: This script deletes business data from the database.
-- It keeps auth.users, user_profiles, and user_roles (Admin users).

-- Option A: Delete EVERYTHING (Transactions + Master Data like Customers, Hotels, Suppliers)
-- Note: CASCADE will automatically delete all dependent tables like bookings, invoices, etc.
TRUNCATE TABLE 
  public.customers,
  public.suppliers,
  public.hotels,
  public.supplier_applications,
  public.quotations,
  public.bookings,
  public.invoices,
  public.receipts,
  public.supplier_payments,
  public.rfqs,
  public.payment_orders
CASCADE;

-- Option B: If you want to reset the counters to 0 so new bookings start from 1
UPDATE public.counters SET current_value = 0;

-- Optional: If you also want to delete all notifications and audit logs
TRUNCATE TABLE public.notifications, public.audit_logs CASCADE;
