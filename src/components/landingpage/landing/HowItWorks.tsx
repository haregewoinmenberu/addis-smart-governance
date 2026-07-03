import { UserPlus, LayoutGrid, FileSignature, Brain, BadgeCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register / Login",
    desc: "Authenticate with your Government Identity.",
  },
  {
    icon: LayoutGrid,
    title: "Select Service",
    desc: "Choose the relevant module from the launchpad.",
  },
  {
    icon: FileSignature,
    title: "Submit Request",
    desc: "Complete the smart, guided application form.",
  },
  { icon: Brain, title: "Evaluation", desc: "Workflows route automatically to the right desk." },
  {
    icon: BadgeCheck,
    title: "Approval & Certificate",
    desc: "Receive your verified digital certification.",
  },
];

export function HowItWorks() {
  return (
    <section id="transformation" className="px-4 pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-cta p-10 text-primary-foreground shadow-glow sm:p-14">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-20 animate-wave"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,180 C260,280 520,90 1200,210 L1200,400 L0,400 Z"
            fill="white"
            fillOpacity="0.22"
          />
          <path
            d="M0,250 C360,130 820,340 1200,190 L1200,400 L0,400 Z"
            fill="white"
            fillOpacity="0.14"
          />
        </svg>

        <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-white opacity-25 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            From request to certified outcome in five steps
          </h2>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-linear-to-r from-transparent via-white/35 to-transparent lg:block" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="group flex h-full flex-col items-center rounded-3xl border border-white/15 bg-white/10 p-5 text-center shadow-sm backdrop-blur transition-transform hover:-translate-y-1 hover:bg-white/15">
                  <div className="relative">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-primary shadow-elegant transition-transform group-hover:scale-[1.03]">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-white/25 bg-white/20 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/80">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
