import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getServiceBySlug, getAllServices } from "@/lib/services-data";
import { Navbar } from "@/components/landingpage/landing/Navbar";
import { Footer } from "@/components/landingpage/landing/Footer";
import { ServiceRegistrationForm } from "@/components/landingpage/landing/ServiceRegistrationForm";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, ChevronDown, Zap, Target, Users, TrendingUp } from "lucide-react";
import { useState, useRef } from "react";

export const Route = createFileRoute("/services/$serviceSlug")({
  head: ({ params }) => {
    const service = getServiceBySlug(params.serviceSlug);
    return {
      meta: [
        { title: service ? `${service.title} — STRP Portal` : "Service — STRP Portal" },
        {
          name: "description",
          content: service?.description || "Smart Technology Regulatory Portal service details",
        },
        { property: "og:title", content: service?.title || "STRP Service" },
        {
          property: "og:description",
          content: service?.description || "STRP service details",
        },
      ],
    };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { serviceSlug } = Route.useParams();
  const navigate = useNavigate();
  const service = getServiceBySlug(serviceSlug);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-foreground">Service Not Found</h1>
            <p className="mt-4 text-muted-foreground">
              The service you're looking for doesn't exist or has been moved.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const Icon = service.icon;
  const allServices = getAllServices();
  const currentIndex = allServices.findIndex((s) => s.slug === serviceSlug);
  const nextService = allServices[(currentIndex + 1) % allServices.length];
  const prevService = allServices[(currentIndex - 1 + allServices.length) % allServices.length];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Simplified & Focused */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
        {/* Backdrop */}
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[600px] opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 40%), radial-gradient(circle at 80% 10%, color-mix(in oklab, var(--primary-glow) 14%, transparent), transparent 45%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronDown className="h-3 w-3 -rotate-90" />
            <Link to="/#services" className="hover:text-primary transition-colors">
              Services
            </Link>
            <ChevronDown className="h-3 w-3 -rotate-90" />
            <span className="text-foreground font-medium">{service.shortTitle}</span>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            {/* Service Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{service.shortTitle}</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>

            {/* Tagline */}
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              {service.tagline}
            </p>

            {/* CTA Buttons - Prominent */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={scrollToForm}
                className="group inline-flex h-14 items-center gap-2 rounded-xl bg-gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-glow"
              >
                <FileText className="h-5 w-5" />
                Apply Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link
                to="/login"
                className="inline-flex h-14 items-center gap-2 rounded-xl border-2 border-border bg-surface px-8 text-base font-semibold transition-all hover:border-primary/50 hover:bg-surface-elevated"
              >
                Sign In
              </Link>
            </div>

            {/* Stats Row - Compact */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
              {service.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose This Service - Value Props */}
      <section className="py-20 bg-surface-elevated/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose {service.shortTitle}?
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Ethiopian government and public sector needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Fast & Efficient", desc: "Streamlined processes save time" },
              { icon: Target, title: "Purpose-Built", desc: "Designed for public sector" },
              { icon: Users, title: "Collaborative", desc: "Connect teams & agencies" },
              { icon: TrendingUp, title: "Measurable Impact", desc: "Track results & outcomes" }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-base mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Card Style */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Key Capabilities
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Everything you need in one comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {service.features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-border bg-surface p-8 shadow-soft transition-all hover:shadow-elegant hover:border-primary/30"
                >
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                        <FeatureIcon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - Simplified List */}
      <section className="py-20 bg-surface-elevated/50">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Expected Outcomes
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Measurable impact for your agency and constituents
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {service.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-surface p-5 hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section - Sticky CTA */}
      <section ref={formRef} className="px-4 py-20 scroll-mt-20">
        <div className="mx-auto max-w-4xl">
          {/* Form Header - Always Visible */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Application Form</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
              {service.ctaText}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {service.ctaSubtext}
            </p>
          </div>

          {/* Form Container */}
          <div className="rounded-3xl border border-border bg-surface shadow-elegant overflow-hidden">
            {/* Form Toggle */}
            {!showForm ? (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground mb-6">
                    No account required. Submit your application and we'll get back to you within 3-5 business days.
                  </p>
                  <button
                    onClick={scrollToForm}
                    className="group inline-flex h-14 items-center gap-2 rounded-xl bg-gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:shadow-glow w-full justify-center sm:w-auto"
                  >
                    <FileText className="h-5 w-5" />
                    Start Application
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-10">
                <ServiceRegistrationForm kind={service.slug} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Explore More Services */}
      <section className="border-t border-border py-16 bg-surface-elevated/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">Explore More Services</h3>
            <p className="text-sm text-muted-foreground mt-2">Discover other ways STRP can help your agency</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Previous Service */}
            <Link
              to="/services/$serviceSlug"
              params={{ serviceSlug: prevService.slug }}
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                <span className="text-xs text-muted-foreground">Previous</span>
              </div>
              <div className="font-semibold text-sm">{prevService.shortTitle}</div>
            </Link>

            {/* All Services */}
            <Link
              to="/#services"
              className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center transition-all hover:bg-primary/10"
            >
              <div className="text-xs text-primary mb-2">View All</div>
              <div className="font-semibold text-sm text-primary">All Services</div>
            </Link>

            {/* Next Service */}
            <Link
              to="/services/$serviceSlug"
              params={{ serviceSlug: nextService.slug }}
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-soft text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-2">
                <span className="text-xs text-muted-foreground">Next</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <div className="font-semibold text-sm">{nextService.shortTitle}</div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
