import { r as reactExports } from "../_libs/react.mjs";
function useDebounce(value, ms = 300) {
  const [v, setV] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
export {
  useDebounce as u
};
