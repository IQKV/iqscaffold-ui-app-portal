// Generic access guard
export { ServiceAccessGuard } from "./ServiceAccessGuard";

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================
// Feature-specific guards have been moved to their respective entity layers.
// Re-exporting here for backward compatibility during migration.
// TODO: Update all imports to use entity-specific paths and remove these exports

// Billing guards (moved to @/entities/billing/ui/guards)
export { BillingAccessGuard, BillingManagerGuard } from "@/entities/billing/ui";

// CRM guards (moved to @/entities/crm/ui/guards)
export {
  CrmAccessGuard,
  CrmLeadManagerGuard,
  CrmContactManagerGuard,
  CrmPipelineManagerGuard,
} from "@/entities/crm/ui";
