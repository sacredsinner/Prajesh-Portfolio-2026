"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CURRENCIES, formatMoney, guessCurrency, type Currency } from "@/lib/money"
import { ADD_ONS, ONGOING, PACKAGES, TAX_NOTE } from "@/lib/packages"
import { BOOKING_URL } from "@/lib/site"

// Packages and rates with a currency switch (guessed from the visitor's time zone).
export function PackagesView() {
  const [currency, setCurrency] = useState<Currency>("USD")
  useEffect(() => setCurrency(guessCurrency()), [])
  const from = (amounts: Record<Currency, number>) => formatMoney(amounts[currency], currency)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-y border-border py-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Prices in</span>
        {CURRENCIES.map((code) => (
          <button key={code} type="button" onClick={() => setCurrency(code)} className={`rounded-full px-4 py-1.5 text-sm ${code === currency ? "bg-foreground text-background" : "border border-border hover:border-foreground"}`} aria-pressed={code === currency}>{code}</button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{TAX_NOTE[currency]}</span>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PACKAGES.map((item) => (
          <article key={item.id} className={`flex flex-col border p-8 ${item.popular ? "border-foreground bg-foreground text-background" : "border-border"}`}>
            <p className={`text-xs uppercase tracking-widest ${item.popular ? "text-background/70" : "text-muted-foreground"}`}>{item.popular ? "Most chosen" : "Package"}</p>
            <h2 className="mt-4 font-serif text-4xl">{item.name}</h2>
            <p className={`mt-3 text-sm leading-relaxed ${item.popular ? "text-background/80" : "text-muted-foreground"}`}>{item.audience}</p>
            <p className="mt-8 font-serif text-3xl">From {from(item.from)}</p>
            <p className={`mt-1 text-xs ${item.popular ? "text-background/70" : "text-muted-foreground"}`}>{item.timeline} · {item.concepts} concepts · {item.rounds} revision rounds</p>
            <ul className={`mt-8 space-y-2 border-t pt-6 text-sm ${item.popular ? "border-background/20" : "border-border"}`}>
              {item.includes.map((line) => <li key={line} className="flex gap-3"><span aria-hidden="true">—</span>{line}</li>)}
            </ul>
            <Link href={`/contact?package=${item.name}`} className={`group mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm underline-offset-4 hover:underline`}>Start with {item.name} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </article>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-3xl">Add-ons and single pieces</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {ADD_ONS.map((rate) => (
              <li key={rate.name} className="flex items-baseline justify-between gap-6 py-3 text-sm"><span>{rate.name}{rate.unit ? <span className="text-muted-foreground"> · {rate.unit}</span> : null}</span><span className="shrink-0">from {from(rate.from)}</span></li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-3xl">Ongoing work</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {ONGOING.map((rate) => (
              <li key={rate.name} className="flex items-baseline justify-between gap-6 py-3 text-sm"><span>{rate.name}</span><span className="shrink-0">{from(rate.from)}{rate.unit ? ` ${rate.unit}` : ""}</span></li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Every project starts with a free 30-minute call. You&apos;ll have a written proposal within two working days. Payment is 50% to book and 50% before final files (40 / 30 / 30 for System). Rush timelines are possible at +30%.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-75">Start a project</Link>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="border border-foreground px-5 py-3 text-sm transition-colors hover:bg-foreground hover:text-background">Book a free call ↗</a>
          </div>
        </section>
      </div>
    </div>
  )
}
