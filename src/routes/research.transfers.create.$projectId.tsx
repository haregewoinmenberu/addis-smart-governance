import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const transferSchema = z.object({
  transfer_package: z.string().min(100, "Transfer package must be at least 100 characters"),
  receiving_organization: z.string().min(2, "Receiving organization is required"),
  deployment_plan: z.string().min(100, "Deployment plan must be at least 100 characters"),
  training_plan: z.string().min(50, "Training plan must be at least 50 characters"),
  documentation: z.string().min(50, "Documentation must be at least 50 characters"),
  intellectual_property: z.string().optional(),
  commercialization_status: z.enum(["not_started", "in_planning", "pilot", "commercial", "scaled"]),
  deployment_status: z.enum(["planned", "in_progress", "completed", "on_hold"]),
  transferred_at: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

export const Route = createFileRoute("/research/transfers/create/$projectId")({
  component: () => (
    <RequireAuth>
      <CreateTransferPage />
    </RequireAuth>
  ),
});

function CreateTransferPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: project } = useQuery({
    queryKey: ["research-project", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/research-projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      return response.json();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      commercialization_status: "not_started",
      deployment_status: "planned",
    },
  });

  const createTransfer = useMutation({
    mutationFn: async (data: TransferFormData) => {
      const response = await fetch(`/api/technology-transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ ...data, research_project_id: projectId }),
      });
      if (!response.ok) throw new Error('Failed to create transfer');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Technology transfer created successfully",
      });
      navigate({ to: '/research/transfers' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transfer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormData) => {
    createTransfer.mutate(data);
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Technology Transfer"
        subtitle={project?.data?.title || "Deploy research outcomes"}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/transfers' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transfers
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transfer Package */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Package</CardTitle>
            <CardDescription>
              Define what will be transferred to the receiving organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer_package">Transfer Package Content *</Label>
              <Textarea
                id="transfer_package"
                placeholder="Describe the complete package including technology, documentation, training materials, etc. (minimum 100 characters)"
                rows={6}
                {...register("transfer_package")}
                className={errors.transfer_package ? "border-destructive" : ""}
              />
              {errors.transfer_package && (
                <p className="text-sm text-destructive">{errors.transfer_package.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentation">Documentation *</Label>
              <Textarea
                id="documentation"
                placeholder="List all technical documentation, manuals, and guides included (minimum 50 characters)"
                rows={5}
                {...register("documentation")}
                className={errors.documentation ? "border-destructive" : ""}
              />
              {errors.documentation && (
                <p className="text-sm text-destructive">{errors.documentation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="intellectual_property">Intellectual Property (Optional)</Label>
              <Input
                id="intellectual_property"
                placeholder="Patents, trademarks, copyrights, or trade secrets"
                {...register("intellectual_property")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Receiving Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Receiving Organization</CardTitle>
            <CardDescription>
              Organization that will receive and deploy the technology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiving_organization">Organization Name *</Label>
              <Input
                id="receiving_organization"
                placeholder="Name of the receiving organization"
                {...register("receiving_organization")}
                className={errors.receiving_organization ? "border-destructive" : ""}
              />
              {errors.receiving_organization && (
                <p className="text-sm text-destructive">{errors.receiving_organization.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deployment_plan">Deployment Plan *</Label>
              <Textarea
                id="deployment_plan"
                placeholder="Detailed plan for deploying the technology in the organization (minimum 100 characters)"
                rows={6}
                {...register("deployment_plan")}
                className={errors.deployment_plan ? "border-destructive" : ""}
              />
              {errors.deployment_plan && (
                <p className="text-sm text-destructive">{errors.deployment_plan.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_plan">Training Plan *</Label>
              <Textarea
                id="training_plan"
                placeholder="Training and capacity building plan for the receiving organization (minimum 50 characters)"
                rows={5}
                {...register("training_plan")}
                className={errors.training_plan ? "border-destructive" : ""}
              />
              {errors.training_plan && (
                <p className="text-sm text-destructive">{errors.training_plan.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Status</CardTitle>
            <CardDescription>
              Current status and commercialization stage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deployment_status">Deployment Status *</Label>
                <select
                  id="deployment_status"
                  {...register("deployment_status")}
                  className={`w-full px-3 py-2 border rounded-lg bg-background ${
                    errors.deployment_status ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
                {errors.deployment_status && (
                  <p className="text-sm text-destructive">{errors.deployment_status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercialization_status">Commercialization Status *</Label>
                <select
                  id="commercialization_status"
                  {...register("commercialization_status")}
                  className={`w-full px-3 py-2 border rounded-lg bg-background ${
                    errors.commercialization_status ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_planning">In Planning</option>
                  <option value="pilot">Pilot Phase</option>
                  <option value="commercial">Commercial Launch</option>
                  <option value="scaled">Scaled Deployment</option>
                </select>
                {errors.commercialization_status && (
                  <p className="text-sm text-destructive">{errors.commercialization_status.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferred_at">Transfer Date (Optional)</Label>
              <Input
                id="transferred_at"
                type="date"
                {...register("transferred_at")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createTransfer.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Save className="h-4 w-4 mr-2" />
            {createTransfer.isPending ? 'Creating...' : 'Create Technology Transfer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/research/transfers' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
