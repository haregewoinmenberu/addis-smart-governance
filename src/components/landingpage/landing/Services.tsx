import { ArrowRight, FlaskConical, Cpu, ShieldCheck, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ServiceKey } from "@/lib/services-data";

type Service = {
  icon: LucideIcon;
  title: string;
  bullets: string[];
  slug: ServiceKey;
};

const services: Service[] = [
  {
    icon: FlaskConical,
    title: "Research & Innovation Hub",
    slug: "research",
    bullets: [
      "AI-driven research submission system",
      "Policy and technology research evaluation",
      "National innovation tracking dashboard",
    ],
  },
  {
    icon: Cpu,
    title: "Technology Transformation",
    slug: "transformation",
    bullets: [
      "Government system modernization",
      "Digital infrastructure transformation",
      "Smart city integration pipeline",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Professional Licensing",
    slug: "licensing",
    bullets: [
      "Digital licensing for IT professionals & vendors",
      "Certification workflows",
      "Automated verification system",
    ],
  },
  {
    icon: GraduationCap,
    title: "Learning Management System",
    slug: "lms",
    bullets: [
      "Government training platform",
      "E-learning for public sector workforce",
      "Certification and skill tracking",
    ],
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Core Services"
          title="Our Services"
          description="Every module is built on the same secure backbone — single sign-on, shared identity, and AI-driven workflows that move across agencies."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.title} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="hover-lift group relative flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.title}</h3>
      <ul className="mt-3 flex-1 space-y-2 text-sm text-muted-foreground">
        {service.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {b}
          </li>
        ))}
      </ul>
      <Link
        to="/services/$serviceSlug"
        params={{ serviceSlug: service.slug }}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform hover:translate-x-0.5"
      >
        Explore Module
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
