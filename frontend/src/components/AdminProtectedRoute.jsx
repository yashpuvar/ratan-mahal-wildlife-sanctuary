
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../lib/api";

function AdminProtectedRoute() {
  const adminToken = localStorage.getItem("adminToken");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(Boolean(adminToken));
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (!adminToken) return;
    let active = true;
    api.get("/api/admin/me")
      .then(({ data }) => {
        if (!active) return;
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        setAuthorized(data.admin?.role === "admin");
        setMustChangePassword(Boolean(data.admin?.mustChangePassword));
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        if (active) setAuthorized(false);
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [adminToken]);

  if (!adminToken) return <Navigate to="/admin/login" replace />;
  if (checking) return <div className="min-h-screen bg-[#061a17] p-8 text-center text-white">Checking administrator access…</div>;
  if (!authorized) return <Navigate to="/admin/login" replace />;
  if (mustChangePassword) return <Navigate to="/admin/change-password" replace />;

  return <Outlet />;
}

export default AdminProtectedRoute;
