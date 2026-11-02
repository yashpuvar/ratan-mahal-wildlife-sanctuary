import { useEffect, useState } from "react";
import api from "../lib/api";
import SanctuaryStatusContext from "./SanctuaryStatusContext";

function SanctuaryStatusProvider({ children }) {
  const [value, setValue] = useState({ loading: true, status: null, hours: null });

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [statusResponse, hoursResponse] = await Promise.all([
          api.get("/api/sanctuary/status", { timeout: 10000 }),
          api.get("/api/sanctuary/hours", { timeout: 10000 }),
        ]);
        if (!active) return;
        const status = statusResponse.data?.success ? statusResponse.data.data : null;
        setValue({ loading: false, status, hours: hoursResponse.data?.success ? hoursResponse.data.data : null });
      } catch (error) {
        console.error("Could not refresh sanctuary hours and status:", error);
        if (active) setValue((current) => ({ ...current, loading: false, status: null }));
      }
    };

    refresh();
    const timer = window.setInterval(refresh, 60_000);
    const refreshNow = () => refresh();
    window.addEventListener("sanctuaryStatusChanged", refreshNow);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("sanctuaryStatusChanged", refreshNow); };
  }, []);

  return <SanctuaryStatusContext.Provider value={value}>{children}</SanctuaryStatusContext.Provider>;
}

export default SanctuaryStatusProvider;
