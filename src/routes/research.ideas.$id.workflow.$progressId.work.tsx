import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { researchWorkflowAPI } from "@/lib/research-workflow-api";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { ResearchWorkflowProgress } from "@/types/research-workflow";

export const Route = createFileRoute("/research/ideas/$id/workflow/$progressId/work")({
  component: () => (
    <RequireAuth>
      <WorkOnStagePage />
    </RequireAuth> 
  ),
});

function WorkOnStagePage() {
  const { id, progressId } = Route.useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ResearchWorkflowProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProgress();
  }, [progressId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await researchWorkflowAPI.getProgressItem(progressId);
      if (response.success) {
        setProgress(response.data);
        // Load existing data if any
        if (response.data.stage_data) {
          setFormData(response.data.stage_data);
        }
        if (response.data.notes) {
          setNotes(response.data.notes);
        }
      }
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast.error(error.message || "Failed to load stage data");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => { 
    // Validate required fields
    if (progress?.stage?.form_fields) {
      const requiredFields = progress.stage.form_fields.filter((f: any) => f && f.required);
      const missingFields = requiredFields.filter(
        (f: any) => !formData[f.name] || formData[f.name].toString().trim() === "",
      );

      if (missingFields.length > 0) {
        const fieldNames = missingFields
          .map((f: any) => f.label || f.name.replace(/_/g, " "))
          .join(", ");
        toast.error(`Please fill in required fields: ${fieldNames}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await researchWorkflowAPI.submitStage(progressId, {
        stage_data: formData,
        notes: notes || undefined,
      });

      if (response.success) {
        toast.success("Stage submitted successfully");
        navigate({
          to: "/research/ideas/$id/workspace",
          params: { id },
          search: { tab: "workflow" },
        });
      }
    } catch (error: any) {
      console.error("Error submitting stage:", error);
      toast.error(error.message || "Failed to submit stage");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate({
      to: "/research/ideas/$id/workspace",
      params: { id },
      search: { tab: "workflow" },
    });
  };

  const renderFormField = (field: any) => {
    if (!field || !field.name) return null;

    const value = formData[field.name] || "";
    const label = field.label || field.name.replace(/_/g, " ");
    const placeholder = field.hint || `Enter ${label.toLowerCase()}`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={placeholder}
              rows={6}
              className="w-full"
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        );

      case "text":
      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
            {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <div className="text-center">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (!progress) {
    return (
      <AppShell>
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">Stage not found</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflow
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{progress.stage?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{progress.stage?.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {progress.stage?.form_fields && progress.stage.form_fields.length > 0 ? (
              <>
                <div className="space-y-6">
                  {progress.stage.form_fields
                    .filter((field: any) => field && field.name)
                    .map((field: any) => renderFormField(field))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or comments"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Stage"}
                  </Button>
                  <Button variant="outline" onClick={handleBack} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No form fields configured for this stage.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
