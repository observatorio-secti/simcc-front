import { useEffect } from "react";
import { debounce } from "lodash";

export default function useWindowResize(callback) {
  useEffect(() => {
    const handleResize = debounce(callback, 200);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [callback]);
}
