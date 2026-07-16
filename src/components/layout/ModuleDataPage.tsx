import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getList, getModule } from "@/lib/api";

export type ModuleColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  badge?: (row: T) => { label: string; className: string } | null;
};

type ModuleDataPageProps<T> = {
  moduleKey: string;
  title: string;
  subtitle: string;
  endpoint: string;
  columns: ModuleColumn<T>[];
  emptyMessage?: string;
};

export function ModuleDataPage<T extends Record<string, unknown>>({
  moduleKey,
  title,
  subtitle,
  endpoint,
  columns,
  emptyMessage = "No records found.",
}: ModuleDataPageProps<T>) {
  const moduleQuery = useQuery({
    queryKey: ["module", moduleKey],
    queryFn: async () => (await getModule(moduleKey)).data,
  });

  const listQuery = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await getList<T>(endpoint)).data,
  });

  const headerTitle = moduleQuery.data?.title ?? title;
  const headerSubtitle = moduleQuery.data?.subtitle ?? subtitle;
  const rows = listQuery.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        actions={<Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow">New</Button>}
      />

      <Card className="rounded-2xl border-border/60 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold tracking-tight">Latest records</h3>
            <p className="text-xs text-muted-foreground">Live data from the backend.</p>
          </div>
          {listQuery.isLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>
        <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm m-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
                <tr>
                  {columns.map((column) => (
                    <th key={String(column.key)} className="text-left py-3.5 px-6 font-semibold">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!rows.length && !listQuery.isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={index} className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                    }`}>
                      {columns.map((column) => {
                        const badge = column.badge?.(row) ?? null;
                        return (
                          <td key={String(column.key)} className="px-6 py-4 text-sm text-[#4a5568]">
                            {badge ? (
                              <Badge variant="secondary" className={badge.className}>{badge.label}</Badge>
                            ) : (
                              column.render?.(row) ?? String(row[column.key as keyof T] ?? "")
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
