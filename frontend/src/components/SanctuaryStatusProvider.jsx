import { useEffect, useState } from "react";
import api from "../lib/api";
import { snapshotLifetime } from "../lib/sanctuaryStatus";
import SanctuaryStatusContext from "./SanctuaryStatusContext";

const empty = (loading = false, error = false) => ({ loading, error, status: null, hours: null });

function SanctuaryStatusProvider({ children }) {
  const [value, setValue] = useState(() => empty(true));
  useEffect(() => {
    let active = true;
    let version = 0;
    let controller;
    let expiry;
    const apply = (data, elapsed = 0) => {
      const lifetime = snapshotLifetime(data, elapsed);
      if (!lifetime) throw new Error("Status snapshot is not verified or current");
      window.clearTimeout(expiry);
      setValue({ loading: false, error: false, status: data, hours: data.hours || null });
      expiry = window.setTimeout(() => { if (active) refresh(true); }, lifetime);
    };
    const refresh = async (invalidate = false) => {
      const requestVersion = ++version;
      controller?.abort();
      controller = new AbortController();
      if (invalidate) { window.clearTimeout(expiry); setValue(empty(true)); }
      const start = performance.now();
      try {
        const response = await api.get("/api/sanctuary/status", { timeout: 10000, signal: controller.signal });
        if (!active || requestVersion !== version) return;
        if (!response.data?.success) throw new Error("Status request failed");
        apply(response.data.data, performance.now() - start);
      } catch {
        if (!active || requestVersion !== version) return;
        window.clearTimeout(expiry);
        setValue(empty(false, true));
      }
    };
    const changed = event => {
      ++version;
      controller?.abort();
      try {
        if (!event.detail?.publicStatus) throw new Error();
        apply(event.detail.publicStatus, event.detail.requestDurationMs || 0);
      } catch { refresh(true); }
    };
    const visible = () => { if (document.visibilityState === "visible") refresh(true); };
    const storageChanged = event => { if (event.key === "sanctuaryStatusRefresh") refresh(true); };
    refresh();
    // Polling covers clock boundaries, browsers without EventSource and multiple
    // server instances. Save events and same-instance notifications are immediate.
    const timer = window.setInterval(() => refresh(), 10000);
    const stream = typeof window.EventSource === "function" ? new EventSource(`${api.defaults.baseURL}/api/sanctuary/events`) : null;
    const liveRefresh = () => refresh(true);
    stream?.addEventListener("refresh", liveRefresh);
    if (stream) stream.onerror = liveRefresh;
    window.addEventListener("sanctuaryStatusChanged", changed);
    window.addEventListener("storage", storageChanged);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false; ++version; controller?.abort(); stream?.close();
      window.clearInterval(timer); window.clearTimeout(expiry);
      window.removeEventListener("sanctuaryStatusChanged", changed);
      window.removeEventListener("storage", storageChanged);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return <SanctuaryStatusContext.Provider value={value}>{children}</SanctuaryStatusContext.Provider>;
}

export default SanctuaryStatusProvider;
