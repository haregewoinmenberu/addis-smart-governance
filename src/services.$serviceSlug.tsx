import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { ServiceRegistrationForm } from "@/components/landing/ServiceRegistrationForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SERVICES, type ServiceKey } from "@/lib/services-data";

export const Route = createFileRoute("/services/$serviceSlug")({
  loader: ({ params }) => {
    const key = params.serviceSlug as ServiceKey;
    const service = SERVICES[key];

    if (!service) {
      throw notFound();
    }

    return { service };
  },
  head: ({ loaderData }) => {
    const service = loaderData?.service;

    if (!service) {
      return { meta: [{ title: "Service not found — STRP" }] };
    }

    return {
      meta: [
        { title: `${service.title} — STRP` },
        { name: "description", content: service.tagline },
        { property: "og:title", content: `${service.title} — STRP` },
        { property: "og:description", content: service.tagline },
      ],
    };
  },
  component: ServiceDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <div className="text-sm font-semibold text-primary">404</div>
        <h1 className="mt-2 text-2xl font-bold">Service not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
          Back to home
        </Link>
      </div>
    </div>
  ),
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/" hash="services" className="hover:text-foreground">
              Services
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{service.title}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-soft">
                <Sparkles className="h-3 w-3 text-primary" />
                STRP Service Module
              </span>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                {service.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {service.tagline}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {service.description}
              </p>
            </div>

            <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <DetailStat label="Service type" value={service.title} />
              <DetailStat label="Workflow steps" value={`${service.workflow.length} stages`} />
              <DetailStat label="FAQs" value={`${service.faqs.length} answers`} />
              <DetailStat label="Application" value={service.formTitle} />
            </aside>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What this module includes
              </div>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {service.highlights.map((highlight: string) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Need help?
              </div>
              <div className="mt-2 text-xl font-semibold">Service desk available 24/7</div>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85">
                Reach the STRP support line for assistance with your application or to clarify
                submission requirements.
              </p>
              <a
                href="mailto:support@strp.gov.et"
                className="mt-5 inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors hover:bg-white/25"
              >
                support@strp.gov.et
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.workflow.map((step: { title: string; desc: string }, index: number) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
              >
                <div className="text-xs font-bold text-primary">STEP {index + 1}</div>
                <div className="mt-2 text-sm font-semibold">{step.title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="apply" className="py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{service.formTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.formSubtitle}</p>
            <div className="mt-8">
              <ServiceRegistrationForm kind={service.formKind} />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                FAQs
              </div>
              <Accordion type="single" collapsible className="mt-2">
                {service.faqs.map((faq: { q: string; a: string }) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-sm">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Link
              to="/"
              hash="services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all services
            </Link>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-snug text-foreground">{value}</div>
    </div>
  );
}
