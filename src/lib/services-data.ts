import { FlaskConical, Cpu, ShieldCheck, GraduationCap, CheckCircle2, Sparkles, Users, BarChart3, FileCheck, Clock, Shield, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceKey = "research" | "transformation" | "licensing" ;

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
  highlights: string[];
  workflow: Array<{
    title: string;
    desc: string;
  }>;
  faqs: Array<{
    q: string;
    a: string;
  }>;
  formKind: ServiceKey;
  formTitle: string;
  formSubtitle: string;
}

export const servicesData: Record<ServiceKey, ServiceDetail> = {
  research: {
    slug: "research",
    title: "Research ",
    shortTitle: "Research ",
    icon: FlaskConical,
    tagline: "Driving Ethiopia's Digital Future Through Evidence-Based Innovation",
    description: "research submission, evaluation, and tracking system for national technology policy and innovation research.",
    longDescription: "The Research  is a comprehensive platform designed to streamline research submission, peer review, and policy implementation tracking. It connects researchers, policymakers, and innovators across Ethiopia to build an evidence-based foundation for digital transformation.",
    features: [
      {
        icon: Sparkles,
        title: "Research Submission",
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
    ctaSubtext: "Submit your research proposal or join as a peer reviewer",
    highlights: [
      "proposal screening and scoring",
      "Policy & technology research evaluation",
      "National innovation tracking dashboard",
      "Inter-institution collaboration spaces"
    ],
    workflow: [
      {
        title: "Submit proposal",
        desc: "Complete the structured submission form with objectives, methodology and expected impact."
      },
      {
        title: "Screening",
        desc: "Automated checks for completeness, scope alignment, and duplication detection."
      },
      {
        title: "Expert review",
        desc: "Routed to a diverse panel for policy and technical evaluation."
      },
      {
        title: "Decision & funding",
        desc: "Track decision status and approved funding within the dashboard."
      }
    ],
    faqs: [
      {
        q: "Who can submit a research proposal?",
        a: "Any researcher or research institution registered with STRP. This includes university faculty, government research centers, think tanks, and private sector R&D teams."
      },
      {
        q: "How long is the review cycle?",
        a: "Typically 8-12 weeks from submission to decision. AI screening takes 2-3 days, expert review takes 4-6 weeks, and decision notification takes 1-2 weeks."
      },
      {
        q: "Can proposals be co-authored across institutions?",
        a: "Yes, co-authorship across government agencies, universities, and private sector organizations is encouraged. All co-authors must have STRP accounts."
      }
    ],
    formKind: "research",
    formTitle: "Research Proposal Registration",
    formSubtitle: "Provide the details below to register your research proposal with STRP."
  },
  
  transformation: {
    slug: "transformation",
    title: "Technology Transfer",
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
    ],
    ctaText: "Begin Digital Transformation",
    ctaSubtext: "Request a system assessment or start a modernization project",
    highlights: [
      "Government system modernization roadmaps",
      "Digital infrastructure transformation platform",
      "Smart city integration pipeline",
      "Digital maturity assessment tools"
    ],
    workflow: [
      {
        title: "Assess current state",
        desc: "Complete digital maturity assessment covering systems, infrastructure, and organizational readiness."
      },
      {
        title: "Plan transformation",
        desc: "Roadmap with phased timelines, resource allocation, and risk mitigation strategies."
      },
      {
        title: "Implement changes",
        desc: "Execute modernization with dedicated project management, vendor coordination, and change management support."
      },
      {
        title: "Monitor & optimize",
        desc: "Track metrics, measure ROI, and optimize systems based on real-time performance data."
      }
    ],
    faqs: [
      {
        q: "What systems can be modernized?",
        a: "Any legacy government system: HR management, financial systems, citizen services, internal operations, and data management systems are all candidates for modernization."
      },
      {
        q: "How long does a transformation project take?",
        a: "Typically 6-24 months depending on scope and complexity. Small infrastructure upgrades may take 3-6 months, while enterprise-wide transformations can take 18-24 months."
      },
      {
        q: "Are there standards we must follow?",
        a: "Yes, all transformations must follow Ethiopian government IT standards, security protocols, and open data guidelines to ensure interoperability and data protection."
      }
    ],
    formKind: "transformation",
    formTitle: "Digital Transformation Request",
    formSubtitle: "Submit your organization's transformation needs and we'll provide a customized digital roadmap."
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
    ],
    ctaText: "Get Licensed Today",
    ctaSubtext: "Apply for professional certification or register as a vendor",
    highlights: [
      "Digital license issuance and management",
      "Automated skills assessment and verification",
      "Vendor registration and compliance tracking",
      "Professional directory and credential lookup"
    ],
    workflow: [
      {
        title: "Apply online",
        desc: "Submit application with professional credentials, education, and work experience documentation."
      },
      {
        title: "Document verification",
        desc: "Automated background checks and credential verification through integrated government databases."
      },
      {
        title: "Skills assessment",
        desc: "AI-powered technical assessment and peer review to ensure professional competency."
      },
      {
        title: "License issuance",
        desc: "Receive blockchain-verified digital license and access professional directory immediately upon approval."
      }
    ],
    faqs: [
      {
        q: "Who can apply for IT professional licensing?",
        a: "Software developers, systems administrators, network engineers, IT security professionals, and other technology specialists with relevant education or work experience."
      },
      {
        q: "How long is a license valid?",
        a: "Professional licenses are valid for 3 years. Renewal requires proof of continued professional development and payment of renewal fees."
      },
      {
        q: "Can proposals be co-authored across institutions?",
        a: "Yes, the verification API provides instant credential checks for government procurement teams, vendor management systems, and third-party integrations."
      }
    ],
    formKind: "licensing",
    formTitle: "Professional License Application",
    formSubtitle: "Apply for IT professional certification or vendor registration with STRP."
  },
};

export const SERVICES = servicesData;

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return servicesData[slug as ServiceKey];
}

export function getAllServices(): ServiceDetail[] {
  return Object.values(servicesData);
}
