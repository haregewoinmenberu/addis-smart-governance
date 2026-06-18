import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  researchSchema, transformationSchema, licensingSchema, lmsSchema,
  type ResearchFormData, type TransformationFormData,
  type LicensingFormData, type LmsFormData,
} from "@/lib/service-forms-schema";
import type { ServiceKey } from "@/lib/services-data";
import { apiPost } from "@/lib/api";

type Props = { kind: ServiceKey };

// Map service kind to form data type
type FormDataMap = {
  research: ResearchFormData;
  transformation: TransformationFormData;
  licensing: LicensingFormData;
  lms: LmsFormData;
};

async function submitServiceForm<K extends ServiceKey>(
  serviceType: K,
  formData: FormDataMap[K]
): Promise<{ reference: string }> {
  const data = await apiPost<{ success: boolean; data: { reference_number: string } }>(
    '/service-forms/submit',
    {
      serviceType,
      formData,
    }
  );
  
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
    case "lms":
      return <LmsForm />;
  }
}

/* ------------------------- shared bits ------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SubmitRow({
  loading,
  label = "Submit application",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Your information is encrypted and reviewed by authorized STRP officers only.
      </p>
      <Button
        type="submit"
        disabled={loading}
        className="h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </div>
  );
}

function AgreeField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="agree"
      render={({ field }) => (
        <FormItem className="sm:col-span-2 flex flex-row items-start gap-3 rounded-xl border border-border bg-secondary/50 p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(v) => field.onChange(Boolean(v))}
            />
          </FormControl>
          <div className="space-y-1 leading-snug">
            <FormLabel className="text-sm font-medium">
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
) {
  return form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await submitServiceForm(serviceType, values);
      toast.success(`${label} received`, {
        description: `Reference: ${res.reference}. You'll get a confirmation by email.`,
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

/* ------------------------- research ------------------------- */

import { useState } from "react";

function ResearchForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<ResearchFormData>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      fullName: "", email: "", phone: "", institution: "",
      researchTitle: "", category: "AI & Data", abstract: "",
      estimatedBudget: "", durationMonths: 6, agree: false as unknown as true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler(form, setLoading, "Research proposal", "research")} className="space-y-8">
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

        <Section title="Consent"><AgreeField form={form} /></Section>
        <SubmitRow loading={loading} label="Submit proposal" />
      </form>
    </Form>
  );
}

/* ------------------------- transformation ------------------------- */

function TransformationForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<TransformationFormData>({
    resolver: zodResolver(transformationSchema),
    defaultValues: {
      agencyName: "", contactPerson: "", position: "",
      email: "", phone: "",
      agencyType: "Bureau", currentMaturity: "Developing",
      scope: "", expectedStart: "",
      agree: false as unknown as true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler(form, setLoading, "Transformation request", "transformation")} className="space-y-8">
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

        <Section title="Consent"><AgreeField form={form} /></Section>
        <SubmitRow loading={loading} label="Submit request" />
      </form>
    </Form>
  );
}

/* ------------------------- licensing ------------------------- */

function LicensingForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<LicensingFormData>({
    resolver: zodResolver(licensingSchema),
    defaultValues: {
      applicantType: "Individual Professional",
      fullName: "", nationalId: "",
      email: "", phone: "",
      category: "Software Development", grade: "Grade 1",
      experienceYears: 0, organization: "",
      agree: false as unknown as true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler(form, setLoading, "License application", "licensing")} className="space-y-8">
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
          <SelectField form={form} name="grade" label="Grade" options={["Grade 1", "Grade 2", "Grade 3"]} />
          <NumberField form={form} name="experienceYears" label="Years of experience" />
        </Section>

        <Section title="Consent"><AgreeField form={form} /></Section>
        <SubmitRow loading={loading} label="Apply for license" />
      </form>
    </Form>
  );
}

/* ------------------------- LMS ------------------------- */

function LmsForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<LmsFormData>({
    resolver: zodResolver(lmsSchema),
    defaultValues: {
      learnerName: "", employeeId: "",
      email: "", phone: "",
      agency: "", position: "",
      program: "Digital Leadership", cohort: "Self-paced",
      notes: "",
      agree: false as unknown as true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler(form, setLoading, "Learner registration", "lms")} className="space-y-8">
        <Section title="Learner">
          <TextField form={form} name="learnerName" label="Full name" />
          <TextField form={form} name="employeeId" label="Employee ID" />
          <TextField form={form} name="email" label="Work email" type="email" />
          <TextField form={form} name="phone" label="Phone" />
          <TextField form={form} name="agency" label="Agency" />
          <TextField form={form} name="position" label="Position" />
        </Section>

        <Section title="Program">
          <SelectField
            form={form} name="program" label="Program"
            options={["Digital Leadership", "Cybersecurity Awareness", "Public Sector Data Analytics", "AI for Government", "Project Management"]}
          />
          <SelectField
            form={form} name="cohort" label="Cohort"
            options={["Self-paced", "Q1 Cohort", "Q2 Cohort", "Q3 Cohort", "Q4 Cohort"]}
          />
          <div className="sm:col-span-2">
            <TextAreaField form={form} name="notes" label="Notes (optional)" placeholder="Accessibility needs, prerequisites, etc." rows={4} />
          </div>
        </Section>

        <Section title="Consent"><AgreeField form={form} /></Section>
        <SubmitRow loading={loading} label="Register learner" />
      </form>
    </Form>
  );
}

/* ------------------------- field primitives ------------------------- */

function TextField({ form, name, label, placeholder, type = "text" }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl><Input type={type} placeholder={placeholder} {...field} /></FormControl>
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
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value)} />
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
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl><Textarea rows={rows} placeholder={placeholder} {...field} /></FormControl>
          <FormDescription className="text-xs">
            {typeof field.value === "string" ? `${field.value.length} characters` : null}
          </FormDescription>
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
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
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
