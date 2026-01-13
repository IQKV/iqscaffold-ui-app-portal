import { loadStripe, Stripe } from "@stripe/stripe-js";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

let stripePromise: Promise<Stripe | null>;

/**
 * Get or initialize stripe instance
 */
export const getStripe = (publicKey?: string, accountId?: string) => {
  if (!stripePromise || publicKey) {
    const key = publicKey || getConfig(ENV_KEYS.STRIPE_PUBLIC_KEY);
    const options = accountId ? { stripeAccount: accountId } : {};
    stripePromise = loadStripe(key as string, options);
  }
  return stripePromise;
};
