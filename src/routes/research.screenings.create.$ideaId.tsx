import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { researchScreeningSchema, type ResearchScreeningFormData } from "@/lib/research-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/research/screenings/create/$ideaId")({
  component: () => (
    <RequireAuth>
      <CreateScreeningPage />
    </RequireAuth>
  ),
});

function CreateScreeningPage() {
  const { ideaId } = Route.useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: idea } = useQuery({
    queryKey: ["research-idea", ideaId],
    queryFn: async () => {
      const response = await fetch(`/api/research-ideas/${ideaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    },
  });

  const form = useForm<ResearchScreeningFormData>({
    resolver: zodResolver(researchScreeningSchema),
    defaultValues: {
      strategic_alignment_score: 5,
      feasibility_score: 5,
      governance_impact_score: 5,
      resource_requirement_score: 5,
      innovation_level_score: 5,
      risk_level_score: 5,
      decision: "approved",
    },
  });

  const scores = form.watch();
  const totalScore = [
    scores.strategic_alignment_score,
    scores.feasibility_score,
    scores.governance_impact_score,
    scores.resource_requirement_score,
    scores.innovation_level_score,
    scores.risk_level_score,
  ].reduce((sum, score) => sum + (Number(score) || 0), 0);

  const createScreening = useMutation({
    mutationFn: async (data: ResearchScreeningFormData) => {
      const response = await fetch(`/api/research-screenings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, research_idea_id: ideaId }),
      });
      if (!response.ok) throw new Error('Failed to create screening');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Screening evaluation completed successfully",
      });
      navigate({ to: '/research/screenings' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create screening",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data: ResearchScreeningFormData) => {
    createScreening.mutate(data);
  });

  const ScoreInput = ({ name, label, comment }: { name: keyof ResearchScreeningFormData; label: string; comment: keyof ResearchScreeningFormData }) => (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-semibold">{label}</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-24 h-12 text-center text-lg font-semibold rounded-lg"
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">/ 10</div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={comment}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm text-muted-foreground">Comment (Optional)</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder={`Add your evaluation notes for ${label.toLowerCase()}...`}
                {...field}
                className="text-sm rounded-lg resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <AppShell>
      <PageHeader
        title="Screen Research Idea"
        subtitle={idea?.data?.title || "Evaluate and score research proposal"}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/screenings' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Screenings
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Total Score Overview */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="text-5xl font-bold text-primary">{totalScore}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 60 points</p>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
              <CardDescription>
                Score each criterion from 0 to 10 based on your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreInput 
                name="strategic_alignment_score" 
                label="Strategic Alignment" 
                comment="strategic_alignment_comment"
              />
              <ScoreInput 
                name="feasibility_score" 
                label="Feasibility" 
                comment="feasibility_comment"
              />
              <ScoreInput 
                name="governance_impact_score" 
                label="Governance Impact" 
                comment="governance_impact_comment"
              />
              <ScoreInput 
                name="resource_requirement_score" 
                label="Resource Requirement" 
                comment="resource_requirement_comment"
              />
              <ScoreInput 
                name="innovation_level_score" 
                label="Innovation Level" 
                comment="innovation_level_comment"
              />
              <ScoreInput 
                name="risk_level_score" 
                label="Risk Level" 
                comment="risk_level_comment"
              />
            </CardContent>
          </Card>

          {/* Decision */}
          <Card>
            <CardHeader>
              <CardTitle>Decision & Overall Assessment</CardTitle>
              <CardDescription>
                Provide your final decision and overall evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Decision *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approved">Approved - Move to Next Stage</SelectItem>
                        <SelectItem value="revision_requested">Revision Requested - Needs Improvements</SelectItem>
                        <SelectItem value="rejected">Rejected - Not Suitable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overall_comment"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">Overall Comment *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide your comprehensive evaluation summary (minimum 20 characters)"
                        rows={6}
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
              disabled={createScreening.isPending}
              className="h-12 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              {createScreening.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Screening
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/research/screenings' })}
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
