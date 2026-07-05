import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  departmentId: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const ticketSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(140),
  description: z.string().min(10, "Please describe the issue in more detail"),
  category: z.enum([
    "HARDWARE",
    "SOFTWARE",
    "NETWORK",
    "ACCOUNT",
    "EMAIL",
    "SECURITY",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  departmentId: z.string().optional().nullable(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(),
      })
    )
    .optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000),
  isInternal: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  jobTitle: z.string().max(80).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  departmentId: z.string().optional().nullable(),
});

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().max(300).optional().nullable(),
});

export const articleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(140),
  body: z.string().min(10, "Article body is too short"),
  category: z.string().max(60).optional().nullable(),
  published: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});
