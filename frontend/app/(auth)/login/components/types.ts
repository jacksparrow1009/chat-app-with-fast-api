import * as z from "zod";

export const authSchema = z
  .object({
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AuthFormValues = z.infer<typeof authSchema>;
