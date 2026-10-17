"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { acceptQuote } from "@/app/actions/invoices"

// "Accept quote" on the client's quote page: they type their name to confirm.
export function AcceptQuoteForm({ token }: { token: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      const result = await acceptQuote({ token, name: String(form.get("name") ?? ""), website: String(form.get("website") ?? "") })
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.refresh()
    } catch {
      setError("Sorry, that didn't work. Please try again, or reply to the email this quote came with.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 border border-foreground p-6 print:hidden">
      <div>
        <p className="font-serif text-2xl">Ready to go ahead?</p>
        <p className="mt-2 text-sm text-muted-foreground">Type your name to accept this quote. I&apos;ll be in touch with next steps and the first invoice.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label htmlFor="accept-name" className="sr-only">Your name</label>
        <input id="accept-name" name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your full name" className="min-w-0 flex-1 border-0 border-b border-input bg-transparent px-0 py-3 text-base focus:border-foreground focus:outline-none" />
        <button type="submit" disabled={busy} className="bg-foreground px-6 py-3 text-sm tracking-wide text-background disabled:opacity-50">{busy ? "Accepting…" : "Accept quote"}</button>
      </div>
      <div aria-hidden="true" className="hidden">
        <label htmlFor="accept-website">Website</label>
        <input id="accept-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  )
}
