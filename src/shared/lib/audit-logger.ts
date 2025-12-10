/**
 * Security Audit Logger
 * Logs security-related events for compliance and monitoring
 */

import { Authority, SecurityContext } from "@/shared/types/authority";

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  tenantId?: string;
  sessionId: string;
  eventType: AuditEventType;
  resource: string;
  action: string;
  authorities: Authority[];
  success: boolean;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditEventType {
  ACCESS_GRANTED = "access_granted",
  ACCESS_DENIED = "access_denied",
  AUTHORITY_CHECK = "authority_check",
  RESOURCE_ACCESS = "resource_access",
  SENSITIVE_DATA_ACCESS = "sensitive_data_access",
  PRIVILEGE_ESCALATION = "privilege_escalation",
}

export interface AuditLogger {
  logAccessAttempt(
    context: SecurityContext,
    authorities: Authority[],
    resource: string,
    action: string,
    success: boolean,
    details?: Record<string, any>
  ): void;

  logAuthorityCheck(
    context: SecurityContext,
    authorities: Authority[],
    requiredAuthority: Authority,
    success: boolean
  ): void;

  logSensitiveDataAccess(
    context: SecurityContext,
    authorities: Authority[],
    dataType: string,
    recordCount: number
  ): void;

  logPrivilegeEscalation(
    context: SecurityContext,
    fromAuthorities: Authority[],
    toAuthorities: Authority[],
    reason: string
  ): void;
}

class SecurityAuditLogger implements AuditLogger {
  private events: AuditEvent[] = [];

  logAccessAttempt(
    context: SecurityContext,
    authorities: Authority[],
    resource: string,
    action: string,
    success: boolean,
    details?: Record<string, any>
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: context.userId,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      eventType: success
        ? AuditEventType.ACCESS_GRANTED
        : AuditEventType.ACCESS_DENIED,
      resource,
      action,
      authorities,
      success,
      details,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    this.recordEvent(event);
  }

  logAuthorityCheck(
    context: SecurityContext,
    authorities: Authority[],
    requiredAuthority: Authority,
    success: boolean
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: context.userId,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      eventType: AuditEventType.AUTHORITY_CHECK,
      resource: "authority",
      action: "check",
      authorities,
      success,
      details: {
        requiredAuthority,
        userAuthorities: authorities,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    this.recordEvent(event);
  }

  logSensitiveDataAccess(
    context: SecurityContext,
    authorities: Authority[],
    dataType: string,
    recordCount: number
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: context.userId,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      eventType: AuditEventType.SENSITIVE_DATA_ACCESS,
      resource: dataType,
      action: "read",
      authorities,
      success: true,
      details: {
        recordCount,
        dataType,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    this.recordEvent(event);
  }

  logPrivilegeEscalation(
    context: SecurityContext,
    fromAuthorities: Authority[],
    toAuthorities: Authority[],
    reason: string
  ): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: context.userId,
      tenantId: context.tenantId,
      sessionId: context.sessionId,
      eventType: AuditEventType.PRIVILEGE_ESCALATION,
      resource: "authority",
      action: "escalate",
      authorities: toAuthorities,
      success: true,
      details: {
        fromAuthorities,
        toAuthorities,
        reason,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    this.recordEvent(event);
  }

  private recordEvent(event: AuditEvent): void {
    // Store event locally (in production, this would send to audit service)
    this.events.push(event);

    // Log to console for development
    console.log("[AUDIT]", {
      type: event.eventType,
      user: event.userId,
      tenant: event.tenantId,
      resource: event.resource,
      action: event.action,
      success: event.success,
      timestamp: event.timestamp.toISOString(),
    });

    // In production, send to audit service
    this.sendToAuditService(event);
  }

  private async sendToAuditService(event: AuditEvent): Promise<void> {
    try {
      // In production, this would send to a secure audit service
      // For now, we'll just store locally
      const auditLogs = this.getStoredAuditLogs();
      auditLogs.push(event);
      localStorage.setItem(
        "audit_logs",
        JSON.stringify(auditLogs.slice(-1000))
      ); // Keep last 1000 events
    } catch (error) {
      console.error("Failed to store audit event:", error);
    }
  }

  private getStoredAuditLogs(): AuditEvent[] {
    try {
      const stored = localStorage.getItem("audit_logs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to retrieve audit logs (for admin interfaces)
  getAuditLogs(filters?: {
    userId?: string;
    tenantId?: string;
    eventType?: AuditEventType;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditEvent[] {
    let logs = this.getStoredAuditLogs();

    if (filters) {
      logs = logs.filter((log) => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.tenantId && log.tenantId !== filters.tenantId) return false;
        if (filters.eventType && log.eventType !== filters.eventType)
          return false;
        if (filters.resource && log.resource !== filters.resource) return false;
        if (filters.startDate && log.timestamp < filters.startDate)
          return false;
        if (filters.endDate && log.timestamp > filters.endDate) return false;
        return true;
      });
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Singleton instance
export const auditLogger = new SecurityAuditLogger();
