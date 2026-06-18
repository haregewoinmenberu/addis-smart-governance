import { z } from "zod";

// Research & Innovation Hub form schema
export const researchSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  institution: z.string().min(2, "Institution is required"),
  researchTitle: z.string().min(10, "Research title must be at least 10 characters"),
  category: z.enum(["AI & Data", "Smart City", "Cybersecurity", "Public Sector Innovation", "Other"]),
  abstract: z.string().min(20, "Abstract must be at least 20 characters"),
  estimatedBudget: z.string().optional(),
  durationMonths: z.number().min(1).max(60),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

export type ResearchFormData = z.infer<typeof researchSchema>;

// Technology Transformation form schema
export const transformationSchema = z.object({
  agencyName: z.string().min(2, "Agency name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  position: z.string().min(2, "Position is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  agencyType: z.enum(["Bureau", "Sub-city", "Public Enterprise", "Other"]),
  currentMaturity: z.enum(["Initial", "Developing", "Established", "Advanced"]),
  scope: z.string().min(20, "Please describe the scope (at least 20 characters)"),
  expectedStart: z.string().min(1, "Expected start date is required"),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

export type TransformationFormData = z.infer<typeof transformationSchema>;

// Professional Licensing form schema
export const licensingSchema = z.object({
  applicantType: z.enum(["Individual Professional", "Firm", "Vendor"]),
  fullName: z.string().min(2, "Full name or company name is required"),
  nationalId: z.string().min(5, "National ID or TIN is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  category: z.enum([
    "Software Development",
    "Networking & Infrastructure",
    "Cybersecurity",
    "Data & AI",
    "IT Consulting",
    "Hardware Supply",
  ]),
  grade: z.enum(["Grade 1", "Grade 2", "Grade 3"]),
  experienceYears: z.number().min(0).max(50),
  organization: z.string().optional(),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

export type LicensingFormData = z.infer<typeof licensingSchema>;

// Learning Management System form schema
export const lmsSchema = z.object({
  learnerName: z.string().min(2, "Full name is required"),
  employeeId: z.string().min(2, "Employee ID is required"),
  email: z.string().email("Valid work email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  agency: z.string().min(2, "Agency is required"),
  position: z.string().min(2, "Position is required"),
  program: z.enum([
    "Digital Leadership",
    "Cybersecurity Awareness",
    "Public Sector Data Analytics",
    "AI for Government",
    "Project Management",
  ]),
  cohort: z.enum(["Self-paced", "Q1 Cohort", "Q2 Cohort", "Q3 Cohort", "Q4 Cohort"]),
  notes: z.string().optional(),
  agree: z.literal(true, { errorMap: () => ({ message: "You must agree to continue" }) }),
});

export type LmsFormData = z.infer<typeof lmsSchema>;
