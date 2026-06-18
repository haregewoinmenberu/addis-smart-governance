import {
  Brain,
  Database,
  KeyRound,
  Activity,
  Workflow,
  Network,
} from "lucide-react";

const features = [
  { icon: Brain, label: "Decision Making" },
  { icon: Database, label: "Centralized Data Governance" },
  { icon: KeyRound, label: "Secure Identity & Access" },
  { icon: Activity, label: "Real-Time Monitoring" },
  { icon: Workflow, label: "Workflow Automation" },
  { icon: Network, label: "Inter-Agency Integration" },
];

export function FeatureStrip() {
  return (
    <section className="relative py-14">
      <div
        className="absolute inset-x-0 inset-y-4 -z-10 rounded-3xl mx-4"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--primary) 8%, transparent), color-mix(in oklab, var(--primary-glow) 10%, transparent))",
        }}
      />
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {features.map((f) => (
            <div
              key={f.label}
              className="glass-strong flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-transform hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="text-xs font-semibold leading-tight">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
