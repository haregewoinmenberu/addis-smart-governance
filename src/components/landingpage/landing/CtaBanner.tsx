import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CtaBanner() {
  return (
    <section className="px-4 pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-cta p-10 text-primary-foreground shadow-glow sm:p-14">
        {/* animated waves */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-25 animate-wave"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 C300,300 600,100 1200,220 L1200,400 L0,400 Z"
            fill="white"
            fillOpacity="0.25"
          />
          <path
            d="M0,260 C400,140 800,340 1200,200 L1200,400 L0,400 Z"
            fill="white"
            fillOpacity="0.15"
          />
        </svg>
        <div
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "white" }}
        />

        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Start using Ethiopia's unified Government Technology Portal today.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
              Join agencies, professionals and citizens already operating on
              STRP — a smarter, faster, more transparent public sector.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/login"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-surface px-5 text-sm font-semibold text-primary shadow-elegant transition-transform hover:scale-[1.02]"
            >
              Request Government Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            
          </div>
        </div>
      </div>
    </section>
  );
}
