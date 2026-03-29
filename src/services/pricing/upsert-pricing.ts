import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  Package,
  AddOn,
  CreatePackagePayload,
  UpdatePackagePayload,
  CreateAddOnPayload,
  UpdateAddOnPayload,
} from "./types";

// ─── Package mutations ──────────────────────────────────────

export async function createPackage(
  payload: Omit<CreatePackagePayload, "type">,
): Promise<Package> {
  const { data } = await api.post<ApiResponse<Package>>("/pricing", {
    type: "package",
    ...payload,
  });
  return data.data!;
}

export async function updatePackage(
  id: string,
  payload: UpdatePackagePayload,
): Promise<Package> {
  const { data } = await api.put<ApiResponse<Package>>(
    `/pricing/packages/${id}`,
    payload,
  );
  return data.data!;
}

export async function deletePackage(id: string): Promise<void> {
  await api.delete(`/pricing/packages/${id}`);
}

// ─── Add-on mutations ───────────────────────────────────────

export async function createAddOn(
  payload: Omit<CreateAddOnPayload, "type">,
): Promise<AddOn> {
  const { data } = await api.post<ApiResponse<AddOn>>("/pricing", {
    type: "addon",
    ...payload,
  });
  return data.data!;
}

export async function updateAddOn(
  id: string,
  payload: UpdateAddOnPayload,
): Promise<AddOn> {
  const { data } = await api.put<ApiResponse<AddOn>>(
    `/pricing/addons/${id}`,
    payload,
  );
  return data.data!;
}

export async function deleteAddOn(id: string): Promise<void> {
  await api.delete(`/pricing/addons/${id}`);
}
