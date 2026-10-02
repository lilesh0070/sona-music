import { useState, useEffect, useCallback } from "react";
export default function useAsync(loader, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => loader(controller.signal))
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [...deps, version]);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    window.addEventListener("vibe:catalog", retry);
    return () => window.removeEventListener("vibe:catalog", retry);
  }, [retry]);
  return { ...state, retry };
}
