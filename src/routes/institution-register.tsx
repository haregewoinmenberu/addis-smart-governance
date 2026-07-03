import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Navbar } from "@/components/landingpage/landing/Navbar";
import { Footer } from "@/components/landingpage/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost } from "@/lib/api";

export const Route = createFileRoute("/institution-register")({
  component: InstitutionRegister,
});

const institutionTypes = {
  BUREAU: "Bureau",
  AUTHORITY: "Authority",
  COMMISSION: "Commission",
  AGENCY: "Agency",
  OFFICE: "Office",
  SUB_CITY: "Sub-City",
  WOREDA: "Woreda",
  PUBLIC_ENTERPRISE: "Public Enterprise",
  UNIVERSITY: "University",
  COLLEGE: "College",
  TVET: "TVET Institution",
  SCHOOL: "School",
  HOSPITAL: "Hospital",
  HEALTH_CENTER: "Health Center",
  HEALTH_OFFICE: "Health Office",
  RESEARCH_INSTITUTE: "Research Institute",
  COURT: "Court",
  SECURITY: "Security Institution",
  UTILITY: "Utility Institution",
  NGO: "NGO / Development Partner",
  COOPERATIVE: "Cooperative",
  ASSOCIATION: "Association",
  MANUFACTURING: "Manufacturing Industry",
  FINANCIAL_INSTITUTION: "Financial Institution",
  PRIVATE_COMPANY: "Private Company",
  STARTUP: "Startup / Innovation Center",
  RELIGIOUS_INSTITUTION: "Religious Institution",
  OTHER_GOVERNMENT: "Other Government Institution",
  OTHER: "Other",
};

const schema = z.object({
  // Institution details
  institution_name: z.string().min(2, "Institution name is required"),
  institution_amharic_name: z.string().optional(),
  institution_type: z.string().min(1, "Institution type is required"),
  registration_number: z.string().optional(),
  tin_number: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  alternative_phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Valid URL is required").optional().or(z.literal("")),
  description: z.string().optional(),

  // Primary contact details
  contact_name: z.string().min(2, "Contact person name is required"),
  contact_email: z.string().email("Valid email is required"),
  contact_phone: z.string().min(10, "Valid phone number is required"),
  contact_position: z.string().min(2, "Position is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type FormData = z.infer<typeof schema>;

function InstitutionRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      institution_name: "",
      institution_amharic_name: "",
      institution_type: "",
      registration_number: "",
      tin_number: "",
      email: "",
      phone: "",
      alternative_phone: "",
      address: "",
      website: "",
      description: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      contact_position: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const response = await apiPost("/institutions/register", values);
      
      toast.success("Registration successful!", {
        description: "Your institution account is pending verification. You'll receive an email once approved.",
      });
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 3000);
      
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || "Registration failed";
      toast.error("Registration failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="relative min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-[80vh] items-center justify-center px-4 pt-32">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-3 text-2xl font-bold">Registration Successful!</h1>
            <p className="text-muted-foreground">
              Your institution account has been created and is pending verification.
              You'll receive an email notification once your account is approved.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Login
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Institution Registration</h1>
                <p className="text-sm text-muted-foreground">
                  Create an account to access STRP services
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Institution Information */}
                <div className="space-y-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Institution Information
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="institution_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Education Bureau" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="institution_amharic_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amharic Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="የትምህርት ቢሮ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="institution_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {Object.entries(institutionTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registration_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="REG-123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tin_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TIN Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Official Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@institution.gov.et" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+251 11 XXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="alternative_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternative Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="+251 91 XXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://institution.gov.et" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Physical address, Woreda, Sub-City, etc."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your institution and its mandate"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Contact Information */}
                <div className="space-y-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary Contact / Administrator
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Abebe Kebede" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position *</FormLabel>
                          <FormControl>
                            <Input placeholder="IT Director" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="abebe.k@institution.gov.et" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            This will be your login email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+251 91 XXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Minimum 8 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password_confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Your information will be verified by STRP administrators before activation.
                  </p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                    ) : (
                      <>Register Institution</>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Sign in here
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
