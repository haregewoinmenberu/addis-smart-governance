import { CheckCircle2, Building2, Users, BarChart3, ArrowRight } from "lucide-react";

const points = [
  { title: "Efficiency", desc: "Replace fragmented systems with one operational platform." },
  { title: "Transparency", desc: "Every action audited and traceable in real time." },
  { title: "Automation", desc: "AI evaluates, routes and approves with policy guardrails." },
  { title: "Citizen-centric", desc: "Services designed around outcomes, not departments." },
];

export function GovernanceValue() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        <div> 
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Transforming Government Services into a{" "}
            <span className="text-gradient">Unified Digital Ecosystem</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            STRP connects ministries, agencies and citizens through a single,
            intelligent operating layer — eliminating silos, accelerating
            decisions, and putting transparency at the center of public service.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <div
                key={p.title}
                className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right infographic */}
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-primary opacity-15 blur-3xl" />
          <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data feedback loop
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <FlowNode icon={<Building2 className="h-4 w-4" />} title="Government" subtitle="Policy & strategy" />
              <Connector />
              <FlowNode icon={<BarChart3 className="h-4 w-4" />} title="STRP Portal" subtitle="AI orchestration layer" highlight />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-end pr-3">
                  <Connector vertical />
                </div>
                <div className="flex pl-3">
                  <Connector vertical />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FlowNode icon={<Building2 className="h-4 w-4" />} title="Agencies" subtitle="Execution" compact />
                <FlowNode icon={<Users className="h-4 w-4" />} title="Citizens" subtitle="Service delivery" compact />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                Feedback & insight flows back to policy
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowNode({
  icon,
  title,
  subtitle,
  highlight = false,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        highlight
          ? "border-primary/30 bg-gradient-primary text-primary-foreground shadow-elegant"
          : "border-border bg-surface-elevated"
      } ${compact ? "" : "px-4"}`}
    >
      <div
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          highlight ? "bg-white/15 text-primary-foreground" : "bg-accent text-primary"
        }`}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold">{title}</div>
        <div className={`text-[11px] ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      className={`relative ${vertical ? "h-6 w-px" : "mx-auto h-6 w-px"} bg-gradient-to-b from-primary/40 to-primary/0`}
    >
      <span className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
    </div>
  );
}
