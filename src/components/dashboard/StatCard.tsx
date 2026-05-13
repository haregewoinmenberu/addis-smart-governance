import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  accent?: "primary" | "info" | "warning" | "success" | "destructive";
}

const accents: Record<NonNullable<Props["accent"]>, string> = {
  primary: "from-primary/15 to-primary/0 text-primary",
  info: "from-info/15 to-info/0 text-info",
  warning: "from-warning/20 to-warning/0 text-warning",
  success: "from-success/15 to-success/0 text-success",
  destructive: "from-destructive/15 to-destructive/0 text-destructive",
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent = "primary" }: Props) {
  return (
    <Card className="relative overflow-hidden p-5 rounded-2xl border-border/60 hover:shadow-elegant transition-shadow">
      <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-40 bg-gradient-to-br", accents[accent])} />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {delta && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trend === "up" ? "text-success" : "text-destructive")}>
              {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{delta}</span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
