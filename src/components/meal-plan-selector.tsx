import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const MEAL_PLANS = [
  { id: "BB", label_ar: "فطار", label_en: "Breakfast" },
  { id: "LUNCH", label_ar: "غداء", label_en: "Lunch" },
  { id: "DINNER", label_ar: "عشاء", label_en: "Dinner" },
  { id: "HB", label_ar: "نص اقامة", label_en: "Half Board" },
  { id: "FB", label_ar: "اقامة كاملة", label_en: "Full Board" },
  { id: "RO", label_ar: "بدون وجبات", label_en: "Room Only" },
  { id: "AI", label_ar: "شامل كلياً", label_en: "All Inclusive" },
  { id: "UAI", label_ar: "شامل كلياً مميز", label_en: "Ultra All Inclusive" },
] as const;

export function MealPlanSelector({
  value,
  onChange,
  multiple = false,
  lang = "en",
  allowedMeals = MEAL_PLANS.map(m => m.id),
}: {
  value: string | string[];
  onChange: (val: any) => void;
  multiple?: boolean;
  lang?: "en" | "ar";
  allowedMeals?: string[];
}) {
  const isChecked = (id: string) => multiple ? (value as string[]).includes(id) : value === id;

  const handleToggle = (id: string) => {
    if (multiple) {
      const current = new Set(value as string[]);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      onChange(Array.from(current));
    } else {
      onChange(id);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {MEAL_PLANS.filter(m => allowedMeals.includes(m.id)).map(meal => {
        const checked = isChecked(meal.id);
        return (
          <div
            key={meal.id}
            onClick={() => handleToggle(meal.id)}
            className={cn("border rounded-xl px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors",
              checked ? "border-amber-600 text-amber-700 bg-amber-50/5 dark:text-amber-500" : "border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <div className={cn("w-4 h-4 rounded flex items-center justify-center border", checked ? "bg-amber-600 border-amber-600 text-white" : "border-muted-foreground/30 bg-white dark:bg-transparent")}>
              {checked && <Check className="w-3 h-3" />}
            </div>
            <span className="text-sm font-bold">{lang === "ar" ? meal.label_ar : meal.label_en}</span>
          </div>
        );
      })}
    </div>
  );
}
