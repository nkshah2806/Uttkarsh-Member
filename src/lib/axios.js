import axios from "axios";
import { Config } from "./Config";
import { startLoading, stopLoading } from "./globalLoading";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${Config.API_HOST_URl}`,
  // timeout: 10000, // Optional: request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Track requests that should drive the global loader. Background calls (for
// example on-demand translation batches) opt out via `{ silent: true }`.
const isSilent = (config) => Boolean(config && config.silent) || config?.headers?.["X-Silent"] === "1";

// Optional: Add request interceptor (e.g., attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!isSilent(config)) {
      config.__globalLoadingTracked = true;
      startLoading();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.config?.__globalLoadingTracked) {
      stopLoading();
    }
    return response;
  },
  (error) => {
    if (error?.config?.__globalLoadingTracked) {
      stopLoading();
    }
    // Global error handling
    if (error.response?.status === 401) {
      // e.g., redirect to login or logout
      console.warn("Unauthorized, logging out...");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
