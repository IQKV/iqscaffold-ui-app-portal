import { BillingCycle, Plan, Subscription } from "@/shared/types/billing";
import { LocaleCurrencyUtils, LocaleDateUtils } from "./i18n/locale-formatting";

/**
 * Currency formatting utilities with locale support
 * @deprecated Use LocaleCurrencyUtils instead for better i18n support
 */
export class CurrencyUtils {
  /**
   * Format currency amount with locale-specific formatting
   */
  static format(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
  ): string {
    return LocaleCurrencyUtils.format(amount, currency, locale);
  }

  /**
   * Parse currency string to number
   */
  static parse(currencyString: string): number {
    // Remove currency symbols and parse
    const numericString = currencyString.replace(/[^\d.-]/g, "");
    return parseFloat(numericString) || 0;
  }

  /**
   * Convert between currencies (placeholder for actual conversion service)
   */
  static convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRate?: number
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    // In real implementation, this would call an exchange rate service
    return amount * (exchangeRate || 1);
  }

  /**
   * Calculate tax amount
   */
  static calculateTax(amount: number, taxRate: number): number {
    return Math.round(amount * taxRate * 100) / 100;
  }
}

/**
 * Date calculation utilities for billing periods
 * @deprecated Use LocaleDateUtils instead for better i18n support
 */
export class BillingDateUtils {
  /**
   * Format billing date with locale support
   */
  static formatBillingDate(date: Date, locale: string = "en-US"): string {
    return LocaleDateUtils.formatDate(date, locale);
  }

  /**
   * Calculate billing period end date
   */
  static calculateBillingPeriod(
    start: Date,
    cycle: BillingCycle
  ): { start: Date; end: Date } {
    const end = new Date(start);

    switch (cycle) {
      case BillingCycle.MONTHLY:
        end.setMonth(end.getMonth() + 1);
        break;
      case BillingCycle.YEARLY:
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        throw new Error(`Unsupported billing cycle: ${cycle}`);
    }

    return { start: new Date(start), end };
  }

  /**
   * Check if date is within grace period
   */
  static isWithinGracePeriod(date: Date, graceDays: number): boolean {
    const now = new Date();
    const graceEnd = new Date(date);
    graceEnd.setDate(graceEnd.getDate() + graceDays);
    return now <= graceEnd;
  }

  /**
   * Calculate days remaining in billing period
   */
  static getDaysRemaining(periodEnd: Date): number {
    const now = new Date();
    const diffTime = periodEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get next billing date based on cycle
   */
  static getNextBillingDate(lastBillingDate: Date, cycle: BillingCycle): Date {
    const nextDate = new Date(lastBillingDate);

    switch (cycle) {
      case BillingCycle.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case BillingCycle.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}

/**
 * Proration calculation utilities
 */
export class ProrationUtils {
  /**
   * Calculate proration amount for plan changes
   */
  static calculateProration(
    oldPlan: Plan,
    newPlan: Plan,
    periodStart: Date,
    periodEnd: Date,
    changeDate: Date = new Date()
  ): number {
    const totalPeriodDays = this.getDaysBetween(periodStart, periodEnd);
    const remainingDays = this.getDaysBetween(changeDate, periodEnd);

    if (remainingDays <= 0) {
      return 0;
    }

    const dailyOldRate = oldPlan.price / totalPeriodDays;
    const dailyNewRate = newPlan.price / totalPeriodDays;

    const oldPlanCredit = dailyOldRate * remainingDays;
    const newPlanCharge = dailyNewRate * remainingDays;

    return Math.round((newPlanCharge - oldPlanCredit) * 100) / 100;
  }

  /**
   * Calculate usage-based proration
   */
  static calculateUsageProration(
    baseAmount: number,
    usagePercentage: number,
    periodStart: Date,
    periodEnd: Date,
    usageDate: Date = new Date()
  ): number {
    const totalPeriodDays = this.getDaysBetween(periodStart, periodEnd);
    const usageDays = this.getDaysBetween(periodStart, usageDate);

    const dailyRate = baseAmount / totalPeriodDays;
    const prorationFactor = usageDays / totalPeriodDays;

    return Math.round(dailyRate * usageDays * usagePercentage * 100) / 100;
  }

  /**
   * Calculate credit for downgrades
   */
  static calculateDowngradeCredit(
    currentPlan: Plan,
    newPlan: Plan,
    periodStart: Date,
    periodEnd: Date,
    changeDate: Date = new Date()
  ): number {
    const proration = this.calculateProration(
      currentPlan,
      newPlan,
      periodStart,
      periodEnd,
      changeDate
    );

    // Return positive credit amount for downgrades
    return proration < 0 ? Math.abs(proration) : 0;
  }

  private static getDaysBetween(start: Date, end: Date): number {
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Usage calculation utilities
 */
export class UsageUtils {
  /**
   * Calculate usage percentage
   */
  static calculateUsagePercentage(current: number, limit: number): number {
    if (limit === 0) {
      return 0;
    }
    return Math.round((current / limit) * 100);
  }

  /**
   * Check if usage is within grace period
   */
  static isWithinGracePeriod(
    current: number,
    limit: number,
    gracePercentage: number = 5
  ): boolean {
    const graceLimit = limit * (1 + gracePercentage / 100);
    return current <= graceLimit;
  }

  /**
   * Calculate overage amount
   */
  static calculateOverage(
    current: number,
    limit: number,
    overageRate: number
  ): number {
    const overage = Math.max(0, current - limit);
    return Math.round(overage * overageRate * 100) / 100;
  }

  /**
   * Get usage status
   */
  static getUsageStatus(
    current: number,
    limit: number,
    gracePercentage: number = 5
  ): "normal" | "warning" | "exceeded" | "grace" {
    const percentage = this.calculateUsagePercentage(current, limit);

    if (percentage >= 100) {
      return this.isWithinGracePeriod(current, limit, gracePercentage)
        ? "grace"
        : "exceeded";
    }

    return percentage >= 90 ? "warning" : "normal";
  }
}

/**
 * Subscription utilities
 */
export class SubscriptionUtils {
  /**
   * Check if subscription is active
   */
  static isActive(subscription: Subscription): boolean {
    return (
      subscription.status === "active" || subscription.status === "trialing"
    );
  }

  /**
   * Check if subscription is in trial
   */
  static isInTrial(subscription: Subscription): boolean {
    return (
      subscription.status === "trialing" &&
      subscription.trialEnd &&
      new Date(subscription.trialEnd) > new Date()
    );
  }

  /**
   * Get trial days remaining
   */
  static getTrialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trialEnd) {
      return 0;
    }
    return BillingDateUtils.getDaysRemaining(new Date(subscription.trialEnd));
  }

  /**
   * Check if subscription can be upgraded
   */
  static canUpgrade(subscription: Subscription, targetPlan: Plan): boolean {
    return this.isActive(subscription) && subscription.planId !== targetPlan.id;
  }

  /**
   * Check if subscription can be downgraded
   */
  static canDowngrade(subscription: Subscription, targetPlan: Plan): boolean {
    return this.isActive(subscription) && subscription.planId !== targetPlan.id;
  }
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate credit card number (basic Luhn algorithm)
   */
  static isValidCreditCard(number: string): boolean {
    const cleanNumber = number.replace(/\D/g, "");

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate currency amount
   */
  static isValidCurrency(amount: string): boolean {
    const currencyRegex = /^\d+(\.\d{1,2})?$/;
    return currencyRegex.test(amount);
  }

  /**
   * Validate CVV
   */
  static isValidCVV(cvv: string): boolean {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
  }
}
