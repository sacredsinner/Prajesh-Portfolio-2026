"use client"

import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Mail, Phone, MessageSquare, Copy, Check, Clock, Calendar, DollarSign, Briefcase, X } from "lucide-react"

export interface MobileLeadItem {
  id: string
  name: string
  company: string | null
  email: string
  message: string
  status: string
  notes: string | null
  packageInterest?: string | null
  budget?: string | null
  timeline?: string | null
  createdAt: Date | string | null
}

interface MobileLeadDrawerProps {
  lead: MobileLeadItem | null
  open: boolean
  onClose: () => void
  onUpdateStatus?: (id: string, newStatus: string) => Promise<void>
}

export function MobileLeadDrawer({ lead, open, onClose, onUpdateStatus }: MobileLeadDrawerProps) {
  const [copied, setCopied] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)

  if (!lead) return null

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(lead.email)
    setCopied(true)
    toast.success("Client email copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = async (status: string) => {
    if (!onUpdateStatus) return
    setUpdating(true)
    try {
      await onUpdateStatus(lead.id, status)
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const firstName = lead.name.split(" ")[0] || lead.name
  const whatsappText = encodeURIComponent(
    `Hi ${firstName}, Prajesh Shakya here regarding your design and identity inquiry for ${lead.company || "your brand"}. I'd love to connect and discuss your creative direction.`
  )
  const mailSubject = encodeURIComponent(`Design Direction & Collaboration — ${lead.company || lead.name} × Prajesh Shakya`)
  const formattedDate = lead.createdAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(lead.createdAt))
    : "Recent"

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[92vh] bg-background border-t border-border">
        {/* Drag handle pill is built into Vaul drawer */}
        <div className="overflow-y-auto px-5 py-4 pb-12 max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Inquiry Detail
                </span>
                <span className="inline-block h-1 w-1 rounded-full bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground">{formattedDate}</span>
              </div>
              <h2 className="font-serif text-2xl font-normal tracking-tight text-foreground">{lead.name}</h2>
              {lead.company && (
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {lead.company}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics / Tags Grid */}
          <div className="grid grid-cols-2 gap-2.5 py-4 border-b border-border text-xs">
            {lead.packageInterest && (
              <div className="rounded-lg bg-secondary/50 p-2.5 border border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
                  Package Interest
                </span>
                <span className="font-medium text-foreground">{lead.packageInterest}</span>
              </div>
            )}
            {lead.budget && (
              <div className="rounded-lg bg-secondary/50 p-2.5 border border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
                  Budget Scope
                </span>
                <span className="font-mono font-medium text-foreground">{lead.budget}</span>
              </div>
            )}
            {lead.timeline && (
              <div className="rounded-lg bg-secondary/50 p-2.5 border border-border/50">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
                  Timeline
                </span>
                <span className="font-medium text-foreground">{lead.timeline}</span>
              </div>
            )}
            <div className="rounded-lg bg-secondary/50 p-2.5 border border-border/50">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
                Current State
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium font-mono uppercase tracking-wider ${
                  lead.status === "new"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : lead.status === "in_progress" || lead.status === "replied"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {lead.status}
              </span>
            </div>
          </div>

          {/* Message Narrative */}
          <div className="py-4 border-b border-border space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
              Client Brief / Narrative
            </span>
            <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/60 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {lead.message || "No client narrative provided."}
            </div>
          </div>

          {/* Notes if any */}
          {lead.notes && (
            <div className="py-3 border-b border-border space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
                Internal Studio Notes
              </span>
              <p className="text-xs text-muted-foreground italic bg-secondary/20 p-2.5 rounded border border-border/40">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Quick Communication Actions */}
          <div className="py-4 space-y-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
              One-Tap Mobile Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`mailto:${lead.email}?subject=${mailSubject}`}
                className="flex items-center justify-center gap-2 h-11 px-3 rounded-lg bg-foreground text-background font-medium text-xs tracking-wide active:scale-[0.98] transition-all shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Reply Email
              </a>
              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 h-11 px-3 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-foreground font-medium text-xs tracking-wide active:scale-[0.98] transition-all"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                WhatsApp
              </a>
            </div>

            <button
              onClick={handleCopyEmail}
              className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-mono transition-colors active:scale-[0.98]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {lead.email}
            </button>
          </div>

          {/* Status Pipeline Switcher */}
          <div className="pt-2 pb-4 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block">
              Set Pipeline Status
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "new", label: "New" },
                { id: "read", label: "Read" },
                { id: "replied", label: "Replied" },
                { id: "archived", label: "Archive" },
              ].map((s) => (
                <button
                  key={s.id}
                  disabled={updating}
                  onClick={() => handleStatusChange(s.id)}
                  className={`py-2 px-1 rounded text-center text-xs font-mono uppercase tracking-wider transition-all active:scale-95 ${
                    lead.status === s.id
                      ? "bg-foreground text-background font-semibold"
                      : "bg-secondary/40 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
