/**
 * Conditional Widget Component
 * Renders widgets based on authority visibility rules
 */

import React, { type ComponentType } from "react";
import { useWidgetVisibility } from "@/shared/lib/use-authority";

interface ConditionalWidgetProps {
  name: string;
  component: ComponentType<any>;
  props?: any;
  fallback?: React.ReactNode;
}

/**
 * Conditional Widget Renderer
 * Only renders widget if user has appropriate authorities
 */
export function ConditionalWidget({
  name,
  component: Component,
  props = {},
  fallback = null,
}: ConditionalWidgetProps) {
  const isVisible = useWidgetVisibility();

  if (!isVisible(name)) {
    return fallback as React.ReactElement;
  }

  return <Component {...props} />;
}

/**
 * Higher-Order Component for widget visibility
 */
export function withWidgetVisibility<P extends object>(
  Component: ComponentType<P>,
  widgetName: string,
  options?: {
    fallback?: React.ComponentType;
    hideOnUnauthorized?: boolean;
  }
) {
  return (props: P) => {
    const isVisible = useWidgetVisibility();
    const canAccess = isVisible(widgetName);

    if (!canAccess) {
      if (options?.hideOnUnauthorized) {
        return null;
      }
      if (options?.fallback) {
        return <options.fallback />;
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Widget Container with Authority Check
 */
interface ProtectedWidgetContainerProps {
  widgetName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function ProtectedWidgetContainer({
  widgetName,
  children,
  fallback = null,
  className,
}: ProtectedWidgetContainerProps) {
  const isVisible = useWidgetVisibility();

  if (!isVisible(widgetName)) {
    return fallback as React.ReactElement;
  }

  return <div className={className}>{children}</div>;
}
