"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { CommandPalette } from "@/components/admin/command-palette"
import { Search, ExternalLink, LogOut } from "lucide-react"

export type AdminSection =
  | "overview"
  | "projects"
  | "posts"
  | "testimonials"
  | "contacts"
  | "showcase"
  | "email"
  | "clients"
  | "invoices"
  | "moodboards"
  | "packages"
  | "newsletter"

interface AdminHeaderProps {
  active: AdminSection
  user?: { name?: string | null; email?: string | null }
  counts?: {
    projects?: number
    posts?: number
    contacts?: number
    testimonials?: number
    showcase?: number
  }
  onTabChange?: (section: AdminSection) => void
  actions?: React.ReactNode
}

export function AdminHeader({
  active,
  user,
  counts,
  onTabChange,
  actions,
}: AdminHeaderProps) {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const navItems: { id: AdminSection; label: string; href: string; count?: number }[] = [
    { id: "overview", label: "Overview", href: "/admin?tab=overview" },
    { id: "projects", label: "Projects", href: "/admin?tab=projects", count: counts?.projects },
    { id: "posts", label: "Notes", href: "/admin?tab=posts", count: counts?.posts },
    { id: "contacts", label: "Contacts", href: "/admin?tab=contacts", count: counts?.contacts },
    { id: "clients", label: "Clients", href: "/admin/clients" },
    { id: "moodboards", label: "Moodboards", href: "/admin/moodboards" },
    { id: "invoices", label: "Invoices", href: "/admin/invoices" },
    { id: "packages", label: "Packages", href: "/admin/packages" },
    { id: "newsletter", label: "Newsletter", href: "/admin/newsletter" },
    { id: "testimonials", label: "Testimonials", href: "/admin?tab=testimonials", count: counts?.testimonials },
    { id: "showcase", label: "Showcase", href: "/admin?tab=showcase", count: counts?.showcase },
    { id: "email", label: "Email", href: "/admin?tab=email" },
  ]

  const tabClass = (isActive: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
      isActive
        ? "bg-foreground text-background"
        : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    // If we're on the main dashboard and clicking an in-page tab
    if (onTabChange && ["overview", "projects", "posts", "testimonials", "contacts", "showcase", "email"].includes(item.id)) {
      e.preventDefault()
      onTabChange(item.id)
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Prajesh Shakya / Studio
            </p>
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" title="Connected" />
          </div>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Content studio</h1>
          {user?.email && (
            <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="size-3.5" />
            <span>Search or jump…</span>
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <span>Live site</span>
            <ExternalLink className="size-3" />
          </Link>

          <button
            type="button"
            onClick={() =>
              authClient.signOut().then(() => {
                router.push("/admin")
                router.refresh()
              })
            }
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
          >
            <LogOut className="size-3" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap items-center gap-2 py-4 border-b border-border/40">
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {navItems.map((item) => {
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={tabClass(isActive)}
              >
                {item.label}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? "bg-background/20 text-background" : "bg-secondary text-foreground"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {actions && <div className="ml-auto shrink-0 flex items-center gap-2">{actions}</div>}
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  )
}
