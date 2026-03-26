"use server";

import { auth } from "@/lib/auth";
import { updateUserProfile } from "@/repositories/user";
import { revalidatePath } from "next/cache";

/**
 * Server action to update the user's profile (name).
 */
export async function updateProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  if (name.trim().length > 100) {
    return { error: "Name must be less than 100 characters" };
  }

  try {
    await updateUserProfile(session.user.id, {
      name: name.trim(),
    });

    revalidatePath("/vendor/profile");
    revalidatePath("/vendor");

    return { success: true };
  } catch (error) {
    console.error("[Profile] Update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}
