import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { aj as ChevronRight, al as ChevronLeft } from "../_libs/lucide-react.mjs";
function DataPagination({
  page,
  pageSize,
  total,
  onPage
}) {
  const { t, lang } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const Prev = lang === "ar" ? ChevronRight : ChevronLeft;
  const Next = lang === "ar" ? ChevronLeft : ChevronRight;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      from,
      "–",
      to,
      " / ",
      total
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", disabled: page <= 1, onClick: () => onPage(page - 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Prev, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2", children: [
        page,
        " / ",
        pages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", disabled: page >= pages, onClick: () => onPage(page + 1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Next, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
      t("label.total"),
      ": ",
      total
    ] })
  ] });
}
export {
  DataPagination as D
};
