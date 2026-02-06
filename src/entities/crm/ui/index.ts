// CRM domain components
export * from "./LeadCard";
export * from "./LeadScoreBadge";
export * from "./LeadSourceBadge";
export * from "./LeadForm";
export * from "./FollowUpForm";
export * from "./ContactCard";
export * from "./ContactForm";

// CRM-specific UI components
export { CrmServiceDegradationBanner } from "./CrmServiceDegradationBanner";

// CRM access guards
export {
  CrmAccessGuard,
  CrmContactManagerGuard,
  CrmLeadManagerGuard,
  CrmPipelineManagerGuard,
} from "./guards";
