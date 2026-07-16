import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText, CheckCircle2, Copy, Download, ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  researchSchema, transformationSchema, licensingSchema, lmsSchema,
  type ResearchFormData, type TransformationFormData,
  type LicensingFormData, 
} from "@/lib/service-forms-schema";
import type { ServiceKey } from "@/lib/services-data";
import { apiPost } from "@/lib/api";

type Props = { kind: ServiceKey };

// Map service kind to form data type
type FormDataMap = {
  research: ResearchFormData;
  transformation: TransformationFormData;
  licensing: LicensingFormData; 
};

// Helper to store submission history
function storeSubmission(reference: string, serviceType: string, timestamp: string) {
  try {
    const submissions = JSON.parse(localStorage.getItem('strp_submissions') || '[]');
    submissions.unshift({ reference, serviceType, timestamp, status: 'pending' });
    // Keep only last 20 submissions
    if (submissions.length > 20) submissions.length = 20;
    localStorage.setItem('strp_submissions', JSON.stringify(submissions));
  } catch (error) {
    console.error('Failed to store submission:', error);
  }
}

// Helper to copy to clipboard
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Copied to clipboard!');
  }
}

async function submitServiceForm<K extends ServiceKey>(
  serviceType: K,
  formData: FormDataMap[K]
): Promise<{ reference: string }> {
  // Create FormData for file uploads
  const submitData = new FormData();
  submitData.append('serviceType', serviceType);
  
  // Handle file fields separately and ensure proper types
  const jsonData: any = { ...formData };
  
  // Convert number fields to actual numbers
  if ('durationMonths' in jsonData) {
    jsonData.durationMonths = Number(jsonData.durationMonths);
  }
  if ('experienceYears' in jsonData) {
    jsonData.experienceYears = Number(jsonData.experienceYears);
  }
  
  if ('supportingLetter' in formData && formData.supportingLetter instanceof File) {
    submitData.append('supportingLetter', formData.supportingLetter);
    delete jsonData.supportingLetter;
  }
  
  if ('officialLetter' in formData && formData.officialLetter instanceof File) {
    submitData.append('officialLetter', formData.officialLetter);
    delete jsonData.officialLetter;
  }
  
  if ('documents' in formData && Array.isArray(formData.documents)) {
    formData.documents.forEach((file: File, index: number) => {
      submitData.append(`documents[${index}]`, file);
    });
    delete jsonData.documents;
  }
  
  submitData.append('formData', JSON.stringify(jsonData));

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const response = await fetch(`${apiUrl}/service-forms/submit`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: submitData,
    credentials: 'include', // Include cookies for CORS with credentials
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Submission failed' }));
    throw new Error(error.message || 'Submission failed');
  }

  const data = await response.json();
  return { reference: data.data.reference_number };
}

export function ServiceRegistrationForm({ kind }: Props) {
  switch (kind) {
    case "research":
      return <ResearchForm />;
    case "transformation":
      return <TransformationForm />;
    case "licensing":
      return <LicensingForm />; 
  }
}

/* ------------------------- shared bits ------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SubmitRow({
  loading,
  label = "Submit",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <div className="space-y-3 pt-2">
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Your information is encrypted and reviewed by authorized STRP officers only.
      </p>
    </div>
  );
}

function AgreeField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="agree"
      render={({ field }) => (
        <FormItem className="sm:col-span-2 flex flex-row items-start gap-3">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(Boolean(v))}
            />
          </FormControl>
          <div className="space-y-1 leading-snug">
            <FormLabel className="text-sm font-normal text-foreground">
              I confirm the information is accurate and I consent to STRP processing.
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

function onSubmitHandler<K extends ServiceKey>(
  form: ReturnType<typeof useForm<any>>,
  setLoading: (b: boolean) => void,
  label: string,
  serviceType: K,
  setSuccessData: (data: { reference: string; serviceType: string } | null) => void,
) {
  return form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await submitServiceForm(serviceType, values);
      
      // Store submission in localStorage
      storeSubmission(res.reference, serviceType, new Date().toISOString());
      
      // Show success dialog
      setSuccessData({ reference: res.reference, serviceType });
      
      // Also show toast
      toast.success(`${label} received!`, {
        description: `Reference: ${res.reference}`,
        duration: 5000,
      });
      
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again in a moment.';
      toast.error("Submission failed", { description: message });
    } finally {
      setLoading(false);
    }
  });
}

/* ------------------------- success dialog ------------------------- */

function SuccessDialog({ 
  data, 
  onClose 
}: { 
  data: { reference: string; serviceType: string } | null; 
  onClose: () => void;
}) {
  if (!data) return null;

  const serviceLabels: Record<string, string> = {
    research: "Research Proposal",
    transformation: "Technology Transformation Request",
    licensing: "Professional License Application",
    lms: "Learning Management Enrollment",
  };

  const handleDownloadReceipt = () => {
    // Create a simple text receipt
    const receipt = `
STRP Service Submission Receipt
================================

Service Type: ${serviceLabels[data.serviceType] || data.serviceType}
Reference Number: ${data.reference}
Submission Date: ${new Date().toLocaleString()}
Status: Pending Review

================================

Please save this reference number to track your application status.
You can check your application status using this reference number.

Thank you for using STRP services.
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STRP-Receipt-${data.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-2xl">Submission Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your {serviceLabels[data.serviceType] || 'application'} has been received
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reference Number Display */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Your Reference Number
              </p>
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <p className="text-2xl font-bold text-primary tracking-wider font-mono">
                  {data.reference}
                </p>
              </div>
            </div>

            {/* Copy Button */}
            <Button
              onClick={() => copyToClipboard(data.reference)}
              variant="outline"
              className="w-full h-11 font-semibold"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Reference Number
            </Button>
          </div>

          {/* Important Notice */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium mb-2">
              📋 Important: Save Your Reference Number
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Use this reference number to track your application status. We've saved it in your browser, 
              but we recommend taking a screenshot or writing it down.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="h-11"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button
              onClick={() => {
                // Navigate to status check page or show tracking info
                window.open(`/track-status?ref=${data.reference}`, '_blank');
              }}
              variant="outline"
              className="h-11"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Track Status
            </Button>
          </div>

          {/* Next Steps */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">What's Next?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>You'll receive a confirmation email shortly</li>
              <li>Our team will review your submission within 3-5 business days</li>
              <li>You can track your application status using the reference number</li>
              <li>You'll be notified of any updates via email</li>
            </ul>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- research ------------------------- */

function ResearchForm() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ reference: string; serviceType: string } | null>(null);
  
  const form = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", institution: "",
      researchTitle: "", category: "AI & Data", abstract: "",
      estimatedBudget: "", durationMonths: 6, 
      supportingLetter: null,
      agree: false as unknown as true,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmitHandler(form, setLoading, "Research proposal", "research", setSuccessData)} className="space-y-8">
          <Section title="Applicant">
            <TextField form={form} name="fullName" label="Full name" placeholder="Dr. Helen T." />
            <TextField form={form} name="institution" label="Institution" placeholder="Addis Ababa University" />
            <TextField form={form} name="email" label="Email" type="email" placeholder="you@example.com" />
            <TextField form={form} name="phone" label="Phone" placeholder="+251 ..." />
          </Section>

          <Section title="Research details">
            <TextField form={form} name="researchTitle" label="Research title" placeholder="AI-driven traffic optimization for Addis Ababa" />
            <SelectField
              form={form} name="category" label="Category"
              options={["AI & Data", "Smart City", "Cybersecurity", "Public Sector Innovation", "Other"]}
            />
            <NumberField form={form} name="durationMonths" label="Duration (months)" />
            <TextField form={form} name="estimatedBudget" label="Estimated budget (optional)" placeholder="e.g. 250,000 ETB" />
            <div className="sm:col-span-2">
              <TextAreaField form={form} name="abstract" label="Abstract" placeholder="Describe objectives, methodology and expected impact (min 20 chars)…" rows={6} />
            </div>
          </Section>

          <Section title="Supporting Documents">
            <div className="sm:col-span-2">
              <FileUploadField 
                form={form} 
                name="supportingLetter" 
                label="Supporting Letter (optional)" 
                description="Upload an institutional support letter or recommendation (PDF, DOC, DOCX)"
                accept=".pdf,.doc,.docx"
              />
            </div>
          </Section>

          <Section title="Consent"><AgreeField form={form} /></Section>
          <SubmitRow loading={loading} label="Submit proposal" />
        </form>
      </Form>
      
      <SuccessDialog data={successData} onClose={() => setSuccessData(null)} />
    </>
  );
}

/* ------------------------- transformation ------------------------- */

function TransformationForm() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ reference: string; serviceType: string } | null>(null);
  
  const form = useForm<TransformationFormData>({
    resolver: zodResolver(transformationSchema),
    defaultValues: {
      agencyName: "", contactPerson: "", position: "",
      email: "", phone: "",
      agencyType: "Bureau", currentMaturity: "Developing",
      scope: "", expectedStart: "",
      officialLetter: null,
      agree: false as unknown as true,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmitHandler(form, setLoading, "Transformation request", "transformation", setSuccessData)} className="space-y-8">
          <Section title="Agency">
            <TextField form={form} name="agencyName" label="Agency / Bureau" placeholder="Bureau of …" />
            <SelectField form={form} name="agencyType" label="Type" options={["Bureau", "Sub-city", "Public Enterprise", "Other"]} />
            <TextField form={form} name="contactPerson" label="Contact person" />
            <TextField form={form} name="position" label="Position" />
            <TextField form={form} name="email" label="Email" type="email" />
            <TextField form={form} name="phone" label="Phone" />
          </Section>

          <Section title="Engagement">
            <SelectField form={form} name="currentMaturity" label="Current digital maturity" options={["Initial", "Developing", "Established", "Advanced"]} />
            <TextField form={form} name="expectedStart" label="Expected start" type="date" />
            <div className="sm:col-span-2">
              <TextAreaField form={form} name="scope" label="Scope & objectives" placeholder="What systems, processes or capabilities should be transformed?" rows={6} />
            </div>
          </Section>

          <Section title="Official Documents">
            <div className="sm:col-span-2">
              <FileUploadField 
                form={form} 
                name="officialLetter" 
                label="Official Request Letter (optional)" 
                description="Upload an official letter from your agency requesting technology transformation services (PDF, DOC, DOCX)"
                accept=".pdf,.doc,.docx"
              />
            </div>
          </Section>

          <Section title="Consent"><AgreeField form={form} /></Section>
          <SubmitRow loading={loading} label="Submit request" />
        </form>
      </Form>
      
      <SuccessDialog data={successData} onClose={() => setSuccessData(null)} />
    </>
  );
}

/* ------------------------- licensing ------------------------- */

function LicensingForm() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ reference: string; serviceType: string } | null>(null);
  
  const form = useForm<LicensingFormData>({
    resolver: zodResolver(licensingSchema),
    defaultValues: {
      applicantType: "Individual Professional",
      fullName: "", nationalId: "",
      email: "", phone: "",
      category: "Software Development", grade: "Grade 1",
      experienceYears: 0, organization: "",
      documents: [],
      agree: false as unknown as true,
    },
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmitHandler(form, setLoading, "License application", "licensing", setSuccessData)} className="space-y-8">
          <Section title="Applicant">
            <SelectField form={form} name="applicantType" label="Applicant type" options={["Individual Professional", "Firm", "Vendor"]} />
            <TextField form={form} name="fullName" label="Full / Company name" />
            <TextField form={form} name="nationalId" label="National ID / TIN" />
            <TextField form={form} name="organization" label="Organization (optional)" />
            <TextField form={form} name="email" label="Email" type="email" />
            <TextField form={form} name="phone" label="Phone" />
          </Section>

          <Section title="License">
            <SelectField
              form={form} name="category" label="Category"
              options={["Software Development", "Networking & Infrastructure", "Cybersecurity", "Data & AI", "IT Consulting", "Hardware Supply"]}
            /> 
            <NumberField form={form} name="experienceYears" label="Years of experience" />
          </Section>

          <Section title="Required Documents">
            <div className="sm:col-span-2">
              <MultiFileUploadField 
                form={form} 
                name="documents" 
                label="Supporting Documents" 
                description="Upload required documents: CV/Resume, Certificates, Educational transcripts, Work experience letters, Company registration (if applicable), etc. (PDF, DOC, DOCX, JPG, PNG)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </Section>

          <Section title="Consent"><AgreeField form={form} /></Section>
          <SubmitRow loading={loading} label="Apply for license" />
        </form>
      </Form>
      
      <SuccessDialog data={successData} onClose={() => setSuccessData(null)} />
    </>
  );
}

 

/* ------------------------- field primitives ------------------------- */

function TextField({ form, name, label, placeholder, type = "text" }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              className="h-11 rounded-lg border-border bg-background px-3 text-sm shadow-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberField({ form, name, label }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
              className="h-11 rounded-lg border-border bg-background px-3 text-sm shadow-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextAreaField({ form, name, label, placeholder, rows = 4 }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              {...field}
              className="rounded-lg border-border bg-background px-3 py-2.5 text-sm shadow-none resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({ form, name, label, options }: { form: any; name: string; label: string; options: string[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="h-11 rounded-lg border-border bg-background px-3 text-sm shadow-none">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FileUploadField({ form, name, label, description, accept }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-border bg-background px-4 text-sm"
                  onClick={() => document.getElementById(`file-${name}`)?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {value && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{value.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onChange(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <input
                {...field}
                id={`file-${name}`}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  onChange(file || null);
                }}
              />
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MultiFileUploadField({ form, name, label, description, accept }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value = [], onChange, ...field } }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-semibold text-foreground">{label}</FormLabel>
          <FormControl>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg border-border bg-background px-4 text-sm"
                  onClick={() => document.getElementById(`file-multi-${name}`)?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Document{value.length > 0 ? 's' : ''}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {value.length} document{value.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              {value.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  {value.map((file: File, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-2 rounded bg-background px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => {
                          const newFiles = value.filter((_: any, i: number) => i !== index);
                          onChange(newFiles);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <input
                {...field}
                id={`file-multi-${name}`}
                type="file"
                accept={accept}
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  onChange([...value, ...files]);
                  e.target.value = ''; // Reset input to allow re-adding same file
                }}
              />
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}