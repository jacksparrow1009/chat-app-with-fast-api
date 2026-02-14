import * as z from "zod";

export const authSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  // We make username optional in the schema but required by the form
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
});

export type AuthFormValues = z.infer<typeof authSchema>;