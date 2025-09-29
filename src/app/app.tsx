import { StrictMode, useEffect } from "react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";

// Import the generated route tree
import { routeTree } from "@/routeTree.gen";
import { theme } from "./theme";
import { queryClient } from "@/shared/lib";

import { ErrorBoundary } from "@/shared/ui";
import { dynamicActivateLocale, getClientLocale } from "@/shared/locales";
import { ConfirmContextModal } from "@/shared/ui/confirmation-modal";

// Import Mantine styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  useEffect(() => {
    // Activate locale based on cookie or browser
    dynamicActivateLocale(getClientLocale());
  }, []);

  return (
    <StrictMode>
      <HelmetProvider>
        <I18nProvider i18n={i18n}>
          <ErrorBoundary>
            <MantineProvider theme={theme}>
              <ModalsProvider modals={{ confirmation: ConfirmContextModal }}>
                <Notifications />
                <QueryClientProvider client={queryClient}>
                  <RouterProvider router={router} />
                  <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
              </ModalsProvider>
            </MantineProvider>
          </ErrorBoundary>
        </I18nProvider>
      </HelmetProvider>
    </StrictMode>
  );
}
