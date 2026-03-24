import axios from "axios";

const isLiveServerOrigin =
  typeof window !== "undefined" &&
  (window.location.origin === "http://127.0.0.1:5500" ||
    window.location.origin === "http://localhost:5500");

const apiBaseURL = isLiveServerOrigin
  ? "http://127.0.0.1:5000/api"
  : import.meta.env.PROD
    ? "/api"
    : import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: apiBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindmitra-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;



