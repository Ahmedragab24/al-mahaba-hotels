import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/routes/__root";
import AuthenticatedLayout from "@/routes/_authenticated/route";

// Lazy-load page components for code splitting
const LoginPage = () => import("@/routes/auth").then((m) => ({ Component: m.default }));
const SupplierApplyPage = () => import("@/routes/supplier-apply").then((m) => ({ Component: m.default }));
const DashboardPage = () => import("@/routes/_authenticated/index").then((m) => ({ Component: m.default }));
const UsersPage = () => import("@/routes/_authenticated/users").then((m) => ({ Component: m.default }));
const SettingsPage = () => import("@/routes/_authenticated/settings").then((m) => ({ Component: m.default }));
const CurrenciesPage = () => import("@/routes/_authenticated/currencies").then((m) => ({ Component: m.default }));
const SupplierApplicationsPage = () => import("@/routes/_authenticated/supplier-applications").then((m) => ({ Component: m.default }));
const TasksIndex = () => import("@/routes/_authenticated/tasks/index").then((m) => ({ Component: m.default }));
const NotificationsIndex = () => import("@/routes/_authenticated/notifications/index").then((m) => ({ Component: m.default }));
const PlatformTransactionsIndex = () => import("@/routes/_authenticated/platform-transactions/index").then((m) => ({ Component: m.default }));

// Hotels
const HotelsIndex = () => import("@/routes/_authenticated/hotels/index").then((m) => ({ Component: m.default }));
const HotelDetail = () => import("@/routes/_authenticated/hotels/$id").then((m) => ({ Component: m.default }));
const HotelNew = () => import("@/routes/_authenticated/hotels/new").then((m) => ({ Component: m.default }));

// Suppliers
const SuppliersIndex = () => import("@/routes/_authenticated/suppliers/index").then((m) => ({ Component: m.default }));
const SupplierDetail = () => import("@/routes/_authenticated/suppliers/$id").then((m) => ({ Component: m.default }));
const SupplierNew = () => import("@/routes/_authenticated/suppliers/new").then((m) => ({ Component: m.default }));

// Bookings
const BookingsIndex = () => import("@/routes/_authenticated/bookings/index").then((m) => ({ Component: m.default }));
const BookingDetail = () => import("@/routes/_authenticated/bookings/$id").then((m) => ({ Component: m.default }));
const BookingNew = () => import("@/routes/_authenticated/bookings/new").then((m) => ({ Component: m.default }));

// Customers
const CustomersIndex = () => import("@/routes/_authenticated/customers/index").then((m) => ({ Component: m.default }));
const CustomerDetail = () => import("@/routes/_authenticated/customers/$id").then((m) => ({ Component: m.default }));
const CustomerNew = () => import("@/routes/_authenticated/customers/new").then((m) => ({ Component: m.default }));

// Contracts
// const ContractsIndex = () => import("@/routes/_authenticated/contracts/index").then((m) => ({ Component: m.default }));
// const ContractDetail = () => import("@/routes/_authenticated/contracts/$id").then((m) => ({ Component: m.default }));
// const ContractNew = () => import("@/routes/_authenticated/contracts/new").then((m) => ({ Component: m.default }));

// Quotations
const QuotationsIndex = () => import("@/routes/_authenticated/quotations/index").then((m) => ({ Component: m.default }));
const QuotationDetail = () => import("@/routes/_authenticated/quotations/$id").then((m) => ({ Component: m.default }));
const QuotationNew = () => import("@/routes/_authenticated/quotations/new").then((m) => ({ Component: m.default }));

// Rates
const RatesIndex = () => import("@/routes/_authenticated/rates/index").then((m) => ({ Component: m.default }));
const RateDetail = () => import("@/routes/_authenticated/rates/$id").then((m) => ({ Component: m.default }));
const RateNew = () => import("@/routes/_authenticated/rates/new").then((m) => ({ Component: m.default }));
const RateCompare = () => import("@/routes/_authenticated/rates/compare").then((m) => ({ Component: m.default }));

// Room Types
const RoomTypesIndex = () => import("@/routes/_authenticated/room-types/index").then((m) => ({ Component: m.default }));
const RoomTypeDetail = () => import("@/routes/_authenticated/room-types/$id").then((m) => ({ Component: m.default }));

// Financial
const InvoicesIndex = () => import("@/routes/_authenticated/invoices/index").then((m) => ({ Component: m.default }));
const InvoiceDetail = () => import("@/routes/_authenticated/invoices/$id").then((m) => ({ Component: m.default }));

// Reports
const ReportsIndex = () => import("@/routes/_authenticated/reports/index").then((m) => ({ Component: m.default }));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    hydrateFallbackElement: (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-gold)] border-t-transparent" />
      </div>
    ),
    children: [
      {
        path: "/auth",
        lazy: LoginPage,
      },
      {
        path: "/supplier-apply",
        lazy: SupplierApplyPage,
      },
      {
        element: <AuthenticatedLayout />,
        children: [
          { index: true, lazy: DashboardPage },
          { path: "users", lazy: UsersPage },
          { path: "settings", lazy: SettingsPage },
          { path: "currencies", lazy: CurrenciesPage },
          { path: "notifications", lazy: NotificationsIndex },
          { path: "supplier-applications", lazy: SupplierApplicationsPage },
          { path: "tasks", lazy: TasksIndex },
          // Hotels
          { path: "hotels", lazy: HotelsIndex },
          { path: "hotels/new", lazy: HotelNew },
          { path: "hotels/:id", lazy: HotelDetail },
          // Suppliers
          { path: "suppliers", lazy: SuppliersIndex },
          { path: "suppliers/new", lazy: SupplierNew },
          { path: "suppliers/:id", lazy: SupplierDetail },
          // Bookings
          { path: "bookings", lazy: BookingsIndex },
          { path: "bookings/new", lazy: BookingNew },
          { path: "bookings/:id", lazy: BookingDetail },
          // Customers
          { path: "customers", lazy: CustomersIndex },
          { path: "customers/new", lazy: CustomerNew },
          { path: "customers/:id", lazy: CustomerDetail },
          // Contracts
          // { path: "contracts", lazy: ContractsIndex },
          // { path: "contracts/new", lazy: ContractNew },
          // { path: "contracts/:id", lazy: ContractDetail },
          // Quotations
          { path: "quotations", lazy: QuotationsIndex },
          { path: "quotations/new", lazy: QuotationNew },
          { path: "quotations/:id", lazy: QuotationDetail },
          // Rates
          { path: "rates", lazy: RatesIndex },
          { path: "rates/new", lazy: RateNew },
          { path: "rates/compare", lazy: RateCompare },
          { path: "rates/:id", lazy: RateDetail },
          // Room Types
          { path: "room-types", lazy: RoomTypesIndex },
          { path: "room-types/:id", lazy: RoomTypeDetail },
          // Financial
          { path: "invoices", lazy: InvoicesIndex },
          { path: "invoices/:id", lazy: InvoiceDetail },
          { path: "platform-transactions", lazy: PlatformTransactionsIndex },
          // Reports
          { path: "reports", lazy: ReportsIndex },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
