
import { useQuery } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hotel, FileSignature, Tags, CalendarCheck, Wallet, Loader2, Building2 } from "lucide-react";
import {
  getMySupplierProfile, listMyHotels, listMyRates, listMyBookings, listMyPayables,
} from "@/lib/supplier-portal.functions";

export default function SupplierPortalPage() {
  const { t, lang } = useI18n();
  const profile = useQuery({ queryKey: ["my-supplier"], queryFn: () => getMySupplierProfile() });

  if (profile.isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!profile.data?.supplier) {
    return (
      <div className="p-6">
        <Card><CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">{t("supplier.portal.no_link_title")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("supplier.portal.no_link_desc")}</p>
        </CardContent></Card>
      </div>
    );
  }

  const s = profile.data.supplier as { name_ar: string; name_en: string; code: string; supplier_type: string; email: string | null; phone: string | null };
  const stats = profile.data.stats!;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={lang === "ar" ? s.name_ar : s.name_en} subtitle={`${s.code} · ${t(`supplier.type.${s.supplier_type}`)}`} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Kpi icon={<Hotel className="h-5 w-5" />} label={t("nav.hotels")} value={stats.hotels} />
        <Kpi icon={<FileSignature className="h-5 w-5" />} label={t("nav.contracts")} value={stats.contracts} />
        <Kpi icon={<Tags className="h-5 w-5" />} label={t("nav.rates")} value={stats.rates} />
        <Kpi icon={<CalendarCheck className="h-5 w-5" />} label={t("nav.bookings")} value={stats.bookings} />
        <Kpi icon={<Wallet className="h-5 w-5" />} label={t("supplier.portal.outstanding")} value={stats.outstanding.toLocaleString()} accent />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("supplier.portal.tab_overview")}</TabsTrigger>
          <TabsTrigger value="hotels">{t("nav.hotels")}</TabsTrigger>
          <TabsTrigger value="rates">{t("nav.rates")}</TabsTrigger>
          <TabsTrigger value="bookings">{t("nav.bookings")}</TabsTrigger>
          <TabsTrigger value="payables">{t("nav.payables")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card><CardHeader><CardTitle>{t("supplier.portal.profile")}</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
              <Row label={t("label.code")} value={s.code} />
              <Row label={t("label.type")} value={t(`supplier.type.${s.supplier_type}`)} />
              <Row label={t("label.email")} value={s.email ?? "—"} />
              <Row label={t("label.phone")} value={s.phone ?? "—"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels" className="mt-4"><HotelsTab /></TabsContent>
        <TabsContent value="rates" className="mt-4"><RatesTab /></TabsContent>
        <TabsContent value="bookings" className="mt-4"><BookingsTab /></TabsContent>
        <TabsContent value="payables" className="mt-4"><PayablesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent?: boolean }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon}<span>{label}</span></div>
      <div className={`text-2xl font-bold mt-1 ${accent ? "text-amber-600" : ""}`}>{value}</div>
    </CardContent></Card>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div>{value}</div></div>;
}

function HotelsTab() {
  const { lang, t } = useI18n();
  const q = useQuery({ queryKey: ["my-hotels"], queryFn: () => listMyHotels() });
  const rows = (q.data?.rows ?? []) as unknown as Array<{ hotels: { id: string; name_ar: string; name_en: string; code: string; star_rating: number | null } | null }>;
  if (q.isLoading) return <Loader />;
  if (rows.length === 0) return <Empty msg={t("supplier.portal.empty_hotels")} />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map((r) => r.hotels && (
        <Card key={r.hotels.id}><CardContent className="p-4">
          <div className="font-semibold truncate">{lang === "ar" ? r.hotels.name_ar : r.hotels.name_en}</div>
          <div className="text-xs text-muted-foreground">{r.hotels.code} · {"★".repeat(r.hotels.star_rating ?? 0)}</div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function RatesTab() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["my-rates"], queryFn: () => listMyRates() });
  if (q.isLoading) return <Loader />;
  const rows = (q.data?.rows ?? []) as Array<{ id: string; code: string; status: string; valid_from: string; valid_to: string; currency: string }>;
  if (rows.length === 0) return <Empty msg={t("supplier.portal.empty_rates")} />;
  return (
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          <Th>{t("label.code")}</Th><Th>{t("label.status")}</Th>
          <Th>{t("label.checkin")}</Th><Th>{t("label.checkout")}</Th><Th>{t("label.currency")}</Th>
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t">
            <Td>{r.code}</Td><Td><Badge variant="outline">{r.status}</Badge></Td>
            <Td>{r.valid_from}</Td><Td>{r.valid_to}</Td><Td>{r.currency}</Td>
          </tr>
        ))}</tbody>
      </table>
    </CardContent></Card>
  );
}

function BookingsTab() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["my-bookings"], queryFn: () => listMyBookings() });
  if (q.isLoading) return <Loader />;
  const rows = (q.data?.rows ?? []) as unknown as Array<{ id: string; check_in: string; check_out: string; nights: number; rooms: number; total_cost: number; confirmation_status: string }>;
  if (rows.length === 0) return <Empty msg={t("supplier.portal.empty_bookings")} />;
  return (
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          <Th>{t("label.checkin")}</Th><Th>{t("label.checkout")}</Th>
          <Th>Nights</Th><Th>Rooms</Th><Th>Total</Th><Th>{t("label.status")}</Th>
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t">
            <Td>{r.check_in}</Td><Td>{r.check_out}</Td>
            <Td>{r.nights}</Td><Td>{r.rooms}</Td>
            <Td>{Number(r.total_cost).toLocaleString()}</Td>
            <Td><Badge variant="outline">{r.confirmation_status}</Badge></Td>
          </tr>
        ))}</tbody>
      </table>
    </CardContent></Card>
  );
}

function PayablesTab() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["my-payables"], queryFn: () => listMyPayables() });
  if (q.isLoading) return <Loader />;
  const rows = (q.data?.rows ?? []) as Array<{ id: string; due_date: string; amount: number; currency: string; status: string; reference?: string }>;
  if (rows.length === 0) return <Empty msg={t("supplier.portal.empty_payables")} />;
  return (
    <Card><CardContent className="p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50"><tr>
          <Th>Due</Th><Th>Amount</Th><Th>{t("label.status")}</Th>
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.id} className="border-t">
            <Td>{r.due_date}</Td>
            <Td>{Number(r.amount).toLocaleString()} {r.currency}</Td>
            <Td><Badge variant={r.status === "paid" ? "default" : "secondary"}>{r.status}</Badge></Td>
          </tr>
        ))}</tbody>
      </table>
    </CardContent></Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th className="text-start px-3 py-2 font-medium">{children}</th>;
const Td = ({ children }: { children: React.ReactNode }) => <td className="px-3 py-2">{children}</td>;
const Loader = () => <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
const Empty = ({ msg }: { msg: string }) => <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">{msg}</CardContent></Card>;

export { SupplierPortalPage as Component };
