import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/api/admin/login",
        formData
      );

      // Save token & admin details in browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify(response.data.admin));
      window.dispatchEvent(new Event("authChanged"));

      // Redirect to Dashboard
      navigate(response.data.admin?.mustChangePassword ? "/admin/change-password" : "/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020d0a] flex items-center justify-center px-5 py-16 text-white">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-950/60 text-3xl shadow-lg">
            🐻
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Ratan Mahal Wildlife Sanctuary
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-white/10 bg-[#061e17] p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-3.5 text-sm text-red-200">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2"
              >
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/60 transition duration-300 hover:from-emerald-400 hover:to-green-500 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;
