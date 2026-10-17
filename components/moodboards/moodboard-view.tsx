import { textOn, type MoodboardItem, type MoodboardSection } from "@/lib/moodboards"

// The board itself, as the client sees it. Server-renderable; no interactivity.
export function MoodboardView({ sections }: { sections: MoodboardSection[] }) {
  const filled = sections.filter((section) => section.items.length > 0)
  if (filled.length === 0) return <p className="text-muted-foreground">Nothing on this board yet.</p>
  return (
    <div className="space-y-16">
      {filled.map((section, index) => (
        <section key={section.id} id={`section-${section.id}`} className="border-t border-border pt-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="font-serif text-3xl md:text-4xl"><span className="mr-3 font-mono text-sm text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>{section.title}</h2>
            {section.note && <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{section.note}</p>}
          </div>
          <SectionGrid items={section.items} />
        </section>
      ))}
    </div>
  )
}

function SectionGrid({ items }: { items: MoodboardItem[] }) {
  const colours = items.filter((item) => item.type === "colour")
  const rest = items.filter((item) => item.type !== "colour")
  return (
    <div className="space-y-6">
      {colours.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {colours.map((item) => item.type === "colour" && (
            <div key={item.id} className="flex aspect-[4/5] flex-col justify-end border border-border p-4" style={{ background: item.hex, color: textOn(item.hex) }}>
              <p className="text-sm font-semibold">{item.name || item.hex.toUpperCase()}</p>
              <p className="text-xs opacity-80">{item.hex.toUpperCase()}{item.note ? ` · ${item.note}` : ""}</p>
            </div>
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => {
            if (item.type === "image") {
              return (
                <figure key={item.id} className={item.wide ? "sm:col-span-2 lg:col-span-3" : ""}>
                  <img src={item.url} alt={item.caption || ""} loading="lazy" className="w-full border border-border bg-white object-cover" />
                  {item.caption && <figcaption className="mt-2 text-xs text-muted-foreground">{item.caption}</figcaption>}
                </figure>
              )
            }
            if (item.type === "type") {
              return (
                <div key={item.id} className="border border-border p-6">
                  <p className="text-4xl leading-tight" style={{ fontFamily: `'${item.family}', serif` }}>{item.sample || "Aa Bb Cc 0123"}</p>
                  <p className="mt-4 text-sm font-semibold">{item.family}</p>
                  {item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}
                  <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(item.family).replace(/%20/g, "+")}:ital,wght@0,400;0,600;1,400&display=swap`} />
                </div>
              )
            }
            if (item.type === "note") {
              return <blockquote key={item.id} className="border-l border-foreground bg-secondary/40 p-6 font-serif text-xl leading-snug whitespace-pre-line">{item.text}</blockquote>
            }
            return (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group border border-border p-6 transition-colors hover:bg-foreground hover:text-background">
                <p className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-background/70">Reference ↗</p>
                <p className="mt-3 font-serif text-xl">{item.title || item.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
                {item.note && <p className="mt-2 text-sm text-muted-foreground group-hover:text-background/70">{item.note}</p>}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
