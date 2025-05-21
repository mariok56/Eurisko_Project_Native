import {z} from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
});

// Updated to require 6 digits instead of 4
export const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const profileEditSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  // profileImage is handled separately
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be a positive number'),
  // location and images are handled separately
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
