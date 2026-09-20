import axios from "axios";
import { Config } from "./Config";
import { startLoading, stopLoading } from "./globalLoading";

// Create an Axios instance.
//
// ROOT CAUSE FIX (profile image upload sent `profileImage: {}`):
// This instance used to declare a default `headers: { "Content-Type":
// "application/json" }`. Axios picks the request encoding from the *resolved*
// Content-Type, so every request body — FormData included — was routed through
// the JSON transform:
//
//   // node_modules/axios/lib/defaults/index.js
//   if (utils.isFormData(data)) {
//     return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
//   }
//
// `formDataToJSON()` copies each FormData entry into a plain object and a
// browser `File` has no enumerable own properties, so the selected image
// collapsed to `{ profileImage: {} }`. The backend then received a JSON body,
// multer never parsed a multipart part, `req.file` stayed undefined and the
// API answered HTTP 400 "NO_FILE".
//
// Axios already sets "application/json" on its own for plain-object payloads,
// so dropping the instance default changes nothing for JSON endpoints. FormData
// bodies are additionally protected by the request interceptor below.
const axiosInstance = axios.create({
  baseURL: `${Config.API_HOST_URl}`,
  // timeout: 10000, // Optional: request timeout
});

/**
 * Keep multipart bodies as native FormData.
 *
 * Removes any pre-existing Content-Type (instance default or one passed by a
 * caller) so it can neither trigger axios' JSON serialization nor send a
 * boundary-less `multipart/form-data` header. The browser then generates the
 * correct `multipart/form-data; boundary=...` value itself.
 */
const stripContentTypeForFormData = (config) => {
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (!isFormData) return;
  // AxiosHeaders#setContentType(undefined) removes the header (undefined values
  // are skipped when the headers are serialized for the wire).
  if (typeof config.headers?.setContentType === "function") {
    config.headers.setContentType(undefined);
  }
  delete config.headers?.["Content-Type"];
  delete config.headers?.["content-type"];
};

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
    stripContentTypeForFormData(config);
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
