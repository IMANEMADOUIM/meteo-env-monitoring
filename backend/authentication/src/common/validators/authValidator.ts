import { z } from "zod";
import Audience from "../constants/audience";


const emailSchema = z.string().email("Invalid email format").min(3, "Email must be at least 3 characters long" ).max(255, "Email cannot exceed 255 characters");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters long").max(255, "Password cannot exceed 255 characters");
const verificationCodeSchema = z.string().min(1).max(100).trim();

export const loginSchema = z.object({
  email: emailSchema,
  password : passwordSchema,
  userAgent: z.string().optional(),
});

 export const registerSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters long").max(30, "Username cannot exceed 30 characters"),
  role: z.nativeEnum(Audience).optional().default(Audience.User),
  confirmPassword: z.string().min(6).max(255),
  userAgent: z.string().optional(),
 })
 .refine((data)=> data.password === data.confirmPassword, {
   message: "Password do not match",
   path: ["confirmPassword"],
 });

 export const verificationEmailSchema = z.object({
  code: verificationCodeSchema,
});

 // Schéma pour la réinitialisation de mot de passe (étape 2: confirmation)
 export const resetPasswordSchema = z.object({
   password: passwordSchema,
   confirmPassword: passwordSchema,
   verificationCode: z.string(),
 }).refine(data => data.password === data.confirmPassword, {
   message: "Passwords do not match",
   path: ["confirmPassword"],
 });

 export const forgotPasswordSchema = z.object({
   email: emailSchema,
 });
 
 // Schéma pour la mise à jour du profile 

 export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long").max(30, "Username cannot exceed 30 characters").optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  oldPassword: z.string().optional(),
}).refine(data => {
  if (data.password && !data.oldPassword) {
    return false; // Old password is required if new password is provided
  }
  return true;
}, {
  message: "Old password is required to update password",
  path: ["oldPassword"],
});
