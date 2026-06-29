import { Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { MealPlanSelector } from "@/components/meal-plan-selector";
import { useWatch, useFormContext } from "react-hook-form";

export interface MealPlanConfiguratorProps {
  // Legacy props
  mealsIncluded?: boolean;
  onMealsIncludedChange?: (val: boolean) => void;
  mealPlanComponents?: string[];
  onMealPlanComponentsChange?: (val: string[]) => void;
  currency?: string;
  prices?: {
    breakfast_price?: number | "";
    lunch_price?: number | "";
    dinner_price?: number | "";
    half_board_price?: number | "";
    full_board_price?: number | "";
  };
  onPriceChange?: (field: "breakfast_price" | "lunch_price" | "dinner_price" | "half_board_price" | "full_board_price", val: number | "") => void;
  lang?: "en" | "ar";

  // New RHF props
  meals?: any[];
  control?: any;
}

export function MealPlanConfigurator({
  mealsIncluded,
  onMealsIncludedChange,
  mealPlanComponents,
  onMealPlanComponentsChange,
  currency,
  prices,
  onPriceChange,
  lang = "en",
  meals,
  control,
}: MealPlanConfiguratorProps) {
  const formContext = useFormContext();

  if (control && meals) {
    const mealPlanType = useWatch({ control, name: "meal_plan_type" }) || "inclusive";
    const inclusiveDetails = useWatch({ control, name: "meal_plan_inclusive_details" }) || [];
    const exclusivePrices = useWatch({ control, name: "meal_plan_exclusive_prices" }) || {};

    const isInclusive = mealPlanType === "inclusive";

    return (
      <div className="pt-6 border-t mt-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-2">
            {lang === "ar" ? "خطة الوجبات" : "Meal Plan"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "ar"
              ? "تحديد ما إذا كانت الإقامة تشمل وجبات أو لا، مع إمكانية تحديد تفاصيل الخطة والأسعار"
              : "Determine if the stay includes meals, and configure plan details and prices"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div
            className={cn("border rounded-xl p-4 sm:p-6 cursor-pointer flex justify-between items-center gap-4 transition-colors", isInclusive ? "border-amber-600 bg-amber-50/10" : "border-border hover:border-amber-600/50")}
            onClick={() => {
              if (formContext) {
                formContext.setValue("meal_plan_type", "inclusive", { shouldDirty: true });
                formContext.setValue("meal_plan_exclusive_prices", {}, { shouldDirty: true });
              }
            }}
          >
            <div>
              <div className="font-bold text-base sm:text-lg mb-1">{lang === "ar" ? "شامل" : "Included"}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {lang === "ar" ? "الوجبات مشمولة في سعر الحجز" : "Meals are included in the booking rate"}
              </div>
            </div>
            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", isInclusive ? "border-amber-600" : "border-muted-foreground/30")}>
              {isInclusive && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
            </div>
          </div>

          <div
            className={cn("border rounded-xl p-4 sm:p-6 cursor-pointer flex justify-between items-center gap-4 transition-colors", !isInclusive ? "border-amber-600 bg-amber-50/10" : "border-border hover:border-amber-600/50")}
            onClick={() => {
              if (formContext) {
                formContext.setValue("meal_plan_type", "exclusive", { shouldDirty: true });
                formContext.setValue("meal_plan_inclusive_details", [], { shouldDirty: true });
              }
            }}
          >
            <div>
              <div className="font-bold text-base sm:text-lg mb-1">{lang === "ar" ? "غير شامل" : "Not Included"}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {lang === "ar" ? "الوجبات تُحسب بشكل منفصل" : "Meals are calculated separately"}
              </div>
            </div>
            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", !isInclusive ? "border-amber-600" : "border-muted-foreground/30")}>
              {!isInclusive && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
            </div>
          </div>
        </div>

        {isInclusive ? (
          <div dir={lang === "ar" ? "rtl" : "ltr"} className="max-w-2xl mx-auto">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              {lang === "ar" ? "مكونات الخطة الشاملة" : "Included Plan Components"}
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              {meals.map(meal => {
                const mealId = Number(meal.id);
                const checked = inclusiveDetails.includes(mealId);
                return (
                  <div
                    key={mealId}
                    onClick={() => {
                      if (formContext) {
                        const current = new Set(inclusiveDetails);
                        if (current.has(mealId)) current.delete(mealId);
                        else current.add(mealId);
                        formContext.setValue("meal_plan_inclusive_details", Array.from(current), { shouldDirty: true });
                      }
                    }}
                    className={cn("border rounded-xl px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors",
                      checked ? "border-amber-600 text-amber-700 bg-amber-50/5 dark:text-amber-500" : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center border shrink-0", checked ? "bg-amber-600 border-amber-600 text-white" : "border-muted-foreground/30 bg-white dark:bg-transparent")}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-bold">{lang === "ar" ? meal.name_ar : meal.name_en}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden max-w-3xl mx-auto">
            <div className="bg-amber-50/30 px-6 py-4 hidden sm:flex justify-between items-center border-b text-sm font-bold text-muted-foreground" dir={lang === "ar" ? "rtl" : "ltr"}>
              <div>{lang === "ar" ? "نوع الوجبة" : "Meal Type"}</div>
              <div className="w-[200px] text-left" dir="ltr">{lang === "ar" ? "السعر" : "Price"}</div>
            </div>
            <div className="divide-y" dir={lang === "ar" ? "rtl" : "ltr"}>
              {meals.map(meal => {
                const mealId = Number(meal.id);
                const checked = exclusivePrices[mealId.toString()] !== undefined;
                return (
                  <div key={mealId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div
                        onClick={() => {
                          if (formContext) {
                            const current = { ...exclusivePrices };
                            if (checked) {
                              delete current[mealId.toString()];
                            } else {
                              current[mealId.toString()] = 0;
                            }
                            formContext.setValue("meal_plan_exclusive_prices", current, { shouldDirty: true });
                          }
                        }}
                        className={cn("w-4 h-4 rounded flex items-center justify-center border cursor-pointer shrink-0", checked ? "bg-amber-600 border-amber-600 text-white" : "border-muted-foreground/30 bg-white dark:bg-transparent")}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </div>
                      <span className={cn("text-sm font-bold", checked ? "text-foreground" : "text-muted-foreground")}>
                        {lang === "ar" ? meal.name_ar : meal.name_en}
                      </span>
                    </div>
                    <div className={cn("w-full sm:w-[200px]", !checked && "hidden sm:block sm:h-10")} dir="ltr">
                      {checked ? (
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-10 text-right pr-3 pl-3 border-amber-200 focus-visible:ring-amber-600 w-full"
                            value={exclusivePrices[mealId.toString()] || ""}
                            onChange={(e) => {
                              if (formContext) {
                                const current = { ...exclusivePrices };
                                current[mealId.toString()] = e.target.value === "" ? "" : Number(e.target.value);
                                formContext.setValue("meal_plan_exclusive_prices", current, { shouldDirty: true });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold mb-2">
          {lang === "ar" ? "خطة الوجبات" : "Meal Plan"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "ar"
            ? "تحديد ما إذا كانت الإقامة تشمل وجبات أو لا، مع إمكانية تحديد تفاصيل الخطة والأسعار"
            : "Determine if the stay includes meals, and configure plan details and prices"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div
          className={cn("border rounded-xl p-4 sm:p-6 cursor-pointer flex justify-between items-center gap-4 transition-colors", mealsIncluded ? "border-amber-600 bg-amber-50/10" : "border-border hover:border-amber-600/50")}
          onClick={() => onMealsIncludedChange?.(true)}
        >
          <div>
            <div className="font-bold text-base sm:text-lg mb-1">{lang === "ar" ? "شامل" : "Included"}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {lang === "ar" ? "الوجبات مشمولة في سعر الحجز" : "Meals are included in the booking rate"}
            </div>
          </div>
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", mealsIncluded ? "border-amber-600" : "border-muted-foreground/30")}>
            {mealsIncluded && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
          </div>
        </div>

        <div
          className={cn("border rounded-xl p-4 sm:p-6 cursor-pointer flex justify-between items-center gap-4 transition-colors", !mealsIncluded ? "border-amber-600 bg-amber-50/10" : "border-border hover:border-amber-600/50")}
          onClick={() => onMealsIncludedChange?.(false)}
        >
          <div>
            <div className="font-bold text-base sm:text-lg mb-1">{lang === "ar" ? "غير شامل" : "Not Included"}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {lang === "ar" ? "الوجبات تُحسب بشكل منفصل" : "Meals are calculated separately"}
            </div>
          </div>
          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", !mealsIncluded ? "border-amber-600" : "border-muted-foreground/30")}>
            {!mealsIncluded && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full" />}
          </div>
        </div>
      </div>

      {mealsIncluded ? (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="max-w-2xl mx-auto">
          <div className="text-sm font-medium text-muted-foreground mb-4">
            {lang === "ar" ? "مكونات الخطة الشاملة" : "Included Plan Components"}
          </div>
          <div className="mb-8">
            <MealPlanSelector
              value={mealPlanComponents || []}
              onChange={onMealPlanComponentsChange || (() => { })}
              multiple={true}
              lang={lang}
              allowedMeals={["BB", "LUNCH", "DINNER", "HB", "FB"]}
            />
          </div>
          <div className="bg-[#f0fbf4] text-[#16a34a] p-4 rounded-xl flex items-center justify-center gap-3">
            <span className="text-sm font-bold">
              {lang === "ar" ? "هذه الوجبات مشمولة ضمن سعر الحجز" : "These meals are included in the rate"}
            </span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden max-w-3xl mx-auto">
          <div className="bg-amber-50/30 px-6 py-4 hidden sm:flex justify-between items-center border-b text-sm font-bold text-muted-foreground" dir={lang === "ar" ? "rtl" : "ltr"}>
            <div>{lang === "ar" ? "نوع الوجبة" : "Meal Type"}</div>
            <div className="w-[200px] text-left" dir="ltr">{lang === "ar" ? "السعر" : "Price"} ({currency})</div>
          </div>
          <div className="divide-y" dir={lang === "ar" ? "rtl" : "ltr"}>
            {[
              { id: "BB", label_ar: "فطار", label_en: "Breakfast", field: "breakfast_price" as const },
              { id: "LUNCH", label_ar: "غداء", label_en: "Lunch", field: "lunch_price" as const },
              { id: "DINNER", label_ar: "عشاء", label_en: "Dinner", field: "dinner_price" as const },
              { id: "HB", label_ar: "Half Board", label_en: "Half Board", field: "half_board_price" as const },
              { id: "FB", label_ar: "Full Board", label_en: "Full Board", field: "full_board_price" as const },
            ].map(meal => {
              const isChecked = (mealPlanComponents || []).includes(meal.id);
              return (
                <div key={meal.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div
                      onClick={() => {
                        const current = new Set(mealPlanComponents || []);
                        if (current.has(meal.id)) {
                          current.delete(meal.id);
                          onPriceChange?.(meal.field, "");
                        } else {
                          current.add(meal.id);
                        }
                        onMealPlanComponentsChange?.(Array.from(current));
                      }}
                      className={cn("w-4 h-4 rounded flex items-center justify-center border cursor-pointer shrink-0", isChecked ? "bg-amber-600 border-amber-600 text-white" : "border-muted-foreground/30 bg-white dark:bg-transparent")}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={cn("text-sm font-bold", isChecked ? "text-foreground" : "text-muted-foreground")}>
                      {lang === "ar" ? meal.label_ar : meal.label_en}
                    </span>
                  </div>
                  <div className={cn("w-full sm:w-[200px]", !isChecked && "hidden sm:block sm:h-10")} dir="ltr">
                    {isChecked ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-700 font-bold">{currency}</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-10 text-right pr-3 pl-10 border-amber-200 focus-visible:ring-amber-600 w-full"
                          value={prices?.[meal.field] ?? ""}
                          onChange={(e) => onPriceChange?.(meal.field, e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    ) : (
                      <div className="h-10" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  );
}
