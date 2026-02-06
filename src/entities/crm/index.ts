// CRM Entity Public API
// Following billing service pattern for consistency

export * from "./api/queries";
export * from "./api/mutations";
export * from "./ui/LeadCard";
export * from "./ui/ContactCard";
export * from "./ui/LeadForm";
export * from "./ui/ContactForm";
export * from "./ui/FollowUpForm";
export * from "./ui/LeadScoreBadge";
export * from "./ui/LeadSourceBadge";
export * from "./ui/CrmFormField";
export * from "./lib";
export * from "./lib/types";

// CRM-specific UI components and guards
export * from "./ui/CrmServiceDegradationBanner";
export * from "./ui/guards";
