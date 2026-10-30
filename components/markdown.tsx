import type { ReactNode } from "react"
import { SITE_URL } from "@/lib/site"

// Small, safe Markdown renderer for notes written in the admin or synced from Notion. Supports
// ## / ### headings, paragraphs, **bold**, *italic*, `code`, [links](url),
// ![images](url), "- " and "1. " lists and "> " quotes. It builds React elements, never raw
// HTML, so nothing typed into a note can inject markup or scripts.

const INLINE = /(!\[[^\]]*\]\([^)\s]+\)|\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g

function safeHref(href: string) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : null
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href) && !href.startsWith(SITE_URL)
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let index = 0
  for (const match of text.matchAll(INLINE)) {
    const token = match[0]
    const start = match.index ?? 0
    if (start > last) nodes.push(text.slice(last, start))
    const key = `${keyPrefix}-${index++}`
    if (token.startsWith("![")) {
      const [, alt, rawSrc] = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(token) ?? []
      const src = rawSrc ? safeHref(rawSrc) : null
      if (src) {
        nodes.push(
          <span key={key} className="my-6 block overflow-hidden rounded-xl border border-border bg-secondary/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt || "Note visual"} className="w-full h-auto object-cover max-h-[600px]" loading="lazy" />
            {alt ? <span className="block border-t border-border bg-secondary/30 p-2 text-center text-xs text-muted-foreground">{alt}</span> : null}
          </span>
        )
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key} className="font-semibold">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key} className="bg-secondary px-1 font-mono text-[0.9em]">{token.slice(1, -1)}</code>)
    } else if (token.startsWith("[")) {
      const [, label, rawHref] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? []
      const href = rawHref ? safeHref(rawHref) : null
      nodes.push(href ? (
        <a key={key} href={href} className="underline underline-offset-4 hover:opacity-70" {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>
      ) : label)
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    }
    last = start + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function withLineBreaks(lines: string[], keyPrefix: string) {
  return lines.flatMap((line, index) => [index > 0 ? <br key={`${keyPrefix}-br-${index}`} /> : null, ...renderInline(line, `${keyPrefix}-${index}`)])
}

export function Markdown({ content }: { content: string }) {
  const blocks = content.replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((block) => block.split("\n").filter((line) => line.trim() !== "")).filter((lines) => lines.length > 0)

  return (
    <div className="space-y-6 text-base leading-8 md:text-lg md:leading-8">
      {blocks.map((lines, index) => {
        const key = `block-${index}`
        const first = lines[0].trim()

        // Standalone image block
        const imgMatch = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/.exec(first)
        if (lines.length === 1 && imgMatch) {
          const [, alt, rawSrc] = imgMatch
          const src = safeHref(rawSrc)
          if (src) {
            return (
              <figure key={key} className="my-8 overflow-hidden rounded-xl border border-border bg-secondary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt || "Note visual"} className="w-full h-auto object-cover max-h-[650px]" loading="lazy" />
                {alt ? <figcaption className="border-t border-border bg-secondary/30 p-2.5 text-center text-xs text-muted-foreground">{alt}</figcaption> : null}
              </figure>
            )
          }
        }

        if (lines.length === 1 && /^#{1,2}\s/.test(first)) {
          return <h2 key={key} className="pt-6 font-serif text-3xl leading-tight md:text-4xl">{renderInline(first.replace(/^#{1,2}\s+/, ""), key)}</h2>
        }
        if (lines.length === 1 && /^#{3,6}\s/.test(first)) {
          return <h3 key={key} className="pt-4 font-serif text-2xl leading-tight">{renderInline(first.replace(/^#{3,6}\s+/, ""), key)}</h3>
        }
        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return <ul key={key} className="list-disc space-y-2 pl-6">{lines.map((line, item) => <li key={item}>{renderInline(line.replace(/^\s*[-*]\s+/, ""), `${key}-${item}`)}</li>)}</ul>
        }
        if (lines.every((line) => /^\s*\d+[.)]\s+/.test(line))) {
          return <ol key={key} className="list-decimal space-y-2 pl-6">{lines.map((line, item) => <li key={item}>{renderInline(line.replace(/^\s*\d+[.)]\s+/, ""), `${key}-${item}`)}</li>)}</ol>
        }
        if (lines.every((line) => /^\s*>/.test(line))) {
          return <blockquote key={key} className="border-l border-foreground pl-6 font-serif text-2xl leading-snug">{withLineBreaks(lines.map((line) => line.replace(/^\s*>\s?/, "")), key)}</blockquote>
        }
        return <p key={key}>{withLineBreaks(lines, key)}</p>
      })}
    </div>
  )
}
