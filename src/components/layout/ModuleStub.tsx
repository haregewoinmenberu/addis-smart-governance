import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, Sparkles } from "lucide-react";
import { ReactNode } from "react";

export function ModuleStub({
  title, subtitle, points,
}: { title: string; subtitle: string; points: string[] }) {
  return (
    <AppShell>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">Get started</Button>}
      />
      <Card className="rounded-2xl border-border/60 p-10 lg:p-14 bg-gradient-to-br from-primary/5 via-card to-card text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-5">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title} module</h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2">
          This enterprise module is scaffolded and ready for data integration. Below are the planned capabilities.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8 text-left">
          {points.map((p) => (
            <div key={p} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Construction className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

export function makeStub(title: string, subtitle: string, points: string[]): () => ReactNode {
  return () => <ModuleStub title={title} subtitle={subtitle} points={points} />;
}
