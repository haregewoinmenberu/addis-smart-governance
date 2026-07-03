import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles, HelpCircle, Mail } from "lucide-react";

import { Footer } from "@/components/landingpage/landing/Footer";
import { Navbar } from "@/components/landingpage/landing/Navbar";
import { ServiceRegistrationForm } from "@/components/landingpage/landing/ServiceRegistrationForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SERVICES, type ServiceKey } from "@/lib/services-data";

export const Route = createFileRoute("/services/$serviceSlug")({
  // Public route - no authentication required
  beforeLoad: () => {
    // This ensures the route is public and accessible to everyone
    return {};
  },
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

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-4">
          {/* Breadcrumb */}
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

          {/* Hero Content */}
          <div className="mt-8">
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {service.description}
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl">
              {service.stats.map((stat, index) => (
                <div key={index} className="rounded-xl border border-border bg-surface p-4 text-center shadow-soft">
                  <div className="text-2xl font-bold text-gradient sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
 
      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Simple workflow designed for efficiency and transparency
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.workflow.map((step, index) => (
              <li
                key={step.title}
                className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-soft hover:shadow-elegant transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                      {index + 1}
                    </span>
                    STEP
                  </span>
                  {index < service.workflow.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full">
                      <div className="h-0.5 w-4 bg-border" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-semibold leading-snug">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form Section */}
      <section id="apply" className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{service.formTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.formSubtitle}</p>
            <div className="mt-8">
              <ServiceRegistrationForm kind={service.formKind} />
            </div>
          </div>

          {/* FAQs Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                FAQs
              </div>
              <Accordion type="single" collapsible className="mt-4">
                {service.faqs.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
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
