import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-09-30.endive" })
  : undefined;

export function getStripeOrThrow(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return stripe;
}

type PeriodItem = { current_period_start: number; current_period_end: number };
/**
 * The billing period of a subscription, from its items: Stripe moved current_period_start and
 * current_period_end there in API 2025-03-31.basil. The item that ends last, start and end from
 * that same item, so the period is always coherent; identical to the old subscription-level
 * values for a single-item subscription. Undefined when there are no items, which Stripe never
 * returns: the caller decides what that means where it stands.
 */
export function subscriptionPeriod(s: {
  items: { data: PeriodItem[] };
}): { start: number; end: number } | undefined {
  const latest = s.items.data.reduce<PeriodItem | undefined>(
    (best, item) =>
      best === undefined || item.current_period_end > best.current_period_end ? item : best,
    undefined,
  );
  return latest && { start: latest.current_period_start, end: latest.current_period_end };
}
