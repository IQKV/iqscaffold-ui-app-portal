import { StrictMode, useEffect } from "react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { LocaleProvider, LocaleUtils } from "@/shared/lib/i18n";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Import the generated route tree
import { routeTree } from "@/routeTree.gen";
import { theme } from "./theme";
import { queryClient } from "@/shared/lib";
import { AuthProvider, AuthGuardWrapper } from "@/processes/auth";
import { TenantProvider } from "@/processes/tenant";

import { ErrorBoundary } from "@/shared/ui";
import { MSWDevTools } from "@/shared/ui/msw-dev-tools";
import { ConfirmContextModal } from "@/shared/ui/confirmation-modal";

// MSW setup
import { startMSW } from "@/shared/mocks";

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
    // Start MSW if enabled
    if (typeof window !== "undefined") {
      startMSW();
    }
  }, []);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
    components: "buttons",
    intent: "authorize",
    vault: true,
    currency: "USD",
  } as const;

  return (
    <StrictMode>
      <HelmetProvider>
        <LocaleProvider defaultLocale={LocaleUtils.detectLocale()}>
          <ErrorBoundary>
            <MantineProvider theme={theme} defaultColorScheme="auto">
              <ModalsProvider modals={{ confirmation: ConfirmContextModal }}>
                <Notifications />
                <QueryClientProvider client={queryClient}>
                  <TenantProvider>
                    <AuthProvider>
                      <PayPalScriptProvider options={paypalOptions}>
                        <Elements stripe={stripePromise}>
                          <AuthGuardWrapper>
                            <RouterProvider router={router} />
                            <ReactQueryDevtools initialIsOpen={false} />
                            <MSWDevTools />
                          </AuthGuardWrapper>
                        </Elements>
                      </PayPalScriptProvider>
                    </AuthProvider>
                  </TenantProvider>
                </QueryClientProvider>
              </ModalsProvider>
            </MantineProvider>
          </ErrorBoundary>
        </LocaleProvider>
      </HelmetProvider>
    </StrictMode>
  );
}
