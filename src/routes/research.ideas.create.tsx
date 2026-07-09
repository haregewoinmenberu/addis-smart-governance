import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { researchIdeaSchema, researchCategoryLabels, priorityLabels, type ResearchIdeaFormData } from "@/lib/research-schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export const Route = createFileRoute("/research/ideas/create")({
  component: () => (
    <RequireAuth>
      <CreateResearchIdeaPage />
    </RequireAuth>
  ),
});

function CreateResearchIdeaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ResearchIdeaFormData>({
    resolver: zodResolver(researchIdeaSchema),
    defaultValues: {
      title: "",
      summary: "",
      problem_statement: "",
      objectives: "",
      expected_outcome: "",
      research_category: "basic_research",
      government_sector: "",
      priority: "medium",
    },
  });

  const createIdea = useMutation({
    mutationFn: async (data: ResearchIdeaFormData) => {
      const response = await fetch('/api/research-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create idea');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Research idea created successfully",
      });
      navigate({ to: '/research/ideas' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create research idea",
        variant: "destructive",
      });
    },
  });

  return (
    <AppShell>
      <PageHeader
        title="Submit Research Idea"
        subtitle="Propose a new research or innovation project"
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate({ to: '/research/ideas' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ideas
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => createIdea.mutate(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the core details of your research idea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Research Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive title for your research idea"
                        {...field}
                        className="h-11 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="research_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Research Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(researchCategoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-lg">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Government Sector */}
              <FormField
                control={form.control}
                name="government_sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Government Sector (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Health, Education, Transportation"
                        {...field}
                        className="h-11 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Executive Summary *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief summary of your research idea (minimum 50 characters)"
                        rows={4}
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
              <CardTitle>Problem & Objectives</CardTitle>
              <CardDescription>
                Describe the problem you're addressing and your research objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Problem Statement */}
              <FormField
                control={form.control}
                name="problem_statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Problem Statement *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Clearly describe the problem or gap your research will address (minimum 100 characters)"
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
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Research Objectives *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the specific objectives your research aims to achieve (minimum 50 characters)"
                        rows={5}
                        {...field}
                        className="rounded-lg resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected Outcome */}
              <FormField
                control={form.control}
                name="expected_outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Expected Outcome *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the anticipated results and impact of your research (minimum 50 characters)"
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
              disabled={createIdea.isPending}
              className="h-12 bg-gradient-primary text-primary-foreground shadow-glow font-semibold"
            >
              {createIdea.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {createIdea.isPending ? 'Submitting...' : 'Submit Research Idea'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/research/ideas' })}
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
