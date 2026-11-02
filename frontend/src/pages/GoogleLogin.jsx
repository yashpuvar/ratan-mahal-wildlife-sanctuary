
import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";

function GoogleLoginPage() {
  const googleClientIdConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim());
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      if (!credentialResponse?.credential) throw new Error("Google sign-in did not return a credential.");
      const response = await api.post("/api/auth/google/login", {
        credential: credentialResponse.credential,
      });
      const data = response.data;

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));
      navigate(location.state?.from || "/");
    } catch (error) {
      console.error("Google Login Error:", error);
      setError(error.response?.data?.message || error.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#061a17] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Welcome to Ratan Mahal
        </h1>

        <p className="mb-6 text-gray-600">
          Sign in with Google to continue
        </p>

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="mb-4 text-sm text-gray-600">Signing you in…</p>}

        {googleClientIdConfigured ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              useOneTap={false}
              onError={() => {
                setError("Google sign-in was cancelled or could not start. Please try again.");
              }}
            />
          </div>
        ) : (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Google sign-in is not configured for this deployment. Please try again later or contact the site administrator.
          </p>
        )}

      </div>
    </div>
  );
}

export default GoogleLoginPage;
