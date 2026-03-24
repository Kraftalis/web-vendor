import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { authConfig, authProviders } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/repositories/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: authProviders,
  events: {
    async signIn({ user, account }) {
      if (!user.id) return;

      if (account?.provider === "google") {
        await createAuditLog({
          userId: user.id,
          action: "LOGIN_SUCCESS",
          metadata: { provider: "google" },
        });
      }

      // Set the "bp" cookie if the user already has a business profile.
      // This ensures returning users (e.g. Google sign-in) are not
      // unnecessarily redirected to onboarding after every login.
      try {
        const profile = await prisma.businessProfile.findUnique({
          where: { userId: user.id },
          select: { id: true },
        });
        if (profile) {
          const cookieStore = await cookies();
          cookieStore.set("bp", "1", {
            path: "/",
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
          });
        }
      } catch {
        // Non-critical — middleware will redirect to /onboarding if needed
      }
    },
    async signOut(message) {
      const userId = "token" in message ? (message.token?.sub ?? null) : null;
      if (userId) {
        await createAuditLog({
          userId,
          action: "LOGOUT",
        });
      }
    },
  },
});
