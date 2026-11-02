import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const fallbackApiUrl = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://ratan-mahal-backend.onrender.com";

const api = axios.create({
  baseURL: (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, ""),
});

api.interceptors.request.use((config) => {
  const visitorPhotoSubmission = config.url?.startsWith("/api/gallery/visitor") && config.method !== "get" && !config.url.includes("/admin/");
  const visitorPhotoAdmin = config.url?.startsWith("/api/gallery/visitor/admin/");
  const isAdminRequest = visitorPhotoAdmin || (!visitorPhotoSubmission && (config.url?.startsWith("/api/admin/") || config.url?.startsWith("/api/sanctuary/admin/") ||
    ["/api/posts", "/api/gallery", "/api/videos", "/api/contacts", "/api/bookings"].some(
      (path) => config.url?.startsWith(path) && config.method !== "get"
    ) || ["/api/contacts", "/api/bookings"].some((path) => config.url?.startsWith(path))));
  const token = isAdminRequest
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const visitorPhotoSubmission = url.startsWith("/api/gallery/visitor") && error.config?.method !== "get" && !url.includes("/admin/");
      const visitorPhotoAdmin = url.startsWith("/api/gallery/visitor/admin/");
      const adminRequest = visitorPhotoAdmin || (!visitorPhotoSubmission && (url.startsWith("/api/admin/") || url.startsWith("/api/sanctuary/admin/") ||
        ["/api/contacts", "/api/bookings"].some((path) => url.startsWith(path)) ||
        (["/api/posts", "/api/gallery", "/api/videos"].some((path) => url.startsWith(path)) && error.config?.method !== "get")));
      if (adminRequest) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      window.dispatchEvent(new Event("authChanged"));
    }
    return Promise.reject(error);
  }
);

export default api;
