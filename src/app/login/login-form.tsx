"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ACCOUNT_CREATED_MESSAGE,
  SIGN_IN_UNAVAILABLE_MESSAGE,
} from "@/lib/domain/labels";
import { ROUTES } from "@/lib/domain/routes";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

const inputClassName =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-navy outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const client = createBrowserSupabaseClient();

    if (!client) {
      setMessageTone("error");
      setMessage(SIGN_IN_UNAVAILABLE_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    if (mode === "signup") {
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) {
        setIsSubmitting(false);
        setMessageTone("error");
        setMessage(error.message);
        return;
      }

      if (data.session) {
        await client.auth.signOut();
      }

      setIsSubmitting(false);
      setMode("signin");
      setMessageTone("success");
      setMessage(ACCOUNT_CREATED_MESSAGE);
      return;
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setMessageTone("error");
      setMessage(error.message);
      return;
    }

    router.push(ROUTES.passport);
    router.refresh();
  }

  const isSignUp = mode === "signup";

  return (
    <Card className="w-full">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-navy">
        {isSignUp ? "Create account" : "Sign in"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        {isSignUp
          ? "Create an account with your email and password."
          : "Enter the email and password for your account."}
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-navy">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="block text-sm font-medium text-navy">
          Password
          <input
            type="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
          />
        </label>
        {message ? (
          <p
            className={
              messageTone === "success" ? "text-sm text-verified" : "text-sm text-danger"
            }
            role={messageTone === "success" ? "status" : "alert"}
          >
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm font-semibold text-copper hover:text-copper-hover"
        onClick={() => {
          setMode(isSignUp ? "signin" : "signup");
          setMessage(null);
        }}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Need an account? Create one"}
      </button>
    </Card>
  );
}
