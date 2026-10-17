import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { NewsletterForm } from "@/components/newsletter-form"
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site"

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Notes" },
  { href: "/clients", label: "Clients" },
  { href: "/contact", label: "Contact" },
]

// `newsletter={false}` hides the sign-up (the /newsletter page has its own).
export function Footer({ newsletter = true }: { newsletter?: boolean }) {
  return (
    <footer className="border-t border-border">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <BrandMark className="h-7 w-7" />
              <span className="text-[13px] font-semibold uppercase tracking-[0.3em]">Prajesh Shakya</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              I build distinctive brand identities through strategy, design, and meaningful visual systems.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block text-sm underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Navigation
            </h2>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-muted-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Connect
            </h2>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-muted-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        {newsletter && (
          <div className="mt-16 grid grid-cols-1 gap-6 border-t border-border pt-10 md:grid-cols-2 md:items-end md:gap-12">
            <div className="space-y-3">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Notes by email</h2>
              <p className="max-w-sm font-serif text-2xl leading-snug">New thinking on brand strategy and identity, in your inbox.</p>
            </div>
            <NewsletterForm className="w-full min-w-0 md:max-w-md md:justify-self-end" />
          </div>
        )}

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Prajesh Shakya. All rights reserved.
          </p>
          <p className="font-serif text-lg italic text-muted-foreground">
            Designed with intention.
          </p>
        </div>
      </div>
    </footer>
  )
}
