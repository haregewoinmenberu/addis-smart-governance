import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Building2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/research/transfers")({
  component: () => (
    <RequireAuth>
      <TechnologyTransfersPage />
    </RequireAuth>
  ),
});

function TechnologyTransfersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: transfers, isLoading } = useQuery({
    queryKey: ["technology-transfers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/technology-transfers?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      completed: "bg-green-500/10 text-green-700 border-green-500/20",
      on_hold: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  return (
    <AppShell>
      <PageHeader
        title="Technology Transfers"
        subtitle="Track technology deployment and commercialization"
      />

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers by project or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transfers List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading transfers...</div>
      ) : (
        <div className="grid gap-4">
          {transfers?.data?.map((transfer: any) => (
            <Card key={transfer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {transfer.research_project?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {transfer.receiving_organization}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(transfer.deployment_status)}>
                    {transfer.deployment_status?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Transfer Date</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {transfer.transferred_at ? new Date(transfer.transferred_at).toLocaleDateString() : 'Not transferred'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commercialization</p>
                    <Badge variant="outline" className="mt-1">
                      {transfer.commercialization_status?.replace('_', ' ') || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IP Protection</p>
                    <p className="text-sm font-medium mt-1">
                      {transfer.intellectual_property || 'Not specified'}
                    </p>
                  </div>
                </div>

                {transfer.transfer_package && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Transfer Package</p>
                    <p className="text-sm line-clamp-2">{transfer.transfer_package}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate({ to: `/research/transfers/${transfer.id}` })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {transfers?.data?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No technology transfers found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
