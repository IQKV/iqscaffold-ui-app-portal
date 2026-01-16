/**
 * Performance Monitoring Utilities
 *
 * Tracks CRM-specific metrics, user interactions, API response times, and error rates.
 * Implements performance budgets and provides insights for optimization.
 *
 * Features:
 * - Track user interactions and component render times
 * - Monitor API response times and error rates
 * - Implement performance budgets with warnings
 * - Collect and report performance metrics
 * - Integration with browser Performance API
 *
 * Requirements: 13.7
 */

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface APIPerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
}

export interface UserInteractionMetric {
  action: string;
  component: string;
  duration?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Performance budgets (in milliseconds)
export const PERFORMANCE_BUDGETS = {
  API_RESPONSE: 1000, // API calls should complete within 1 second
  COMPONENT_RENDER: 100, // Components should render within 100ms
  PAGE_LOAD: 3000, // Pages should load within 3 seconds
  INTERACTION: 50, // User interactions should respond within 50ms
} as const;

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: APIPerformanceMetric[] = [];
  private interactionMetrics: UserInteractionMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private isEnabled = true;

  constructor() {
    // Check if Performance API is available
    if (typeof window === "undefined" || !window.performance) {
      this.isEnabled = false;
      console.warn("Performance API not available");
    }
  }

  /**
   * Track a generic performance metric
   */
  trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.trimMetrics();

    // Check against performance budget
    this.checkBudget(name, value);

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${value}ms`, metadata);
    }
  }

  /**
   * Track API call performance
   */
  trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    success: boolean
  ) {
    if (!this.isEnabled) {
      return;
    }

    const metric: APIPerformanceMetric = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
      success,
    };

    this.apiMetrics.push(metric);
    this.trimMetrics();

    // Check against API budget
    if (duration > PERFORMANCE_BUDGETS.API_RESPONSE) {
      console.warn(
        `[Performance] Slow API call: ${method} ${endpoint} took ${duration}ms (budget: ${PERFORMANCE_BUDGETS.API_RESPONSE}ms)`
      );
    }

    // Track error rate
    if (!success) {
      this.trackMetric("api_error", 1, { endpoint, method, status });
    }
  }

  /**
   * Track user interaction performance
   */
  trackInteraction(
    action: string,
    component: string,
    duration?: number,
    metadata?: Record<string, any>
  ) {
    if (!this.isEnabled) {
      return;
    }

    const metric: UserInteractionMetric = {
      action,
      component,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.interactionMetrics.push(metric);
    this.trimMetrics();

    // Check against interaction budget
    if (duration && duration > PERFORMANCE_BUDGETS.INTERACTION) {
      console.warn(
        `[Performance] Slow interaction: ${action} in ${component} took ${duration}ms (budget: ${PERFORMANCE_BUDGETS.INTERACTION}ms)`
      );
    }
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, callback: () => void) {
    if (!this.isEnabled) {
      callback();
      return;
    }

    const startTime = performance.now();
    callback();
    const duration = performance.now() - startTime;

    this.trackMetric("component_render", duration, {
      component: componentName,
    });

    if (duration > PERFORMANCE_BUDGETS.COMPONENT_RENDER) {
      console.warn(
        `[Performance] Slow render: ${componentName} took ${duration}ms (budget: ${PERFORMANCE_BUDGETS.COMPONENT_RENDER}ms)`
      );
    }
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      this.trackMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    if (!this.isEnabled) {
      return null;
    }

    const apiStats = this.calculateAPIStats();
    const renderStats = this.calculateRenderStats();
    const interactionStats = this.calculateInteractionStats();

    return {
      api: apiStats,
      render: renderStats,
      interaction: interactionStats,
      totalMetrics: this.metrics.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate API statistics
   */
  private calculateAPIStats() {
    if (this.apiMetrics.length === 0) {
      return null;
    }

    const durations = this.apiMetrics.map((m) => m.duration);
    const errors = this.apiMetrics.filter((m) => !m.success).length;

    return {
      count: this.apiMetrics.length,
      averageDuration: this.average(durations),
      medianDuration: this.median(durations),
      p95Duration: this.percentile(durations, 95),
      errorRate: (errors / this.apiMetrics.length) * 100,
      slowCalls: this.apiMetrics.filter(
        (m) => m.duration > PERFORMANCE_BUDGETS.API_RESPONSE
      ).length,
    };
  }

  /**
   * Calculate render statistics
   */
  private calculateRenderStats() {
    const renderMetrics = this.metrics.filter(
      (m) => m.name === "component_render"
    );

    if (renderMetrics.length === 0) {
      return null;
    }

    const durations = renderMetrics.map((m) => m.value);

    return {
      count: renderMetrics.length,
      averageDuration: this.average(durations),
      medianDuration: this.median(durations),
      p95Duration: this.percentile(durations, 95),
      slowRenders: renderMetrics.filter(
        (m) => m.value > PERFORMANCE_BUDGETS.COMPONENT_RENDER
      ).length,
    };
  }

  /**
   * Calculate interaction statistics
   */
  private calculateInteractionStats() {
    if (this.interactionMetrics.length === 0) {
      return null;
    }

    const withDuration = this.interactionMetrics.filter(
      (m) => m.duration !== undefined
    );
    const durations = withDuration.map((m) => m.duration!);

    return {
      count: this.interactionMetrics.length,
      averageDuration: durations.length > 0 ? this.average(durations) : 0,
      medianDuration: durations.length > 0 ? this.median(durations) : 0,
      slowInteractions: withDuration.filter(
        (m) => m.duration! > PERFORMANCE_BUDGETS.INTERACTION
      ).length,
    };
  }

  /**
   * Check performance budget
   */
  private checkBudget(name: string, value: number) {
    const budgetKey = name
      .toUpperCase()
      .replace(/_/g, "_") as keyof typeof PERFORMANCE_BUDGETS;
    const budget = PERFORMANCE_BUDGETS[budgetKey];

    if (budget && value > budget) {
      console.warn(
        `[Performance Budget] ${name} exceeded budget: ${value}ms > ${budget}ms`
      );
    }
  }

  /**
   * Trim metrics to max size
   */
  private trimMetrics() {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics);
    }
    if (this.interactionMetrics.length > this.maxMetrics) {
      this.interactionMetrics = this.interactionMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Calculate average
   */
  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate median
   */
  private median(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) {
      return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.apiMetrics = [];
    this.interactionMetrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      metrics: this.metrics,
      apiMetrics: this.apiMetrics,
      interactionMetrics: this.interactionMetrics,
      stats: this.getStats(),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    trackMetric: performanceMonitor.trackMetric.bind(performanceMonitor),
    trackAPICall: performanceMonitor.trackAPICall.bind(performanceMonitor),
    trackInteraction:
      performanceMonitor.trackInteraction.bind(performanceMonitor),
    measureRender: performanceMonitor.measureRender.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor),
  };
}
