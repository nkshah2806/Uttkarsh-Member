import axios from "axios";
import { Config } from "./Config";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: `${Config.API_HOST_URl}`,
  // timeout: 10000, // Optional: request timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add request interceptor (e.g., attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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
