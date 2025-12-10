/**
 * Authority and Role-Based Access Control Types
 * Defines the authority system for billing operations
 */

export enum Authority {
  TENANT_ADMIN = "tenant_admin",
  PLATFORM_ADMIN = "platform_admin",
  SUPPORT_AGENT = "support_agent",
  BILLING_VIEWER = "billing_viewer",
}

export interface UserAuthority {
  userId: string;
  tenantId?: string;
  authorities: Authority[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorityCheck {
  authority: Authority;
  resource: string;
  action: string;
  tenantId?: string;
}

export interface SecurityContext {
  tenantId?: string;
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComponentVisibility {
  pages: string[];
  widgets: string[];
  actions: string[];
  fields: string[];
}

export interface AuthorityRule {
  authority: Authority;
  resource: string;
  actions: string[];
  tenantScoped: boolean;
  conditions?: Record<string, any>;
}

// Authority-based access control configuration
export const AUTHORITY_RULES: AuthorityRule[] = [
  // Tenant Admin Rules
  {
    authority: Authority.TENANT_ADMIN,
    resource: "subscription",
    actions: ["read", "update", "cancel", "upgrade", "downgrade"],
    tenantScoped: true,
  },
  {
    authority: Authority.TENANT_ADMIN,
    resource: "payment_method",
    actions: ["read", "create", "update", "delete", "set_default"],
    tenantScoped: true,
  },
  {
    authority: Authority.TENANT_ADMIN,
    resource: "invoice",
    actions: ["read", "download", "retry_payment"],
    tenantScoped: true,
  },
  {
    authority: Authority.TENANT_ADMIN,
    resource: "usage",
    actions: ["read"],
    tenantScoped: true,
  },

  // Platform Admin Rules
  {
    authority: Authority.PLATFORM_ADMIN,
    resource: "subscription",
    actions: [
      "read",
      "create",
      "update",
      "delete",
      "cancel",
      "upgrade",
      "downgrade",
      "suspend",
      "reactivate",
    ],
    tenantScoped: false,
  },
  {
    authority: Authority.PLATFORM_ADMIN,
    resource: "payment_method",
    actions: ["read", "create", "update", "delete", "set_default"],
    tenantScoped: false,
  },
  {
    authority: Authority.PLATFORM_ADMIN,
    resource: "invoice",
    actions: [
      "read",
      "create",
      "update",
      "delete",
      "download",
      "retry_payment",
      "refund",
    ],
    tenantScoped: false,
  },
  {
    authority: Authority.PLATFORM_ADMIN,
    resource: "usage",
    actions: ["read", "update", "reset"],
    tenantScoped: false,
  },
  {
    authority: Authority.PLATFORM_ADMIN,
    resource: "analytics",
    actions: ["read", "export"],
    tenantScoped: false,
  },

  // Support Agent Rules
  {
    authority: Authority.SUPPORT_AGENT,
    resource: "subscription",
    actions: ["read", "extend_trial"],
    tenantScoped: true,
    conditions: { requiresApproval: true },
  },
  {
    authority: Authority.SUPPORT_AGENT,
    resource: "payment_method",
    actions: ["read"],
    tenantScoped: true,
  },
  {
    authority: Authority.SUPPORT_AGENT,
    resource: "invoice",
    actions: ["read", "download", "retry_payment"],
    tenantScoped: true,
    conditions: { requiresApproval: true },
  },
  {
    authority: Authority.SUPPORT_AGENT,
    resource: "usage",
    actions: ["read"],
    tenantScoped: true,
  },
  {
    authority: Authority.SUPPORT_AGENT,
    resource: "refund",
    actions: ["create"],
    tenantScoped: true,
    conditions: { requiresApproval: true, maxAmount: 1000 },
  },

  // Billing Viewer Rules
  {
    authority: Authority.BILLING_VIEWER,
    resource: "subscription",
    actions: ["read"],
    tenantScoped: true,
  },
  {
    authority: Authority.BILLING_VIEWER,
    resource: "invoice",
    actions: ["read", "download"],
    tenantScoped: true,
  },
  {
    authority: Authority.BILLING_VIEWER,
    resource: "usage",
    actions: ["read"],
    tenantScoped: true,
  },
  {
    authority: Authority.BILLING_VIEWER,
    resource: "analytics",
    actions: ["read"],
    tenantScoped: true,
  },
];

// Widget visibility matrix based on authorities
export const WIDGET_VISIBILITY_MATRIX: Record<string, Authority[]> = {
  // Dashboard Widgets
  BillingOverview: [Authority.TENANT_ADMIN, Authority.PLATFORM_ADMIN],
  SubscriptionCard: [
    Authority.TENANT_ADMIN,
    Authority.PLATFORM_ADMIN,
    Authority.SUPPORT_AGENT,
  ],
  PaymentMethods: [Authority.TENANT_ADMIN],
  UsageMetrics: [
    Authority.TENANT_ADMIN,
    Authority.PLATFORM_ADMIN,
    Authority.BILLING_VIEWER,
  ],
  InvoiceHistory: [
    Authority.TENANT_ADMIN,
    Authority.PLATFORM_ADMIN,
    Authority.SUPPORT_AGENT,
    Authority.BILLING_VIEWER,
  ],

  // Analytics Widgets
  RevenueAnalytics: [Authority.PLATFORM_ADMIN, Authority.BILLING_VIEWER],
  ChurnAnalysis: [Authority.PLATFORM_ADMIN],
  CohortAnalysis: [Authority.PLATFORM_ADMIN],
  UsageAnalytics: [
    Authority.TENANT_ADMIN,
    Authority.PLATFORM_ADMIN,
    Authority.BILLING_VIEWER,
  ],

  // Admin Widgets
  TenantManagement: [Authority.PLATFORM_ADMIN],
  SystemHealth: [Authority.PLATFORM_ADMIN],
  AuditLogs: [Authority.PLATFORM_ADMIN],

  // Support Widgets
  CustomerSupport: [Authority.SUPPORT_AGENT, Authority.PLATFORM_ADMIN],
  TicketManagement: [Authority.SUPPORT_AGENT],
  RefundTools: [Authority.SUPPORT_AGENT, Authority.PLATFORM_ADMIN],
};

// Page layout configurations for different authorities
export interface PageLayoutConfig {
  authority: Authority;
  layout: {
    header: string[];
    sidebar: string[];
    main: string[];
    footer: string[];
  };
  restrictions: {
    hiddenComponents: string[];
    readOnlyComponents: string[];
    disabledActions: string[];
  };
}

export const BILLING_PAGE_LAYOUTS: PageLayoutConfig[] = [
  {
    authority: Authority.TENANT_ADMIN,
    layout: {
      header: ["BillingBreadcrumb", "TenantSelector", "QuickActions"],
      sidebar: ["SubscriptionNav", "PaymentNav", "InvoiceNav", "ReportsNav"],
      main: [
        "BillingDashboard",
        "SubscriptionCard",
        "UsageMetrics",
        "RecentInvoices",
      ],
      footer: ["SupportLinks", "DocumentationLinks"],
    },
    restrictions: {
      hiddenComponents: [],
      readOnlyComponents: [],
      disabledActions: [],
    },
  },
  {
    authority: Authority.PLATFORM_ADMIN,
    layout: {
      header: ["BillingBreadcrumb", "GlobalTenantSelector", "AdminActions"],
      sidebar: ["AllTenantsNav", "RevenueNav", "AnalyticsNav", "SystemNav"],
      main: [
        "AdminDashboard",
        "RevenueAnalytics",
        "TenantMetrics",
        "SystemHealth",
      ],
      footer: ["AdminTools", "SystemStatus"],
    },
    restrictions: {
      hiddenComponents: [],
      readOnlyComponents: [],
      disabledActions: [],
    },
  },
  {
    authority: Authority.SUPPORT_AGENT,
    layout: {
      header: ["SupportBreadcrumb", "CustomerSearch", "SupportActions"],
      sidebar: ["CustomerNav", "TicketNav", "KnowledgeBase"],
      main: ["CustomerDashboard", "SupportTools", "BillingHistory"],
      footer: ["SupportResources", "EscalationPaths"],
    },
    restrictions: {
      hiddenComponents: ["PaymentMethods", "BillingSettings"],
      readOnlyComponents: ["SubscriptionDetails", "InvoiceDetails"],
      disabledActions: ["delete", "refund"],
    },
  },
  {
    authority: Authority.BILLING_VIEWER,
    layout: {
      header: ["ReportsBreadcrumb", "DateRangeSelector"],
      sidebar: ["ReportsNav", "ExportNav"],
      main: ["ReportsDashboard", "BillingCharts", "ExportTools"],
      footer: ["ReportHelp"],
    },
    restrictions: {
      hiddenComponents: ["PaymentMethods", "SubscriptionActions"],
      readOnlyComponents: ["*"], // All components read-only
      disabledActions: ["create", "update", "delete"],
    },
  },
];
