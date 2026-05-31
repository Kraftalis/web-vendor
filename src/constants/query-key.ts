/**
 * Centralized React Query keys for all domains.
 * All hooks must import their keys from here.
 */

import type { PricingQueryParams, AddOnQueryParams } from "@/services/pricing";

export const eventKeys = {
  all: ["events"] as const,
  detail: (id: string) => ["events", id] as const,
  bookingLink: (token: string) => ["booking-link", token] as const,
};

export const briefKeys = {
  list: (eventId: string) => [...eventKeys.detail(eventId), "briefs"] as const,
};

export const bookingKeys = {
  links: ["booking-links"] as const,
};

export const userKeys = {
  profile: ["user", "profile"] as const,
};

export const pricingKeys = {
  all: ["pricing"] as const,
  list: (params?: PricingQueryParams) => ["pricing", "list", params] as const,
  detail: (id: string) => ["pricing", "detail", id] as const,
  addOns: (params?: AddOnQueryParams) => ["pricing", "addons", params] as const,
  categories: ["pricing", "categories"] as const,
};
