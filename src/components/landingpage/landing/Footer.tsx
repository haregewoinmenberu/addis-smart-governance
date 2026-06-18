import { Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer id="help" className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none">
                  <path d="M12 2L3 7v6c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold">Smart Technology Regulatory Portal</div>
                <div className="text-[11px] text-muted-foreground">One Government. One Portal. All Tech Services.</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              Addis Ababa City Administration —{" "}
              <span className="font-semibold text-foreground/80">
                Innovation & Technology Development Bureau
              </span>
              . The unified digital backbone of public sector technology.
            </p>
            <div className="mt-5 flex gap-2">
              {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Services"
            links={["Research Hub", "Transformation", "Licensing", "LMS"]}
          />
          <FooterCol
            title="Resources"
            links={["Help Center", "Privacy Policy", "Terms of Use", "Support"]}
          />

          <div>
            <div className="text-sm font-semibold">Contact</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Addis Ababa, Ethiopia
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                info@strp.gov.et
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                +251 11 000 0000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} STRP — Addis Ababa City Administration. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Accessibility</a>
            <a href="#" className="hover:text-foreground">Status</a>
            <a href="#" className="hover:text-foreground">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="transition-colors hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
