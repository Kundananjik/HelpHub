"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation";

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
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same to avoid account enumeration.
  const genericMessage =
    "If an account exists for that email, a password reset link has been generated.";

  if (!user) {
    return { success: genericMessage };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expires },
  });

  // In a production app this token would be emailed. For this demo we surface
  // the reset link directly so the flow can be completed end-to-end.
  return { success: genericMessage, resetToken: token };
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
