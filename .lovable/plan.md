
# بوابة الموردين (Supplier Portal)

نظام متكامل يسمح للموردين بالتسجيل، انتظار الموافقة، ثم الدخول للوحة تحكم خاصة يرون فيها فقط بياناتهم.

## 1) تدفق الانضمام (Onboarding Workflow)

```text
[زائر] → /supplier/apply  ──►  طلب انضمام (supplier_applications: pending)
                                        │
                                        ▼
                          [admin/super_admin] /supplier-applications
                                        │
                          ┌─────────────┴─────────────┐
                          ▼                           ▼
                    قبول (approve)              رفض (reject)
                          │                           │
                          ▼                           ▼
            • إنشاء حساب auth.users               status=rejected
            • إنشاء profiles + user_roles=supplier  + سبب الرفض
            • ربط profiles.supplier_id بسجل suppliers
            • إرسال بيانات الدخول للإيميل
```

## 2) قاعدة البيانات

### تعديلات على enum وجداول قائمة
- إضافة `'supplier'` إلى `app_role`
- إضافة `profiles.supplier_id uuid REFERENCES suppliers(id)` لربط المستخدم بمورده
- إضافة دالة أمان `current_user_supplier_id()`

### جدول جديد: `supplier_applications`
- بيانات الشركة: name_en, name_ar, supplier_type, country_code, city_id, address, website, tax_number
- جهة الاتصال: contact_name, email, phone, position
- المرفقات: commercial_reg_path, tax_cert_path, profile_path
- الحالة: status (pending/under_review/approved/rejected), submitted_at, reviewed_at, reviewed_by, rejection_reason
- بعد القبول: created_supplier_id, created_user_id

### سياسات RLS المحصورة للمورد (Row-Level Security)
الدور `supplier` يرى/يعدّل فقط ما يخصه:
- **suppliers**: SELECT/UPDATE فقط على `id = current_user_supplier_id()`
- **supplier_contracts, supplier_bank_accounts, supplier_contacts, supplier_payables, supplier_payments**: محصورة على `supplier_id = current_user_supplier_id()`
- **rates**: SELECT/INSERT/UPDATE على `supplier_id = current_user_supplier_id()` (DRAFT فقط، لا يستطيع approve)
- **hotel_suppliers, hotels, hotel_room_types, hotel_meal_plans**: SELECT للفنادق المرتبطة به فقط
- **booking_rooms, bookings**: SELECT فقط حيث `supplier_id = current_user_supplier_id()`
- **invoices, customers**: لا وصول
- **profiles**: قراءة سجله فقط

## 3) صفحات جديدة

### عامة (بدون مصادقة)
- `/supplier/apply` — نموذج تقديم طلب انضمام متعدد الخطوات (Stepper):
  1. بيانات الشركة + النوع (مباشر/وسيط/DMC)
  2. الدولة/المدينة/العنوان
  3. جهة الاتصال
  4. رفع المستندات (سجل تجاري، شهادة ضريبية، بروفايل)
  5. مراجعة وإرسال
- `/supplier/apply/success` — رسالة استلام الطلب

### للمسؤول
- `/supplier-applications` — قائمة الطلبات بفلاتر (pending/approved/rejected)
- `/supplier-applications/$id` — تفاصيل طلب: عرض كل البيانات والمرفقات، أزرار قبول/رفض، حقل سبب الرفض، عند القبول يتم إنشاء المورد + المستخدم

### للمورد (Supplier Portal — مسار `_authenticated/supplier-portal/`)
لوحة تحكم خاصة لا يرى فيها الموظفون أي شيء، ولا يرى المورد سواها:
- `/supplier-portal` — Dashboard:
  - KPI: عدد العقود النشطة، عدد الفنادق، الأسعار المعتمدة/قيد الانتظار، حجوزات الشهر، الذمم المستحقة
  - رسم بياني: الإيرادات الشهرية + الحجوزات
  - آخر 5 حجوزات، آخر 5 دفعات
- `/supplier-portal/profile` — بيانات الشركة (تعديل البيانات الأساسية، الشعار، جهات الاتصال، الحسابات البنكية)
- `/supplier-portal/contracts` — العقود الخاصة به فقط (read-only + رفع مرفقات)
- `/supplier-portal/rates` — إدارة أسعاره: إضافة/تعديل/أرشفة، إرسال للموافقة (لا يستطيع approve بنفسه)
- `/supplier-portal/bookings` — الحجوزات المسندة إليه (مع تأكيد الحجز ورفع رقم تأكيد + مرفق)
- `/supplier-portal/payables` — الذمم الدائنة (ما له على المنصة)
- `/supplier-portal/payments` — الدفعات المستلمة
- `/supplier-portal/reports` — تقارير محصورة: مبيعات/أسعار/أداء

## 4) التوجيه والصلاحيات (Routing & Access Control)

- طبقة جديدة `_authenticated/_supplier/` تحمي مسار `supplier-portal`:
  - `beforeLoad`: إذا الدور ليس `supplier` → redirect إلى `/` (أو خطأ صلاحية)
- الموظفون (admin/sales/...) لا يرون رابط البوابة في القائمة الجانبية
- الموردون لا يرون أي قائمة جانبية أخرى — فقط بنود البوابة
- تعديل `app-sidebar.tsx` لإظهار قوائم مختلفة حسب الدور

## 5) الواجهة (UX حديث)

- نموذج طلب انضمام بـ Stepper مع validation بـ Zod وحفظ تلقائي (draft localStorage)
- Empty states واضحة وأنيقة
- Skeleton loaders للجداول
- Toasts لنتائج العمليات
- Confirm dialog قبل الموافقة/الرفض
- شريط حالة الطلب (timeline) في صفحة المسؤول
- في البوابة: header مخصص يظهر اسم الشركة + شعارها + حالة الحساب

## 6) i18n

إضافة كل المفاتيح (ar/en):
- `supplier.apply.*`, `supplier.portal.*`, `supplier.applications.*`
- `roles.supplier`, `nav.supplier_portal`, `nav.supplier_applications`

## 7) تفاصيل تقنية مختصرة

- Migration واحدة: enum + جدول applications + عمود profiles.supplier_id + RLS لكل الجداول المعنية + دالة `current_user_supplier_id()` + دالة `approve_supplier_application(_id)` security definer (تنشئ auth user + supplier + role + ربط)
- استخدام `supabaseAdmin` في server function لإنشاء `auth.users` (تتطلب service role)
- التحقق من تطابق الإيميل (لا يكون مكرراً) قبل الموافقة
- إرسال كلمة مرور مؤقتة + إجبار تغييرها عند أول دخول (`profiles.must_change_password = true`)
- Storage bucket جديد `supplier-docs` للمرفقات (مع RLS تسمح للمسؤول والمورد صاحب الطلب)

## ما لن يُنفذ في هذه المرحلة (لتجنّب التضخم)
- إرسال البريد الفعلي (سنُظهر بيانات الدخول للمسؤول لينقلها يدوياً)
- توقيع رقمي للعقود
- API خارجي للموردين

## الخطوات بالترتيب
1. Migration: enum + جدول applications + سياسات RLS + دوال
2. Storage bucket + سياساته
3. Server functions: تقديم الطلب، الموافقة (تنشئ auth user)
4. صفحة `/supplier/apply` العامة
5. صفحات إدارة الطلبات للمسؤول
6. طبقة `_supplier` + صفحات البوابة الست
7. تحديث `app-sidebar` لإظهار/إخفاء حسب الدور
8. ترجمات + اختبار التدفق الكامل
