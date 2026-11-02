import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../lib/api";

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let active = true;
    api.get("/api/auth/google/me")
      .then(({ data }) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(data.user));
        setAuthorized(data.user?.role === "user");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (active) setAuthorized(false);
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;
  if (checking) return <div className="min-h-screen bg-[#061a17] p-8 text-center text-white">Checking sign-in…</div>;
  if (!authorized) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
