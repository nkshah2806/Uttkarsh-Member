
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderCustom } from "./components/theme-context";
import ErrorBoundary from "./components/ErrorBoundary";
import { GlobalLoader, TranslationLoader } from "./components/Loader";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProviderCustom>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalLoader />
          <TranslationLoader />
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ThemeProviderCustom>
  </ErrorBoundary>
);
