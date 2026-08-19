import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "";
const API_URL = rawUrl
  ? (rawUrl.replace(/\/$/, "").endsWith("/api") ? rawUrl.replace(/\/$/, "") : `${rawUrl.replace(/\/$/, "")}/api`)
  : "/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("BIGO_JWT_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("BIGO_JWT_TOKEN");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bigo:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default client;
