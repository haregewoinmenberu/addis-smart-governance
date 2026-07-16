import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { getTechnologies, getTechnologyStatistics, deleteTechnology } from "@/lib/api";
import { Database, Server, ShieldCheck, MapPin, Search, Filter, Download, Plus, Globe2, Cpu, Cloud, HardDrive, Edit, Trash2, MoreVertical } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/registry/")({
  head: () => ({ meta: [{ title: "Technology Registry — STRP" }] }),
  component: () => (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ),
});

interface Technology {
  id: number;
  name: string;
  code?: string;
  category: string;
  description?: string;
  vendor?: string;
  version?: string;
  status: string;
  deployment_type?: string;
  owner?: string;
  license_type?: string;
}

const statusStyle = (s: string) => {
  if (s === "active") return "bg-success/10 text-success border-success/20";
  if (s === "inactive") return "bg-destructive/10 text-destructive border-destructive/20";
  if (s === "maintenance") return "bg-warning/15 text-warning-foreground border-warning/30";
  if (s === "pilot") return "bg-info/10 text-info border-info/20";
  return "bg-muted text-muted-foreground";
};

const envIcon = (e?: string) => {
  if (e === "Cloud") return Cloud;
  if (e === "On-Prem") return Server;
  if (e === "Edge") return Cpu;
  return HardDrive;
};

function Page() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    target: Technology | null;
  }>({ isOpen: false, target: null });

  // Fetch technologies
  const { data: techData, isLoading } = useQuery({
    queryKey: ["technologies", searchQuery],
    queryFn: () => getTechnologies({ search: searchQuery }),
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["technology-statistics"],
    queryFn: getTechnologyStatistics,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technologies"] });
      queryClient.invalidateQueries({ queryKey: ["technology-statistics"] });
      toast({
        title: "Success",
        description: "Technology deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (id: number) => {
    navigate({ to: "/registry/$id/edit", params: { id: id.toString() } });
  };

  const openConfirm = (target: Technology) => {
    setConfirmState({ isOpen: true, target });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, target: null });
  };

  const handleConfirm = () => {
    if (!confirmState.target) return;
    deleteMutation.mutate(confirmState.target.id);
    closeConfirm();
  };

  const technologies = techData?.data || [];
  const stats = statsData?.data || { total: 0, active: 0, inactive: 0 };
  const totalAssets = stats.total || 0;
  const activeAssets = stats.active || 0;

  return (
    <AppShell>
      <PageHeader
        title="Technology Registry"
        subtitle="Centralized inventory of every technology asset deployed across Addis Ababa."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <PermissionGuard permission="create_technologies">
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
                onClick={() => navigate({ to: "/registry/create" })}
              >
                <Plus className="h-4 w-4" />
                Register asset
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total assets" value={totalAssets.toString()} delta="+8.2%" icon={Database} accent="primary" />
        <StatCard label="Operational" value={activeAssets.toString()} delta="+2.1%" icon={ShieldCheck} accent="success" />
        <StatCard label="Cloud-hosted" value={(Math.floor(totalAssets * 0.58)).toString()} delta="+11%" icon={Cloud} accent="info" />
        <StatCard label="Sub-cities covered" value="11 / 11" delta="100%" icon={Globe2} accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl border-border/60 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Asset inventory</h3>
              <p className="text-xs text-muted-foreground">Filter, classify and audit every registered system</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  className="pl-9 h-9 w-56 bg-muted/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
          <div className="border border-border/40 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8fafc] border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
                  <tr>
                    <th className="text-left py-3.5 px-6 font-semibold">Asset</th>
                    <th className="text-left py-3.5 px-6 font-semibold">Owner</th>
                    <th className="text-left py-3.5 px-6 font-semibold">Environment</th>
                    <th className="text-left py-3.5 px-6 font-semibold">Category</th>
                    <th className="text-left py-3.5 px-6 font-semibold">Status</th>
                    <th className="text-right py-3.5 px-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Loading technologies...
                      </td>
                    </tr>
                  ) : technologies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No technologies found
                      </td>
                    </tr>
                  ) : (
                    technologies.map((tech: Technology, rowIndex: number) => {
                      const Icon = envIcon(tech.deployment_type);
                      return (
                        <tr key={tech.id} className={`border-b border-border/40 hover:bg-slate-50/50 transition-colors ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/30"
                        }`}>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Database className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-[#1a202c]">{tech.name}</p>
                                <p className="text-xs text-muted-foreground">{tech.code || `TECH-${tech.id}`}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">{tech.owner || "—"}</td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              {tech.deployment_type || "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">{tech.category}</td>
                          <td className="px-6 py-4 text-sm text-[#4a5568]">
                            <Badge variant="secondary" className={statusStyle(tech.status)}>
                              {tech.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <PermissionGuard permission="edit_technologies">
                                  <DropdownMenuItem onClick={() => handleEdit(tech.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </PermissionGuard>
                                <PermissionGuard permission="delete_technologies">
                                  <DropdownMenuItem
                                    onClick={() => openConfirm(tech)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </PermissionGuard>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl border-border/60">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold tracking-tight">Deployment map</h3>
          </div>
          <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 via-info/5 to-card border border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
            {[
              { x: "30%", y: "40%", s: "Bole" },
              { x: "55%", y: "30%", s: "Yeka" },
              { x: "45%", y: "55%", s: "Kirkos" },
              { x: "65%", y: "60%", s: "Arada" },
              { x: "25%", y: "70%", s: "Lideta" },
              { x: "75%", y: "45%", s: "Gulele" },
            ].map((p) => (
              <div key={p.s} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: p.x, top: p.y }}>
                <div className="relative">
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-primary animate-ping opacity-60" />
                  <div className="h-3 w-3 rounded-full bg-gradient-primary shadow-glow" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-foreground/80 whitespace-nowrap">
                    {p.s}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Live deployments across 11 sub-cities</p>
        </Card>
      </div>
      <AlertDialog open={confirmState.isOpen} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete technology?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
