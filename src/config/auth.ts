import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compareSync } from "bcryptjs";
import { findUserByEmail, isUserActive } from "@/repositories/user";
import { createAuditLog } from "@/repositories/audit";

/**
 * Shared auth config (callbacks, pages, session) — safe for Edge/middleware.
 * Does NOT include providers (which depend on Node.js modules like bcryptjs).
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Overridden in src/lib/auth.ts
  pages: {
    signIn: "/vendor/login",
    newUser: "/vendor/signup",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLanding = nextUrl.pathname === "/";
      const isOnLogin = nextUrl.pathname.startsWith("/vendor/login");
      const isOnSignUp = nextUrl.pathname.startsWith("/vendor/signup");
      const isOnVerifyEmail = nextUrl.pathname.startsWith(
        "/vendor/verify-email",
      );
      const isOnBooking = nextUrl.pathname.startsWith("/client/booking");
      const isPublicRoute =
        isLanding || isOnLogin || isOnSignUp || isOnVerifyEmail || isOnBooking;

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/vendor", nextUrl));
        return true;
      }

      if (isPublicRoute) return true;

      if (!isLoggedIn) return false;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

/**
 * Full providers array — only used server-side (not in middleware).
 */
export const authProviders: NextAuthConfig["providers"] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  }),
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string;
      const password = credentials?.password as string;

      if (!email || !password) return null;

      // Look up user in the database
      const user = await findUserByEmail(email);

      if (!user || !user.passwordHash) {
        await createAuditLog({
          action: "LOGIN_FAILED",
          metadata: { email, reason: "user_not_found" },
        });
        return null;
      }

      // Check if user is active
      const active = await isUserActive(user.id);
      if (!active) {
        // Check specifically for pending verification
        if (user.status === "PENDING_VERIFICATION") {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            metadata: { reason: "email_not_verified" },
          });
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        await createAuditLog({
          userId: user.id,
          action: "LOGIN_FAILED",
          metadata: { reason: "account_inactive", status: user.status },
        });
        return null;
      }

      // Validate password
      const isValid = compareSync(password, user.passwordHash);
      if (!isValid) {
        await createAuditLog({
          userId: user.id,
          action: "LOGIN_FAILED",
          metadata: { reason: "invalid_password" },
        });
        return null;
      }

      // Log successful login
      await createAuditLog({
        userId: user.id,
        action: "LOGIN_SUCCESS",
        metadata: { provider: "credentials" },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];
