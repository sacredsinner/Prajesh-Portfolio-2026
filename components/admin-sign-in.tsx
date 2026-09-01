"use client"

import { type FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function AdminSignIn() {
  const [error, setError] = useState("")
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

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
<h1 className="mt-2 font-serif text-3xl">Admin sign in</h1>
  <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your projects and notes.</p>
      </div>
<label className="grid gap-2 text-sm">
        Email
        <input name="email" type="email" required className="rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-full bg-foreground px-4 py-3 text-sm text-background disabled:opacity-50"
      >
        {pending ? "Please wait…" : "Sign in"}
      </button>
      <div className="flex flex-col gap-3 text-sm">
        <a href="/forgot-password" className="text-muted-foreground underline underline-offset-4">
          Forgot password?
        </a>
        <a
          href="/admin/signup"
          className="inline-flex w-fit items-center justify-center rounded-full border border-border px-4 py-2 font-medium text-foreground underline-offset-4 transition-colors hover:bg-muted hover:underline"
        >
          Create an account
        </a>
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true)
            setError("")
            try {
              const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: `${window.location.origin}/admin`,
              })
              if (result.error) setError("Unable to continue with Google. Please try again.")
            } catch {
              setError("Unable to continue with Google. Please try again.")
            } finally {
              setPending(false)
            }
          }}
          className="rounded-full border border-border px-4 py-2 disabled:opacity-50"
        >
          Continue with Google
        </button>
      </div>

    </form>
  )
}
