import heroDashboard from "@/assets/hero-dashboard.jpg";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, PlayCircle, Sparkles, Activity, BadgeCheck, GraduationCap, LineChart } from "lucide-react";

export function Hero() {
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
            One Government Portal for{" "}
            <span className="text-gradient">All Technology Services</span>{" "}
            in Addis Ababa
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            A unified digital governance platform enabling research, innovation
            transformation, professional licensing, and smart learning management
            under one secure ecosystem.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <span className="text-base"></span>
              Explore Services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
             
            <button className="inline-flex h-12 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-primary">
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </button>
          </div> 
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

