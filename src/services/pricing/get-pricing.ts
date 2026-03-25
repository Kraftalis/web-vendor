import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  PricingData,
  PricingQueryParams,
  AddOn,
  AddOnQueryParams,
  Category,
} from "./types";

/**
 * Fetch packages and add-ons for the current vendor.
 * Supports pagination, search, and filtering via query params.
 */
export async function getPricing(
  params?: PricingQueryParams,
): Promise<{ data: PricingData; meta: ApiResponse["meta"] }> {
  const { data } = await api.get<ApiResponse<PricingData>>("/pricing", {
    params,
  });
  return { data: data.data!, meta: data.meta };
}

/**
 * Fetch add-ons for the current vendor (separate endpoint).
 */
export async function getAddOns(
  params?: AddOnQueryParams,
): Promise<{ data: AddOn[]; meta: ApiResponse["meta"] }> {
  const { data } = await api.get<ApiResponse<AddOn[]>>("/pricing/addons", {
    params,
  });
  return { data: data.data!, meta: data.meta };
}

/**
 * Fetch all categories.
 */
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>(
    "/pricing/categories",
  );
  return data.data!;
}
