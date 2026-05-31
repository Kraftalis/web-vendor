import { signIn } from "next-auth/react";

export const loginWithGoogle = async (): Promise<void> => {
  await signIn("google", { callbackUrl: "/" });
};
