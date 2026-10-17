"use client"

import { type FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

// Codes Better Auth adds to /admin?error=… when Google sign-in doesn't complete.
const GOOGLE_ERRORS: Record<string, string> = {
  signup_disabled: "That Google account doesn't have access to the content studio. Choose the admin Google account and try again.",
  account_not_linked: "Google couldn't be connected to your existing account. Sign in with your email and password, then try Google again.",
  unable_to_link_account: "Google couldn't be connected to your account. Please try again.",
  access_denied: "Google sign-in was cancelled.",
}

function describeError(code?: string) {
  if (!code) return ""
  return GOOGLE_ERRORS[code] ?? "Google sign-in didn't complete. Please try again."
}

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export function AdminSignIn({ allowSignUp = false, googleEnabled = false, error: initialError }: { allowSignUp?: boolean; googleEnabled?: boolean; error?: string }) {
  const [error, setError] = useState(describeError(initialError))
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) setError("Unable to sign in. Check your email and password.")
      else window.location.assign("/admin")
    } catch {
      setError("Unable to sign in right now. Please try again.")
    } finally {
      setPending(false)
    }
  }

  async function continueWithGoogle() {
    setPending(true)
    setError("")
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/admin`,
        // Send failures back here with ?error=… instead of Better Auth's bare error page.
        errorCallbackURL: `${window.location.origin}/admin`,
      })
      if (result.error) {
        setError("Unable to continue with Google. Please try again.")
        setPending(false)
      }
      // On success the browser is already on its way to Google.
    } catch {
      setError("Unable to continue with Google. Please try again.")
      setPending(false)
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
        <h1 className="mt-2 font-serif text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your projects and notes.</p>
      </div>

      {googleEnabled && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={continueWithGoogle}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-foreground bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <GoogleLogo />
            {pending ? "Please wait…" : "Continue with Google"}
          </button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use your password
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="grid gap-2 text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="At least 8 characters"
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
        <button
          disabled={pending}
          className="rounded-full bg-foreground px-4 py-3 text-sm text-background disabled:opacity-50"
        >
          {pending ? "Please wait…" : "Sign in"}
        </button>
      </form>

      <div className="flex flex-col gap-3 text-sm">
        <a href="/forgot-password" className="text-muted-foreground underline underline-offset-4">
          Forgot password?
        </a>
        {allowSignUp && (
          <a
            href="/admin/signup"
            className="inline-flex w-fit items-center justify-center rounded-full border border-border px-4 py-2 font-medium text-foreground underline-offset-4 transition-colors hover:bg-muted hover:underline"
          >
            Create an account
          </a>
        )}
      </div>
    </div>
  )
}

// Shown when someone is signed in with an account that isn't the admin.
export function AdminNoAccess({ email }: { email: string }) {
  const [pending, setPending] = useState(false)
  return (
    <div className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
      <h1 className="font-serif text-3xl">No access</h1>
      <p className="text-sm text-muted-foreground">You&apos;re signed in as {email}, which doesn&apos;t have access to the content studio.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => { setPending(true); void authClient.signOut().then(() => window.location.reload()) }}
        className="w-fit rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
      >
        {pending ? "Signing out…" : "Sign out and try another account"}
      </button>
    </div>
  )
}
