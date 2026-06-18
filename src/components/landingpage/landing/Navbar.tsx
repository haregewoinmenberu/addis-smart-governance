import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Globe, Moon, Sun } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About STRP", href: "#about" },
  { label: "Digital Transformation", href: "#transformation" },
  { label: "Help Center", href: "#help" },
];

const languages = ["EN", "AM", "ORO"] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<(typeof languages)[number]>("EN");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const cycleLang = () => {
    const i = languages.indexOf(lang);
    setLang(languages[(i + 1) % languages.length]);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <nav
          className={`glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 ${
            scrolled ? "shadow-soft" : ""
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none">
                <path
                  d="M12 2L3 7v6c0 5 3.5 8.5 9 10 5.5-1.5 9-5 9-10V7l-9-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">STRP</div>
              <div className="hidden text-[10px] font-medium text-muted-foreground sm:block">
                Gov Tech Portal
              </div>
            </div>
          </Link>

          {/* Center links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleLang}
              aria-label="Switch language"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent sm:flex"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              className="hidden h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-foreground/80 transition-colors hover:bg-accent sm:grid"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className="hidden h-9 items-center rounded-lg bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] md:inline-flex"
            >
              Login
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="glass-strong mt-2 rounded-2xl p-3 lg:hidden">
            <ul className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    onClick={() => setOpen(false)}
                    href={l.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link
                to="/login"
                className="flex-1 rounded-lg bg-gradient-primary py-2 text-center text-sm font-semibold text-primary-foreground"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
