import React from "react";
import { useAuth } from "@/processes/auth";
import { ServiceAccessGuard } from "./ServiceAccessGuard";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";

interface CrmAccessGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
  /** Whether to check service health */
  checkServiceHealth?: boolean;
}

/**
 * Guard component that restricts access to CRM features.
 * Uses the generic ServiceAccessGuard with CRM-specific configuration.
 */
export const CrmAccessGuard: React.FC<CrmAccessGuardProps> = (props) => {
  const { hasCrmAccess } = useAuth();
  const serviceHealth = useCrmServiceHealth();

  const requiredAuthorities = [
    "CRM_ACCESS",
    "CRM_LEAD_MANAGER",
    "CRM_CONTACT_MANAGER", 
    "CRM_PIPELINE_MANAGER",
    "CRM_ADMIN",
    "ADMIN",
    "SUPER_ADMIN"
  ];

  return (
    <ServiceAccessGuard
      {...props}
      featureCode="crm"
      serviceName="CRM"
      hasAccess={hasCrmAccess}
      serviceHealth={props.checkServiceHealth ? serviceHealth : undefined}
      requiredAuthorities={requiredAuthorities}
    />
  );
};