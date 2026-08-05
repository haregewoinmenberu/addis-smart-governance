import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { ResearchWorkflowStage, FormField } from "@/types/research-workflow";

const FIELD_TYPES: FormField["type"][] = ["text", "textarea", "number", "select", "checkbox", "file"];

const RESEARCH_TYPE_LABELS: Record<string, string> = {
  all: "All Requests",
  system_request: "System Requests",
  infrastructure_request: "Infrastructure Requests",
  security_related_request: "Security-Related Requests",
};

export const FILLABLE_BY_ROLE_LABELS: Record<string, string> = {
  research_director: "Research Director only",
  research_team_leader: "Research Team Leader only",
  research_officer: "Research Officer only",
};

export type StageFormState = {
  name: string;
  description: string;
  research_type: string;
  fillable_by_role: string;
  is_required: boolean;
  requires_approval: boolean;
  is_active: boolean;
  form_fields: FormField[];
};

export const emptyStageForm: StageFormState = {
  name: "",
  description: "",
  research_type: "all",
  fillable_by_role: "",
  is_required: true,
  requires_approval: true,
  is_active: true,
  form_fields: [],
};

export function stageToFormState(stage: ResearchWorkflowStage): StageFormState {
  return {
    name: stage.name,
    description: stage.description ?? "",
    research_type: stage.research_type ?? "all",
    fillable_by_role: (stage as any).fillable_by_role ?? "",
    is_required: stage.is_required,
    requires_approval: stage.requires_approval,
    is_active: stage.is_active,
    form_fields: stage.form_fields ? JSON.parse(JSON.stringify(stage.form_fields)) : [],
  };
}

export function WorkflowStageForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: {
  initial: StageFormState;
  onSubmit: (payload: Record<string, any>) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<StageFormState>(initial);

  const updateField = (index: number, patch: Partial<FormField>) => {
    setForm((prev) => ({
      ...prev,
      form_fields: prev.form_fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const addField = () => {
    setForm((prev) => ({
      ...prev,
      form_fields: [...prev.form_fields, { name: "", label: "", type: "text", required: true }],
    }));
  };

  const removeField = (index: number) => {
    setForm((prev) => ({ ...prev, form_fields: prev.form_fields.filter((_, i) => i !== index) }));
  };

  const addOption = (fieldIndex: number) => {
    setForm((prev) => ({
      ...prev,
      form_fields: prev.form_fields.map((f, i) =>
        i === fieldIndex ? { ...f, options: [...(f.options ?? []), { value: "", label: "" }] } : f,
      ),
    }));
  };

  const updateOption = (fieldIndex: number, optionIndex: number, patch: Partial<{ value: string; label: string }>) => {
    setForm((prev) => ({
      ...prev,
      form_fields: prev.form_fields.map((f, i) =>
        i === fieldIndex
          ? { ...f, options: (f.options ?? []).map((o, oi) => (oi === optionIndex ? { ...o, ...patch } : o)) }
          : f,
      ),
    }));
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setForm((prev) => ({
      ...prev,
      form_fields: prev.form_fields.map((f, i) =>
        i === fieldIndex ? { ...f, options: (f.options ?? []).filter((_, oi) => oi !== optionIndex) } : f,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Stage name is required");
      return;
    }
    for (const field of form.form_fields) {
      if (!field.name.trim() || !field.label.trim()) {
        toast.error("Every form field needs a name and a label");
        return;
      }
      if (field.type === "select" && !(field.options && field.options.length > 0)) {
        toast.error(`Field "${field.label}" is a dropdown and needs at least one option`);
        return;
      }
    }
    onSubmit({
      ...form,
      fillable_by_role: form.fillable_by_role || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stage-name">Stage Name</Label>
            <Input
              id="stage-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Technical Assessment"
              required
            />
          </div>

          <div>
            <Label htmlFor="stage-description">Description</Label>
            <Textarea
              id="stage-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Applies To</Label>
              <Select value={form.research_type} onValueChange={(v) => setForm({ ...form, research_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RESEARCH_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fillable By</Label>
              <Select
                value={form.fillable_by_role || "any"}
                onValueChange={(v) => setForm({ ...form, fillable_by_role: v === "any" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Anyone assigned to this request</SelectItem>
                  {Object.entries(FILLABLE_BY_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Restrict who can start/submit this stage. Reviewers and admins are unaffected.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="stage-required"
                checked={form.is_required}
                onCheckedChange={(c) => setForm({ ...form, is_required: c === true })}
              />
              <Label htmlFor="stage-required" className="mt-0!">Required Stage</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="stage-approval"
                checked={form.requires_approval}
                onCheckedChange={(c) => setForm({ ...form, requires_approval: c === true })}
              />
              <Label htmlFor="stage-approval" className="mt-0!">Requires Approval</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="stage-active"
                checked={form.is_active}
                onCheckedChange={(c) => setForm({ ...form, is_active: c === true })}
              />
              <Label htmlFor="stage-active" className="mt-0!">Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Form Fields</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addField}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {form.form_fields.map((field, index) => (
              <div key={index} className="border rounded-md p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="field_name"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    className="flex-1 min-w-[140px]"
                  />
                  <Input
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="flex-1 min-w-[140px]"
                  />
                  <Select value={field.type} onValueChange={(v) => updateField(index, { type: v as FormField["type"] })}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Checkbox
                      id={`field-required-${index}`}
                      checked={field.required}
                      onCheckedChange={(c) => updateField(index, { required: c === true })}
                    />
                    <Label htmlFor={`field-required-${index}`} className="mt-0! text-xs">Required</Label>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Input
                  placeholder="Hint text (optional)"
                  value={field.hint ?? ""}
                  onChange={(e) => updateField(index, { hint: e.target.value })}
                />

                {field.type === "select" && (
                  <div className="pl-4 border-l-2 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Options</p>
                    {(field.options ?? []).map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <Input
                          placeholder="value"
                          value={opt.value}
                          onChange={(e) => updateOption(index, optIndex, { value: e.target.value })}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Label"
                          value={opt.label}
                          onChange={(e) => updateOption(index, optIndex, { label: e.target.value })}
                          className="flex-1"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index, optIndex)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Option
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {form.form_fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No form fields yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
