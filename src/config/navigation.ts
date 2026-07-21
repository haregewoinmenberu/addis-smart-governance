/**
 * Navigation Configuration
 * 
 * This file defines the mapping between permissions and navigation routes.
 * It's used by the Sidebar component to dynamically render navigation items
 * based on the user's permissions.
 */

import type { PermissionName } from "@/types/rbac";

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export interface NavigationItem {
  to: string;
  label: string;
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAll?: boolean;
  description?: string;
}

/**
 * Complete navigation structure organized by sections
 * This configuration is used to generate the sidebar navigation
 */
export const navigationSections: NavigationSection[] = [
  {
    label: "Dashboards",
    items: [
      {
        to: "/dashboard",
        label: "Main Dashboard",
        permission: "view_dashboard",
        description: "Overview of all system activities",
      },
      {
        to: "/dashboard/executive",
        label: "Executive Dashboard",
        permission: "view_executive_dashboard",
        description: "High-level executive insights and metrics",
      },
      {
        to: "/dashboard/research",
        label: "Research Dashboard",
        permission: "view_research_dashboard",
        description: "Research and innovation metrics",
      },
      {
        to: "/reports",
        label: "Reports Dashboard",
        permission: "view_reports_dashboard",
        description: "Comprehensive reports and analytics",
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        to: "/users",
        label: "Users",
        permission: "view_users",
        description: "View and manage system users",
      },
      {
        to: "/users/create",
        label: "Create User",
        permission: "create_users",
        description: "Add new users to the system",
      },
      {
        to: "/users",
        label: "Edit Users",
        permission: "edit_users",
        description: "Modify user information",
      },
      {
        to: "/users",
        label: "Delete Users",
        permission: "delete_users",
        description: "Remove users from the system",
      },
      {
        to: "/users/roles",
        label: "Manage Roles",
        permission: "manage_roles",
        description: "Assign and manage user roles",
      },
    ],
  },
  {
    label: "Requests Management",
    items: [
      {
        to: "/requests",
        label: "All Requests",
        permission: "view_requests",
        description: "View all technology requests",
      },
      {
        to: "/service-requests",
        label: "Service Requests",
        permission: "receive_requests",
        description: "Incoming service requests",
      },
      {
        to: "/requests/assign",
        label: "Assign Requests",
        permission: "assign_requests",
        description: "Assign requests to team members",
      },
      {
        to: "/requests/reassign",
        label: "Reassign Requests",
        permission: "reassign_requests",
        description: "Reassign existing requests",
      },
      {
        to: "/requests/approve",
        label: "Approve Requests",
        permission: "approve_requests",
        description: "Approve pending requests",
      },
      {
        to: "/requests/reject",
        label: "Reject Requests",
        permission: "reject_requests",
        description: "Reject requests with reasons",
      },
      {
        to: "/requests/priority",
        label: "Request Priority",
        permission: "change_request_priority",
        description: "Manage request priorities",
      },
      {
        to: "/requests/close",
        label: "Close Requests",
        permission: "close_requests",
        description: "Close completed requests",
      },
    ],
  },
  {
    label: "Training Management",
    items: [
      {
        to: "/training",
        label: "Training Programs",
        permission: "view_training",
        description: "View all training programs",
      },
      {
        to: "/training/create",
        label: "Create Training",
        permission: "create_training",
        description: "Create new training programs",
      },
      {
        to: "/training/edit",
        label: "Edit Training",
        permission: "edit_training",
        description: "Modify existing training programs",
      },
      {
        to: "/training/officers",
        label: "Training Officers",
        permission: "assign_training_officer",
        description: "Assign training officers",
      },
      {
        to: "/training/schedule",
        label: "Schedule Training",
        permission: "schedule_training",
        description: "Schedule training sessions",
      },
      {
        to: "/training/approve",
        label: "Approve Training",
        permission: "approve_training",
        description: "Approve training proposals",
      },
      {
        to: "/training/materials",
        label: "Training Materials",
        permission: "upload_training_material",
        description: "Upload training resources",
      },
      {
        to: "/training/attendance",
        label: "Attendance",
        permission: "upload_attendance",
        description: "Track training attendance",
      },
      {
        to: "/training/certificates",
        label: "Certificates",
        permission: "generate_certificate",
        description: "Generate training certificates",
      },
    ],
  },
  {
    label: "Research Management",
    items: [
      {
        to: "/research/ideas",
        label: "Research Ideas",
        permission: "view_research",
        description: "View research proposals",
      },
      {
        to: "/research/assign",
        label: "Assign Research",
        permission: "assign_research",
        description: "Assign research projects",
      },
      {
        to: "/research/conduct",
        label: "Conduct Research",
        permission: "conduct_research",
        description: "Execute research activities",
      },
      {
        to: "/research/technology-assessment",
        label: "Technology Assessment",
        permission: "technology_assessment",
        description: "Assess technology viability",
      },
      {
        to: "/research/cost-benefit",
        label: "Cost-Benefit Analysis",
        permission: "cost_benefit_analysis",
        description: "Analyze project economics",
      },
      {
        to: "/research/risk-analysis",
        label: "Risk Analysis",
        permission: "risk_analysis",
        description: "Evaluate project risks",
      },
      {
        to: "/research/feasibility",
        label: "Feasibility Studies",
        permission: "submit_feasibility",
        description: "Submit feasibility reports",
      },
      {
        to: "/research/approve",
        label: "Approve Research",
        permission: "approve_research",
        description: "Approve research projects",
      },
      {
        to: "/research/approve-feasibility",
        label: "Approve Feasibility",
        permission: "approve_feasibility",
        description: "Approve feasibility studies",
      },
      {
        to: "/research/forward",
        label: "Forward Projects",
        permission: "forward_project",
        description: "Forward projects to next phase",
      },
    ],
  },
  {
    label: "Security Reviews",
    items: [
      {
        to: "/security-review",
        label: "Security Reviews",
        permission: "view_security_review",
        description: "View security assessments",
      },
      {
        to: "/security-review/assign",
        label: "Assign Reviews",
        permission: "assign_security_review",
        description: "Assign security reviews",
      },
      {
        to: "/security-review/assessment",
        label: "Security Assessment",
        permission: "security_assessment",
        description: "Conduct security assessments",
      },
      {
        to: "/security-review/vulnerability",
        label: "Vulnerability Assessment",
        permission: "vulnerability_assessment",
        description: "Identify vulnerabilities",
      },
      {
        to: "/security-review/penetration",
        label: "Penetration Testing",
        permission: "penetration_testing",
        description: "Conduct penetration tests",
      },
      {
        to: "/security-review/approve",
        label: "Approve Security",
        permission: "approve_security",
        description: "Approve security measures",
      },
      {
        to: "/security-review/clearance",
        label: "Security Clearance",
        permission: "issue_security_clearance",
        description: "Issue security clearances",
      },
    ],
  },
  {
    label: "Project Management",
    items: [
      {
        to: "/projects",
        label: "Projects",
        permission: "view_projects",
        description: "View all projects",
      },
      {
        to: "/projects/create",
        label: "Create Project",
        permission: "create_project",
        description: "Create new projects",
      },
      {
        to: "/projects/edit",
        label: "Edit Project",
        permission: "edit_project",
        description: "Modify project details",
      },
      {
        to: "/projects/assign",
        label: "Assign Project",
        permission: "assign_project",
        description: "Assign projects to teams",
      },
      {
        to: "/projects/manager",
        label: "Project Manager",
        permission: "assign_project_manager",
        description: "Assign project managers",
      },
      {
        to: "/projects/timeline",
        label: "Project Timeline",
        permission: "update_project_timeline",
        description: "Update project schedules",
      },
      {
        to: "/projects/milestones",
        label: "Milestones",
        permission: "approve_milestone",
        description: "Approve project milestones",
      },
      {
        to: "/projects/deliverables",
        label: "Deliverables",
        permission: "approve_deliverable",
        description: "Approve project deliverables",
      },
      {
        to: "/projects/close",
        label: "Close Project",
        permission: "close_project",
        description: "Close completed projects",
      },
      {
        to: "/projects/archive",
        label: "Archive Project",
        permission: "archive_project",
        description: "Archive old projects",
      },
    ],
  },
  {
    label: "Tasks & Development",
    items: [
      {
        to: "/tasks",
        label: "Tasks",
        permission: "create_tasks",
        description: "Create and manage tasks",
      },
      {
        to: "/tasks/assign",
        label: "Assign Tasks",
        permission: "assign_tasks",
        description: "Assign tasks to developers",
      },
      {
        to: "/tasks/status",
        label: "Task Status",
        permission: "update_task_status",
        description: "Update task progress",
      },
      {
        to: "/tasks/review",
        label: "Review Tasks",
        permission: "review_task",
        description: "Review completed tasks",
      },
      {
        to: "/development/developers",
        label: "Assign Developers",
        permission: "assign_developer",
        description: "Assign developers to tasks",
      },
      {
        to: "/development/architecture",
        label: "Architecture Review",
        permission: "review_architecture",
        description: "Review system architecture",
      },
      {
        to: "/development/code-review",
        label: "Code Review",
        permission: "review_code",
        description: "Review code submissions",
      },
      {
        to: "/development/pull-requests",
        label: "Pull Requests",
        permission: "review_pull_request",
        description: "Review pull requests",
      },
      {
        to: "/development/merge",
        label: "Approve Merge",
        permission: "approve_merge",
        description: "Approve code merges",
      },
      {
        to: "/development/releases",
        label: "Releases",
        permission: "approve_release",
        description: "Approve software releases",
      },
      {
        to: "/development/documentation",
        label: "Documentation",
        permission: "upload_documentation",
        description: "Upload project documentation",
      },
    ],
  },
  {
    label: "Infrastructure Management",
    items: [
      {
        to: "/infrastructure",
        label: "Infrastructure",
        permission: "view_infrastructure",
        description: "View infrastructure status",
      },
      {
        to: "/infrastructure/design",
        label: "Design Approval",
        permission: "approve_design",
        description: "Approve infrastructure design",
      },
      {
        to: "/infrastructure/network",
        label: "Network Config",
        permission: "network_configuration",
        description: "Configure network settings",
      },
      {
        to: "/infrastructure/servers",
        label: "Server Installation",
        permission: "server_installation",
        description: "Install and configure servers",
      },
      {
        to: "/infrastructure/firewall",
        label: "Firewall Config",
        permission: "firewall_configuration",
        description: "Configure firewall rules",
      },
      {
        to: "/infrastructure/upload",
        label: "Upload Configuration",
        permission: "upload_configuration",
        description: "Upload configuration files",
      },
    ],
  },
  {
    label: "IT Operations",
    items: [
      {
        to: "/tickets",
        label: "Support Tickets",
        permission: "view_tickets",
        description: "View support tickets",
      },
      {
        to: "/tickets/assign",
        label: "Assign Tickets",
        permission: "assign_ticket",
        description: "Assign tickets to staff",
      },
      {
        to: "/tickets/accept",
        label: "Accept Tickets",
        permission: "accept_ticket",
        description: "Accept ticket assignments",
      },
      {
        to: "/tickets/update",
        label: "Update Tickets",
        permission: "update_ticket",
        description: "Update ticket status",
      },
      {
        to: "/tickets/resolve",
        label: "Resolve Tickets",
        permission: "resolve_ticket",
        description: "Resolve tickets",
      },
      {
        to: "/tickets/close",
        label: "Close Tickets",
        permission: "close_ticket",
        description: "Close completed tickets",
      },
      {
        to: "/maintenance",
        label: "Maintenance",
        permission: "approve_maintenance",
        description: "Approve maintenance activities",
      },
    ],
  },
  {
    label: "Cloud Management",
    items: [
      {
        to: "/cloud/resources",
        label: "Cloud Resources",
        permission: "approve_cloud_resource",
        description: "Approve cloud resources",
      },
      {
        to: "/cloud/provision",
        label: "Provision Server",
        permission: "provision_server",
        description: "Provision cloud servers",
      },
      {
        to: "/cloud/deploy",
        label: "Deploy Application",
        permission: "deploy_application",
        description: "Deploy applications",
      },
      {
        to: "/cloud/backup",
        label: "Backup System",
        permission: "backup_system",
        description: "Backup systems",
      },
      {
        to: "/cloud/restore",
        label: "Restore System",
        permission: "restore_system",
        description: "Restore from backups",
      },
      {
        to: "/cloud/scale",
        label: "Scale Resources",
        permission: "scale_resource",
        description: "Scale cloud resources",
      },
    ],
  },
  {
    label: "Quality Management",
    items: [
      {
        to: "/quality",
        label: "Quality Reviews",
        permission: "view_quality_review",
        description: "View quality reviews",
      },
      {
        to: "/quality/test",
        label: "Quality Testing",
        permission: "conduct_quality_test",
        description: "Conduct quality tests",
      },
      {
        to: "/quality/audit",
        label: "Document Audit",
        permission: "audit_documents",
        description: "Audit documents",
      },
      {
        to: "/quality/compliance",
        label: "Verify Compliance",
        permission: "verify_compliance",
        description: "Verify regulatory compliance",
      },
      {
        to: "/quality/approve",
        label: "Approve Quality",
        permission: "approve_quality",
        description: "Approve quality standards",
      },
      {
        to: "/quality/report",
        label: "Audit Report",
        permission: "generate_audit_report",
        description: "Generate audit reports",
      },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      {
        to: "/reports",
        label: "Reports",
        permission: "view_reports",
        description: "View system reports",
      },
      {
        to: "/reports/generate",
        label: "Generate Reports",
        permission: "generate_reports",
        description: "Generate custom reports",
      },
      {
        to: "/reports/export",
        label: "Export Reports",
        permission: "export_reports",
        description: "Export reports to file",
      },
    ],
  },
  {
    label: "System Administration",
    items: [
      {
        to: "/settings",
        label: "System Settings",
        permission: "manage_settings",
        description: "Manage system settings",
      },
      {
        to: "/settings/archive",
        label: "Archive Records",
        permission: "archive_records",
        description: "Archive old records",
      },
      {
        to: "/notifications",
        label: "Notifications",
        permission: "view_notifications",
        description: "View notifications",
      },
      {
        to: "/notifications/send",
        label: "Send Notifications",
        permission: "send_notifications",
        description: "Send system notifications",
      },
    ],
  },
];

/**
 * Get all unique routes accessible by a user's permissions
 */
export function getAccessibleRoutes(permissions: PermissionName[]): string[] {
  const routes = new Set<string>();

  navigationSections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.permission && permissions.includes(item.permission)) {
        routes.add(item.to);
      }
      if (item.permissions) {
        const hasAccess = item.requireAll
          ? item.permissions.every((p) => permissions.includes(p))
          : item.permissions.some((p) => permissions.includes(p));
        if (hasAccess) {
          routes.add(item.to);
        }
      }
    });
  });

  return Array.from(routes);
}

/**
 * Get navigation sections filtered by user permissions
 */
export function getFilteredNavigationSections(
  permissions: PermissionName[]
): NavigationSection[] {
  return navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.permission) {
          return permissions.includes(item.permission);
        }
        if (item.permissions) {
          return item.requireAll
            ? item.permissions.every((p) => permissions.includes(p))
            : item.permissions.some((p) => permissions.includes(p));
        }
        return false;
      }),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Permission to feature description mapping for display purposes
 */
export const permissionDescriptions: Record<PermissionName, string> = {
  // Dashboard permissions
  view_dashboard: "Access to main dashboard",
  view_executive_dashboard: "Access to executive dashboard with high-level metrics",
  view_reports_dashboard: "Access to reports and analytics dashboard",
  
  // User management permissions
  view_users: "View system users",
  create_users: "Create new users",
  edit_users: "Edit user information",
  delete_users: "Delete users from the system",
  manage_roles: "Assign and manage user roles and permissions",
  
  // Request management permissions
  view_requests: "View all technology requests",
  receive_requests: "Receive new service requests",
  assign_requests: "Assign requests to team members",
  reassign_requests: "Reassign requests to different team members",
  approve_requests: "Approve pending requests",
  reject_requests: "Reject requests with reasons",
  return_requests: "Return requests for revision",
  change_request_priority: "Modify request priority levels",
  close_requests: "Close completed requests",
  
  // Training permissions
  view_training: "View training programs",
  create_training: "Create new training programs",
  edit_training: "Edit training program details",
  assign_training_officer: "Assign training officers",
  schedule_training: "Schedule training sessions",
  approve_training: "Approve training proposals",
  cancel_training: "Cancel scheduled training",
  upload_training_material: "Upload training materials",
  upload_attendance: "Upload training attendance records",
  generate_certificate: "Generate training certificates",
  complete_training: "Mark training as completed",
  
  // Research permissions
  view_research: "View research projects",
  assign_research: "Assign research projects",
  conduct_research: "Conduct research activities",
  technology_assessment: "Assess technology viability",
  cost_benefit_analysis: "Perform cost-benefit analysis",
  risk_analysis: "Conduct risk analysis",
  submit_feasibility: "Submit feasibility studies",
  approve_research: "Approve research projects",
  approve_feasibility: "Approve feasibility studies",
  forward_project: "Forward projects to next phase",
  
  // Security permissions
  view_security_review: "View security reviews",
  assign_security_review: "Assign security reviews",
  security_assessment: "Conduct security assessments",
  vulnerability_assessment: "Perform vulnerability assessments",
  penetration_testing: "Conduct penetration testing",
  approve_security: "Approve security measures",
  reject_security: "Reject security proposals",
  issue_security_clearance: "Issue security clearances",
  
  // Project permissions
  view_projects: "View all projects",
  create_project: "Create new projects",
  edit_project: "Edit project details",
  assign_project: "Assign projects to teams",
  assign_project_manager: "Assign project managers",
  update_project_timeline: "Update project timelines",
  approve_milestone: "Approve project milestones",
  approve_deliverable: "Approve project deliverables",
  close_project: "Close completed projects",
  archive_project: "Archive old projects",
  
  // Task and development permissions
  create_tasks: "Create new tasks",
  assign_tasks: "Assign tasks to developers",
  update_task_status: "Update task status",
  submit_task: "Submit completed tasks",
  review_task: "Review task submissions",
  assign_developer: "Assign developers to tasks",
  review_architecture: "Review system architecture",
  review_code: "Review code submissions",
  commit_code: "Commit code to repository",
  review_pull_request: "Review pull requests",
  approve_merge: "Approve code merges",
  approve_release: "Approve software releases",
  upload_documentation: "Upload project documentation",
  
  // Infrastructure permissions
  view_infrastructure: "View infrastructure status",
  approve_design: "Approve infrastructure design",
  network_configuration: "Configure network settings",
  server_installation: "Install and configure servers",
  firewall_configuration: "Configure firewall rules",
  upload_configuration: "Upload configuration files",
  
  // IT Operations permissions
  view_tickets: "View support tickets",
  assign_ticket: "Assign tickets to staff",
  accept_ticket: "Accept ticket assignments",
  update_ticket: "Update ticket status",
  resolve_ticket: "Resolve tickets",
  close_ticket: "Close completed tickets",
  approve_maintenance: "Approve maintenance activities",
  
  // Cloud management permissions
  approve_cloud_resource: "Approve cloud resource allocation",
  provision_server: "Provision cloud servers",
  deploy_application: "Deploy applications to cloud",
  backup_system: "Backup systems",
  restore_system: "Restore systems from backup",
  scale_resource: "Scale cloud resources",
  
  // Quality management permissions
  view_quality_review: "View quality reviews",
  conduct_quality_test: "Conduct quality tests",
  audit_documents: "Audit documents for compliance",
  verify_compliance: "Verify regulatory compliance",
  approve_quality: "Approve quality standards",
  reject_quality: "Reject quality submissions",
  generate_audit_report: "Generate audit reports",
  
  // Reporting permissions
  view_reports: "View system reports",
  generate_reports: "Generate custom reports",
  export_reports: "Export reports to file",
  
  // System administration permissions
  manage_settings: "Manage system settings",
  archive_records: "Archive old records",
  view_notifications: "View system notifications",
  send_notifications: "Send system notifications",
};
