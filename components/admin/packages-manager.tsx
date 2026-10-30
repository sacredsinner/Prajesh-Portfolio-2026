"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updatePricing } from "@/app/actions/pricing"
import { CURRENCIES, CURRENCY_LABELS, formatMoney, type Currency } from "@/lib/money"
import { newId } from "@/lib/moodboards"
import {
  budgetChoices,
  rateCard,
  visiblePackages,
  visibleRates,
  type Package,
  type Pricing,
  type Rate,
} from "@/lib/packages"
import { PackagesView } from "@/components/packages/packages-view"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { toast } from "sonner"
import {
  Save,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Star,
  ExternalLink,
  Layers,
  Sparkles,
  Clock,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  ListChecks,
  List,
  Edit3,
  Filter,
  DollarSign,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Check,
  Package as PackageIcon,
  PlusCircle,
  CheckCheck,
} from "lucide-react"

// Design Tokens & Presets
const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground placeholder:text-muted-foreground/60"
const labelClass = "block text-xs font-medium text-foreground mb-1.5"
const helperClass = "text-[11px] text-muted-foreground mt-1"

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NPR: "NPR",
  AUD: "A$",
  USD: "US$",
}

const DELIVERABLE_PRESETS = [
  "60-minute strategy kickoff call",
  "Competitor snapshot & market audit",
  "Primary & secondary logo suite",
  "Colour palette & typography hierarchy",
  "Brand guidelines & specs manual (PDF)",
  "Social media template kit & avatar suite",
  "Pitch deck & presentation template",
  "Business stationery suite",
  "Packaging & label system",
  "Interactive landing page design system",
  "5-second animated logo mark",
  "Handover walkthrough & master asset export",
  "30 days post-launch support & advisory",
]

const UNIT_PRESETS = [
  "per product",
  "per page",
  "per asset",
  "a month",
  "an hour",
  "a day",
  "one-time project",
  "3 months minimum",
]

const emptyMoney = (): Record<Currency, number> => ({ NPR: 0, AUD: 0, USD: 0 })

function moveItem<T>(list: T[], index: number, by: number): T[] {
  const target = index + by
  if (target < 0 || target >= list.length) return list
  const copy = [...list]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}

// -------------------------------------------------------------
// Sub-component: Money Input Group
// -------------------------------------------------------------
interface MoneyInputGroupProps {
  value: Record<Currency, number>
  onChange: (next: Record<Currency, number>) => void
  label?: string
  helper?: string
}

function MoneyInputGroup({ value, onChange, label, helper }: MoneyInputGroupProps) {
  return (
    <div className="space-y-2">
      {label && <label className={labelClass}>{label}</label>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CURRENCIES.map((code) => {
          const val = value[code] ?? 0
          return (
            <div
              key={code}
              className="rounded-lg border border-border/70 bg-secondary/30 p-2.5 transition-colors focus-within:border-foreground focus-within:bg-background"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground font-mono">
                <span className="font-semibold text-foreground">{code}</span>
                <span className="truncate">{CURRENCY_SYMBOLS[code]}</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground select-none font-mono">
                  {code === "NPR" ? "Rs." : code === "AUD" ? "A$" : "$"}
                </span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={val === 0 ? "" : val}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value
                    const parsed = raw === "" ? 0 : Math.max(0, Math.floor(Number(raw)))
                    onChange({ ...value, [code]: Number.isNaN(parsed) ? 0 : parsed })
                  }}
                  className="w-full bg-transparent text-sm font-mono font-medium outline-none text-foreground placeholder:text-muted-foreground/40"
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground font-mono truncate">
                {val > 0 ? formatMoney(val, code) : "Free / Included"}
              </p>
            </div>
          )
        })}
      </div>
      {helper && <p className={helperClass}>{helper}</p>}
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Deliverables / Inclusions Editor
// -------------------------------------------------------------
interface DeliverablesEditorProps {
  includes: string[]
  onChange: (next: string[]) => void
}

function DeliverablesEditor({ includes, onChange }: DeliverablesEditorProps) {
  const [newItem, setNewItem] = useState("")
  const [bulkMode, setBulkMode] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = (textToAdd?: string) => {
    const item = (textToAdd ?? newItem).trim()
    if (!item) return
    if (includes.length >= 20) {
      toast.warning("Maximum 20 deliverables reached for this package tier.")
      return
    }
    onChange([...includes, item])
    if (!textToAdd) {
      setNewItem("")
      inputRef.current?.focus()
    }
  }

  const handleRemove = (index: number) => {
    onChange(includes.filter((_, i) => i !== index))
  }

  const handleEdit = (index: number, val: string) => {
    const copy = [...includes]
    copy[index] = val
    onChange(copy)
  }

  const handleMove = (index: number, by: number) => {
    onChange(moveItem(includes, index, by))
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-secondary/20 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div>
          <span className="text-xs font-medium text-foreground">
            What&apos;s included in this tier
          </span>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            ({includes.length}/20 items)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setBulkMode(!bulkMode)}
          className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {bulkMode ? (
            <>
              <ListChecks className="size-3" />
              <span>Interactive mode</span>
            </>
          ) : (
            <>
              <Edit3 className="size-3" />
              <span>Paste / Bulk edit</span>
            </>
          )}
        </button>
      </div>

      {bulkMode ? (
        <div className="space-y-2">
          <textarea
            rows={Math.max(5, includes.length + 1)}
            value={includes.join("\n")}
            onChange={(e) => onChange(e.target.value.split("\n"))}
            className={`${inputClass} font-sans`}
            placeholder="One deliverable per line…"
          />
          <p className="text-[11px] text-muted-foreground">
            Edit or paste bullet points directly. Empty lines will be automatically cleaned when saved.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {includes.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground italic">
              No deliverables added yet. Use the input below or pick a preset.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {includes.map((item, index) => (
                <li
                  key={index}
                  className="group flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 transition-colors focus-within:border-foreground"
                >
                  <span className="font-mono text-[10px] text-muted-foreground select-none shrink-0 w-4 text-center">
                    {index + 1}
                  </span>
                  <input
                    value={item}
                    maxLength={160}
                    onChange={(e) => handleEdit(index, e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground outline-none"
                    placeholder="Describe deliverable..."
                  />
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === includes.length - 1}
                      className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                      title="Remove deliverable"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Quick Add Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newItem}
              maxLength={160}
              placeholder="Add another deliverable (press Enter)..."
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              className={`${inputClass} text-xs`}
            />
            <button
              type="button"
              onClick={() => handleAdd()}
              disabled={!newItem.trim() || includes.length >= 20}
              className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Presets Suggestions */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Quick Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DELIVERABLE_PRESETS.filter((p) => !includes.includes(p))
                .slice(0, 6)
                .map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAdd(preset)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Plus className="size-2.5" />
                    <span>{preset}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Package Card
// -------------------------------------------------------------
interface PackageCardProps {
  item: Package
  index: number
  total: number
  isExpanded: boolean
  onToggleExpand: () => void
  onChange: (patch: Partial<Package>) => void
  onMove: (by: number) => void
  onDuplicate: () => void
  onDelete: () => void
  onSetPopular: (isPopular: boolean) => void
}

function PackageCard({
  item,
  index,
  total,
  isExpanded,
  onToggleExpand,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
  onSetPopular,
}: PackageCardProps) {
  return (
    <article
      className={`rounded-xl border transition-all ${
        item.popular
          ? "border-foreground/80 bg-background shadow-xs ring-1 ring-foreground/10"
          : "border-border bg-background hover:border-border/80"
      } ${item.hidden ? "opacity-75" : ""}`}
    >
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/40 select-none">
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-foreground">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
                {item.name || "Untitled Package"}
              </h3>
              {item.popular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
                  <Star className="size-2.5 fill-current" />
                  Most Chosen
                </span>
              )}
              {item.hidden ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                  Hidden / Draft
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  <span className="size-1 rounded-full bg-emerald-500" />
                  Published
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {item.audience || "No audience description set"}
            </p>
          </div>
        </div>

        {/* Price snippet + actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right mr-2 font-mono text-xs text-muted-foreground">
            <span>From </span>
            <span className="font-medium text-foreground">
              {formatMoney(item.from.NPR, "NPR")}
            </span>
            <span className="mx-1 text-border">·</span>
            <span>{formatMoney(item.from.USD, "USD")}</span>
          </div>

          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition-colors"
            title="Move up"
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20 transition-colors"
            title="Move down"
          >
            <ChevronDown className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Duplicate package"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={total <= 1}
            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 disabled:opacity-20 transition-colors"
            title="Delete package"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="rounded-lg border border-border p-1.5 text-foreground hover:bg-secondary transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Row 1: Name and Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Package Tier Name</label>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.name.length}/60
                </span>
              </div>
              <input
                className={inputClass}
                value={item.name}
                maxLength={60}
                required
                placeholder="e.g. Foundation, Identity, System"
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Target Audience / Who it&apos;s for</label>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.audience.length}/200
                </span>
              </div>
              <input
                className={inputClass}
                value={item.audience}
                maxLength={200}
                placeholder="e.g. Growing businesses ready to be recognised across all touchpoints."
                onChange={(e) => onChange({ audience: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Timeline, Concepts, Rounds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Timeline</label>
              <input
                className={inputClass}
                value={item.timeline}
                maxLength={60}
                placeholder="e.g. 6–8 weeks"
                onChange={(e) => onChange({ timeline: e.target.value })}
              />
              <p className={helperClass}>Displayed on package card & proposal</p>
            </div>
            <div>
              <label className={labelClass}>Initial Concepts</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  className={`${inputClass} font-mono`}
                  value={item.concepts}
                  onChange={(e) =>
                    onChange({
                      concepts: Math.min(20, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">directions</span>
              </div>
              <p className={helperClass}>Explorations presented at milestone 1</p>
            </div>
            <div>
              <label className={labelClass}>Revision Rounds</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  className={`${inputClass} font-mono`}
                  value={item.rounds}
                  onChange={(e) =>
                    onChange({
                      rounds: Math.min(20, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">rounds</span>
              </div>
              <p className={helperClass}>Feedback cycles included in fee</p>
            </div>
          </div>

          {/* Row 3: Starting Rates */}
          <div>
            <MoneyInputGroup
              label="Starting Rates (From Amount)"
              helper="Prices exclude local taxes (VAT in Nepal, GST in Australia). These amounts feed contact form budget tiers."
              value={item.from}
              onChange={(from) => onChange({ from })}
            />
          </div>

          {/* Row 4: Deliverables List Editor */}
          <div>
            <DeliverablesEditor
              includes={item.includes}
              onChange={(includes) => onChange({ includes })}
            />
          </div>

          {/* Row 5: Flags & Options */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/40 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(item.popular)}
                  onChange={(e) => onSetPopular(e.target.checked)}
                  className="rounded border-border text-foreground focus:ring-0"
                />
                <span className="font-medium text-foreground">
                  Feature as &ldquo;Most chosen&rdquo;
                </span>
                <span className="text-[11px] text-muted-foreground">
                  (Inverts card with black background on frontend)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!item.hidden}
                  onChange={(e) => onChange({ hidden: !e.target.checked })}
                  className="rounded border-border text-foreground focus:ring-0"
                />
                <span className="font-medium text-foreground">Publish on frontend</span>
                <span className="text-[11px] text-muted-foreground">
                  (Visible on /packages & /contact)
                </span>
              </label>
            </div>

            <div className="text-[11px] font-mono text-muted-foreground">
              ID: <code>{item.id}</code>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// -------------------------------------------------------------
// Sub-component: Rate Item Card / Row (Add-ons & Ongoing)
// -------------------------------------------------------------
interface RateItemProps {
  item: Rate
  index: number
  total: number
  currencyView: Currency
  onChange: (patch: Partial<Rate>) => void
  onMove: (by: number) => void
  onDuplicate: () => void
  onDelete: () => void
}

function RateItemRow({
  item,
  index,
  total,
  currencyView,
  onChange,
  onMove,
  onDuplicate,
  onDelete,
}: RateItemProps) {
  const [editingMoney, setEditingMoney] = useState(false)

  return (
    <div
      className={`rounded-xl border border-border bg-background p-3.5 transition-colors ${
        item.hidden ? "opacity-60 bg-secondary/20" : ""
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Index and Name */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="font-mono text-xs text-muted-foreground select-none w-5 text-center shrink-0">
            {index + 1}
          </span>
          <div className="w-full">
            <input
              className={`${inputClass} text-xs font-medium`}
              value={item.name}
              maxLength={120}
              placeholder="Service or deliverable name..."
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
        </div>

        {/* Unit and Preset Chips */}
        <div className="w-full lg:w-48 shrink-0">
          <input
            className={`${inputClass} text-xs`}
            value={item.unit ?? ""}
            maxLength={40}
            placeholder="Unit (e.g. per product)"
            onChange={(e) => onChange({ unit: e.target.value })}
          />
        </div>

        {/* Pricing Summary / Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/40 px-3 py-1.5">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              {currencyView}:
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {formatMoney(item.from[currencyView] || 0, currencyView)}
            </span>
            <button
              type="button"
              onClick={() => setEditingMoney(!editingMoney)}
              className="ml-1 text-[11px] underline text-muted-foreground hover:text-foreground"
            >
              {editingMoney ? "Done" : "All 3"}
            </button>
          </div>

          {/* Visibility Checkbox */}
          <label className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs cursor-pointer hover:bg-secondary select-none">
            <input
              type="checkbox"
              checked={!item.hidden}
              onChange={(e) => onChange({ hidden: !e.target.checked })}
              className="rounded border-border text-foreground focus:ring-0"
            />
            <span className="text-[11px]">{item.hidden ? "Hidden" : "Shown"}</span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20"
              title="Move up"
            >
              <ChevronUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-20"
              title="Move down"
            >
              <ChevronDown className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="Duplicate rate"
            >
              <Copy className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete rate"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Multi-Currency Editor */}
      {editingMoney && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <MoneyInputGroup
            value={item.from}
            onChange={(from) => onChange({ from })}
            helper="Starting rate for this item across NPR, AUD, and USD."
          />
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Sync & Impact Inspector
// -------------------------------------------------------------
interface SyncInspectorProps {
  pricing: Pricing
}

function SyncInspector({ pricing }: SyncInspectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD")
  const budgets = budgetChoices(pricing)
  const rateCardItems = rateCard(pricing, selectedCurrency)
  const [searchFilter, setSearchFilter] = useState("")

  const filteredCard = useMemo(() => {
    if (!searchFilter.trim()) return rateCardItems
    const q = searchFilter.toLowerCase()
    return rateCardItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    )
  }, [rateCardItems, searchFilter])

  return (
    <div className="space-y-6">
      {/* Contact Form Budget Sync */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-emerald-500" />
              <h3 className="font-serif text-xl">Contact Form Budget Ranges</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Visitors choosing a project on <code>/contact</code> select from these dynamically generated budget tiers.
            </p>
          </div>
          <Link
            href="/contact"
            target="_blank"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            <span>View /contact form</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURRENCIES.map((code) => (
            <div key={code} className="rounded-lg border border-border/70 bg-secondary/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-foreground">{code}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {CURRENCY_LABELS[code].split("·")[1]?.trim()}
                </span>
              </div>
              <ul className="space-y-1.5 pt-2">
                {budgets[code].map((range, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs rounded-md bg-background/80 px-2.5 py-1 font-mono border border-border/40"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{range}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Rate Card Integration */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-blue-500" />
              <h3 className="font-serif text-xl">Invoice & Proposal Rate Card</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              These items can be inserted into client quotes and invoices with a single click in <code>/admin/invoices</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Currency:</span>
            {CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setSelectedCurrency(code)}
                className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                  code === selectedCurrency
                    ? "bg-foreground text-background font-medium"
                    : "border border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search invoice rate cards..."
              className={`${inputClass} pl-9 text-xs`}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {filteredCard.length} line items
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/40 rounded-lg border border-border/60">
          {filteredCard.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 p-3 hover:bg-secondary/20 text-xs">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
              </div>
              <span className="font-mono font-semibold text-foreground shrink-0">
                {formatMoney(item.price, selectedCurrency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Sub-component: Page Content & Policies Editor
// -------------------------------------------------------------
interface PageCopyProps {
  intro: string
  terms: string
  taxNote: Record<Currency, string>
  onIntroChange: (val: string) => void
  onTermsChange: (val: string) => void
  onTaxChange: (currency: Currency, val: string) => void
}

function PageCopyEditor({
  intro,
  terms,
  taxNote,
  onIntroChange,
  onTermsChange,
  onTaxChange,
}: PageCopyProps) {
  return (
    <div className="space-y-6">
      {/* Intro statement */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl">Introductory Statement</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rendered directly beneath the main heading on the public <code>/packages</code> page.
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{intro.length}/600</span>
        </div>
        <textarea
          rows={3}
          maxLength={600}
          value={intro}
          onChange={(e) => onIntroChange(e.target.value)}
          className={inputClass}
          placeholder="Every package starts with strategy and ends with an identity you can use everywhere..."
        />
      </div>

      {/* Terms & How it works */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl">Terms of Work &amp; Booking Cadence</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explains booking, payment milestones (e.g. 50/50), proposal turnaround, and rush fees.
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{terms.length}/1000</span>
        </div>
        <textarea
          rows={4}
          maxLength={1000}
          value={terms}
          onChange={(e) => onTermsChange(e.target.value)}
          className={inputClass}
          placeholder="Every project starts with a free 30-minute call. You'll have a written proposal within two working days..."
        />
      </div>

      {/* Regional Tax Notes */}
      <div className="rounded-xl border border-border bg-background p-6 space-y-4">
        <div>
          <h3 className="font-serif text-xl">Regional Tax Policies</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Appears at the top of the price table depending on which currency the visitor chooses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURRENCIES.map((code) => (
            <div key={code} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Tax note ({code})</label>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {taxNote[code]?.length || 0}/160
                </span>
              </div>
              <input
                className={inputClass}
                maxLength={160}
                value={taxNote[code] || ""}
                onChange={(e) => onTaxChange(code, e.target.value)}
                placeholder={
                  code === "NPR"
                    ? "Prices exclude VAT."
                    : code === "AUD"
                    ? "Prices exclude GST."
                    : "Prices exclude local taxes."
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN COMPONENT: PackagesManager
// -------------------------------------------------------------
type ActiveTab = "packages" | "addons" | "ongoing" | "copy" | "sync" | "preview"

export function PackagesManager({ initial }: { initial: Pricing }) {
  const router = useRouter()
  const [data, setData] = useState<Pricing>(initial)
  const savedRef = useRef<Pricing>(initial)
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("packages")
  const [currencyPreview, setCurrencyPreview] = useState<Currency>("USD")

  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState("")
  const [showStatusFilter, setShowStatusFilter] = useState<"all" | "shown" | "hidden">("all")

  // Accordion state for packages: set of expanded package IDs
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initMap: Record<string, boolean> = {}
    initial.packages.forEach((p) => {
      initMap[p.id] = true // default all open
    })
    return initMap
  })

  // Confirmation modals
  const [deletePackageTarget, setDeletePackageTarget] = useState<Package | null>(null)
  const [deleteRateTarget, setDeleteRateTarget] = useState<{ listKey: "addOns" | "ongoing"; rate: Rate } | null>(null)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Dirty State Tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(savedRef.current)
  }, [data])

  // Prevent accidental navigation when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  // State setters
  const set = useCallback(<K extends keyof Pricing>(key: K, value: Pricing[K]) => {
    setData((old) => ({ ...old, [key]: value }))
  }, [])

  const setPackage = useCallback((id: string, patch: Partial<Package>) => {
    setData((old) => ({
      ...old,
      packages: old.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }, [])

  const handleSetPopular = useCallback((id: string, isPopular: boolean) => {
    setData((old) => ({
      ...old,
      packages: old.packages.map((p) => ({
        ...p,
        popular: p.id === id ? isPopular : false, // Only one can be most chosen
      })),
    }))
  }, [])

  // Keyboard shortcut Ctrl/Cmd + S
  const save = useCallback(async () => {
    // Basic validation before network call
    if (data.packages.length === 0) {
      toast.error("You must have at least one package.")
      return
    }
    for (const pkg of data.packages) {
      if (!pkg.name.trim()) {
        toast.error("Every package must have a name.")
        setActiveTab("packages")
        return
      }
    }
    const visibleNames = data.packages.filter((p) => !p.hidden).map((p) => p.name.trim().toLowerCase())
    if (new Set(visibleNames).size !== visibleNames.length) {
      toast.error("Two visible packages share the exact same name. Please make them unique.")
      setActiveTab("packages")
      return
    }

    setBusy(true)
    const toastId = toast.loading("Saving package pricing & rate cards…")
    try {
      const cleanData: Pricing = {
        ...data,
        packages: data.packages.map((p) => ({
          ...p,
          includes: p.includes.map((s) => s.trim()).filter(Boolean),
        })),
      }
      const result = await updatePricing(cleanData)
      if (!result.ok) {
        toast.error(result.error, { id: toastId })
        return
      }
      savedRef.current = cleanData
      setData(cleanData)
      toast.success("Pricing saved! Public pages, contact forms & rate cards updated.", {
        id: toastId,
      })
      router.refresh()
    } catch {
      toast.error("Couldn't save pricing. Check connection and retry.", { id: toastId })
    } finally {
      setBusy(false)
    }
  }, [data, router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        void save()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [save])

  // Metric KPIs
  const visiblePkgs = useMemo(() => visiblePackages(data), [data])
  const popularPkg = useMemo(() => data.packages.find((p) => p.popular), [data.packages])

  // Filtered Add-ons & Ongoing
  const filteredAddOns = useMemo(() => {
    return data.addOns.filter((item) => {
      if (showStatusFilter === "shown" && item.hidden) return false
      if (showStatusFilter === "hidden" && !item.hidden) return false
      if (!searchFilter.trim()) return true
      const q = searchFilter.toLowerCase()
      return item.name.toLowerCase().includes(q) || (item.unit && item.unit.toLowerCase().includes(q))
    })
  }, [data.addOns, searchFilter, showStatusFilter])

  const filteredOngoing = useMemo(() => {
    return data.ongoing.filter((item) => {
      if (showStatusFilter === "shown" && item.hidden) return false
      if (showStatusFilter === "hidden" && !item.hidden) return false
      if (!searchFilter.trim()) return true
      const q = searchFilter.toLowerCase()
      return item.name.toLowerCase().includes(q) || (item.unit && item.unit.toLowerCase().includes(q))
    })
  }, [data.ongoing, searchFilter, showStatusFilter])

  // Bulk expand/collapse
  const allExpanded = useMemo(() => {
    return data.packages.every((p) => expandedIds[p.id])
  }, [data.packages, expandedIds])

  const toggleAllExpanded = () => {
    const nextState = !allExpanded
    const nextMap: Record<string, boolean> = {}
    data.packages.forEach((p) => {
      nextMap[p.id] = nextState
    })
    setExpandedIds(nextMap)
  }

  // Add package handler
  const handleAddPackage = () => {
    if (data.packages.length >= 6) {
      toast.warning("Maximum of 6 packages allowed by the schema.")
      return
    }
    const newPkg: Package = {
      id: newId(),
      name: `Package ${data.packages.length + 1}`,
      audience: "Specific client profile or industry tier",
      timeline: "4–6 weeks",
      concepts: 2,
      rounds: 2,
      from: { NPR: 50000, AUD: 3500, USD: 2500 },
      includes: ["Discovery kickoff call", "Core visual identity suite", "Brand guidelines PDF"],
      hidden: false,
    }
    set("packages", [...data.packages, newPkg])
    setExpandedIds((old) => ({ ...old, [newPkg.id]: true }))
    toast.success("New package created.")
  }

  // Duplicate package handler
  const handleDuplicatePackage = (pkg: Package) => {
    if (data.packages.length >= 6) {
      toast.warning("Maximum of 6 packages allowed by the schema.")
      return
    }
    const cloned: Package = {
      ...pkg,
      id: newId(),
      name: `${pkg.name} (Copy)`,
      includes: [...pkg.includes],
      from: { ...pkg.from },
      popular: false,
    }
    set("packages", [...data.packages, cloned])
    setExpandedIds((old) => ({ ...old, [cloned.id]: true }))
    toast.success(`Duplicated "${pkg.name}" tier.`)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Studio / Pricing Engine
            </span>
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                All changes saved
              </span>
            )}
          </div>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-foreground">Packages &amp; pricing</h2>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Curate your brand identity packages, single deliverables, and retainers. Changes sync instantly to the public{" "}
            <code className="text-foreground">/packages</code> catalog, contact budget dropdowns, and client invoices.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/packages"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <span>Live catalog</span>
            <ExternalLink className="size-3" />
          </Link>

          {isDirty && (
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <RotateCcw className="size-3" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "preview" ? "packages" : "preview")}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs hover:bg-secondary transition-colors"
          >
            <Eye className="size-3" />
            <span>{activeTab === "preview" ? "Back to Editor" : "Frontend Preview"}</span>
          </button>

          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
          >
            {busy ? (
              <>
                <span className="size-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="size-3" />
                <span>Save changes</span>
                <kbd className="hidden sm:inline-block rounded border border-background/20 bg-background/10 px-1 py-0.2 text-[9px] font-mono">
                  ⌘S
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Packages</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-foreground">{data.packages.length}</span>
            <span className="text-xs text-muted-foreground">({visiblePkgs.length} live)</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {popularPkg ? `Featured: ${popularPkg.name}` : "No featured tier"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Base Starting Fee</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-foreground">
              {formatMoney(
                Math.min(...visiblePkgs.map((p) => p.from.NPR || Infinity)),
                "NPR"
              )}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate font-mono">
            {formatMoney(Math.min(...visiblePkgs.map((p) => p.from.AUD || Infinity)), "AUD")} ·{" "}
            {formatMoney(Math.min(...visiblePkgs.map((p) => p.from.USD || Infinity)), "USD")}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Add-on Services</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-foreground">{data.addOns.length}</span>
            <span className="text-xs text-muted-foreground">({visibleRates(data.addOns).length} live)</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Single pieces & extras</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Retainers & Rates</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold font-mono text-foreground">{data.ongoing.length}</span>
            <span className="text-xs text-muted-foreground">({visibleRates(data.ongoing).length} live)</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Hourly, day & monthly</p>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-border bg-background p-3.5 space-y-1 flex flex-col justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Surface Integrations</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-foreground">
              <Check className="size-2.5 text-emerald-500" /> /packages
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-foreground">
              <Check className="size-2.5 text-emerald-500" /> /contact
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-foreground">
              <Check className="size-2.5 text-emerald-500" /> Invoices
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Revalidated on save</p>
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <nav className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "packages" as const, label: "Packages", count: data.packages.length, icon: PackageIcon },
            { id: "addons" as const, label: "Add-on Services", count: data.addOns.length, icon: PlusCircle },
            { id: "ongoing" as const, label: "Retainers & Rates", count: data.ongoing.length, icon: Clock },
            { id: "copy" as const, label: "Content & Tax", icon: FileText },
            { id: "sync" as const, label: "Live Sync Inspector", icon: Zap },
            { id: "preview" as const, label: "Frontend Preview", icon: Eye },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? "bg-background/20 text-background" : "bg-secondary text-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Contextual filter controls for Addons & Ongoing */}
        {(activeTab === "addons" || activeTab === "ongoing") && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rates…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-40 rounded-full border border-border bg-background pl-7 pr-3 py-1 text-xs outline-none focus:border-foreground"
              />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-full p-0.5 bg-secondary/30">
              <button
                type="button"
                onClick={() => setShowStatusFilter("all")}
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  showStatusFilter === "all" ? "bg-background text-foreground shadow-xs font-medium" : "text-muted-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setShowStatusFilter("shown")}
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  showStatusFilter === "shown" ? "bg-background text-foreground shadow-xs font-medium" : "text-muted-foreground"
                }`}
              >
                Shown
              </button>
              <button
                type="button"
                onClick={() => setShowStatusFilter("hidden")}
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  showStatusFilter === "hidden" ? "bg-background text-foreground shadow-xs font-medium" : "text-muted-foreground"
                }`}
              >
                Hidden
              </button>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-[11px] text-muted-foreground">Currency:</span>
              {CURRENCIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrencyPreview(code)}
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    code === currencyPreview ? "bg-foreground text-background" : "hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tab Contents */}
      {/* Tab: PACKAGES */}
      {activeTab === "packages" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl">Brand Identity Packages</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Core packages presented side-by-side on <code>/packages</code>. Up to 6 tiers supported.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAllExpanded}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
              <button
                type="button"
                onClick={handleAddPackage}
                disabled={data.packages.length >= 6}
                className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Plus className="size-3.5" />
                <span>Add package ({data.packages.length}/6)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {data.packages.map((item, index) => (
              <PackageCard
                key={item.id}
                item={item}
                index={index}
                total={data.packages.length}
                isExpanded={Boolean(expandedIds[item.id])}
                onToggleExpand={() =>
                  setExpandedIds((old) => ({ ...old, [item.id]: !old[item.id] }))
                }
                onChange={(patch) => setPackage(item.id, patch)}
                onMove={(by) => set("packages", moveItem(data.packages, index, by))}
                onDuplicate={() => handleDuplicatePackage(item)}
                onDelete={() => setDeletePackageTarget(item)}
                onSetPopular={(popular) => handleSetPopular(item.id, popular)}
              />
            ))}
          </div>

          {data.packages.length < 6 && (
            <button
              type="button"
              onClick={handleAddPackage}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-secondary/30 transition-all"
            >
              <Plus className="size-4" />
              <span>Add another package tier ({data.packages.length}/6)</span>
            </button>
          )}
        </section>
      )}

      {/* Tab: ADD-ONS */}
      {activeTab === "addons" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl">Add-ons &amp; Single Pieces</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specialized modular pieces listed under the core packages with starting prices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newRate: Rate = {
                  id: newId(),
                  name: "",
                  from: emptyMoney(),
                  unit: "per product",
                }
                set("addOns", [...data.addOns, newRate])
              }}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="size-3.5" />
              <span>Add a service</span>
            </button>
          </div>

          {filteredAddOns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No add-ons match the current filter or search criteria.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAddOns.map((rate) => {
                const actualIndex = data.addOns.findIndex((r) => r.id === rate.id)
                return (
                  <RateItemRow
                    key={rate.id}
                    item={rate}
                    index={actualIndex}
                    total={data.addOns.length}
                    currencyView={currencyPreview}
                    onChange={(patch) =>
                      set(
                        "addOns",
                        data.addOns.map((r) => (r.id === rate.id ? { ...r, ...patch } : r))
                      )
                    }
                    onMove={(by) => set("addOns", moveItem(data.addOns, actualIndex, by))}
                    onDuplicate={() => {
                      const cloned: Rate = {
                        ...rate,
                        id: newId(),
                        name: `${rate.name} (Copy)`,
                        from: { ...rate.from },
                      }
                      set("addOns", [...data.addOns, cloned])
                      toast.success(`Duplicated "${rate.name}".`)
                    }}
                    onDelete={() => setDeleteRateTarget({ listKey: "addOns", rate })}
                  />
                )
              })}
            </div>
          )}

          <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Common Unit Presets
            </span>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Click to quickly set standard billing cadences:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {UNIT_PRESETS.map((unit) => (
                <span
                  key={unit}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-mono text-muted-foreground"
                >
                  {unit}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab: ONGOING */}
      {activeTab === "ongoing" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-2xl">Ongoing Work &amp; Retainers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Retainer, hourly, and day rates for continuous brand advisory and design partner work.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newRate: Rate = {
                  id: newId(),
                  name: "",
                  from: emptyMoney(),
                  unit: "a month",
                }
                set("ongoing", [...data.ongoing, newRate])
              }}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="size-3.5" />
              <span>Add a retainer rate</span>
            </button>
          </div>

          {filteredOngoing.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No ongoing models match the current filter.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredOngoing.map((rate) => {
                const actualIndex = data.ongoing.findIndex((r) => r.id === rate.id)
                return (
                  <RateItemRow
                    key={rate.id}
                    item={rate}
                    index={actualIndex}
                    total={data.ongoing.length}
                    currencyView={currencyPreview}
                    onChange={(patch) =>
                      set(
                        "ongoing",
                        data.ongoing.map((r) => (r.id === rate.id ? { ...r, ...patch } : r))
                      )
                    }
                    onMove={(by) => set("ongoing", moveItem(data.ongoing, actualIndex, by))}
                    onDuplicate={() => {
                      const cloned: Rate = {
                        ...rate,
                        id: newId(),
                        name: `${rate.name} (Copy)`,
                        from: { ...rate.from },
                      }
                      set("ongoing", [...data.ongoing, cloned])
                      toast.success(`Duplicated "${rate.name}".`)
                    }}
                    onDelete={() => setDeleteRateTarget({ listKey: "ongoing", rate })}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab: PAGE COPY & TAX */}
      {activeTab === "copy" && (
        <section className="space-y-4">
          <PageCopyEditor
            intro={data.intro}
            terms={data.terms}
            taxNote={data.taxNote}
            onIntroChange={(intro) => set("intro", intro)}
            onTermsChange={(terms) => set("terms", terms)}
            onTaxChange={(currency, val) =>
              set("taxNote", { ...data.taxNote, [currency]: val })
            }
          />
        </section>
      )}

      {/* Tab: SYNC & IMPACT INSPECTOR */}
      {activeTab === "sync" && (
        <section className="space-y-4">
          <SyncInspector pricing={data} />
        </section>
      )}

      {/* Tab: LIVE FRONTEND PREVIEW */}
      {activeTab === "preview" && (
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-4 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Simulated Public View
                </p>
                <h3 className="font-serif text-2xl">Live Client Experience</h3>
              </div>
              <Link
                href="/packages"
                target="_blank"
                className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <span>Open in separate tab</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>

            <div className="rounded-lg border border-border/80 bg-background p-4 sm:p-8">
              <PackagesView pricing={data} />
            </div>
          </div>
        </section>
      )}

      {/* 5. Sticky Floating Action Bar when unsaved */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border border-foreground/20 bg-background/95 px-5 py-2.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3">
          <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            Unsaved changes in pricing
          </span>
          <div className="h-3 w-px bg-border mx-1" />
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            disabled={busy}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1 text-xs font-medium text-background hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
          >
            {busy ? "Saving…" : "Save changes (⌘S)"}
          </button>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmDialog
        open={deletePackageTarget !== null}
        onOpenChange={(open) => !open && setDeletePackageTarget(null)}
        title="Remove Package Tier"
        description={`Are you sure you want to delete the "${deletePackageTarget?.name || "Untitled"}" package? This will remove it from the draft.`}
        confirmLabel="Delete package"
        onConfirm={() => {
          if (!deletePackageTarget) return
          set(
            "packages",
            data.packages.filter((p) => p.id !== deletePackageTarget.id)
          )
          setDeletePackageTarget(null)
          toast.success("Package removed from draft.")
        }}
      />

      <ConfirmDialog
        open={deleteRateTarget !== null}
        onOpenChange={(open) => !open && setDeleteRateTarget(null)}
        title="Remove Service Rate"
        description={`Are you sure you want to remove "${deleteRateTarget?.rate.name || "this rate"}"?`}
        confirmLabel="Remove rate"
        onConfirm={() => {
          if (!deleteRateTarget) return
          const { listKey, rate } = deleteRateTarget
          set(listKey, data[listKey].filter((r) => r.id !== rate.id))
          setDeleteRateTarget(null)
          toast.success("Service rate removed from draft.")
        }}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Discard Unsaved Changes"
        description="Are you sure you want to discard all changes since your last save? This cannot be undone."
        confirmLabel="Discard changes"
        isDestructive={false}
        onConfirm={() => {
          setData(JSON.parse(JSON.stringify(savedRef.current)))
          setResetConfirmOpen(false)
          toast.info("Pricing draft reset to saved state.")
        }}
      />
    </div>
  )
}
