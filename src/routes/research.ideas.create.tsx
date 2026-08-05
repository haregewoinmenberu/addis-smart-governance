import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getAuthToken } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  researchIdeaSchema,
  researchCategoryLabels,
  priorityLabels,
  type ResearchIdeaFormData,
} from "@/lib/research-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Save,
  Loader2,
  Lightbulb,
  Target,
  FlaskConical,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/research/ideas/create")({
  component: () => (
    <RequireAuth>
      <CreateResearchIdeaPage />
    </RequireAuth>
  ),
});

// Government sector options
const GOVERNMENT_SECTORS = [
  "Health",
  "Education",
  "Transportation",
  "Agriculture",
  "Finance",
  "Trade & Industry",
  "Urban Development",
  "Environment",
  "Water & Sanitation",
  "Energy",
  "ICT",
  "Social Affairs",
  "Justice",
  "Security",
  "Culture & Tourism",
  "Other",
];

// Priority badge colors
const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

// Section icons
const SECTION_ICONS = {
  basic: <Lightbulb className="h-5 w-5 text-amber-500" />,
  problem: <Target className="h-5 w-5 text-blue-500" />,
  outcome: <TrendingUp className="h-5 w-5 text-green-500" />,
};

function CharCounter({ value = "", min, label }: { value?: string; min: number; label: string }) {
  const len = value?.length ?? 0;
  const ok = len >= min;
  return (
    <div className="flex items-center justify-between mt-1">
      <span
        className={`text-xs flex items-center gap-1 ${ok ? "text-green-600" : "text-muted-foreground"}`}
      >
        {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {ok ? `${label} requirement met` : `Minimum ${min} characters required`}
      </span>
      <span
        className={`text-xs font-mono ${ok ? "text-green-600" : len > 0 ? "text-amber-600" : "text-muted-foreground"}`}
      >
        {len}/{min}
      </span>
    </div>
  );
}

function CreateResearchIdeaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<ResearchIdeaFormData>({
    resolver: zodResolver(researchIdeaSchema),
    defaultValues: {
      title: "",
      summary: "",
      problem_statement: "",
      objectives: "",
      expected_outcome: "",
      research_category: "",
      government_sector: "",
      priority: "medium",
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();
  const selectedPriority = form.watch("priority");

  const createIdea = useMutation({
    mutationFn: async (data: ResearchIdeaFormData) => {
      const response = await fetch("/api/research-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create idea");
      }
      return response.json();
    },
    onSuccess: async (response: any) => {
      const ideaId = response?.data?.id || response?.id;

      // Upload attachments if any
      if (attachments.length > 0 && ideaId) {
        try {
          await Promise.all(
            attachments.map(async (file) => {
              const formData = new FormData();
              formData.append("file", file);

              const uploadResponse = await fetch(`/api/research-ideas/${ideaId}/attachments`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`,
                },
                body: formData,
              });

              if (!uploadResponse.ok) {
                console.error("Failed to upload attachment:", file.name);
              }
            }),
          );
        } catch (error) {
          console.error("Error uploading attachments:", error);
        }
      }

      // Invalidate research ideas list query to refetch
      queryClient.invalidateQueries({ queryKey: ["research-ideas"] });

      toast({
        title: "✅ Technology Request Submitted",
        description: "Your request has been created and assigned to the Smart City Command Center.",
      });

      // Check if user is Research Director and redirect accordingly
      const isResearchDirector = user?.roles?.some((role) => role.name === "research_director");
      if (isResearchDirector) {
        navigate({ to: "/research/ideas/director", search: { tab: "created" } });
      } else {
        navigate({ to: "/research/ideas" });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit technology request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data: ResearchIdeaFormData) => {
    createIdea.mutate(data);
  });

  // Calculate overall form progress
  const fields = [
    watchedValues.title,
    watchedValues.summary,
    watchedValues.problem_statement,
    watchedValues.objectives,
    watchedValues.expected_outcome,
    watchedValues.research_category,
  ];
  const filledCount = fields.filter((f) => f && String(f).length > 0).length;
  const progressPct = Math.round((filledCount / fields.length) * 100);

  // Determine back route based on user role
  const backRoute = user?.roles?.some((role) => role.name === "research_director")
    ? "/research/ideas/director"
    : "/research/ideas";

  return (
    <AppShell>
      <PageHeader
        title="Submit Technology Request"
        subtitle="Propose a new technology request for evaluation in Addis Ababa"
        actions={
          <Button
            id="back-to-ideas-btn"
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: backRoute })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ideas
          </Button>
        }
      />

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Form completion</span>
          <span
            className={`text-sm font-semibold ${progressPct === 100 ? "text-green-600" : "text-primary"}`}
          >
            {progressPct}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form id="create-research-idea-form" onSubmit={onSubmit} className="space-y-6">
          {/* ─── Section 1: Basic Information ─── */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                {SECTION_ICONS.basic}
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Title */}
              <FormField
                control={form.control as any}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Research Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="idea-title"
                        placeholder="e.g., AI-Driven Traffic Management System for Addis Ababa"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <CharCounter value={field.value} min={10} label="Title" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control as any}
                  name="research_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">
                        Research Category <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger id="idea-category" className="h-11">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(researchCategoryLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger id="idea-priority" className="h-11">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs py-0 ${PRIORITY_STYLES[value]}`}>
                                  {label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPriority && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected:{" "}
                          <Badge className={`text-xs py-0 ${PRIORITY_STYLES[selectedPriority]}`}>
                            {priorityLabels[selectedPriority as keyof typeof priorityLabels]}
                          </Badge>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Government Sector */}
              <FormField
                control={form.control as any}
                name="government_sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Government Sector{" "}
                      <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger id="idea-sector" className="h-11">
                          <SelectValue placeholder="Select a sector or leave blank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GOVERNMENT_SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              <FormField
                control={form.control as any}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Executive Summary <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="idea-summary"
                        placeholder="Give a concise overview of your technology request — what it is, why it matters, and what you aim to achieve..."
                        rows={4}
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <CharCounter value={field.value} min={50} label="Summary" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Section 2: Problem & Objectives ─── */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                {SECTION_ICONS.problem}
                Problem Statement & Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Problem Statement */}
              <FormField
                control={form.control as any}
                name="problem_statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Problem Statement <span className="text-red-500">*</span>
                    </FormLabel>
                    <p className="text-xs text-muted-foreground -mt-1 mb-2">
                      Clearly describe the problem or gap this research will address. Include
                      context, affected stakeholders, and current limitations.
                    </p>
                    <FormControl>
                      <Textarea
                        id="idea-problem"
                        placeholder="Describe the problem in detail. What is the current situation? Who is affected? What happens without a solution?..."
                        rows={6}
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <CharCounter value={field.value} min={100} label="Problem statement" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Objectives */}
              <FormField
                control={form.control as any}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Research Objectives <span className="text-red-500">*</span>
                    </FormLabel>
                    <p className="text-xs text-muted-foreground -mt-1 mb-2">
                      List specific, measurable objectives. Use bullet points or numbered items for
                      clarity.
                    </p>
                    <FormControl>
                      <Textarea
                        id="idea-objectives"
                        placeholder="1. Develop a framework for...&#10;2. Analyze and evaluate...&#10;3. Implement and test..."
                        rows={5}
                        {...field}
                        className="resize-none font-mono text-sm"
                      />
                    </FormControl>
                    <CharCounter value={field.value} min={50} label="Objectives" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Section 3: Expected Outcome ─── */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                {SECTION_ICONS.outcome}
                Expected Outcomes & Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <FormField
                control={form.control as any}
                name="expected_outcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Expected Outcome <span className="text-red-500">*</span>
                    </FormLabel>
                    <p className="text-xs text-muted-foreground -mt-1 mb-2">
                      Describe the tangible deliverables, anticipated results, and the impact this
                      research will have on the city and its residents.
                    </p>
                    <FormControl>
                      <Textarea
                        id="idea-outcome"
                        placeholder="Describe the expected deliverables (reports, tools, policies, prototypes...), the anticipated improvements, and long-term societal or economic impact..."
                        rows={5}
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <CharCounter value={field.value} min={50} label="Expected outcome" />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ─── Section 4: Attachments ─── */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-blue-500" />
                Supporting Documents
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Upload supporting documents, research proposals, or any relevant files (optional)
              </p>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <FileUploadBox
                id="research-attachments"
                label="Upload Documents"
                description="PDF, Word, or image files — supporting materials for your technology request"
                files={attachments}
                onChange={setAttachments}
              />
            </CardContent>
          </Card>

          {/* ─── Submit Actions ─── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <Button
              id="submit-idea-btn"
              type="submit"
              disabled={createIdea.isPending || progressPct < 100}
              className="h-12 px-8 bg-gradient-primary text-primary-foreground shadow-glow font-semibold flex-1 sm:flex-none"
            >
              {createIdea.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Technology Request
                </>
              )}
            </Button>
            <Button
              id="cancel-idea-btn"
              type="button"
              variant="outline"
              className="h-12 px-6"
              onClick={() => navigate({ to: backRoute })}
              disabled={createIdea.isPending}
            >
              Cancel
            </Button>
            {progressPct < 100 && (
              <p className="text-xs text-muted-foreground self-center sm:ml-2">
                Complete all required fields to submit
              </p>
            )}
          </div>
        </form>
      </Form>
    </AppShell>
  );
}

/**
 * Multi-file upload component with drag-and-drop style interface
 */
function FileUploadBox({
  id,
  label,
  description,
  files,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles);
    onChange([...files, ...filesArray]);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </span>
        )}
      </div>

      {/* Show selected files */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm font-medium">
          {files.length > 0 ? "Click to add more files" : "Click to upload files"}
        </span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </label>

      <Input
        id={id}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
