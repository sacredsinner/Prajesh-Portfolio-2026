import Link from "next/link"

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Notes" },
  { href: "/clients", label: "Clients" },
  { href: "/contact", label: "Contact" },
]

const socialLinks = [
  { href: "https://instagram.com/prajeshshakya", label: "Instagram" },
  { href: "https://www.linkedin.com/in/prajeshshakya/", label: "LinkedIn" },
  { href: "https://dribbble.com/prajesh", label: "Dribbble" },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight hover:opacity-70 transition-opacity"
            >
              Prajesh Shakya
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              I build distinctive brand identities through strategy, design, and meaningful visual systems.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
              Navigation
            </h4>
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
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">
              Connect
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
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

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Prajesh Shakya. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Designed with intention
          </p>
        </div>
      </div>
    </footer>
  )
}
