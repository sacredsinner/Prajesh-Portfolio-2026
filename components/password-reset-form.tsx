"use client"

import { FormEvent, useState } from "react"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage("")
    setError("")
    try {
      const email = String(new FormData(event.currentTarget).get("email") ?? "").trim()
      const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` })
      if (result.error) setError("Unable to send a reset email. Please try again.")
      else setMessage("If an account exists for that email, a reset link is on its way.")
    } catch {
      setError("Unable to send a reset email. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return <form onSubmit={submit} className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Account recovery</p><h1 className="mt-2 font-serif text-3xl">Forgot password</h1><p className="mt-2 text-sm text-muted-foreground">Enter your email and we&apos;ll send a secure reset link.</p></div>
    <label className="grid gap-2 text-sm">Email<input name="email" type="email" required autoComplete="email" className="rounded-lg border border-border bg-background px-3 py-2" /></label>
    {message && <p role="status" className="text-sm text-foreground">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <button disabled={pending} className="rounded-full bg-foreground px-4 py-3 text-sm text-background disabled:opacity-50">{pending ? "Sending…" : "Send reset link"}</button>
  </form>
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(""); setError("")
    try {
      const result = await authClient.resetPassword({ newPassword: password, token })
      if (result.error) setError("This reset link is invalid or expired.")
      else setMessage("Password updated. You can now sign in.")
    } catch { setError("This reset link is invalid or expired.") } finally { setPending(false) }
  }

  return <form onSubmit={submit} className="flex max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
    <div><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Account recovery</p><h1 className="mt-2 font-serif text-3xl">Set new password</h1></div>
    <label className="grid gap-2 text-sm">New password<input value={password} onChange={(event) => setPassword(event.target.value)} name="password" type="password" minLength={8} required autoComplete="new-password" className="rounded-lg border border-border bg-background px-3 py-2" /></label>
    {message && <p role="status" className="text-sm text-foreground">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <button disabled={pending} className="rounded-full bg-foreground px-4 py-3 text-sm text-background disabled:opacity-50">{pending ? "Updating…" : "Update password"}</button>
  </form>
}
