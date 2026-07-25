
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderCustom } from "./components/theme-context";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <ThemeProviderCustom>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ThemeProviderCustom>
);
