"use client"

import { type FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function AdminSignUp() {
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const form = new FormData(event.currentTarget)

    try {
      const result = await authClient.signUp.email({
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      })
      if (result.error) {
        setError("Unable to create your account. Check your details and try again.")
      } else {
        window.location.assign("/admin")
      }
    } catch {
      setError("Unable to create your account right now. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Private workspace</p>
        <h1 className="mt-2 font-serif text-3xl">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create an account to access the admin workspace.</p>
      </div>
      <label className="grid gap-2 text-sm">
        Name
        <input name="name" required minLength={2} autoComplete="name" className="rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className="rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm">
        Password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className="rounded-lg border border-border bg-background px-3 py-2" />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button disabled={pending} className="rounded-full bg-foreground px-4 py-3 text-sm text-background disabled:opacity-50">
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-muted-foreground">
        Already have an account? <a href="/admin" className="underline underline-offset-4">Sign in</a>
      </p>
    </form>
  )
}
