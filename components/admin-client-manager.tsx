"use client"

import { useState, useMemo } from "react"
import { addClients, deleteClient, discardUploadedLogos, saveClient } from "@/app/actions/clients"
import { uploadToBlob } from "@/lib/upload-client"
import { makeSlug, nameFromFilename, needsClientName } from "@/lib/utils"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { Search } from "lucide-react"
import { toast } from "sonner"

type Client = { id: number; name: string; slug: string; logoUrl: string; logoPathname: string; websiteUrl: string | null; description: string | null; isPublished: boolean; sortOrder: number }

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function AdminClientManager({ initialClients }: { initialClients: Client[] }) {
  const [items, setItems] = useState(initialClients)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [search, setSearch] = useState("")
  const unnamed = items.filter((client) => needsClientName(client.name)).length

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const input = form.elements.namedItem("files") as HTMLInputElement
    const files = Array.from(input.files ?? [])
    if (!files.length) return
    if (files.length > 50) {
      setError("Upload up to 50 logos at a time.")
      toast.error("Upload up to 50 logos at a time.")
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
        toast.error(saved.error)
        return
      }
      setItems((current) => [...current, ...saved.data])
      toast.success(`Successfully uploaded ${saved.data.length} client logo${saved.data.length === 1 ? "" : "s"}`)
      form.reset()
    } catch (uploadError) {
      if (uploaded.length) await discardUploadedLogos(uploaded.map((item) => item.logoUrl)).catch(() => undefined)
      const err = uploadError instanceof Error ? uploadError.message : "Upload failed. Check the Blob connection."
      setError(err)
      toast.error(err)
    } finally {
      setBusy(false)
      setStatus("")
    }
  }

  async function executeDelete() {
    if (!deleteTarget) return
    const client = deleteTarget
    try {
      await deleteClient(client.id)
      setItems((current) => current.filter((item) => item.id !== client.id))
      if (editing?.id === client.id) setEditing(null)
      toast.success(`Deleted ${client.name}`)
    } catch {
      toast.error(`Could not delete ${client.name}. Please try again.`)
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [items, search])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl">Trusted partnerships</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload logos in bulk. Filename becomes the client name (hamro-patro.png → Hamro Patro).
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-9 pr-3 py-1.5 text-xs outline-none focus:border-foreground"
          />
        </div>
      </div>

      <form onSubmit={upload} className="flex flex-col gap-4 rounded-xl border border-border p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm">
          <span>Logo images <span className="text-xs text-muted-foreground">(PNG or SVG look best)</span></span>
          <input name="files" type="file" accept="image/*" multiple required disabled={busy} className="text-xs" />
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background disabled:opacity-50 hover:opacity-90 transition-opacity">
          {busy ? status || "Uploading…" : "Upload images"}
        </button>
      </form>

      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}

      {unnamed > 0 && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400">
          {`${unnamed === 1 ? "1 client still needs" : `${unnamed} clients still need`} a real name. Until then the site shows the filename. Use Edit to set proper names.`}
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
            toast.success("Client details saved")
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {filteredItems.map((client) => (
          <article key={client.id} className="flex flex-col justify-between rounded-xl border border-border p-3 transition-colors hover:border-foreground/40">
            <div className="flex aspect-square items-center justify-center p-3">
              <img src={client.logoUrl} alt={client.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <p className="truncate font-medium text-xs">{client.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">/{client.slug}</p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(client)}
                  className="flex-1 rounded border border-border py-1 text-center text-[10px] hover:bg-secondary transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(client)}
                  className="rounded border border-destructive/50 px-2 py-1 text-[10px] text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Del
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No clients found.
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete client"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete permanently"
        onConfirm={executeDelete}
      />
    </section>
  )
}

function ClientEditor({ client, onCancel, onSaved }: { client: Client; onCancel: () => void; onSaved: (client: Client) => void }) {
  const [data, setData] = useState(client)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [slugFollowsName, setSlugFollowsName] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const saved = await saveClient({
        id: client.id,
        name: data.name.trim(),
        slug: makeSlug(data.slug),
        logoUrl: client.logoUrl,
        logoPathname: client.logoPathname,
        websiteUrl: data.websiteUrl?.trim() || "",
        description: data.description?.trim() || "",
        isPublished: data.isPublished,
        sortOrder: data.sortOrder,
      })
      if (!saved.ok) {
        setError(saved.error)
        return
      }
      onSaved(saved.data)
    } catch {
      setError("Could not save. Please check the network.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Edit {client.name}</h3>
        <button type="button" onClick={onCancel} className="text-xs underline">Cancel</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-1.5 text-xs">
          Name
          <input className={inputClass} value={data.name} required maxLength={120} onChange={(event) => { const name = event.target.value; setData((old) => ({ ...old, name, slug: slugFollowsName ? makeSlug(name) || old.slug : old.slug })) }} />
        </label>
        <label className="grid gap-1.5 text-xs">
          Slug (web address)
          <input className={inputClass} value={data.slug} required onChange={(event) => { setSlugFollowsName(false); setData((old) => ({ ...old, slug: event.target.value })) }} />
        </label>
        <label className="grid gap-1.5 text-xs">
          Website
          <input className={inputClass} type="url" value={data.websiteUrl || ""} placeholder="https://example.com" onChange={(event) => setData((old) => ({ ...old, websiteUrl: event.target.value }))} />
        </label>
        <label className="grid gap-1.5 text-xs">
          Sort order
          <input className={inputClass} type="number" value={data.sortOrder} onChange={(event) => setData((old) => ({ ...old, sortOrder: Number(event.target.value) || 0 }))} />
        </label>
      </div>
      <label className="grid gap-1.5 text-xs">
        <span>Description <span className="text-[10px] text-muted-foreground">(Shown on the client&apos;s page)</span></span>
        <textarea className={inputClass} rows={3} maxLength={5000} value={data.description || ""} onChange={(event) => setData((old) => ({ ...old, description: event.target.value }))} />
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={data.isPublished} onChange={(event) => setData((old) => ({ ...old, isPublished: event.target.checked }))} /> Show on the website
      </label>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="rounded-full bg-foreground px-4 py-1.5 text-xs text-background disabled:opacity-50 hover:opacity-90 transition-opacity">{busy ? "Saving…" : "Save client"}</button>
        <button type="button" onClick={onCancel} className="text-xs underline ml-2">Cancel</button>
      </div>
    </form>
  )
}
