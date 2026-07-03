import heroDashboard from "@/assets/hero-dashboard.jpg";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Search } from "lucide-react";
import { useState } from "react";

const quickTags = ["Licensing", "Research grant", "Digital transformation", "Training"];

export function Hero() {
  const [query, setQuery] = useState("");
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 40%), radial-gradient(circle at 80% 10%, color-mix(in oklab, var(--primary-glow) 14%, transparent), transparent 45%)",
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 80%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[1.05fr_1fr]">
        {/* Left */}
        <div>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            ITDB Portal for <span className="text-gradient">All Tech Services</span> in Addis Ababa
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Start using Addis Ababa City Innovation and Technology Development Bureau unified
            Government Technology Portal today.
          </p>


          {/* Search bar */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mt-16 flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-elegant max-w-lg focus-within:ring-2 focus-within:ring-primary/30"
          >
            <div className="flex items-center gap-2 px-3 flex-1">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, licenses, programs…"
                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>  
        </div>

        {/* Right visual */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-glow">
            {/* shimmer line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
            </div>
            <img
              src={heroDashboard}
              alt="STRP AI government dashboard preview"
              width={1280}
              height={960}
              className="block w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
