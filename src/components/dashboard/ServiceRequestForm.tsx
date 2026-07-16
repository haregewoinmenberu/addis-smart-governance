import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPostForm } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { FlaskConical, Cpu, ShieldCheck, Loader2, CheckCircle2, X, Upload, FileText, Trash2 } from "lucide-react";

interface ServiceRequestFormProps {
  serviceType?: "research" | "transformation" | "licensing";
  editingSubmission?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ServiceRequestForm({ 
  serviceType: initialServiceType, 
  editingSubmission,
  onSuccess,
  onCancel 
}: ServiceRequestFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState<string>(
    initialServiceType || editingSubmission?.service_type || ""
  );
  const [formData, setFormData] = useState<Record<string, any>>(
    editingSubmission?.form_data || {}
  );
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Uploaded documents / letters (multipart)
  const [supportingLetter, setSupportingLetter] = useState<File | null>(null);
  const [officialLetter, setOfficialLetter] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  // Prefill contact details from the authenticated user for new requests.
  // Only fills fields the user hasn't already entered, so we never clobber input.
  useEffect(() => {
    if (!user || editingSubmission || !serviceType) return;
    setFormData((prev) => {
      const prefill: Record<string, any> = {};
      if (user.email && !prev.email) prefill.email = user.email;
      if (user.phone && !prev.phone) prefill.phone = user.phone;

      if (serviceType === "research") {
        if (user.name && !prev.fullName) prefill.fullName = user.name;
      } else if (serviceType === "transformation") {
        if (user.name && !prev.contactPerson) prefill.contactPerson = user.name;
        if (user.position && !prev.position) prefill.position = user.position;
      } else if (serviceType === "licensing") {
        if (user.name && !prev.fullName) prefill.fullName = user.name;
        if (user.department && !prev.organization) prefill.organization = user.department;
      }

      return Object.keys(prefill).length ? { ...prev, ...prefill } : prev;
    });
  }, [user, serviceType, editingSubmission]);

  const mutation = useMutation({
    mutationFn: async (data: { serviceType: string; formData: any }) => {
      const fd = new FormData();
      fd.append("serviceType", data.serviceType);
      fd.append("formData", JSON.stringify(data.formData));

      // Attach the relevant document(s) / letter(s) for this service type
      if (data.serviceType === "research" && supportingLetter) {
        fd.append("supportingLetter", supportingLetter);
      }
      if (data.serviceType === "transformation" && officialLetter) {
        fd.append("officialLetter", officialLetter);
      }
      if (data.serviceType === "licensing") {
        documents.forEach((file, index) => fd.append(`documents[${index}]`, file));
      }

      if (editingSubmission) {
        // Laravel method spoofing — multipart bodies must be POSTed
        fd.append("_method", "PUT");
        return apiPostForm<any>(`/service-forms/${editingSubmission.id}`, fd);
      }
      return apiPostForm<any>("/service-forms", fd);
    },
    onSuccess: (response: any) => {
      const referenceNumber =
        response?.data?.reference_number ?? response?.data?.data?.reference_number;
      toast({
        title: editingSubmission ? "Request Updated" : "Request Submitted",
        description: editingSubmission
          ? "Your service request has been updated successfully"
          : `Your service request has been submitted.${referenceNumber ? ` Reference: ${referenceNumber}` : ""}`,
      });
      queryClient.invalidateQueries({ queryKey: ["institution-requests"] });
      queryClient.invalidateQueries({ queryKey: ["user-submissions"] });
      onSuccess();
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      }
      toast({
        title: "Submission Failed",
        description: errorData?.message || "Please check the form and try again",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agree && !editingSubmission) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...formData,
      agree: agree || editingSubmission ? true : false,
    };

    mutation.mutate({
      serviceType,
      formData: submissionData,
    });
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "research":
        return FlaskConical;
      case "transformation":
        return Cpu;
      case "licensing":
        return ShieldCheck;
      default:
        return FlaskConical;
    }
  };

  const ServiceIcon = getServiceIcon(serviceType);

  if (!serviceType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Service Type</CardTitle>
          <CardDescription>Choose the type of service you want to request</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="cursor-pointer hover:border-primary transition-all"
              onClick={() => setServiceType("research")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <FlaskConical className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Research Services</h3>
                <p className="text-xs text-muted-foreground">
                  Submit research proposals
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-all"
              onClick={() => setServiceType("transformation")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Technology Transformation</h3>
                <p className="text-xs text-muted-foreground">
                  Request digital transformation services
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-all"
              onClick={() => setServiceType("licensing")}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold">Professional Licensing</h3>
                <p className="text-xs text-muted-foreground">
                  Apply for IT professional licenses
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ServiceIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>
                {editingSubmission ? "Edit" : "New"} {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Request
              </CardTitle>
              <CardDescription>
                {editingSubmission 
                  ? `Update your ${serviceType} request details`
                  : `Complete the form to submit your ${serviceType} request`
                }
              </CardDescription>
            </div>
          </div>
          {!initialServiceType && !editingSubmission && (
            <Button variant="ghost" size="sm" onClick={() => setServiceType("")}>
              <X className="h-4 w-4 mr-2" />
              Change
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serviceType === "research" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    value={formData.institution || ""}
                    onChange={(e) => handleInputChange("institution", e.target.value)}
                    placeholder="Your institution name"
                  />
                  {errors.institution && (
                    <p className="text-sm text-destructive">{errors.institution}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+251912345678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchTitle">Research Title *</Label>
                <Input
                  id="researchTitle"
                  value={formData.researchTitle || ""}
                  onChange={(e) => handleInputChange("researchTitle", e.target.value)}
                  placeholder="Enter your research title"
                />
                {errors.researchTitle && (
                  <p className="text-sm text-destructive">{errors.researchTitle}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI & Data">AI & Data</SelectItem>
                      <SelectItem value="Smart City">Smart City</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Public Sector Innovation">Public Sector Innovation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Duration (Months) *</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.durationMonths || ""}
                    onChange={(e) => handleInputChange("durationMonths", parseInt(e.target.value))}
                    placeholder="12"
                  />
                  {errors.durationMonths && (
                    <p className="text-sm text-destructive">{errors.durationMonths}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Research Abstract * (min 20 characters)</Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract || ""}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  placeholder="Provide a brief summary of your research..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.abstract?.length || 0} / 2000 characters
                </p>
                {errors.abstract && (
                  <p className="text-sm text-destructive">{errors.abstract}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedBudget">Estimated Budget (Optional)</Label>
                <Input
                  id="estimatedBudget"
                  value={formData.estimatedBudget || ""}
                  onChange={(e) => handleInputChange("estimatedBudget", e.target.value)}
                  placeholder="e.g., 500,000 ETB"
                />
              </div>

              <FileUploadBox
                id="supportingLetter"
                label="Supporting Letter (Optional)"
                description="PDF or Word document — official supporting letter for your research"
                file={supportingLetter}
                existing={editingSubmission?.form_data?.attachments?.supportingLetter}
                onChange={setSupportingLetter}
                onRemove={() => setSupportingLetter(null)}
              />
            </>
          )}

          {serviceType === "transformation" && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency Name *</Label>
                  <Input
                    id="agencyName"
                    value={formData.agencyName || ""}
                    onChange={(e) => handleInputChange("agencyName", e.target.value)}
                    placeholder="Your agency name"
                  />
                  {errors.agencyName && (
                    <p className="text-sm text-destructive">{errors.agencyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyType">Agency Type *</Label>
                  <Select
                    value={formData.agencyType || ""}
                    onValueChange={(value) => handleInputChange("agencyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bureau">Bureau</SelectItem>
                      <SelectItem value="Sub-city">Sub-city</SelectItem>
                      <SelectItem value="Public Enterprise">Public Enterprise</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.agencyType && (
                    <p className="text-sm text-destructive">{errors.agencyType}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    placeholder="Contact person name"
                  />
                  {errors.contactPerson && (
                    <p className="text-sm text-destructive">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position || ""}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="Job title"
                  />
                  {errors.position && (
                    <p className="text-sm text-destructive">{errors.position}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+251912345678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentMaturity">Current Digital Maturity *</Label>
                  <Select
                    value={formData.currentMaturity || ""}
                    onValueChange={(value) => handleInputChange("currentMaturity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maturity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Initial">Initial</SelectItem>
                      <SelectItem value="Developing">Developing</SelectItem>
                      <SelectItem value="Established">Established</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currentMaturity && (
                    <p className="text-sm text-destructive">{errors.currentMaturity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedStart">Expected Start Date *</Label>
                  <Input
                    id="expectedStart"
                    type="date"
                    value={formData.expectedStart || ""}
                    onChange={(e) => handleInputChange("expectedStart", e.target.value)}
                  />
                  {errors.expectedStart && (
                    <p className="text-sm text-destructive">{errors.expectedStart}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope">Transformation Scope * (min 20 characters)</Label>
                <Textarea
                  id="scope"
                  value={formData.scope || ""}
                  onChange={(e) => handleInputChange("scope", e.target.value)}
                  placeholder="Describe the scope of your transformation needs..."
                  rows={6}
                />
                {errors.scope && (
                  <p className="text-sm text-destructive">{errors.scope}</p>
                )}
              </div>

              <FileUploadBox
                id="officialLetter"
                label="Official Request Letter (Optional)"
                description="PDF or Word document — signed official letter from your agency"
                file={officialLetter}
                existing={editingSubmission?.form_data?.attachments?.officialLetter}
                onChange={setOfficialLetter}
                onRemove={() => setOfficialLetter(null)}
              />
            </>
          )}

          {serviceType === "licensing" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="applicantType">Applicant Type *</Label>
                <Select
                  value={formData.applicantType || ""}
                  onValueChange={(value) => handleInputChange("applicantType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual Professional">Individual Professional</SelectItem>
                    <SelectItem value="Firm">Firm</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
                {errors.applicantType && (
                  <p className="text-sm text-destructive">{errors.applicantType}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID *</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId || ""}
                    onChange={(e) => handleInputChange("nationalId", e.target.value)}
                    placeholder="National ID number"
                  />
                  {errors.nationalId && (
                    <p className="text-sm text-destructive">{errors.nationalId}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+251912345678"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">License Category *</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Development">Software Development</SelectItem>
                      <SelectItem value="Networking & Infrastructure">Networking & Infrastructure</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Data & AI">Data & AI</SelectItem>
                      <SelectItem value="IT Consulting">IT Consulting</SelectItem>
                      <SelectItem value="Hardware Supply">Hardware Supply</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">License Grade *</Label>
                  <Select
                    value={formData.grade || ""}
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 1">Grade 1</SelectItem>
                      <SelectItem value="Grade 2">Grade 2</SelectItem>
                      <SelectItem value="Grade 3">Grade 3</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-sm text-destructive">{errors.grade}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience *</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experienceYears || ""}
                    onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value))}
                    placeholder="Years"
                  />
                  {errors.experienceYears && (
                    <p className="text-sm text-destructive">{errors.experienceYears}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    value={formData.organization || ""}
                    onChange={(e) => handleInputChange("organization", e.target.value)}
                    placeholder="Current organization"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documents">Supporting Documents (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Attach credentials, certifications, CV, or other supporting files. You can add multiple.
                </p>

                {(documents.length > 0 ||
                  (editingSubmission?.form_data?.attachments?.documents?.length ?? 0) > 0) && (
                  <div className="space-y-2">
                    {editingSubmission?.form_data?.attachments?.documents?.map(
                      (doc: any, index: number) => (
                        <div
                          key={`existing-${index}`}
                          className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">{doc.original_name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">Uploaded</span>
                        </div>
                      ),
                    )}
                    {documents.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() =>
                            setDocuments((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <label
                  htmlFor="documents"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to add documents</span>
                  <span className="text-xs text-muted-foreground">PDF, Word, or image files</span>
                </label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const selected = Array.from(e.target.files ?? []);
                    if (selected.length) {
                      setDocuments((prev) => [...prev, ...selected]);
                    }
                    e.target.value = "";
                  }}
                />
              </div>
            </>
          )}

          {!editingSubmission && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(checked) => setAgree(checked as boolean)}
              />
              <Label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                I agree to the terms and conditions and certify that the information provided is accurate
              </Label>
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please fix the errors above before submitting
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingSubmission ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {editingSubmission ? "Update Request" : "Submit Request"}
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Single-file upload field with a drop-zone style trigger, selected-file
 * preview, and support for showing an already-uploaded attachment when editing.
 */
function FileUploadBox({
  id,
  label,
  description,
  file,
  existing,
  onChange,
  onRemove,
}: {
  id: string;
  label: string;
  description?: string;
  file: File | null;
  existing?: { original_name?: string } | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {file ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-sm">{file.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(file.size / 1024).toFixed(0)} KB)
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ) : (
        <>
          {existing?.original_name && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm">{existing.original_name}</span>
              <span className="ml-auto text-xs text-muted-foreground">Uploaded</span>
            </div>
          )}
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {existing?.original_name ? "Click to replace file" : "Click to upload"}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </label>
        </>
      )}

      <Input
        id={id}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
