import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface SettingRowProps {
  title: string;
  description: string;
  value?: any;
  children?: ReactNode;
  showStatus?: boolean;
}

export function SettingRow({ title, description, value, children, showStatus = false }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/60 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {showStatus && typeof value === "boolean" && (
            value ? (
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-border text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Disabled
              </Badge>
            )
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
