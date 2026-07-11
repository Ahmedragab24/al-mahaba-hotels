import * as React from "react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";

export interface DateTimePickerProps {
  value?: string; // YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  min,
  className,
}: DateTimePickerProps) {
  const { lang, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [mode, setMode] = React.useState<"hours" | "minutes">("hours");
  const [ampm, setAmpm] = React.useState<"AM" | "PM">("AM");
  const [hour, setHour] = React.useState<number>(12); // 1-12
  const [minute, setMinute] = React.useState<number>(0); // 0-59

  // Synchronize initial value
  React.useEffect(() => {
    if (value) {
      const dateStr = value.includes("T") ? value.split("T")[0] : value.split(" ")[0];
      const timeStr = value.includes("T") ? value.split("T")[1] : value.split(" ")[1];
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
      }
      if (timeStr) {
        const parts = timeStr.split(":");
        const h24 = parseInt(parts[0] || "0", 10);
        const m = parseInt(parts[1] || "0", 10);
        setMinute(m);
        if (h24 >= 12) {
          setAmpm("PM");
          setHour(h24 === 12 ? 12 : h24 - 12);
        } else {
          setAmpm("AM");
          setHour(h24 === 0 ? 12 : h24);
        }
      }
    } else {
      setSelectedDate(undefined);
      setHour(12);
      setMinute(0);
      setAmpm("AM");
    }
  }, [value, open]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateValue(date, hour, minute, ampm);
  };

  const updateValue = (
    d: Date | undefined,
    h: number,
    m: number,
    ap: "AM" | "PM"
  ) => {
    if (!d) return;
    let h24 = h;
    if (ap === "PM" && h < 12) h24 = h + 12;
    if (ap === "AM" && h === 12) h24 = 0;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(h24).padStart(2, "0");
    const minStr = String(m).padStart(2, "0");

    onChange(`${yyyy}-${mm}-${dd}T${hh}:${minStr}`);
  };

  const handleHourSelect = (h: number) => {
    setHour(h);
    updateValue(selectedDate || new Date(), h, minute, ampm);
    // Automatically switch to minutes mode
    setTimeout(() => setMode("minutes"), 150);
  };

  const handleMinuteSelect = (m: number) => {
    setMinute(m);
    updateValue(selectedDate || new Date(), hour, m, ampm);
  };

  const toggleAmpm = (ap: "AM" | "PM") => {
    setAmpm(ap);
    updateValue(selectedDate || new Date(), hour, minute, ap);
  };

  // Clock calculations
  const clockNumbers = React.useMemo(() => {
    if (mode === "hours") {
      return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    } else {
      return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    }
  }, [mode]);

  const handAngle = React.useMemo(() => {
    if (mode === "hours") {
      return (hour % 12) * 30;
    } else {
      return minute * 6;
    }
  }, [mode, hour, minute]);

  const displayString = React.useMemo(() => {
    if (!value) return placeholder || (lang === "ar" ? "اختر التاريخ والوقت" : "Select Date & Time");
    try {
      const parts = value.split(/[T ]/);
      const d = new Date(parts[0]);
      if (isNaN(d.getTime())) return value;
      const formattedDate = format(d, "PP", { locale: lang === "ar" ? ar : enUS });
      const timeStr = parts[1] ? parts[1].substring(0, 5) : "";
      return `${formattedDate} ${timeStr}`;
    } catch {
      return value;
    }
  }, [value, lang, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-start font-normal h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{displayString}</span>
          <Clock className="ms-2 h-4 w-4 text-muted-foreground opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 flex flex-col sm:flex-row gap-4" align="start">
        {/* Calendar Picker */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground px-1 mb-1">
            {lang === "ar" ? "اختر التاريخ" : "Select Date"}
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => {
              if (!min) return false;
              const minD = new Date(min.split(/[T ]/)[0]);
              minD.setHours(0, 0, 0, 0);
              const curD = new Date(date);
              curD.setHours(0, 0, 0, 0);
              return curD < minD;
            }}
          />
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-[1px] bg-border" />

        {/* Time Clock Picker */}
        <div className="flex flex-col items-center justify-between w-[220px]">
          {/* Header Time Display */}
          <div className="flex items-center gap-1.5 justify-center w-full bg-muted/50 rounded-lg p-2 mb-3">
            <button
              type="button"
              onClick={() => setMode("hours")}
              className={cn(
                "text-lg font-bold px-2 py-0.5 rounded transition",
                mode === "hours"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {String(hour).padStart(2, "0")}
            </button>
            <span className="text-lg font-bold text-muted-foreground">:</span>
            <button
              type="button"
              onClick={() => setMode("minutes")}
              className={cn(
                "text-lg font-bold px-2 py-0.5 rounded transition",
                mode === "minutes"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {String(minute).padStart(2, "0")}
            </button>

            <div className="flex flex-col gap-0.5 ms-3 border-s border-border ps-2">
              <button
                type="button"
                onClick={() => toggleAmpm("AM")}
                className={cn(
                  "text-[10px] font-semibold px-1 rounded transition",
                  ampm === "AM"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => toggleAmpm("PM")}
                className={cn(
                  "text-[10px] font-semibold px-1 rounded transition",
                  ampm === "PM"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Clock Face */}
          <div className="relative w-40 h-40 rounded-full border border-border bg-muted/20 flex items-center justify-center select-none shadow-inner my-2">
            {/* Center Pivot */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-primary z-10" />

            {/* Hand */}
            <div
              className="absolute w-0.5 bg-primary origin-bottom transition-all duration-200"
              style={{
                height: "38%",
                bottom: "50%",
                left: "calc(50% - 1px)",
                transform: `rotate(${handAngle}deg)`,
              }}
            />

            {/* Numbers */}
            {clockNumbers.map((num, i) => {
              const angle = ((i + 1) * 30 * Math.PI) / 180;
              const x = 50 + 38 * Math.sin(angle);
              const y = 50 - 38 * Math.cos(angle);
              const isSelected = mode === "hours" ? hour === num : minute === num;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => (mode === "hours" ? handleHourSelect(num) : handleMinuteSelect(num))}
                  className={cn(
                    "absolute w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all -translate-x-1/2 -translate-y-1/2 hover:bg-primary/20",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary"
                      : "text-foreground"
                  )}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  {mode === "hours" ? num : String(num).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* Quick Select Buttons */}
          <div className="flex justify-between w-full mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
            <button
              type="button"
              onClick={() => setMode(mode === "hours" ? "minutes" : "hours")}
              className="hover:text-foreground font-medium underline"
            >
              {mode === "hours"
                ? (lang === "ar" ? "اختر الدقائق" : "Choose Minutes")
                : (lang === "ar" ? "اختر الساعات" : "Choose Hours")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:text-foreground font-bold flex items-center gap-0.5"
            >
              <Check className="h-3 w-3" />
              {lang === "ar" ? "موافق" : "Done"}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
