import React from "react";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Helmet } from "@dr.pogodin/react-helmet";

import { AppLayout } from "@/shared/ui/app-layout";
import { t } from "@lingui/core/macro";

const env = import.meta.env;
const TanStackRouterDevtools =
  env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

function RootComponent() {
  return (
    <AppLayout>
      <Helmet
        defaultTitle={t`IQ Key Value Platform`}
        titleTemplate={t`%s | IQ Key Value Platform`}
      />
      <Outlet />
      <TanStackRouterDevtools />
    </AppLayout>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
