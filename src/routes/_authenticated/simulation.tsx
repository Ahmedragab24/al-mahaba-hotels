import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Play, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getSimulationSettings,
  updateSimulationSettings,
  runSimulationNow,
  purgeSimulatedData,
} from "@/lib/simulation.functions";

export default function SimulationPage() {
  const { dir } = useI18n();
  const qc = useQueryClient();
  const fetchSettings = getSimulationSettings;
  const updateFn = updateSimulationSettings;
  const runFn = runSimulationNow;
  const purgeFn = purgeSimulatedData;

  const q = useQuery({
    queryKey: ["simulation-settings"],
    queryFn: () => fetchSettings(),
    refetchInterval: 10000,
  });

  const update = useMutation({
    mutationFn: (input: { enabled?: boolean; interval_minutes?: number; intensity?: "low" | "medium" | "high" }) =>
      updateFn({ data: { id: q.data!.settings!.id, ...input } }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({ queryKey: ["simulation-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحفظ"),
  });

  const runNow = useMutation({
    mutationFn: () => runFn(),
    onSuccess: (r: any) => {
      toast.success(`تم تشغيل دورة محاكاة — ${JSON.stringify(r.created ?? {})}`);
      qc.invalidateQueries({ queryKey: ["simulation-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل التشغيل"),
  });

  const purge = useMutation({
    mutationFn: () => purgeFn(),
    onSuccess: (r: any) => {
      toast.success(`تم حذف البيانات الاصطناعية`);
      qc.invalidateQueries({ queryKey: ["simulation-settings"] });
      console.log("purge result", r);
    },
    onError: (e: any) => toast.error(e?.message ?? "فشل الحذف"),
  });

  const s = q.data?.settings;
  const counts = q.data?.counts ?? {};

  return (
    <div className="space-y-6" dir={dir}>
      <PageHeader title="وضع المحاكاة الحية" description="تشغيل نشاط تلقائي على المنصة (RFQs، حجوزات، فواتير، سندات) لإظهار المنصة بحالة عمل حقيقي. جميع البيانات الناتجة موسومة وقابلة للحذف بضغطة واحدة." />

      {q.isLoading && <div className="text-muted-foreground">جارٍ التحميل...</div>}

      {s && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                إعدادات المحاكاة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-base">تفعيل المحاكاة التلقائية</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    عند التفعيل سيقوم النظام بإنشاء نشاط تلقائي حسب التردد والشدة المحددين.
                  </p>
                </div>
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) => update.mutate({ enabled: v })}
                  disabled={update.isPending}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>تردد التشغيل (بالدقائق)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1440}
                    defaultValue={s.interval_minutes}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value);
                      if (v && v !== s.interval_minutes) update.mutate({ interval_minutes: v });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    ملاحظة: المهمة المجدولة تعمل كل 5 دقائق وتفحص هذا الإعداد.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>شدة المحاكاة</Label>
                  <Select
                    value={s.intensity}
                    onValueChange={(v) => update.mutate({ intensity: v as any })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة (~2 حدث/دورة)</SelectItem>
                      <SelectItem value="medium">متوسطة (~4 أحداث/دورة)</SelectItem>
                      <SelectItem value="high">عالية (~8 أحداث/دورة)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button onClick={() => runNow.mutate()} disabled={runNow.isPending}>
                  <Play className="h-4 w-4 me-2" />
                  تشغيل دورة الآن
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("سيتم حذف جميع البيانات الاصطناعية. متابعة؟")) purge.mutate();
                  }}
                  disabled={purge.isPending}
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  حذف جميع البيانات الاصطناعية
                </Button>
                <Button variant="outline" onClick={() => q.refetch()}>
                  <RefreshCw className="h-4 w-4 me-2" />
                  تحديث
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>حالة آخر تشغيل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">آخر تشغيل</div>
                  <div className="font-medium">
                    {s.last_run_at ? new Date(s.last_run_at).toLocaleString("ar-SA") : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">الحالة</div>
                  <div>
                    {s.last_run_status === "ok" && <Badge>ناجح</Badge>}
                    {s.last_run_status === "error" && <Badge variant="destructive">فشل</Badge>}
                    {!s.last_run_status && "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">عدد الدورات الإجمالي</div>
                  <div className="font-medium">{s.total_runs ?? 0}</div>
                </div>
              </div>
              {s.last_run_summary && (
                <pre className="mt-4 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                  {JSON.stringify(s.last_run_summary, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>البيانات الاصطناعية الموجودة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الجدول</TableHead>
                    <TableHead className="text-end">عدد السجلات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(counts).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-medium">{k}</TableCell>
                      <TableCell className="text-end">{v as number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
