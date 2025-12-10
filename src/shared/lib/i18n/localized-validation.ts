import { msg } from "@lingui/macro";
import { MessageDescriptor } from "@lingui/core";
import { LocaleValidationUtils } from "./locale-formatting";
import { useLocale } from "./locale-provider";

/**
 * Localized validation rules for forms
 */
export class LocalizedValidation {
  /**
   * Get localized validation messages
   */
  static getMessages() {
    return {
      required: msg`This field is required`,
      invalidEmail: msg`Please enter a valid email address`,
      invalidPhone: msg`Please enter a valid phone number`,
      invalidPostalCode: msg`Please enter a valid postal code`,
      invalidCurrency: msg`Please enter a valid currency amount`,
      invalidCard: msg`Please enter a valid card number`,
      invalidCvv: msg`Please enter a valid CVV code`,
      invalidExpiry: msg`Please enter a valid expiry date`,
      minLength: msg`Must be at least {min} characters long`,
      maxLength: msg`Must be no more than {max} characters long`,
      passwordMismatch: msg`Passwords do not match`,
      weakPassword: msg`Password is too weak`,
      invalidUrl: msg`Please enter a valid URL`,
      invalidDate: msg`Please enter a valid date`,
      futureDate: msg`Date must be in the future`,
      pastDate: msg`Date must be in the past`,
      minValue: msg`Value must be at least {min}`,
      maxValue: msg`Value must be no more than {max}`,
      invalidRange: msg`Value must be between {min} and {max}`,
    };
  }

  /**
   * Create locale-aware validation rules
   */
  static createRules(locale?: string) {
    const messages = this.getMessages();
    
    return {
      required: (value: any): MessageDescriptor | true => {
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return messages.required;
        }
        return true;
      },

      email: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? true : messages.invalidEmail;
      },

      phone: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return LocaleValidationUtils.isValidPhone(value, locale)
          ? true
          : messages.invalidPhone;
      },

      postalCode: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return LocaleValidationUtils.isValidPostalCode(value, locale)
          ? true
          : messages.invalidPostalCode;
      },

      currency: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return LocaleValidationUtils.isValidCurrencyFormat(value, locale)
          ? true
          : messages.invalidCurrency;
      },

      creditCard: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        
        // Remove spaces and dashes
        const cleanNumber = value.replace(/[\s-]/g, "");
        
        // Check length
        if (cleanNumber.length < 13 || cleanNumber.length > 19) {
          return messages.invalidCard;
        }
        
        // Luhn algorithm
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
        
        return sum % 10 === 0 ? true : messages.invalidCard;
      },

      cvv: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        const cvvRegex = /^\d{3,4}$/;
        return cvvRegex.test(value) ? true : messages.invalidCvv;
      },

      expiryDate: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        
        // Expected format: MM/YY or MM/YYYY
        const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
        if (!expiryRegex.test(value)) {
          return messages.invalidExpiry;
        }
        
        const [month, year] = value.split("/");
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = year.length === 2 
          ? 2000 + parseInt(year, 10) 
          : parseInt(year, 10);
        const expMonth = parseInt(month, 10);
        
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          return messages.invalidExpiry;
        }
        
        return true;
      },

      minLength: (min: number) => (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return value.length >= min ? true : messages.minLength;
      },

      maxLength: (max: number) => (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return value.length <= max ? true : messages.maxLength;
      },

      passwordStrength: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const isLongEnough = value.length >= 8;
        
        const strength = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough]
          .filter(Boolean).length;
        
        return strength >= 4 ? true : messages.weakPassword;
      },

      matchPassword: (originalPassword: string) => (value: string): MessageDescriptor | true => {
        if (!value) return true;
        return value === originalPassword ? true : messages.passwordMismatch;
      },

      url: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return messages.invalidUrl;
        }
      },

      futureDate: (value: string | Date): MessageDescriptor | true => {
        if (!value) return true;
        const date = typeof value === "string" ? new Date(value) : value;
        return date > new Date() ? true : messages.futureDate;
      },

      pastDate: (value: string | Date): MessageDescriptor | true => {
        if (!value) return true;
        const date = typeof value === "string" ? new Date(value) : value;
        return date < new Date() ? true : messages.pastDate;
      },

      minValue: (min: number) => (value: number): MessageDescriptor | true => {
        if (value == null) return true;
        return value >= min ? true : messages.minValue;
      },

      maxValue: (max: number) => (value: number): MessageDescriptor | true => {
        if (value == null) return true;
        return value <= max ? true : messages.maxValue;
      },

      range: (min: number, max: number) => (value: number): MessageDescriptor | true => {
        if (value == null) return true;
        return value >= min && value <= max ? true : messages.invalidRange;
      },
    };
  }
}

/**
 * Hook for using localized validation rules
 */
export const useLocalizedValidation = () => {
  const { locale } = useLocale();
  
  return LocalizedValidation.createRules(locale);
};

/**
 * Billing-specific validation rules
 */
export class BillingValidation extends LocalizedValidation {
  static getBillingMessages() {
    return {
      ...this.getMessages(),
      invalidPlan: msg`Please select a valid plan`,
      invalidBillingCycle: msg`Please select a billing cycle`,
      invalidPaymentMethod: msg`Please select a payment method`,
      insufficientFunds: msg`Insufficient funds for this transaction`,
      cardDeclined: msg`Your card was declined`,
      expiredCard: msg`Your card has expired`,
      invalidAmount: msg`Please enter a valid amount`,
      minimumAmount: msg`Amount must be at least {min}`,
      maximumAmount: msg`Amount cannot exceed {max}`,
      invalidTaxId: msg`Please enter a valid tax ID`,
      invalidVatNumber: msg`Please enter a valid VAT number`,
    };
  }

  static createBillingRules(locale?: string) {
    const baseRules = this.createRules(locale);
    const messages = this.getBillingMessages();
    
    return {
      ...baseRules,
      
      billingAmount: (value: string | number): MessageDescriptor | true => {
        if (!value) return true;
        
        const amount = typeof value === "string" ? parseFloat(value) : value;
        
        if (isNaN(amount) || amount < 0) {
          return messages.invalidAmount;
        }
        
        // Check for reasonable maximum (e.g., $1M)
        if (amount > 1000000) {
          return messages.maximumAmount;
        }
        
        return true;
      },

      subscriptionAmount: (min: number = 0.01) => (value: string | number): MessageDescriptor | true => {
        if (!value) return true;
        
        const amount = typeof value === "string" ? parseFloat(value) : value;
        
        if (isNaN(amount)) {
          return messages.invalidAmount;
        }
        
        if (amount < min) {
          return messages.minimumAmount;
        }
        
        return true;
      },

      taxId: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        
        // Basic tax ID validation (can be enhanced per locale)
        const taxIdRegex = /^[A-Z0-9-]{5,20}$/i;
        return taxIdRegex.test(value) ? true : messages.invalidTaxId;
      },

      vatNumber: (value: string): MessageDescriptor | true => {
        if (!value) return true;
        
        // Basic VAT number validation (can be enhanced per locale)
        const vatRegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/i;
        return vatRegex.test(value) ? true : messages.invalidVatNumber;
      },
    };
  }
}

/**
 * Hook for billing-specific validation rules
 */
export const useBillingValidation = () => {
  const { locale } = useLocale();
  
  return BillingValidation.createBillingRules(locale);
};