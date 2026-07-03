import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Edit, Save, X, Mail, Phone, MapPin, Globe, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Institution {
  id: number;
  name: string;
  amharic_name?: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  alternative_phone?: string;
  address?: string;
  website?: string;
  description?: string;
  tin_number?: string;
  registration_number?: string;
  verified_at: string | null;
}

interface ProfileManagementProps {
  institution: Institution;
}

export function ProfileManagement({ institution }: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institution.name,
    amharic_name: institution.amharic_name || "",
    email: institution.email,
    phone: institution.phone,
    alternative_phone: institution.alternative_phone || "",
    address: institution.address || "",
    website: institution.website || "",
    description: institution.description || "",
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiPost(`/institutions/${institution.id}/update`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-institution"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: institution.name,
      amharic_name: institution.amharic_name || "",
      email: institution.email,
      phone: institution.phone,
      alternative_phone: institution.alternative_phone || "",
      address: institution.address || "",
      website: institution.website || "",
      description: institution.description || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{institution.name}</CardTitle>
              <CardDescription className="mt-1">
                {institution.type.replace(/_/g, " ")}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={institution.status === "ACTIVE" ? "default" : "secondary"}
              className="text-sm"
            >
              {institution.status}
            </Badge>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} size="sm" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Institution Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Institution Name
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{institution.name}</p>
            )}
          </div>

          {/* Amharic Name */}
          <div className="space-y-2">
            <Label htmlFor="amharic_name">Amharic Name</Label>
            {isEditing ? (
              <Input
                id="amharic_name"
                value={formData.amharic_name}
                onChange={(e) => setFormData({ ...formData, amharic_name: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{institution.amharic_name || "Not provided"}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{institution.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{institution.phone}</p>
            )}
          </div>

          {/* Alternative Phone */}
          <div className="space-y-2">
            <Label htmlFor="alternative_phone">Alternative Phone</Label>
            {isEditing ? (
              <Input
                id="alternative_phone"
                value={formData.alternative_phone}
                onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">{institution.alternative_phone || "Not provided"}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            {isEditing ? (
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            ) : (
              <p className="text-sm font-medium">
                {institution.website ? (
                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {institution.website}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            )}
          </div>

          {/* TIN Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              TIN Number
            </Label>
            <p className="text-sm font-medium">{institution.tin_number || "Not provided"}</p>
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <p className="text-sm font-medium">{institution.registration_number || "Not provided"}</p>
          </div>

          {/* Address - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            ) : (
              <p className="text-sm font-medium">{institution.address || "Not provided"}</p>
            )}
          </div>

          {/* Description - Full Width */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm font-medium">{institution.description || "Not provided"}</p>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Verification Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                {institution.verified_at 
                  ? `Verified on ${new Date(institution.verified_at).toLocaleDateString()}`
                  : "Pending verification by STRP administrators"
                }
              </p>
            </div>
            {institution.verified_at ? (
              <Badge variant="default" className="bg-green-600">
                ✓ Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                ⏳ Pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
