# دليل استخدام نظام الصلاحيات الجديد

## نظرة عامة
تم تحديث النظام للتحكم في الصفحات والأزرار والإجراءات بناءً على **الصلاحيات (permissions)** وليس بناءً على **نوع المستخدم (role)**. هذا يعني أن أي مستخدم يمكنه الوصول إلى أي صفحة أو زر أو إجراء طالما أن لديه الصلاحية المناسبة.

## الصلاحيات المتاحة
الصلاحيات المتاحة في النظام هي:
- `dashboard`
- `hotels`
- `rooms`
- `suppliers`
- `supplier_applications`
- `rates`
- `quotations`
- `bookings`
- `customers`
- `invoices`
- `transactions`
- `room_types`
- `currencies`
- `users`
- `settings`
- `reports`
- `tasks`

## طرق الاستخدام

### 1. استخدام useAuth Hook

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { hasPermission, canAccess, canWrite, canApprove } = useAuth();

  // التحقق من صلاحية الوصول
  if (hasPermission("quotations")) {
    // المستخدم لديه صلاحية الوصول إلى عروض الأسعار
  }

  // التحقق من صلاحية الكتابة/التعديل
  if (canWrite("bookings")) {
    // المستخدم يمكنه إنشاء أو تعديل الحجوزات
  }

  // التحقق من صلاحية الموافقة
  if (canApprove("invoices")) {
    // المستخدم يمكنه الموافقة على الفواتير
  }
}
```

### 2. استخدام PermissionGate Component

```tsx
import { PermissionGate } from "@/components/permission-gate";

// عرض محتوى إذا كان المستخدم لديه صلاحية واحدة على الأقل
<PermissionGate permissions="quotations">
  <Button>عرض عروض الأسعار</Button>
</PermissionGate>

// عرض محتوى إذا كان المستخدم لديه جميع الصلاحيات المحددة
<PermissionGate permissions={["quotations", "bookings"]} requireAll={true}>
  <Button>عرض العروض والحجوزات</Button>
</PermissionGate>

// عرض محتوى بديل إذا لم تكن الصلاحيات متوفرة
<PermissionGate permissions="users" fallback={<p>ليس لديك صلاحية</p>}>
  <UserManagement />
</PermissionGate>
```

### 3. استخدام WriteGate Component

```tsx
import { WriteGate } from "@/components/permission-gate";

// عرض زر الإضافة/التعديل فقط إذا كان المستخدم لديه صلاحية الكتابة
<WriteGate permissions="bookings">
  <Button onClick={handleCreateBooking}>إضافة حجز جديد</Button>
</WriteGate>
```

### 4. استخدام ApproveGate Component

```tsx
import { ApproveGate } from "@/components/permission-gate";

// عرض زر الموافقة فقط إذا كان المستخدم لديه صلاحية الموافقة
<ApproveGate permissions="invoices">
  <Button onClick={handleApproveInvoice}>موافقة على الفاتورة</Button>
</ApproveGate>
```

## أمثلة عملية

### مثال 1: حماية صفحة كاملة

```tsx
import { PermissionGate } from "@/components/permission-gate";

export default function UsersPage() {
  return (
    <PermissionGate permissions="users" fallback={<div>ليس لديك صلاحية للوصول إلى هذه الصفحة</div>}>
      <UserManagement />
    </PermissionGate>
  );
}
```

### مثال 2: حماية أزرار الإجراءات

```tsx
import { WriteGate, ApproveGate } from "@/components/permission-gate";

function BookingActions({ booking }) {
  return (
    <div className="flex gap-2">
      <WriteGate permissions="bookings">
        <Button variant="edit">تعديل</Button>
        <Button variant="delete">حذف</Button>
      </WriteGate>
      
      <ApproveGate permissions="bookings">
        <Button variant="approve">موافقة</Button>
      </ApproveGate>
    </div>
  );
}
```

### مثال 3: حماية القوائم في الشريط الجانبي

```tsx
import { PermissionGate } from "@/components/permission-gate";

function SidebarMenu() {
  return (
    <nav>
      <PermissionGate permissions="dashboard">
        <MenuItem to="/dashboard">لوحة التحكم</MenuItem>
      </PermissionGate>
      
      <PermissionGate permissions="quotations">
        <MenuItem to="/quotations">عروض الأسعار</MenuItem>
      </PermissionGate>
      
      <PermissionGate permissions="bookings">
        <MenuItem to="/bookings">الحجوزات</MenuItem>
      </PermissionGate>
      
      <PermissionGate permissions="users">
        <MenuItem to="/users">المستخدمين</MenuItem>
      </PermissionGate>
    </nav>
  );
}
```

### مثال 4: التحقق الشرطي في الدوال

```tsx
import { useAuth } from "@/hooks/use-auth";

function handleDeleteBooking(bookingId: number) {
  const { canWrite } = useAuth();
  
  if (!canWrite("bookings")) {
    toast.error("ليس لديك صلاحية لحذف الحجوزات");
    return;
  }
  
  // تنفيذ عملية الحذف
  deleteBooking(bookingId);
}
```

## الفرق بين النظام القديم والجديد

### النظام القديم (يعتمد على نوع المستخدم)
```tsx
// ❌ طريقة قديمة - تعتمد على نوع المستخدم
<RoleGate roles={["admin", "sales_manager"]}>
  <Button>إضافة عرض سعر</Button>
</RoleGate>
```

### النظام الجديد (يعتمد على الصلاحيات)
```tsx
// ✅ طريقة جديدة - تعتمد على الصلاحيات
<PermissionGate permissions="quotations">
  <Button>إضافة عرض سعر</Button>
</PermissionGate>
```

## المزايا

1. **المرونة**: يمكن تعيين صلاحيات مخصصة لأي مستخدم بغض النظر عن نوعه
2. **الدقة**: التحكم الدقيق في كل صفحة وزر وإجراء على حدة
3. **القابلية للتوسع**: سهولة إضافة صلاحيات جديدة دون تعديل أنواع المستخدمين
4. **الصيانة**: أسهل في الصيانة والإدارة

## ملاحظات مهمة

- المستخدم `super_admin` لديه صلاحيات كاملة على جميع الوحدات
- الصلاحيات يتم تعيينها من خلال `profile.permissions` أو من خلال `blockedModules`
- يمكن استخدام `requireAll` للتحقق من وجود جميع الصلاحيات المطلوبة
- `WriteGate` و `ApproveGate` هي اختصارات للاستخدام الشائع
