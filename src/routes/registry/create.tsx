import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTechnology } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/registry/create")({
  component: CreateTechnologyPage,
});

const technologySchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  owner_office: z.string().min(1, "Owner office is required"),
  status: z.enum(["Active", "Inactive", "In review", "Paused", "Pending"]),
  classification: z.enum(["Tier-1", "Tier-2", "Tier-3"]),
  location: z.string().min(1, "Location is required"),
  deployed_at: z.string().optional(),
});

type TechnologyFormData = z.infer<typeof technologySchema>;

function CreateTechnologyPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TechnologyFormData>({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      status: "Active",
      classification: "Tier-2",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TechnologyFormData) => {
      const response = await createTechnology(data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Technology created successfully");
      navigate({ to: `/registry/${data.id}` });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create technology");
    },
  });

  const onSubmit = (data: TechnologyFormData) => {
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
          onClick={() => navigate({ to: "/registry" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Technology</h1>
          <p className="text-gray-600 mt-1">Register a new technology in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Technology Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Technology Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Smart Traffic Management v2"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Category and Owner Office */}
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
                <Label htmlFor="owner_office">
                  Owner Office <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("owner_office")}
                  onValueChange={(value) => setValue("owner_office", value)}
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
                {errors.owner_office && (
                  <p className="text-sm text-red-600">{errors.owner_office.message}</p>
                )}
              </div>
            </div>

            {/* Status and Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) =>
                    setValue("status", value as "Active" | "Inactive" | "In review" | "Paused" | "Pending")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="In review">In Review</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="classification">
                  Classification <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("classification")}
                  onValueChange={(value) =>
                    setValue("classification", value as "Tier-1" | "Tier-2" | "Tier-3")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tier-1">Tier-1 (Critical)</SelectItem>
                    <SelectItem value="Tier-2">Tier-2 (Important)</SelectItem>
                    <SelectItem value="Tier-3">Tier-3 (Standard)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.classification && (
                  <p className="text-sm text-red-600">{errors.classification.message}</p>
                )}
              </div>
            </div>

            {/* Location and Deployed Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g., Bole, ITDB"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deployed_at">Deployed Date</Label>
                <Input
                  id="deployed_at"
                  type="date"
                  {...register("deployed_at")}
                />
                {errors.deployed_at && (
                  <p className="text-sm text-red-600">{errors.deployed_at.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Creating..." : "Create Technology"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/registry" })}
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
