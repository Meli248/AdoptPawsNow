import z from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .nonempty({ message: "Full Name is Required" })
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .nonempty({ message: "Email is Required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .nonempty({ message: "Password is Required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .nonempty({ message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is Required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string()
    .nonempty({ message: "Password is Required" }),
});