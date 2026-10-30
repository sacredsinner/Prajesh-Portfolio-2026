"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              await onConfirm()
              onOpenChange(false)
            }}
            className={`rounded-full px-4 py-2 text-sm text-white font-medium disabled:opacity-50 transition-colors ${
              isDestructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
