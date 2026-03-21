// ─── Event hooks ────────────────────────────────────────────
export {
  eventKeys,
  useEvents,
  useEventDetail,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useBookingLink,
  useGenerateBookingLink,
  useSubmitBooking,
} from "./event";

// ─── Pricing hooks ──────────────────────────────────────────
export {
  pricingKeys,
  usePricing,
  useAddOns,
  useCategories,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useCreateAddOn,
  useUpdateAddOn,
  useDeleteAddOn,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "./pricing";

// ─── Booking hooks ──────────────────────────────────────────
export {
  bookingKeys,
  useBookingLinks,
  useCreateBookingLink,
  useUpdateBookingLink,
  useDeleteBookingLink,
} from "./booking";

// ─── User hooks ─────────────────────────────────────────────
export { userKeys, useProfile, useUpdateProfile } from "./user";

// ─── Shared hooks ───────────────────────────────────────────
export { useConfirmDelete } from "./use-confirm-delete";
