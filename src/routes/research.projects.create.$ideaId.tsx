import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { researchProjectSchema, type ResearchProjectFormData } from "@/lib/research-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/research/projects/create/$ideaId")({
  component: () => (
    <RequireAuth>
      <CreateProjectPage />
    </RequireAuth>
  ),
});

function CreateProjectPage() {
  const { ideaId } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: idea } = useQuery({
    queryKey: ["research-idea", ideaId],
    queryFn: async () => {
      const response = await fetch(`/api/research-ideas/${ideaId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      return response.json();
    },
  });

  const form = useForm<ResearchProjectFormData>({
    resolver: zodResolver(researchProjectSchema),
    defaultValues: {
      title: idea?.data?.title || "",
    },
  });

  const createProject = useMutation({
    mutationFn: async (data: ResearchProjectFormData) => {
      const response = await fetch(`/api/research-projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ ...data, research_idea_id: ideaId }),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Research project created successfully",
      });
      navigate({ to: '/research/projects' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data: ResearchProjectFormData) => {
    createProject.mutate(data);
  });

  return (
    <AppShell>
      <PageHeader
        title="Create Research Project"
        subtitle="Develop detailed project charter and proposal"
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/projects' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Charter</CardTitle>
              <CardDescription>
                Define the project scope, background, and objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Project Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project title"
                        {...field}
                        className="h-12 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Background */}
              <FormField
                control={form.control}
                name="background"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Background *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide comprehensive background information and context (minimum 100 characters)"
                        rows={6}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Objectives */}
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Project Objectives *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List specific, measurable objectives (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Methodology & Deliverables</CardTitle>
              <CardDescription>
                Define research approach and expected outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Methodology */}
              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Research Methodology *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the research methods, approaches, and procedures (minimum 100 characters)"
                        rows={6}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected Deliverables */}
              <FormField
                control={form.control}
                name="expected_deliverables"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Expected Deliverables *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List concrete deliverables and outputs (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources & Timeline</CardTitle>
              <CardDescription>
                Define budget, resources, and project schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimated_budget"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Estimated Budget (ETB) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Required Resources */}
              <FormField
                control={form.control}
                name="required_resources"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Required Resources *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List personnel, equipment, facilities, and other resources needed (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Start Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold">End Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-12 rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment & Success Metrics</CardTitle>
              <CardDescription>
                Identify risks and define success criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Analysis */}
              <FormField
                control={form.control}
                name="risk_analysis"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Risk Analysis *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Identify potential risks, challenges, and mitigation strategies (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Success Metrics */}
              <FormField
                control={form.control}
                name="success_metrics"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Success Metrics *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Define measurable indicators of success (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={createProject.isPending}
              className="h-12 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Research Project
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/research/projects' })}
              className="h-12"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </AppShell>
  );
}
