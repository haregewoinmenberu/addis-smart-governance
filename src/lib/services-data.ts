import { FlaskConical, Cpu, ShieldCheck, GraduationCap, CheckCircle2, Sparkles, Users, BarChart3, FileCheck, Clock, Shield, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceKey = "research" | "transformation" | "licensing" | "lms";

export interface ServiceFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceDetail {
  slug: ServiceKey;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  longDescription: string;
  features: ServiceFeature[];
  benefits: ServiceBenefit[];
  stats: {
    label: string;
    value: string;
  }[];
  ctaText: string;
  ctaSubtext: string;
}

export const servicesData: Record<ServiceKey, ServiceDetail> = {
  research: {
    slug: "research",
    title: "Research & Innovation Hub",
    shortTitle: "Research Hub",
    icon: FlaskConical,
    tagline: "Driving Ethiopia's Digital Future Through Evidence-Based Innovation",
    description: "AI-driven research submission, evaluation, and tracking system for national technology policy and innovation research.",
    longDescription: "The Research & Innovation Hub is a comprehensive platform designed to streamline research submission, peer review, and policy implementation tracking. It connects researchers, policymakers, and innovators across Ethiopia to build an evidence-based foundation for digital transformation.",
    features: [
      {
        icon: Sparkles,
        title: "AI-Driven Research Submission",
        description: "Submit research proposals through an intelligent form system that guides you through requirements, automatically validates data, and matches your research with relevant policy areas."
      },
      {
        icon: FileCheck,
        title: "Policy & Technology Evaluation",
        description: "Comprehensive peer review workflow with automated assignment, conflict-of-interest detection, and structured evaluation criteria aligned with national innovation goals."
      },
      {
        icon: BarChart3,
        title: "National Innovation Dashboard",
        description: "Real-time tracking of research impact, policy adoption metrics, and innovation outcomes across all government agencies and academic institutions."
      },
      {
        icon: Users,
        title: "Collaboration Network",
        description: "Connect with researchers, government agencies, and private sector partners. Create multi-institutional research teams with built-in project management tools."
      }
    ],
    benefits: [
      {
        title: "Accelerated Research-to-Policy Pipeline",
        description: "Reduce time from research submission to policy implementation by 60% through automated workflows and AI-assisted evaluation."
      },
      {
        title: "Evidence-Based Decision Making",
        description: "Policymakers gain access to validated research findings with clear impact assessments and implementation roadmaps."
      },
      {
        title: "Increased Research Quality",
        description: "Structured evaluation criteria and transparent peer review ensure only high-quality, relevant research influences national policy."
      },
      {
        title: "Innovation Ecosystem Visibility",
        description: "Track national innovation metrics, identify research gaps, and allocate resources based on data-driven insights."
      }
    ],
    stats: [
      { label: "Research Projects", value: "1,284" },
      { label: "Active Researchers", value: "3,450" },
      { label: "Policy Impacts", value: "156" },
      { label: "Institutions", value: "89" }
    ],
    ctaText: "Start Your Research Journey",
    ctaSubtext: "Submit your research proposal or join as a peer reviewer"
  },
  
  transformation: {
    slug: "transformation",
    title: "Technology Transformation",
    shortTitle: "Digital Transformation",
    icon: Cpu,
    tagline: "Modernizing Government Systems for the Digital Age",
    description: "Comprehensive digital transformation platform for government system modernization, infrastructure upgrades, and smart city integration.",
    longDescription: "The Technology Transformation module provides end-to-end management of digital transformation initiatives across all government agencies. From legacy system modernization to smart city infrastructure deployment, this platform ensures coordinated, secure, and sustainable digital evolution.",
    features: [
      {
        icon: Cpu,
        title: "System Modernization Pipeline",
        description: "Plan, track, and manage legacy system upgrades with automated dependency mapping, risk assessment, and migration support for seamless transitions."
      },
      {
        icon: Shield,
        title: "Digital Infrastructure Management",
        description: "Centralized control of all government IT infrastructure including cloud resources, on-premise systems, and hybrid architectures with real-time monitoring."
      },
      {
        icon: Sparkles,
        title: "Smart City Integration",
        description: "Coordinate IoT deployments, smart traffic systems, digital public services, and citizen engagement platforms across Addis Ababa's 11 sub-cities."
      },
      {
        icon: BarChart3,
        title: "Transformation Analytics",
        description: "Track digital maturity scores, measure ROI on technology investments, and generate transformation roadmaps with AI-powered recommendations."
      }
    ],
    benefits: [
      {
        title: "Unified Transformation Strategy",
        description: "Avoid siloed modernization efforts with a centralized platform that ensures all agencies follow consistent standards and timelines."
      },
      {
        title: "Cost Optimization",
        description: "Reduce duplication and maximize resource utilization through shared infrastructure and consolidated procurement processes."
      },
      {
        title: "Citizen-Centric Services",
        description: "Transform government-citizen interactions with integrated digital services accessible through web, mobile, and smart city kiosks."
      },
      {
        title: "Future-Ready Infrastructure",
        description: "Build scalable, secure, and sustainable systems designed for AI, blockchain, and emerging technology integration."
      }
    ],
    stats: [
      { label: "Systems Modernized", value: "428" },
      { label: "Smart City Projects", value: "67" },
      { label: "Agencies Connected", value: "145" },
      { label: "Uptime SLA", value: "99.9%" }
    ],
    ctaText: "Begin Digital Transformation",
    ctaSubtext: "Request a system assessment or start a modernization project"
  },
  
  licensing: {
    slug: "licensing",
    title: "Professional Licensing",
    shortTitle: "IT Licensing",
    icon: ShieldCheck,
    tagline: "Secure, Transparent, and Automated IT Professional Certification",
    description: "Digital licensing platform for IT professionals, vendors, and service providers with automated verification and certification workflows.",
    longDescription: "The Professional Licensing module revolutionizes how IT professionals and technology vendors obtain, maintain, and verify credentials. With blockchain-verified certificates, automated renewal workflows, and integrated verification APIs, this system ensures trust and transparency in Ethiopia's technology sector.",
    features: [
      {
        icon: ShieldCheck,
        title: "Digital License Management",
        description: "Apply for, renew, and manage IT professional licenses entirely online. Blockchain-backed certificates ensure authenticity and prevent fraud."
      },
      {
        icon: FileCheck,
        title: "Automated Certification Workflows",
        description: "Streamlined application review with document verification, skills assessment, background checks, and approval routing—all automated with AI assistance."
      },
      {
        icon: CheckCircle2,
        title: "Vendor Verification System",
        description: "Technology vendors can register, maintain compliance records, and provide verifiable credentials to government agencies for procurement processes."
      },
      {
        icon: Users,
        title: "Professional Directory",
        description: "Searchable database of licensed IT professionals and certified vendors with skills, specializations, and verified project histories."
      }
    ],
    benefits: [
      {
        title: "Faster License Issuance",
        description: "Reduce average license processing time from 45 days to 3 days through automated verification and digital approval workflows."
      },
      {
        title: "Fraud Prevention",
        description: "Blockchain-verified certificates and integrated background checks eliminate fake credentials and protect the integrity of the IT workforce."
      },
      {
        title: "Seamless Renewals",
        description: "Automated renewal reminders, online payment processing, and one-click renewal for professionals in good standing."
      },
      {
        title: "Procurement Integration",
        description: "Government agencies can verify vendor credentials instantly during procurement, reducing contract risks and ensuring quality."
      }
    ],
    stats: [
      { label: "Licensed Professionals", value: "12,450" },
      { label: "Certified Vendors", value: "890" },
      { label: "Avg. Processing Time", value: "3 days" },
      { label: "Verification API Calls", value: "45K/mo" }
    ],
    ctaText: "Get Licensed Today",
    ctaSubtext: "Apply for professional certification or register as a vendor"
  },
  
  lms: {
    slug: "lms",
    title: "Learning Management System",
    shortTitle: "Government LMS",
    icon: GraduationCap,
    tagline: "Empowering Public Sector Excellence Through Continuous Learning",
    description: "Comprehensive e-learning platform for government workforce training, skill development, and professional certification tracking.",
    longDescription: "The Learning Management System (LMS) is designed specifically for Ethiopia's public sector workforce. It provides structured training programs, micro-credentials, skill assessments, and career development pathways aligned with government digital transformation goals.",
    features: [
      {
        icon: BookOpen,
        title: "Government Training Catalog",
        description: "Curated courses covering digital literacy, cybersecurity, data analytics, project management, and technology policy—all tailored for public sector context."
      },
      {
        icon: GraduationCap,
        title: "E-Learning for Public Sector",
        description: "Self-paced and instructor-led courses with video lectures, interactive labs, assessments, and peer collaboration tools accessible from any device."
      },
      {
        icon: CheckCircle2,
        title: "Certification & Skill Tracking",
        description: "Earn micro-credentials and professional certificates. HR systems integrate directly to track employee skills and identify training gaps."
      },
      {
        icon: BarChart3,
        title: "Learning Analytics Dashboard",
        description: "Track training completion rates, skill development trends, and workforce readiness metrics across all government agencies."
      }
    ],
    benefits: [
      {
        title: "Upskill Government Workforce",
        description: "Equip civil servants with modern digital skills needed to deliver 21st-century public services efficiently."
      },
      {
        title: "Cost-Effective Training",
        description: "Reduce training costs by 70% compared to traditional in-person workshops while reaching more employees across the country."
      },
      {
        title: "Career Development Pathways",
        description: "Clear skill progression tracks help employees advance their careers while ensuring agencies have the talent they need."
      },
      {
        title: "Knowledge Retention",
        description: "On-demand course library ensures institutional knowledge is preserved and accessible even as employees transition roles."
      }
    ],
    stats: [
      { label: "Active Learners", value: "18,900" },
      { label: "Courses Available", value: "340" },
      { label: "Certificates Issued", value: "6,780" },
      { label: "Avg. Completion Rate", value: "84%" }
    ],
    ctaText: "Start Learning Today",
    ctaSubtext: "Browse courses or create a custom training program for your agency"
  }
};

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return servicesData[slug as ServiceKey];
}

export function getAllServices(): ServiceDetail[] {
  return Object.values(servicesData);
}
