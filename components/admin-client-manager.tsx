"use client"

import { useState } from "react"
import { bulkUploadClientLogos, deleteClient } from "@/app/actions/clients"

type Client = { id: number; name: string; slug: string; logoUrl: string; logoPathname: string; websiteUrl: string | null; description: string | null; isPublished: boolean; sortOrder: number }

export function AdminClientManager({ initialClients }: { initialClients: Client[] }) {
  const [items, setItems] = useState(initialClients)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem("files") as HTMLInputElement
    if (!input.files?.length) return
    setBusy(true)
    setError("")
    try {
      const formData = new FormData()
      Array.from(input.files).forEach((file) => formData.append("files", file))
      const uploaded = await bulkUploadClientLogos(formData)
      setItems((current) => [...uploaded, ...current])
      form.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  async function remove(client: Client) {
    if (!window.confirm(`Delete ${client.name}?`)) return
    await deleteClient(client.id)
    setItems((current) => current.filter((item) => item.id !== client.id))
  }

  return (
    <section className="grid gap-8">
      <div>
        <h2 className="font-serif text-3xl">Trusted partnerships</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upload logo images in bulk. Filenames are used as client names.</p>
      </div>
      <form onSubmit={upload} className="flex flex-col gap-4 border border-border p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm">
          Logo images
          <input name="files" type="file" accept="image/*" multiple required className="text-sm" />
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50">{busy ? "Uploading…" : "Upload images"}</button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((client) => (
          <div key={client.id} className="group relative flex aspect-[1.35] items-center justify-center border border-foreground/80 p-5">
            <img src={client.logoUrl} alt={`${client.name} logo`} className="max-h-20 w-full object-contain" />
            <button type="button" onClick={() => remove(client)} aria-label={`Delete ${client.name}`} className="absolute right-2 top-2 hidden text-xs group-hover:block">Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}
