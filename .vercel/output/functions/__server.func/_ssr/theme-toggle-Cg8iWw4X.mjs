import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { r as Sun, s as Moon, t as Languages } from "../_libs/lucide-react.mjs";
function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      variant: "ghost",
      size: "sm",
      onClick: () => setLang(lang === "ar" ? "en" : "ar"),
      className: "gap-2",
      "aria-label": "Toggle language",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: lang === "ar" ? "English" : "العربية" })
      ]
    }
  );
}
function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}
function ThemeToggle() {
  const [theme, setTheme] = reactExports.useState(getStoredTheme);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
    }
  }, [theme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "ghost",
      size: "sm",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
      "aria-label": "Toggle theme",
      children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4" })
    }
  );
}
export {
  LangSwitcher as L,
  ThemeToggle as T
};
