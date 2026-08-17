"use client"

import { type FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function AdminSignIn() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const email = String(form.get("email"))
    const password = String(form.get("password"))

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            email,
            password,
            name: String(form.get("name") || "Admin"),
          })
        : await authClient.signIn.email({ email, password })

    if (result.error) {
      setError(result.error.message ?? "Something went wrong")
    } else {
      window.location.assign("/admin")
    }
    setPending(false)
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
        <h1 className="mt-2 font-serif text-3xl">{mode === "sign-up" ? "Create admin account" : "Admin sign in"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "sign-up"
            ? "Set up the first administrator to manage your projects and notes."
            : "Sign in to manage your projects and notes."}
        </p>
      </div>
      {mode === "sign-up" && (
        <label className="grid gap-2 text-sm">
          Name
          <input name="name" type="text" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
      )}
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
        {pending ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-up" ? "sign-in" : "sign-up")
          setError("")
        }}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {mode === "sign-up" ? "Already have an account? Sign in" : "Need an account? Create one"}
      </button>
    </form>
  )
}
