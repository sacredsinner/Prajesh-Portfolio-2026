import Link from "next/link"
import type { Overview } from "@/lib/overview"
import { formatDate } from "@/lib/invoices"
import { formatMoney, isCurrency } from "@/lib/money"

// The admin home: what needs attention today, money, audience and recent activity.
export function OverviewPanel({ data, onOpenContacts }: { data: Overview; onOpenContacts: () => void }) {
  const { enquiries, money, moodboards, content, audience } = data
  const attention = [
    enquiries.newCount > 0 && { label: `${enquiries.newCount} new enquir${enquiries.newCount === 1 ? "y" : "ies"} to reply to`, action: onOpenContacts },
    money.overdueCount > 0 && { label: `${money.overdueCount} overdue invoice${money.overdueCount === 1 ? "" : "s"} (${money.overdueAmounts.join(" · ")})`, href: "/admin/invoices" },
    money.quotesAccepted > 0 && { label: `${money.quotesAccepted} accepted quote${money.quotesAccepted === 1 ? "" : "s"} ready to invoice`, href: "/admin/invoices" },
    moodboards.changesRequested > 0 && { label: `${moodboards.changesRequested} moodboard${moodboards.changesRequested === 1 ? "" : "s"} with change requests`, href: "/admin/moodboards" },
    content.drafts > 0 && { label: `${content.drafts} unpublished note${content.drafts === 1 ? "" : "s"}` },
  ].filter(Boolean) as { label: string; href?: string; action?: () => void }[]
  const when = (date: Date | null) => (date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kathmandu" }).format(date) : "")

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New enquiries" value={String(enquiries.newCount)} note={`${enquiries.monthCount} in the last 30 days`} />
        <Stat label="Outstanding" value={money.outstanding.join(" · ") || "—"} note={money.overdueCount ? `${money.overdueCount} overdue` : `${money.quotesOpen} quote${money.quotesOpen === 1 ? "" : "s"} awaiting reply`} warn={money.overdueCount > 0} />
        <Stat label="Paid this year" value={money.paidThisYear.join(" · ") || "—"} note={`${content.projects} projects · ${content.notes} notes live`} />
        <Link href="/admin/newsletter" className="min-w-0"><Stat label="Audience" value={audience.newsletter === null ? "—" : String(audience.newsletter)} note={audience.newsletter === null ? "Newsletter count needs a full-access Resend key" : `newsletter subscribers · ${audience.leads ?? "—"} leads in Resend`} /></Link>
      </section>

      {attention.length > 0 && (
        <section className="rounded-xl border border-foreground p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Needs attention</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {attention.map((item) => (
              <li key={item.label} className="text-sm">
                {item.href ? <Link href={item.href} className="underline underline-offset-4">{item.label} →</Link> : item.action ? <button type="button" onClick={item.action} className="underline underline-offset-4">{item.label} →</button> : item.label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Latest enquiries" more={{ label: "All contacts", action: onOpenContacts }}>
          {enquiries.recent.map((c) => (
            <li key={c.id} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0"><p className="truncate text-sm">{c.name}{c.company ? ` · ${c.company}` : ""}</p><p className="truncate text-xs text-muted-foreground">{[c.packageInterest, c.budget].filter(Boolean).join(" · ") || c.email}</p></div>
              <span className={`shrink-0 text-xs ${c.status === "new" ? "font-semibold" : "text-muted-foreground"}`}>{c.status === "new" ? "New" : when(c.createdAt)}</span>
            </li>
          ))}
          {enquiries.recent.length === 0 && <li className="py-2 text-sm text-muted-foreground">No enquiries yet.</li>}
        </Card>
        <Card title="Unpaid invoices" more={{ label: "Invoices", href: "/admin/invoices" }}>
          {money.unpaidList.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0"><p className="truncate text-sm">{d.number} · {d.clientName}</p><p className={`text-xs ${d.overdue ? "text-destructive" : "text-muted-foreground"}`}>{d.dueDate ? `${d.overdue ? "Overdue since" : "Due"} ${formatDate(d.dueDate)}` : "Due on receipt"}</p></div>
              <span className="shrink-0 text-sm">{isCurrency(d.currency) ? formatMoney(Number(d.total), d.currency) : d.total}</span>
            </li>
          ))}
          {money.unpaidList.length === 0 && <li className="py-2 text-sm text-muted-foreground">Nothing outstanding.</li>}
        </Card>
        <Card title="Moodboards" more={{ label: "Moodboards", href: "/admin/moodboards" }}>
          {moodboards.recentComments.slice(0, 3).map((c) => (
            <li key={c.id} className="py-2"><p className="truncate text-xs text-muted-foreground">{c.author}{c.kind === "approval" ? " approved" : c.kind === "changes" ? " asked for changes" : " commented"} · {c.boardTitle}</p><p className="line-clamp-2 text-sm">{c.body}</p></li>
          ))}
          {moodboards.recentComments.length === 0 && moodboards.recent.map((b) => (
            <li key={b.id} className="flex items-start justify-between gap-3 py-2"><p className="truncate text-sm">{b.title}</p><span className="shrink-0 text-xs text-muted-foreground">{b.shared ? b.status : "draft"}</span></li>
          ))}
          {moodboards.recent.length === 0 && <li className="py-2 text-sm text-muted-foreground">No moodboards yet.</li>}
        </Card>
      </section>
    </div>
  )
}

function Stat({ label, value, note, warn }: { label: string; value: string; note: string; warn?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 truncate font-serif text-2xl">{value}</p>
      <p className={`mt-1 text-xs ${warn ? "text-destructive" : "text-muted-foreground"}`}>{note}</p>
    </div>
  )
}

function Card({ title, more, children }: { title: string; more: { label: string; href?: string; action?: () => void }; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border p-4">
      <div className="flex items-baseline justify-between"><p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>{more.href ? <Link href={more.href} className="text-xs underline underline-offset-4">{more.label}</Link> : <button type="button" onClick={more.action} className="text-xs underline underline-offset-4">{more.label}</button>}</div>
      <ul className="mt-2 divide-y divide-border">{children}</ul>
    </div>
  )
}
