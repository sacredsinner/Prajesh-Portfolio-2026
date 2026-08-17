import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-5rem)] w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex min-h-[calc(100vh-10rem)] flex-col justify-between border-y border-border py-8 sm:py-12">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>404 · Wrong turn</span>
          <span aria-hidden="true">[ Page not found ]</span>
        </div>

        <div className="grid gap-12 py-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="mb-6 font-mono text-sm text-muted-foreground">// signal interrupted</p>
            <h1 className="font-serif text-balance text-6xl leading-[0.9] tracking-[-0.06em] sm:text-8xl lg:text-[10rem]">
              Looks like we lost the thread.
            </h1>
          </div>
          <div className="flex max-w-sm flex-col gap-6 lg:pb-3">
            <p className="text-pretty text-base leading-7 text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t seem to be here anymore—or maybe it never was.
            </p>
            <p className="text-sm italic leading-6 text-muted-foreground">
              Good design is about finding the right direction. This wasn&apos;t it.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/" className="rounded-full bg-foreground px-5 py-3 text-sm text-background transition-opacity hover:opacity-75">
                Back to Home <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/projects" className="rounded-full border border-foreground px-5 py-3 text-sm transition-colors hover:bg-foreground hover:text-background">
                Explore My Work <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-border pt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Prajesh Shakya</span>
          <span className="font-mono">[ 00 / 01 ]</span>
        </div>
      </div>
    </main>
  )
}
