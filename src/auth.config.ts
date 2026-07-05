import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe base config shared by the full server auth instance (`auth.ts`) and
 * the middleware instance (`middleware.ts`). It must NOT import Prisma or any
 * Node-only modules so it can run in the Edge runtime.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/technician",
  "/admin",
  "/tickets",
  "/profile",
  "/notifications",
];

export const authConfig = {
  // Absolute session cap (defense-in-depth). Inactivity logout is enforced
  // client-side by the IdleTimeout component; this ensures a session cookie
  // can't outlive a reasonable working window even if the client never runs.
  session: { strategy: "jwt", maxAge: 60 * 60 * 12, updateAge: 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      if (isProtected) return isLoggedIn;
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
