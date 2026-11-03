"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, QrCode } from "lucide-react"

export function PaymentPanel({
  paymentInstructions,
  paymentLink,
  currency,
  total,
  documentNumber,
}: {
  paymentInstructions: string
  paymentLink: string | null
  currency: string
  total: string
  documentNumber: string
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Parse lines to detect bank account number, swift code, account holder
  const lines = paymentInstructions.split("\n").map((l) => l.trim()).filter(Boolean)
  const accNumMatch = paymentInstructions.match(/(?:Account\s*Number|A\/C\s*No|Account\s*#)[:\s]+([0-9A-Za-z]+)/i)
  const accountNumber = accNumMatch ? accNumMatch[1] : null

  const swiftMatch = paymentInstructions.match(/(?:Swift\s*code|Swift\/BIC)[:\s]+([0-9A-Za-z]+)/i)
  const swiftCode = swiftMatch ? swiftMatch[1] : null

  // Target URL for QR code (wise link, payment link, or encoded payment details)
  const qrTarget = paymentLink || (accountNumber ? `bank:${accountNumber}?swift=${swiftCode || ""}&amount=${total}&ref=${documentNumber}` : "")
  const qrApiUrl = qrTarget ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}&margin=4` : null

  return (
    <section className="space-y-5 border-t border-border py-6 print:border-border">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment Instructions</p>
        <div className="flex items-center gap-2 print:hidden">
          {qrApiUrl && (
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              {showQr ? "Hide QR" : "Show Payment QR"}
            </button>
          )}
          <button
            type="button"
            onClick={() => copyToClipboard(paymentInstructions, "all")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {copiedKey === "all" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey === "all" ? "Copied" : "Copy details"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed">
            <div className="space-y-1.5 whitespace-pre-line font-mono text-xs text-foreground/90">
              {paymentInstructions}
            </div>

            {(accountNumber || swiftCode) && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3 print:hidden">
                {accountNumber && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountNumber, "acc")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-sans text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    {copiedKey === "acc" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === "acc" ? "Account Copied" : `Copy A/C: ${accountNumber}`}
                  </button>
                )}
                {swiftCode && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(swiftCode, "swift")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-sans text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                  >
                    {copiedKey === "swift" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === "swift" ? "Swift Copied" : `Copy Swift: ${swiftCode}`}
                  </button>
                )}
              </div>
            )}
          </div>

          {paymentLink && (
            <div className="print:hidden">
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-medium tracking-wide text-background hover:opacity-90 transition-opacity"
              >
                <span>Pay online with Wise / Card</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* QR Code section */}
        {qrApiUrl && (
          <div className={`${showQr ? "flex" : "hidden sm:flex"} flex-col items-center justify-center rounded-xl border border-border p-3 bg-white text-center print:border`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrApiUrl}
              alt="Scan to pay"
              width={140}
              height={140}
              className="rounded-lg border border-border/40"
            />
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Scan to Pay ({currency})</p>
          </div>
        )}
      </div>
    </section>
  )
}
