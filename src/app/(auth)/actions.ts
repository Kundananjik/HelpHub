"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import { appUrl } from "@/lib/env";

export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  resetToken?: string;
};

function flatten(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    departmentId: formData.get("departmentId") || null,
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const { name, email, password, departmentId } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists" } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: "EMPLOYEE",
      departmentId: departmentId || null,
    },
  });

  return { success: "Account created! You can now sign in." };
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase();

  // Throttle reset requests per email to prevent abuse.
  const rl = await rateLimit(`forgot:${email}`, { limit: 5, windowMs: 60_000 });
  if (!rl.success) {
    return { error: "Too many reset requests. Please try again shortly." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same to avoid account enumeration.
  const genericMessage =
    "If an account exists for that email, a password reset link has been sent.";

  if (!user) {
    return { success: genericMessage };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expires },
  });

  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  const template = passwordResetEmail(resetUrl);
  const { delivered } = await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  // When no email provider is configured (dev), surface the link in-app so the
  // flow can still be completed end-to-end.
  return {
    success: genericMessage,
    resetToken: delivered ? undefined : token,
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const { token, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.used || record.expires < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  return { success: "Your password has been reset. You can now sign in." };
}
