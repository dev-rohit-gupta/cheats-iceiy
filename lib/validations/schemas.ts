import { z } from "zod";

// User validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Cheat validation schemas
export const createCheatSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  driveLink: z
    .string()
    .url("Drive link must be a valid URL")
    .refine(
      (url) =>
        url.includes("drive.google.com") ||
        url.includes("docs.google.com") ||
        url.includes("sheets.google.com"),
      "Link must be from Google Drive, Docs, or Sheets"
    ),
  subject: z.string().min(2, "Subject is required").max(100),
  branch: z.string().max(100).optional(),
  notes: z.string().optional(),
  accessLevel: z.enum(["public", "protected", "private"]).default("public"),
  status: z.enum(["active", "archived", "draft"]).default("active"),
  tags: z.string().optional(),
});

export const updateCheatSchema = createCheatSchema.partial();

// Share code validation schemas
export const createShareCodeSchema = z.object({
  cheatId: z.number().positive("Cheat ID is required"),
  expiresAt: z.date().optional(),
  usageLimit: z.number().positive().optional(),
  scope: z.enum(["single", "all"]).default("single"),
});

export const unlockWithShareCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Share code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Share code must be uppercase alphanumeric"),
});

// OTP validation schemas
export const requestOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateCheatInput = z.infer<typeof createCheatSchema>;
export type UpdateCheatInput = z.infer<typeof updateCheatSchema>;
export type CreateShareCodeInput = z.infer<typeof createShareCodeSchema>;
export type UnlockWithShareCodeInput = z.infer<typeof unlockWithShareCodeSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
