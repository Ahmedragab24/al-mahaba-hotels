import { j as jsxRuntimeExports, r as reactExports } from "./react.mjs";
var DirectionContext = reactExports.createContext(void 0);
var DirectionProvider = (props) => {
  const { dir, children } = props;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DirectionContext.Provider, { value: dir, children });
};
function useDirection(localDir) {
  const globalDir = reactExports.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
export {
  DirectionProvider as D,
  useDirection as u
};
