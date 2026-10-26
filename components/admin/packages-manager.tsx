"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePricing } from "@/app/actions/pricing"
import { CURRENCIES, CURRENCY_LABELS, formatMoney, type Currency } from "@/lib/money"
import { newId } from "@/lib/moodboards"
import { budgetChoices, type Package, type Pricing, type Rate } from "@/lib/packages"
import { PackagesView } from "@/components/packages/packages-view"

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
const labelClass = "grid gap-1.5 text-sm"
const money = (): Record<Currency, number> => ({ NPR: 0, AUD: 0, USD: 0 })

function Money({ value, onChange }: { value: Record<Currency, number>; onChange: (next: Record<Currency, number>) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CURRENCIES.map((code) => (
        <label key={code} className={labelClass}>{code}<input className={inputClass} type="number" min={0} step="1" value={value[code]} onChange={(e) => onChange({ ...value, [code]: Number(e.target.value) })} /></label>
      ))}
    </div>
  )
}

function RateList({ title, note, list, onChange }: { title: string; note: string; list: Rate[]; onChange: (next: Rate[]) => void }) {
  const setRate = (id: string, patch: Partial<Rate>) => onChange(list.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const move = (index: number, by: number) => {
    const target = index + by
    if (target < 0 || target >= list.length) return
    const copy = [...list]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    onChange(copy)
  }
  return (
    <fieldset className="grid gap-3 rounded-xl border border-border p-4">
      <legend className="px-1 text-xs uppercase tracking-widest text-muted-foreground">{title}</legend>
      <p className="text-xs text-muted-foreground">{note}</p>
      {list.map((rate, index) => (
        <div key={rate.id} className={`grid gap-3 rounded-lg bg-secondary/40 p-3 lg:grid-cols-[2fr_1fr_2fr_auto] lg:items-end ${rate.hidden ? "opacity-60" : ""}`}>
          <label className={labelClass}>Name<input className={inputClass} value={rate.name} onChange={(e) => setRate(rate.id, { name: e.target.value })} maxLength={120} /></label>
          <label className={labelClass}>Unit<input className={inputClass} value={rate.unit ?? ""} onChange={(e) => setRate(rate.id, { unit: e.target.value })} maxLength={40} placeholder="per product, a month…" /></label>
          <Money value={rate.from} onChange={(from) => setRate(rate.id, { from })} />
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1"><input type="checkbox" checked={!rate.hidden} onChange={(e) => setRate(rate.id, { hidden: !e.target.checked })} /> Shown</label>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded border border-border px-2 py-1 disabled:opacity-30" aria-label="Move up">↑</button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === list.length - 1} className="rounded border border-border px-2 py-1 disabled:opacity-30" aria-label="Move down">↓</button>
            <button type="button" onClick={() => onChange(list.filter((r) => r.id !== rate.id))} className="rounded border border-border px-2 py-1" aria-label="Remove">×</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, { id: newId(), name: "", from: money() }])} className="w-fit rounded-lg border border-border px-3 py-1.5 text-sm">Add a rate</button>
    </fieldset>
  )
}

// Content studio → Packages: everything on /packages, the contact form's budget ranges and
// the invoice rate card, edited in one place.
export function PackagesManager({ initial }: { initial: Pricing }) {
  const router = useRouter()
  const [data, setData] = useState<Pricing>(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(false)
  const set = <K extends keyof Pricing>(key: K, value: Pricing[K]) => setData((old) => ({ ...old, [key]: value }))
  const setPackage = (id: string, patch: Partial<Package>) => set("packages", data.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const move = <T,>(list: T[], index: number, by: number) => {
    const target = index + by
    if (target < 0 || target >= list.length) return list
    const copy = [...list]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    return copy
  }
  const budgets = budgetChoices(data)

  async function save() {
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const result = await updatePricing(data)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setMessage("Packages saved. The Packages page, the contact form and the invoice rate card are updated.")
      router.refresh()
    } catch {
      setError("Couldn't save. Your session may have expired. Reload the page, sign in again and retry.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Content studio</p>
          <h1 className="mt-2 font-serif text-4xl">Packages &amp; pricing</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">What visitors see on /packages. The same prices set the contact form&apos;s budget ranges and the one-click lines in quotes and invoices.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPreview((p) => !p)} className="rounded-full border border-border px-4 py-2 text-sm">{preview ? "Back to editing" : "Preview"}</button>
          <button type="button" onClick={save} disabled={busy} className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
        </div>
      </div>
      {message && <p role="status" className="rounded-lg border border-border p-3 text-sm">{message}</p>}
      {error && <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">{error}</p>}

      {preview ? (
        <div className="rounded-xl border border-dashed border-border p-4 sm:p-8"><PackagesView pricing={data} /></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void save() }} className="grid gap-6">
          <fieldset className="grid gap-4 rounded-xl border border-border p-4">
            <legend className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Page copy</legend>
            <label className={labelClass}>Intro (under the heading)<textarea className={inputClass} rows={2} value={data.intro} onChange={(e) => set("intro", e.target.value)} maxLength={600} /></label>
            <label className={labelClass}>How it works (under the rates)<textarea className={inputClass} rows={3} value={data.terms} onChange={(e) => set("terms", e.target.value)} maxLength={1000} /></label>
            <div className="grid gap-3 sm:grid-cols-3">
              {CURRENCIES.map((code) => <label key={code} className={labelClass}>Tax note, {code}<input className={inputClass} value={data.taxNote[code]} onChange={(e) => set("taxNote", { ...data.taxNote, [code]: e.target.value })} maxLength={160} /></label>)}
            </div>
          </fieldset>

          {data.packages.map((item, index) => (
            <fieldset key={item.id} className={`grid gap-4 rounded-xl border p-4 ${item.popular ? "border-foreground" : "border-border"} ${item.hidden ? "opacity-60" : ""}`}>
              <legend className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Package {index + 1}{item.hidden ? " · not published" : " · published"}</legend>
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <label className={labelClass}>Name<input className={inputClass} value={item.name} onChange={(e) => setPackage(item.id, { name: e.target.value })} maxLength={60} required /></label>
                <label className={labelClass}>Who it&apos;s for<input className={inputClass} value={item.audience} onChange={(e) => setPackage(item.id, { audience: e.target.value })} maxLength={200} /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className={labelClass}>Timeline<input className={inputClass} value={item.timeline} onChange={(e) => setPackage(item.id, { timeline: e.target.value })} maxLength={60} placeholder="6–8 weeks" /></label>
                <label className={labelClass}>Concepts<input className={inputClass} type="number" min={0} max={20} value={item.concepts} onChange={(e) => setPackage(item.id, { concepts: Number(e.target.value) })} /></label>
                <label className={labelClass}>Revision rounds<input className={inputClass} type="number" min={0} max={20} value={item.rounds} onChange={(e) => setPackage(item.id, { rounds: Number(e.target.value) })} /></label>
              </div>
              <div><p className="mb-1.5 text-sm">From price</p><Money value={item.from} onChange={(from) => setPackage(item.id, { from })} /></div>
              <label className={labelClass}>What&apos;s included (one per line)<textarea className={inputClass} rows={Math.max(4, item.includes.length + 1)} value={item.includes.join("\n")} onChange={(e) => setPackage(item.id, { includes: e.target.value.split("\n") })} /></label>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(item.popular)} onChange={(e) => set("packages", data.packages.map((p) => ({ ...p, popular: p.id === item.id ? e.target.checked : false })))} /> Most chosen (highlighted)</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!item.hidden} onChange={(e) => setPackage(item.id, { hidden: !e.target.checked })} /> Publish package on frontend</label>
                <div className="ml-auto flex gap-1">
                  <button type="button" onClick={() => set("packages", move(data.packages, index, -1))} disabled={index === 0} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => set("packages", move(data.packages, index, 1))} disabled={index === data.packages.length - 1} className="rounded border border-border px-2 py-1 text-xs disabled:opacity-30" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => { if (data.packages.length > 1 && window.confirm(`Remove the ${item.name || "package"} package?`)) set("packages", data.packages.filter((p) => p.id !== item.id)) }} className="rounded border border-border px-2 py-1 text-xs" aria-label="Remove">×</button>
                </div>
              </div>
            </fieldset>
          ))}
          <button type="button" onClick={() => set("packages", [...data.packages, { id: newId(), name: "", audience: "", timeline: "", concepts: 2, rounds: 2, from: money(), includes: [] }])} className="w-fit rounded-lg border border-border px-3 py-2 text-sm">Add a package</button>

          <RateList title="Add-ons and single pieces" note="Listed under the packages, with “from” prices." list={data.addOns} onChange={(list) => set("addOns", list)} />
          <RateList title="Ongoing work" note="Retainer, hourly and day rates. The unit shows after the price (“a month”, “an hour”)." list={data.ongoing} onChange={(list) => set("ongoing", list)} />

          <fieldset className="grid gap-2 rounded-xl border border-border p-4">
            <legend className="px-1 text-xs uppercase tracking-widest text-muted-foreground">Contact form budget ranges (from the package prices)</legend>
            {CURRENCIES.map((code) => <p key={code} className="text-sm"><span className="text-muted-foreground">{CURRENCY_LABELS[code]}:</span> {budgets[code].join(" · ")}</p>)}
            <p className="text-xs text-muted-foreground">Lowest shown package: {CURRENCIES.map((code) => formatMoney(Math.min(...data.packages.filter((p) => !p.hidden).map((p) => p.from[code] || Infinity)), code)).join(" · ")}</p>
          </fieldset>

          <div className="flex items-center gap-3">
            <button disabled={busy} className="rounded-full bg-foreground px-5 py-3 text-sm text-background disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
            <p className="text-xs text-muted-foreground">Changes go live on /packages within a few seconds of saving.</p>
          </div>
        </form>
      )}
    </div>
  )
}
