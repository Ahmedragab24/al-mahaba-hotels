
## نظرة عامة

تطوير وحدة الأسعار (Rates) لدعم تعدد الأسعار، الأرشفة التاريخية، اعتبار الفندق مورداً مباشراً، شاشة مقارنة الأسعار، وحقول تتبع إضافية، مع تحديث منظومة الصلاحيات المالية.

---

## 1. تعدد الأسعار لنفس الفندق/المورد/الغرفة/الفترة

- إزالة أي قيود فريدة (unique constraints) تمنع تكرار الأسعار في جدول `rates`.
- السماح بإدخال أكثر من سعر بنفس (hotel_id, supplier_id, room_type_id, valid_from, valid_to, meal_plan).
- الحفاظ على جميع السجلات للمقارنة.

## 2. أرشفة الأسعار التاريخية (Versioning)

- إضافة عمود `version` و `parent_rate_id` و `superseded_at` و `superseded_by` في جدول `rates`.
- تعديل سلوك "التعديل" في الواجهة: بدلاً من UPDATE، يتم إنشاء سجل جديد (نسخة جديدة) ووسم القديم كـ `superseded`.
- إضافة Cron / Trigger لأرشفة الأسعار الأقدم من سنة تلقائياً (وضع `deleted_at` بدل الحذف الفعلي).
- شاشة "تاريخ السعر" تعرض كل النسخ.

## 3. الفندق كمورد مباشر

- إضافة عمود `is_direct_supplier` على جدول `hotels` وعمود `hotel_id` (nullable) على جدول `rates` للإشارة إلى أن السعر مباشر من الفندق (بدون supplier_id).
- جعل `supplier_id` nullable في `rates` عند وجود سعر مباشر، مع trigger يضمن وجود أحدهما.
- في شاشة المقارنة، عرض "الفندق مباشرة" كمصدر مستقل.

## 4. شاشة مقارنة الأسعار

- مسار جديد: `/rates/compare` يعرض جميع الأسعار النشطة لفندق/فترة/نوع غرفة محدد، مرتبة من الأرخص للأغلى.
- جدول مقارنة: المصدر | السعر | العملة | شروط الإلغاء | حالة السعر | تاريخ الإدخال | المدخل.
- زر "اختيار هذا السعر" لإضافته إلى عرض السعر/الحجز.
- أفضل سعر دائماً بالأعلى.

## 5. حقول إضافية في نموذج السعر

- `entered_at` (موجود ضمنياً كـ created_at — سنعرضه صراحة).
- `entered_by` (موجود كـ created_by — سنعرضه).
- `status` (موجود).
- `archived_at` / زر أرشفة (موجود كـ deleted_at).
- إضافة عرض هذه الحقول في الجدول والنموذج.

## 6. اختيار يدوي للسعر

- إزالة أي منطق "اختيار تلقائي لأفضل سعر" من نماذج العروض والحجوزات.
- في `quotations/-items` و `bookings/-rooms`: عند اختيار فندق+فترة، يفتح dialog مقارنة يختار منه المستخدم السعر يدوياً.
- ترتيب الأسعار: الأرخص أولاً + علامة "أفضل سعر".

## 7. الوظائف المعتمدة (موجودة بالفعل — تأكيد فقط)

- الدول/المدن: موجودة (`countries`, `cities`).
- ربط الموردين بالفنادق: موجود (`hotel_suppliers`).
- مقارنة الأسعار: ستضاف في الخطوة 4.
- مرفقات تأكيد الحجز: موجودة (`attachments`).
- دفعات الموردين: موجودة (`supplier_payments`, `payment_orders`).
- تقارير الذمم المدينة/الدائنة: موجودة في `/reports/financial`.

## 8. الصلاحيات المالية (تطوير حديث)

تطبيق نموذج RBAC + ABAC مع مبدأ Segregation of Duties:

| الصلاحية | super_admin | admin | finance_manager | finance_agent | sales_manager |
|---|---|---|---|---|---|
| إنشاء فاتورة | ✅ | ✅ | ✅ | ✅ | ❌ |
| اعتماد فاتورة (issue) | ✅ | ✅ | ✅ | ❌ | ❌ |
| استلام دفعة | ✅ | ✅ | ✅ | ✅ | ❌ |
| اعتماد دفعة مورد | ✅ | ✅ | ✅ | ❌ | ❌ |
| إلغاء فاتورة معتمدة | ✅ | ✅ | ❌ | ❌ | ❌ |
| تعديل سعر معتمد | ✅ | ❌ | ❌ | ❌ | ❌ |
| رؤية تقارير مالية | ✅ | ✅ | ✅ | ✅ | جزئي |
| Maker-Checker على المدفوعات > X | إجباري | إجباري | إجباري | — | — |

- إضافة جدول `approval_thresholds` (مبالغ تتطلب موافقة ثانية حسب العملة).
- Trigger على `payment_orders` و `invoices` لفرض Maker ≠ Checker للمبالغ الكبيرة.
- تسجيل كل عملية في `audit_logs` (موجود).

---

## التغييرات التقنية

### Migrations (SQL)
1. تعديل `rates`: إضافة `version int`, `parent_rate_id uuid`, `superseded_at`, `superseded_by`, `is_direct` boolean، وجعل `supplier_id` nullable + check constraint.
2. تعديل `hotels`: إضافة `is_direct_supplier boolean default false`.
3. جدول جديد `approval_thresholds(currency, entity_type, amount, requires_second_approver)`.
4. Triggers:
   - `tg_rates_version`: عند UPDATE على سعر approved → منع التعديل، يجب إنشاء نسخة جديدة.
   - `tg_archive_old_rates`: function تستدعى عبر pg_cron يومياً لأرشفة الأسعار > سنة.
   - `tg_payment_maker_checker`: يمنع نفس المستخدم من إنشاء واعتماد دفعة فوق العتبة.
5. تحديث RLS وسياسات `rates` للسماح بالقراءة لكل الإصدارات.

### Frontend
- `src/routes/_authenticated/rates/compare.tsx` — شاشة المقارنة الجديدة.
- `src/routes/_authenticated/rates/-history.tsx` — مكوّن تاريخ نسخ السعر.
- `src/routes/_authenticated/rates/-form.tsx` — تعديل السلوك ليُنشئ نسخة جديدة عند الحفظ على سعر approved.
- `src/routes/_authenticated/rates/index.tsx` — إضافة أعمدة (المدخل، التاريخ، الإصدار)، فلتر "أحدث نسخة فقط".
- `src/routes/_authenticated/quotations/-items.tsx` و `bookings/-rooms.tsx` — استبدال اختيار السعر بفتح dialog مقارنة.
- `src/lib/i18n.tsx` — إضافة مفاتيح ترجمة جديدة (عربي/إنجليزي).

### Permissions
- `src/hooks/use-auth.tsx` — إضافة `canApproveInvoice`, `canApprovePayment`, helpers جديدة.
- `src/components/role-gate.tsx` — لا تغيير جوهري.

---

## ترتيب التنفيذ

1. **Migration 1**: تعديل schema الأسعار + الفنادق + جدول approval_thresholds + triggers.
2. **Migration 2**: pg_cron job للأرشفة السنوية.
3. تحديث `rates/-form.tsx` و `rates/index.tsx`.
4. بناء `rates/compare.tsx`.
5. ربط شاشة المقارنة بـ quotations و bookings.
6. تحديث صلاحيات `use-auth` وحراس الواجهة.
7. تحديث الترجمات.

---

## أسئلة قبل البدء

1. **عتبة Maker-Checker للمدفوعات**: ما المبلغ الافتراضي بالعملة الأساسية الذي يتطلب موافقة ثانية؟ (مثال: 10,000 SAR)
2. **مدة الأرشفة**: سنة من `valid_to` أم من `created_at`؟
3. **عند تعديل سعر draft**: هل ننشئ نسخة جديدة أيضاً، أم نسمح بالتعديل المباشر لأن السعر لم يُعتمد بعد؟ (مقترح: السماح بالتعديل المباشر لـ draft فقط).
4. **الفندق المباشر**: هل ننشئ سجل supplier تلقائياً عند تفعيل `is_direct_supplier` على فندق، أم نتعامل معه كمصدر افتراضي بدون سجل مورد؟
