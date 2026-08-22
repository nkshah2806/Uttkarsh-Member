const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const backendUrl =
  import.meta.env.VITE_API_URL ||
  (isLocal ? "http://localhost:1990" : "https://uttkarsh-backend.onrender.com");

export const Config = {
  API_HOST_URl: `${backendUrl}/api/`,
  API_URL: `${backendUrl}/`,
};
