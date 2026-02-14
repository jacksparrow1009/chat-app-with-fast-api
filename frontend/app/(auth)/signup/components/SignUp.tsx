"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, AuthFormValues } from "../../login/components/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Field, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field";
import Link from "next/link";
import { useState } from "react";

export default function Signup() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setServerError(null);
    try {
      console.log("Submitting to FastAPI:", values);
      
      // Future: const response = await fetch('http://localhost:8000/auth/register', { ... })
      
      // For now, simulating a successful delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Registration successful! You can now log in.");
      
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to join the chat
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {serverError && (
            <div className="mb-4 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <Field>
              <FieldLabel className="font-semibold">Username</FieldLabel>
              <Input
                placeholder="asad_developer"
                {...register("username")}
                className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.username && <FieldError>{errors.username.message}</FieldError>}
            </Field>

            {/* Email Field */}
            <Field>
              <FieldLabel className="font-semibold">Email Address</FieldLabel>
              <Input
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            {/* Password Field */}
            <Field>
              <FieldLabel className="font-semibold">Password</FieldLabel>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 h-11 text-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Log in
            </Link>
          </div>
          <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
            By clicking Sign Up, you agree to our{" "}
            <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Terms of Service</span> and{" "}
            <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Privacy Policy</span>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}