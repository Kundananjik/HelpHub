import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware using the Prisma-free config. The `authorized` callback in
// authConfig enforces authentication on protected route prefixes.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
