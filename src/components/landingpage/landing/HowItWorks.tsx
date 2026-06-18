import { UserPlus, LayoutGrid, FileSignature, Brain, BadgeCheck } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Register / Login", desc: "Authenticate with your Government Identity." },
  { icon: LayoutGrid, title: "Select Service", desc: "Choose the relevant module from the launchpad." },
  { icon: FileSignature, title: "Submit Request", desc: "Complete the smart, guided application form." },
  { icon: Brain, title: "Evaluation", desc: "Workflows route automatically to the right desk." },
  { icon: BadgeCheck, title: "Approval & Certificate", desc: "Receive your verified digital certification." },
];

export function HowItWorks() {
  return (
    <section id="transformation" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            From request to certified outcome in five steps
          </h2>
        </div>

        <div className="relative mt-14">
          {/* progress line */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface text-[10px] font-bold text-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
