"use client"

import { useState } from "react"
import { addClients, deleteClient, discardUploadedLogos, saveClient } from "@/app/actions/clients"
import { uploadToBlob } from "@/lib/upload-client"
import { makeSlug, nameFromFilename, needsClientName } from "@/lib/utils"

type Client = { id: number; name: string; slug: string; logoUrl: string; logoPathname: string; websiteUrl: string | null; description: string | null; isPublished: boolean; sortOrder: number }

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function AdminClientManager({ initialClients }: { initialClients: Client[] }) {
  const [items, setItems] = useState(initialClients)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Client | null>(null)
  const unnamed = items.filter((client) => needsClientName(client.name)).length

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem("files") as HTMLInputElement
    const files = Array.from(input.files ?? [])
    if (!files.length) return
    if (files.length > 50) {
      setError("Upload up to 50 logos at a time.")
      return
    }
    setBusy(true)
    setError("")
    const uploaded: { name: string; logoUrl: string; logoPathname: string }[] = []
    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Uploading ${index + 1} of ${files.length}…`)
        const result = await uploadToBlob(file, "clients")
        uploaded.push({ name: nameFromFilename(file.name).slice(0, 120), logoUrl: result.url, logoPathname: result.pathname })
      }
      setStatus("Saving…")
      const saved = await addClients(uploaded)
      if (!saved.ok) {
        setError(saved.error)
        return
      }
      setItems((current) => [...current, ...saved.data])
      form.reset()
    } catch (uploadError) {
      if (uploaded.length) await discardUploadedLogos(uploaded.map((item) => item.logoUrl)).catch(() => undefined)
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Check the Blob connection.")
    } finally {
      setBusy(false)
      setStatus("")
    }
  }

  async function remove(client: Client) {
    if (!window.confirm(`Delete ${client.name}?`)) return
    try {
      await deleteClient(client.id)
      setItems((current) => current.filter((item) => item.id !== client.id))
      if (editing?.id === client.id) setEditing(null)
    } catch {
      setError(`Could not delete ${client.name}. Please try again.`)
    }
  }

  return (
    <section className="grid gap-8">
      <div>
        <h2 className="font-serif text-3xl">Trusted partnerships</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload logos in bulk. The filename becomes the client name (hamro-patro.png → Hamro Patro), and you can rename any client below.
          Transparent PNG or SVG logos look best on the site.
        </p>
      </div>
      <form onSubmit={upload} className="flex flex-col gap-4 border border-border p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm">
          Logo images
          <input name="files" type="file" accept="image/*" multiple required disabled={busy} className="text-sm" />
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50">{busy ? status || "Uploading…" : "Upload images"}</button>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {unnamed > 0 && (
        <p className="border border-border p-4 text-sm">
          {`${unnamed === 1 ? "1 client still needs" : `${unnamed} clients still need`} a real name. Until then the site shows the filename as the client's name and logo description. Use Edit to fix them.`}
        </p>
      )}
      {editing && (
        <ClientEditor
          key={editing.id}
          client={editing}
          onCancel={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((current) => current.map((item) => (item.id === saved.id ? saved : item)))
            setEditing(null)
          }}
        />
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {items.map((client) => (
          <div key={client.id} className="flex flex-col border border-foreground/80">
            <div className="flex aspect-[1.35] items-center justify-center p-5">
              <img src={client.logoUrl} alt={`${client.name} logo`} className="max-h-20 w-full object-contain" />
            </div>
            <div className="grid gap-2 border-t border-border p-3">
              <p className="truncate text-sm font-medium" title={client.name}>{client.name}</p>
              <p className="text-xs text-muted-foreground">
                {needsClientName(client.name) ? "Needs a name" : client.isPublished ? "Published" : "Hidden"}
              </p>
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => setEditing(client)} className="rounded-full border border-border px-3 py-1">Edit</button>
                <button type="button" onClick={() => remove(client)} aria-label={`Delete ${client.name}`} className="rounded-full border border-destructive px-3 py-1 text-destructive">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClientEditor({ client, onSaved, onCancel }: { client: Client; onSaved: (client: Client) => void; onCancel: () => void }) {
  const [data, setData] = useState({ ...client, websiteUrl: client.websiteUrl ?? "", description: client.description ?? "" })
  // Slugs created from filenames (e.g. "1-png-1788452560206-0") follow the new name until edited by hand.
  const [slugFollowsName, setSlugFollowsName] = useState(needsClientName(client.name) || /-\d{10,}-\d+$/.test(client.slug))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    const result = await saveClient({ ...data, id: client.id }).catch(() => ({ ok: false as const, error: "Could not save the client. Please try again." }))
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSaved(result.data)
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border border-border p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <img src={client.logoUrl} alt="" className="h-16 w-24 border border-border object-contain p-2" />
        <h3 className="font-serif text-2xl">Edit client</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Name
          <input className={inputClass} value={data.name} required maxLength={120} onChange={(event) => { const name = event.target.value; setData((old) => ({ ...old, name, slug: slugFollowsName ? makeSlug(name) || old.slug : old.slug })) }} />
        </label>
        <label className="grid gap-2 text-sm">
          Slug (web address)
          <input className={inputClass} value={data.slug} required onChange={(event) => { setSlugFollowsName(false); setData((old) => ({ ...old, slug: event.target.value })) }} />
        </label>
        <label className="grid gap-2 text-sm">
          Website
          <input className={inputClass} type="url" value={data.websiteUrl} placeholder="https://example.com" onChange={(event) => setData((old) => ({ ...old, websiteUrl: event.target.value }))} />
        </label>
        <label className="grid gap-2 text-sm">
          Sort order
          <input className={inputClass} type="number" value={data.sortOrder} onChange={(event) => setData((old) => ({ ...old, sortOrder: Number(event.target.value) || 0 }))} />
        </label>
      </div>
      <label className="grid gap-2 text-sm">
        Description <span className="text-xs text-muted-foreground">Shown on the client&apos;s page. Clients without one are kept out of search results.</span>
        <textarea className={inputClass} rows={4} maxLength={5000} value={data.description} onChange={(event) => setData((old) => ({ ...old, description: event.target.value }))} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={data.isPublished} onChange={(event) => setData((old) => ({ ...old, isPublished: event.target.checked }))} /> Show on the website
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <button disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save client"}</button>
        <button type="button" onClick={onCancel} className="text-sm underline">Cancel</button>
      </div>
    </form>
  )
}
