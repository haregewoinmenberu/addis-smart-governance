import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/requests/create")({
  component: CreateRequestPage,
});

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  office: z.string().min(1, "Office is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  budget: z.number().min(0, "Budget must be positive"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  justification: z.string().min(10, "Justification must be at least 10 characters"),
});

type RequestFormData = z.infer<typeof requestSchema>;

function CreateRequestPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: "Medium",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await apiPost<{ data: { id: number } }>("/requests", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Request created successfully");
      navigate({ to: `/requests/${data.id}` });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createMutation.mutate(data);
  };

  const categories = [
    "Transport",
    "Citizen Services",
    "Permitting",
    "Assets",
    "Sanitation",
    "Healthcare",
    "Education",
    "Security",
    "Infrastructure",
    "Other",
  ];

  const offices = [
    "Bole Sub-City",
    "Arada Sub-City",
    "Kirkos Sub-City",
    "Yeka Sub-City",
    "Addis Ketema Sub-City",
    "Akaky Kaliti Sub-City",
    "Nifas Silk-Lafto Sub-City",
    "Kolfe Keranio Sub-City",
    "Gulele Sub-City",
    "Lideta Sub-City",
    "ITDB Central",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/requests" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Technology Request</h1>
          <p className="text-gray-600 mt-1">Submit a new technology procurement request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Smart Traffic Management System"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Category and Office */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("category")}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="office">
                  Office <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("office")}
                  onValueChange={(value) => setValue("office", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((office) => (
                      <SelectItem key={office} value={office}>
                        {office}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.office && (
                  <p className="text-sm text-red-600">{errors.office.message}</p>
                )}
              </div>
            </div>

            {/* Priority and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) =>
                    setValue("priority", value as "Low" | "Medium" | "High" | "Critical")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">
                  Budget (ETB) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  {...register("budget", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.budget && (
                  <p className="text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe the technology and its purpose..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <Label htmlFor="justification">
                Justification <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="justification"
                {...register("justification")}
                placeholder="Explain why this technology is needed..."
                rows={4}
              />
              {errors.justification && (
                <p className="text-sm text-red-600">{errors.justification.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Creating..." : "Create Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/requests" })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
