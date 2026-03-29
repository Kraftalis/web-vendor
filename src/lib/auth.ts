import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
