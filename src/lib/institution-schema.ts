import { z } from "zod";

export const institutionRegistrationSchema = z.object({
  // Institution Information
  institution_name: z.string().min(2, "Institution name is required"),
  institution_amharic_name: z.string().optional(),
  institution_type: z.string().min(1, "Institution type is required"),
  registration_number: z.string().optional(),
  tin_number: z.string().optional(),
  institution_email: z.string().email("Valid institution email is required"),
  institution_phone: z.string().min(10, "Valid phone number is required"),
  alternative_phone: z.string().optional(),
  address: z.string().min(10, "Full address is required"),
  sub_city_id: z.string().optional(),
  woreda: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  
  // Primary Contact Information
  contact_name: z.string().min(2, "Contact person name is required"),
  contact_email: z.string().email("Valid contact email is required"),
  contact_phone: z.string().min(10, "Valid contact phone is required"),
  contact_position: z.string().min(2, "Position is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
  
  // Terms
  agree_terms: z.literal(true, { 
    errorMap: () => ({ message: "You must agree to the terms and conditions" }) 
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export type InstitutionRegistrationData = z.infer<typeof institutionRegistrationSchema>;

export const INSTITUTION_TYPES = {
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
