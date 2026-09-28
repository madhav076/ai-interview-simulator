"use client";

import { useState, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ROUTES } from "@/utils/constants";

function LoginForm() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedOut = searchParams.get("logged_out") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login(email, password);
      router.push(ROUTES.DASHBOARD);
    } catch {
      // error is already set in the store
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-lg font-bold text-white shadow-sm shadow-indigo-500/20">
            AI
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-zinc-50">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Success alert on logout */}
        {isLoggedOut && !error && (
          <Alert variant="success" className="mb-4">
            You have been logged out successfully.
          </Alert>
        )}

        {/* Error alert from the store */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <Button
            type="submit"
            variant="primary"
            className="mt-2 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
