export const SIGNUP_GRANT = 200;

export const CREDIT_PACKS = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 10_000,
    priceAmount: 199,
    priceInr: 199,
    currency: "INR",
  },
  growth: {
    id: "growth",
    name: "Growth",
    credits: 50_000,
    priceAmount: 799,
    priceInr: 799,
    currency: "INR",
  },
  scale: {
    id: "scale",
    name: "Scale",
    credits: 2_00_000,
    priceAmount: 2499,
    priceInr: 2499,
    currency: "INR",
  },
} as const;

export const CREDIT_PACKS_LIST = Object.values(CREDIT_PACKS);

export type CreditPackId = keyof typeof CREDIT_PACKS;
