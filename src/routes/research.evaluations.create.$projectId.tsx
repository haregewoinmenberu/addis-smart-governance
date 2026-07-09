import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const evaluationSchema = z.object({
  benchmark_baseline: z.number().min(0).max(100),
  performance_improvement: z.number().min(-100).max(1000),
  research_findings: z.string().min(100, "Research findings must be at least 100 characters"),
  recommendations: z.string().min(50, "Recommendations must be at least 50 characters"),
  lessons_learned: z.string().min(50, "Lessons learned must be at least 50 characters"),
  trl_level: z.number().min(1).max(9),
  evaluation_date: z.string().min(1, "Evaluation date is required"),
  trl_justification: z.string().min(50, "TRL justification must be at least 50 characters"),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

export const Route = createFileRoute("/research/evaluations/create/$projectId")({
  component: () => (
    <RequireAuth>
      <CreateEvaluationPage />
    </RequireAuth>
  ),
});

function CreateEvaluationPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: project } = useQuery({
    queryKey: ["research-project", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/research-projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      trl_level: 1,
      benchmark_baseline: 0,
      performance_improvement: 0,
      evaluation_date: new Date().toISOString().split('T')[0],
    },
  });

  const trlLevel = form.watch("trl_level");

  const trlDescriptions: Record<number, string> = {
    1: "Basic principles observed and reported",
    2: "Technology concept and/or application formulated",
    3: "Analytical and experimental critical function proof of concept",
    4: "Technology validated in laboratory environment",
    5: "Technology validated in relevant environment",
    6: "Technology demonstrated in relevant environment",
    7: "System prototype demonstration in operational environment",
    8: "System complete and qualified",
    9: "Actual system proven through successful mission operations",
  };

  const createEvaluation = useMutation({
    mutationFn: async (data: EvaluationFormData) => {
      const response = await fetch(`/api/research-evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, research_project_id: projectId }),
      });
      if (!response.ok) throw new Error('Failed to create evaluation');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Evaluation completed successfully",
      });
      navigate({ to: '/research/evaluations' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create evaluation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EvaluationFormData) => {
    createEvaluation.mutate(data);
  };

  return (
    <AppShell>
      <PageHeader
        title="Evaluate Research Project"
        subtitle={project?.data?.title || "Assess outcomes and technology readiness"}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/evaluations' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Evaluations
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Quantify the impact and improvements achieved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="benchmark_baseline">Benchmark Baseline (0-100) *</Label>
                <Input
                  id="benchmark_baseline"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register("benchmark_baseline", { valueAsNumber: true })}
                  className={errors.benchmark_baseline ? "border-destructive" : ""}
                />
                {errors.benchmark_baseline && (
                  <p className="text-sm text-destructive">{errors.benchmark_baseline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="performance_improvement">Performance Improvement (%) *</Label>
                <Input
                  id="performance_improvement"
                  type="number"
                  min="-100"
                  max="1000"
                  step="0.1"
                  {...register("performance_improvement", { valueAsNumber: true })}
                  className={errors.performance_improvement ? "border-destructive" : ""}
                />
                {errors.performance_improvement && (
                  <p className="text-sm text-destructive">{errors.performance_improvement.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluation_date">Evaluation Date *</Label>
                <Input
                  id="evaluation_date"
                  type="date"
                  {...register("evaluation_date")}
                  className={errors.evaluation_date ? "border-destructive" : ""}
                />
                {errors.evaluation_date && (
                  <p className="text-sm text-destructive">{errors.evaluation_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Research Findings & Insights</CardTitle>
            <CardDescription>
              Document key discoveries and outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="research_findings">Research Findings *</Label>
              <Textarea
                id="research_findings"
                placeholder="Describe the key research findings and discoveries (minimum 100 characters)"
                rows={6}
                {...register("research_findings")}
                className={errors.research_findings ? "border-destructive" : ""}
              />
              {errors.research_findings && (
                <p className="text-sm text-destructive">{errors.research_findings.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations *</Label>
              <Textarea
                id="recommendations"
                placeholder="Provide actionable recommendations based on the research (minimum 50 characters)"
                rows={5}
                {...register("recommendations")}
                className={errors.recommendations ? "border-destructive" : ""}
              />
              {errors.recommendations && (
                <p className="text-sm text-destructive">{errors.recommendations.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons_learned">Lessons Learned *</Label>
              <Textarea
                id="lessons_learned"
                placeholder="Document lessons learned for future projects (minimum 50 characters)"
                rows={5}
                {...register("lessons_learned")}
                className={errors.lessons_learned ? "border-destructive" : ""}
              />
              {errors.lessons_learned && (
                <p className="text-sm text-destructive">{errors.lessons_learned.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technology Readiness Level */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Technology Readiness Level (TRL) Assessment</CardTitle>
            <CardDescription>
              Evaluate the maturity level of the technology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trl_level">TRL Level (1-9) *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="trl_level"
                  type="number"
                  min="1"
                  max="9"
                  step="1"
                  {...register("trl_level", { valueAsNumber: true })}
                  className={`w-24 text-center text-lg font-semibold ${errors.trl_level ? "border-destructive" : ""}`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{trlDescriptions[trlLevel]}</p>
                </div>
              </div>
              {errors.trl_level && (
                <p className="text-sm text-destructive">{errors.trl_level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trl_justification">TRL Justification *</Label>
              <Textarea
                id="trl_justification"
                placeholder="Explain why this TRL level is appropriate (minimum 50 characters)"
                rows={5}
                {...register("trl_justification")}
                className={errors.trl_justification ? "border-destructive" : ""}
              />
              {errors.trl_justification && (
                <p className="text-sm text-destructive">{errors.trl_justification.message}</p>
              )}
            </div>

            {/* TRL Scale Reference */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">TRL Scale Reference:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <p className="font-medium text-gray-700">Early Stage (1-3)</p>
                  <p className="text-muted-foreground">Basic research & concept</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-blue-700">Development (4-6)</p>
                  <p className="text-muted-foreground">Lab & relevant validation</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-green-700">Deployment (7-9)</p>
                  <p className="text-muted-foreground">Operational & proven</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createEvaluation.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Save className="h-4 w-4 mr-2" />
            {createEvaluation.isPending ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/research/evaluations' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
