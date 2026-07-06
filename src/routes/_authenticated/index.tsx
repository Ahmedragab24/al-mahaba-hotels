import { Link, Navigate, type LinkProps } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule } from "@/lib/auth-utils";
import type { UserProfile } from "@/types/api";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { KPI_TONE, type KpiTone } from "@/components/list-toolkit";
import {
  Users,
  Hotel,
  Briefcase,
  BookOpen,
  FileText,
  CheckCircle2,
  Bed,
  Coins,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { useGetHomeDataQuery } from "@/store/services/home";
import { requestPermission } from "@/lib/firebaseMessaging";
import { useUpdateUserMutation } from "@/store/api";

export default function DashboardOrRedirect() {
  const auth = useSelector(selectAuth);
  if (!canAccessModule(auth, "dashboard")) {
    return <Navigate to="/supplier-portal" replace />;
  }
  return <Dashboard />;
}

function KPIStatCard({
  icon: Icon,
  label,
  value,
  badgeText,
  badgeType,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  badgeText: string;
  badgeType: "success" | "danger" | "neutral";
  to?: LinkProps["to"];
  lang: string;
}) {
  const toneByBadge: Record<typeof badgeType, KpiTone> = {
    success: "success",
    danger: "destructive",
    neutral: "muted",
  };
  const tone = KPI_TONE[toneByBadge[badgeType]];


  const card = (
    <Card className="group h-full overflow-hidden border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5">
      <CardContent className="relative p-4">
        <div className="flex w-full items-center justify-between py-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span
            className={`rounded-full border border-transparent px-2 py-0.5 text-sm font-bold ${tone.bg} ${tone.fg}`}
          >
            {badgeText}
          </span>
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-extrabold leading-tight tracking-tight text-foreground font-sans tabular-nums">
            {value}
          </div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
        </div>
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-start scale-x-0 transition-transform group-hover:scale-x-100 ${tone.bar}`}
        />
      </CardContent>
    </Card>
  );

  if (to)
    return (
      <Link to={to} className="block h-full">
        {card}
      </Link>
    );
  return card;
}

function Dashboard() {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    requestPermission().then((token) => {
      if (token) {
        console.log("FCM Token obtained:", token);
        const profile = auth.profile as UserProfile | null;
        const userId = auth.user?.id;
        const currentFcm = profile?.fcm;
        if (userId && token !== currentFcm) {
          updateUser({ id: userId, body: { fcm: token } })
            .unwrap()
            .then(() => {
              console.log("FCM Token updated on backend successfully.");
            })
            .catch((err) => {
              console.error("Failed to update FCM token on backend:", err);
            });
        }
      }
    });
  }, [auth.profile, auth.user, updateUser]);

  const { data: dData, isLoading: isDashboardLoading } = useGetHomeDataQuery();

  const formatCurrency = (amount: number) => {
    const formatted = Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${t("dashboard.sar")}`;
  };

  const getBadgeInfo = (change?: number) => {
    if (change === undefined || change === null) return { text: "0.0%", type: "neutral" as const };
    const sign = change > 0 ? "+" : "";
    const text = `${sign}${change.toFixed(1)}%`;
    const type =
      change > 0 ? ("success" as const) : change < 0 ? ("danger" as const) : ("neutral" as const);
    return { text, type };
  };

  // Extract / Calculate values based on API and screenshots
  const cards = dData?.cards;
  const totalBookings = cards?.total_bookings?.value ?? 0;
  const pendingOffers = cards?.total_quotations?.value ?? 0;
  const confirmedBookings = cards?.confirmed_bookings?.value ?? 0;
  const activeSuppliers = cards?.active_suppliers?.value ?? cards?.total_suppliers?.value ?? 0;
  const activeHotels = cards?.active_hotels?.value ?? 0;
  const totalRooms = cards?.total_rooms?.value ?? 0;
  const totalCustomers = cards?.total_customers?.value ?? 0;
  const outstandingAR = cards?.receivables_sar?.value ?? 0;
  const totalCollected = cards?.payments_sar?.value ?? 0;
  const netProfit = cards?.net_profit_sar?.value ?? 0;
  const monthlyMarginProfit = cards?.monthly_margin_profit_sar?.value ?? 0;

  const cardData = useMemo(() => {
    const c = dData?.cards;
    const b1 = getBadgeInfo(c?.total_bookings?.change_percentage);
    const b2 = getBadgeInfo(c?.total_quotations?.change_percentage);
    const b3 = getBadgeInfo(c?.confirmed_bookings?.change_percentage);
    const b4 = getBadgeInfo(
      c?.active_suppliers?.change_percentage ?? c?.total_suppliers?.change_percentage,
    );
    const b5 = getBadgeInfo(c?.active_hotels?.change_percentage);
    const b6 = getBadgeInfo(c?.total_rooms?.change_percentage);
    const b7 = getBadgeInfo(c?.total_customers?.change_percentage);
    const b8 = getBadgeInfo(c?.receivables_sar?.change_percentage);
    const b9 = getBadgeInfo(c?.payments_sar?.change_percentage);
    const b10 = getBadgeInfo(c?.net_profit_sar?.change_percentage);
    const b11 = getBadgeInfo(c?.monthly_margin_profit_sar?.change_percentage);

    const ar = (a: string, e: string) => (lang === "ar" ? a : e);

    return [
      {
        icon: BookOpen,
        label: t("dashboard.total_bookings"),
        value: totalBookings.toLocaleString("en-US"),
        badgeText: b1.text,
        badgeType: b1.type,
        to: "/bookings" as const,
      },
      {
        icon: FileText,
        label: t("dashboard.pending_offers"),
        value: pendingOffers.toLocaleString("en-US"),
        badgeText: b2.text,
        badgeType: b2.type,
        to: "/quotations" as const,
      },
      {
        icon: CheckCircle2,
        label: t("dashboard.confirmed_bookings"),
        value: confirmedBookings.toLocaleString("en-US"),
        badgeText: b3.text,
        badgeType: b3.type,
        to: "/bookings" as const,
      },
      {
        icon: Briefcase,
        label: t("dashboard.active_suppliers"),
        value: activeSuppliers.toLocaleString("en-US"),
        badgeText: b4.text,
        badgeType: b4.type,
        to: "/suppliers" as const,
      },
      {
        icon: Hotel,
        label: t("dashboard.active_hotels"),
        value: activeHotels.toLocaleString("en-US"),
        badgeText: b5.text,
        badgeType: b5.type,
        to: "/hotels" as const,
      },
      {
        icon: Bed,
        label: t("dashboard.rooms_count"),
        value: totalRooms.toLocaleString("en-US"),
        badgeText: b6.text,
        badgeType: b6.type,
        to: "/rates" as const,
      },
      {
        icon: Users,
        label: t("dashboard.total_customers"),
        value: totalCustomers.toLocaleString("en-US"),
        badgeText: b7.text,
        badgeType: b7.type,
        to: "/customers" as const,
      },
      {
        icon: Coins,
        label: t("dashboard.financial_receivables"),
        value: formatCurrency(outstandingAR),
        badgeText: b8.text,
        badgeType: b8.type,
        to: "/invoices" as const,
      },
      {
        icon: Wallet,
        label: t("dashboard.financial_payments"),
        value: formatCurrency(totalCollected),
        badgeText: b9.text,
        badgeType: b9.type,
        to: "/receipts" as const,
      },
      {
        icon: Coins,
        label: ar("صافي أرباح المنصة", "Net Platform Profit"),
        value: formatCurrency(netProfit),
        badgeText: b10.text,
        badgeType: b10.type,
        to: "/platform-transactions" as const,
      },
      {
        icon: Wallet,
        label: ar("أرباح هامش الربح الشهري", "Monthly Margin Profit"),
        value: formatCurrency(monthlyMarginProfit),
        badgeText: b11.text,
        badgeType: b11.type,
        to: "/platform-transactions" as const,
      },
    ];
  }, [
    lang,
    totalBookings,
    pendingOffers,
    confirmedBookings,
    activeSuppliers,
    activeHotels,
    totalRooms,
    totalCustomers,
    outstandingAR,
    totalCollected,
    netProfit,
    monthlyMarginProfit,
    dData,
    t,
  ]);

  const chartColors = {
    primary: "var(--chart-1)",
    secondary: "var(--chart-2)",
    muted: "var(--muted-foreground)",
    border: "var(--border)",
    foreground: "var(--foreground)",
    card: "var(--card)",
  };

  // Annual financial performance data mapping
  const annualPerformanceData = useMemo(() => {
    const apiTrend = dData?.charts?.annual_financial_performance || [];
    const monthKeys = [
      "month.jan",
      "month.feb",
      "month.mar",
      "month.apr",
      "month.may",
      "month.jun",
      "month.jul",
      "month.aug",
      "month.sep",
      "month.oct",
      "month.nov",
      "month.dec",
    ];
    const defaultValues = [
      95000, 110000, 85000, 130000, 160000, 150000, 180000, 200000, 190000, 210000, 220000, 250000,
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const apiMonth = apiTrend.find((m: any) => m.month_num === monthNum);
      return {
        name: t(monthKeys[i]),
        value: apiMonth
          ? apiMonth.bookings_revenue + (apiMonth.other_income || 0)
          : defaultValues[i],
      };
    });
  }, [t, dData]);

  // Booking status data mapping
  const bookingStatusData = useMemo(() => {
    const apiDist = dData?.charts?.bookings_status_distribution || [];

    const colors = {
      confirmed: "var(--chart-1)",
      pending: "var(--chart-3)",
      cancelled: "var(--chart-5)",
    };

    const labels = {
      confirmed: t("dashboard.confirmed"),
      pending: t("dashboard.pending"),
      cancelled: t("dashboard.cancelled"),
    };

    return apiDist.map((item: any) => ({
      name: labels[item.status as keyof typeof labels] || item.label || item.status,
      value: item.count,
      color: colors[item.status as keyof typeof colors] || "var(--muted-foreground)",
    }));
  }, [t, dData]);

  // Weekly booking trend data mapping
  const weeklyTrendData = useMemo(() => {
    const apiTrend = dData?.charts?.weekly_bookings_trend || [];
    if (apiTrend.length > 0) {
      return apiTrend.map((item: any, idx: number) => {
        return {
          name: item.week_label || `${t("dashboard.week")} ${idx + 1}`,
          value: item.count,
        };
      });
    }
    // Fallback if empty
    const scaleFactor = totalBookings / 2845;
    const defaultWeeklyValues = [120, 150, 180, 168, 210, 245, 235, 290];

    return Array.from({ length: 8 }, (_, i) => ({
      name: `${t("dashboard.week")} ${i + 1}`,
      value: Math.round(defaultWeeklyValues[i] * scaleFactor),
    }));
  }, [t, totalBookings, dData]);

  // Skeleton loading screen
  if (isDashboardLoading) {
    return (
      <div className="space-y-8 p-6 animate-pulse" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="h-10 w-48 bg-muted rounded-xl mb-6" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-[380px] bg-muted rounded-2xl mb-6" />
        <div className="h-[380px] bg-muted rounded-2xl mb-6" />
        <div className="h-[380px] bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      <PageHeader title={t("dashboard.title")}>
        <div className="rounded-2xl border border-border bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
          {t("dashboard.welcome")}
        </div>
      </PageHeader>

      <div className="space-y-8 p-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cardData.map((card, idx) => (
            <div key={idx}>
              <KPIStatCard {...card} lang={lang} />
            </div>
          ))}
        </div>

        {/* Charts section */}
        <div className="space-y-6">
          {/* Chart 1: Annual Financial Performance */}
          <Card className="">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboard.annual_financial_performance")}
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={annualPerformanceData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={chartColors.border}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11, fontWeight: 550 }}
                      dy={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11, fontWeight: 550 }}
                      tickFormatter={(val) =>
                        val === 0
                          ? "0"
                          : `${val / 1000}K ${t("dashboard.sar")}`
                      }
                      dx={lang === "ar" ? 10 : -10}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatCurrency(value),
                        t("dashboard.revenue"),
                      ]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--card)",
                      }}
                      itemStyle={{ color: chartColors.primary }}
                      labelStyle={{ color: chartColors.muted }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Booking Status */}
          <Card className="">
            <div className="border-b border-border/60 px-6 py-5">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboard.booking_status")}
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-4">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="h-[220px] w-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={88}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {bookingStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [value, t("dashboard.booking_count_label")]}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--card)",
                          }}
                          itemStyle={{ color: chartColors.primary }}
                          labelStyle={{ color: chartColors.muted }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="w-full md:w-[260px] flex flex-col justify-center space-y-4">
                  {bookingStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm font-semibold">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Weekly Booking Trend */}
          <Card className="">
            <div className="border-b border-border/60 px-6 py-5">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboard.weekly_booking_trend")}
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyTrendData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={chartColors.border}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11, fontWeight: 550 }}
                      dy={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.muted, fontSize: 11, fontWeight: 550 }}
                      dx={lang === "ar" ? 10 : -10}
                    />
                    <Tooltip
                      formatter={(value: any) => [value, t("dashboard.booking_count_label")]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--card)",
                      }}
                      itemStyle={{ color: chartColors.primary }}
                      labelStyle={{ color: chartColors.muted }}
                    />
                    <Bar
                      dataKey="value"
                      fill={chartColors.primary}
                      radius={[4, 4, 0, 0]}
                      barSize={22}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { DashboardOrRedirect as Component };
