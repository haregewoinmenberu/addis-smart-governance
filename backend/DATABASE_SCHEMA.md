# Addis Smart Governance - Database Schema

**Generated:** 2026-07-09 06:14:46

This document describes the complete database schema for the Addis Smart Governance system.

---

## Table of Contents

- [Core System](#core-system)
  - [users](#users)
  - [password_reset_tokens](#password_reset_tokens)
  - [sessions](#sessions)
  - [cache](#cache)
  - [cache_locks](#cache_locks)
  - [jobs](#jobs)
  - [job_batches](#job_batches)
  - [failed_jobs](#failed_jobs)
  - [activity_logs](#activity_logs)
  - [user_sessions](#user_sessions)
- [Authentication & Authorization](#authentication-authorization)
  - [roles](#roles)
  - [permissions](#permissions)
  - [permission_role](#permission_role)
  - [role_user](#role_user)
- [Workflow Management](#workflow-management)
  - [workflow_definitions](#workflow_definitions)
  - [workflow_instances](#workflow_instances)
  - [workflow_approvals](#workflow_approvals)
  - [technology_workflow_history](#technology_workflow_history)
  - [licensing_workflow_history](#licensing_workflow_history)
  - [workflows](#workflows)
  - [research_workflow_history](#research_workflow_history)
- [Technology Management](#technology-management)
  - [request_items](#request_items)
  - [duplication_cases](#duplication_cases)
  - [feasibility_studies](#feasibility_studies)
  - [technology_requests](#technology_requests)
  - [technology_evaluations](#technology_evaluations)
  - [evaluation_checklists](#evaluation_checklists)
  - [committee_reviews](#committee_reviews)
  - [committee_votes](#committee_votes)
  - [technology_registry](#technology_registry)
  - [technology_licenses](#technology_licenses)
  - [deployment_projects](#deployment_projects)
  - [deployment_sites](#deployment_sites)
  - [deployment_reports](#deployment_reports)
  - [technology_monitoring](#technology_monitoring)
  - [technology_incidents](#technology_incidents)
  - [technology_revocations](#technology_revocations)
  - [technology_documents](#technology_documents)
  - [technology_versions](#technology_versions)
  - [technology_comments](#technology_comments)
  - [technology_audit_logs](#technology_audit_logs)
  - [vendors](#vendors)
  - [cybersecurity_issues](#cybersecurity_issues)
  - [research_evaluations](#research_evaluations)
  - [technology_transfers](#technology_transfers)
- [Professional Licensing](#professional-licensing)
  - [professions](#professions)
  - [license_applications](#license_applications)
  - [professional_documents](#professional_documents)
  - [educational_records](#educational_records)
  - [experience_records](#experience_records)
  - [verification_requests](#verification_requests)
  - [examinations](#examinations)
  - [exam_questions](#exam_questions)
  - [exam_attempts](#exam_attempts)
  - [licenses](#licenses)
  - [professional_profiles](#professional_profiles)
  - [license_renewals](#license_renewals)
  - [continuing_education](#continuing_education)
  - [complaints](#complaints)
  - [disciplinary_cases](#disciplinary_cases)
  - [disciplinary_actions](#disciplinary_actions)
  - [hearings](#hearings)
  - [sanctions](#sanctions)
  - [license_suspensions](#license_suspensions)
  - [license_revocations](#license_revocations)
  - [appeals](#appeals)
- [Research & Innovation](#research-innovation)
  - [research_ideas](#research_ideas)
  - [research_idea_attachments](#research_idea_attachments)
  - [research_screenings](#research_screenings)
  - [research_projects](#research_projects)
  - [proposal_versions](#proposal_versions)
  - [proposal_reviews](#proposal_reviews)
  - [research_milestones](#research_milestones)
  - [research_tasks](#research_tasks)
  - [experiments](#experiments)
  - [prototype_versions](#prototype_versions)
  - [research_risks](#research_risks)
  - [research_issues](#research_issues)
  - [trl_assessments](#trl_assessments)
  - [research_team_members](#research_team_members)
  - [research_documents](#research_documents)
  - [research_expenses](#research_expenses)
  - [research_time_logs](#research_time_logs)
  - [research_comments](#research_comments)
  - [research_activity_logs](#research_activity_logs)
- [Institutions](#institutions)
  - [institutions](#institutions)
  - [institution_documents](#institution_documents)
  - [institution_team_members](#institution_team_members)
- [OAuth & API](#oauth-api)
  - [oauth_auth_codes](#oauth_auth_codes)
  - [oauth_access_tokens](#oauth_access_tokens)
  - [oauth_refresh_tokens](#oauth_refresh_tokens)
  - [oauth_clients](#oauth_clients)
  - [oauth_device_codes](#oauth_device_codes)
- [Other](#other)
  - [monitoring_metrics](#monitoring_metrics)
  - [monitoring_alerts](#monitoring_alerts)
  - [incident_actions](#incident_actions)
  - [specializations](#specializations)
  - [licensing_audit_logs](#licensing_audit_logs)
  - [service_form_submissions](#service_form_submissions)
  - [technologies](#technologies)
  - [surveys](#surveys)
  - [reports](#reports)
  - [notifications](#notifications)
  - [audits](#audits)
  - [sub_cities](#sub_cities)
  - [system_settings](#system_settings)
  - [progress_reports](#progress_reports)

---

## Core System

### `users`

**Migration File:** `0001_01_01_000000_create_users_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `email` | string | unique |
| `email_verified_at` | timestamp | nullable |
| `password` | string | - |
| `` | rememberToken | - |

---

### `password_reset_tokens`

**Migration File:** `0001_01_01_000000_create_users_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `email` | string | - |
| `token` | string | - |
| `created_at` | timestamp | nullable |

---

### `sessions`

**Migration File:** `0001_01_01_000000_create_users_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | string | - |
| `ip_address` | string | nullable |
| `user_agent` | text | nullable |
| `payload` | longText | - |
| `last_activity` | integer | indexed |

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `cache`

**Migration File:** `0001_01_01_000001_create_cache_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `key` | string | - |
| `value` | mediumText | - |
| `expiration` | integer | - |

---

### `cache_locks`

**Migration File:** `0001_01_01_000001_create_cache_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `key` | string | - |
| `owner` | string | - |
| `expiration` | integer | - |

---

### `jobs`

**Migration File:** `0001_01_01_000002_create_jobs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `queue` | string | indexed |
| `payload` | longText | - |
| `attempts` | unsignedTinyInteger | - |
| `reserved_at` | unsignedInteger | nullable |
| `available_at` | unsignedInteger | - |
| `created_at` | unsignedInteger | - |

---

### `job_batches`

**Migration File:** `0001_01_01_000002_create_jobs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | string | - |
| `name` | string | - |
| `total_jobs` | integer | - |
| `pending_jobs` | integer | - |
| `failed_jobs` | integer | - |
| `failed_job_ids` | longText | - |
| `options` | mediumText | nullable |
| `cancelled_at` | integer | nullable |
| `created_at` | integer | - |
| `finished_at` | integer | nullable |

---

### `failed_jobs`

**Migration File:** `0001_01_01_000002_create_jobs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `uuid` | string | unique |
| `connection` | text | - |
| `queue` | text | - |
| `payload` | longText | - |
| `exception` | longText | - |
| `failed_at` | timestamp | - |

---

### `activity_logs`

**Migration File:** `2024_01_01_000003_create_activity_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `action` | string | - |
| `module` | string | - |
| `old_values` | json | nullable |
| `new_values` | json | nullable |
| `ip_address` | string | nullable |
| `user_agent` | text | nullable |

**Indexes:**
- ['user_id', 'created_at']
- ['module', 'action']

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `user_sessions`

**Migration File:** `2024_01_01_000003_create_activity_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `token_id` | string | unique |
| `ip_address` | string | nullable |
| `user_agent` | text | nullable |
| `last_activity_at` | timestamp | nullable |
| `expires_at` | timestamp | nullable |

**Indexes:**
- ['user_id', 'last_activity_at']

**Foreign Keys:**
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`

---

## Authentication & Authorization

### `roles`

**Migration File:** `2024_01_01_000001_create_roles_and_permissions_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | unique |
| `display_name` | string | - |
| `description` | text | nullable |

---

### `permissions`

**Migration File:** `2024_01_01_000001_create_roles_and_permissions_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | unique |
| `display_name` | string | - |
| `module` | string | nullable |
| `description` | text | nullable |

---

### `permission_role`

**Migration File:** `2024_01_01_000001_create_roles_and_permissions_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |

**Unique Constraints:**
- ['role_id', 'permission_id']

**Foreign Keys:**
- `$table->foreignId('role_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('permission_id')->constrained()->onDelete('cascade')`

---

### `role_user`

**Migration File:** `2024_01_01_000001_create_roles_and_permissions_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |

**Unique Constraints:**
- ['user_id', 'role_id']

**Foreign Keys:**
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('role_id')->constrained()->onDelete('cascade')`

---

## Workflow Management

### `workflow_definitions`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `code` | string | unique |
| `description` | text | nullable |
| `entity_type` | string | - |
| `stages` | json | - |
| `is_active` | boolean | default: true |

**Foreign Keys:**
- `$table->foreignId('created_by')`

---

### `workflow_instances`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `current_stage` | string | - |
| `current_stage_index` | integer | default: 0 |
| `status` | string | - |
| `started_at` | timestamp | nullable |
| `completed_at` | timestamp | nullable |

**Foreign Keys:**
- `$table->foreignId('workflow_definition_id')->constrained()->onDelete('cascade')`

---

### `workflow_approvals`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `stage_name` | string | - |
| `stage_index` | integer | - |
| `action` | string | - |
| `comments` | text | nullable |
| `metadata` | json | nullable |
| `actioned_at` | timestamp | nullable |

**Foreign Keys:**
- `$table->foreignId('workflow_instance_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('approver_id')`

---

### `technology_workflow_history`

**Migration File:** `2024_01_20_000008_create_technology_workflow_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `from_stage` | string | nullable |
| `to_stage` | string | - |
| `reason` | text | nullable |
| `comments` | text | nullable |
| `transitioned_at` | timestamp | - |

**Indexes:**
- ['technology_request_id', 'transitioned_at'], 'tech_workflow_req_time_idx'

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('transitioned_by')->constrained('users')`

---

### `licensing_workflow_history`

**Migration File:** `2024_01_25_102200_create_licensing_workflow_history_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `from_stage` | string | nullable |
| `to_stage` | string | - |
| `action` | string | - |
| `comments` | text | nullable |
| `metadata` | json | nullable |
| `ip_address` | string | nullable |
| `user_agent` | string | nullable |

**Indexes:**
- 'user_id'
- 'created_at'

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `workflows`

**Migration File:** `2026_05_13_080914_create_workflows_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `stages` | unsignedSmallInteger | - |
| `active` | boolean | default: true |
| `owner_office` | string | - |
| `last_run_at` | date | nullable |

---

### `research_workflow_history`

**Migration File:** `2026_07_06_122259_create_research_workflow_history_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `from_stage` | string | - |
| `to_stage` | string | - |
| `transition_reason` | text | nullable |
| `transitioned_at` | timestamp | - |

**Indexes:**
- ['research_project_id', 'transitioned_at'], 'rwh_project_transitioned_idx'
- 'to_stage', 'rwh_to_stage_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('transitioned_by')->constrained('users')->onDelete('cascade')`

---

## Technology Management

### `request_items`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

---

### `duplication_cases`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

---

### `feasibility_studies`

**Migration File:** `2024_01_01_000002_create_workflow_system_tables.php`

---

### `technology_requests`

**Migration File:** `2024_01_20_000001_create_technology_requests_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `request_number` | string | unique |
| `name` | string | - |
| `category` | string | - |
| `type` | string | - |
| `description` | text | - |
| `purpose` | text | - |
| `business_problem` | text | - |
| `expected_benefits` | text | - |
| `innovation_level` | string | - |
| `trl_level` | integer | nullable |
| `owner_organization_id` | unsignedBigInteger | nullable |
| `vendor_name` | string | nullable |
| `vendor_contact` | string | nullable |
| `contact_person` | string | - |
| `contact_email` | string | - |
| `contact_phone` | string | - |
| `source_type` | string | - |
| `research_project_id` | unsignedBigInteger | nullable |
| `technical_documentation` | text | nullable |
| `architecture_diagram` | text | nullable |
| `api_documentation` | text | nullable |
| `licenses` | text | nullable |
| `source_code_repository` | text | nullable |
| `required_infrastructure` | text | nullable |
| `deployment_requirements` | text | nullable |
| `dependencies` | text | nullable |
| `estimated_cost` | decimal | nullable |
| `expected_users` | integer | nullable |
| `current_stage` | string | default: 'submission' |
| `status` | string | default: 'draft' |
| `sub_city_id` | unsignedBigInteger | nullable |
| `submitted_at` | timestamp | nullable |
| `approved_at` | timestamp | nullable |

**Indexes:**
- ['current_stage', 'status']
- 'request_number'
- 'submitted_at'

**Foreign Keys:**
- `$table->foreignId('submitted_by')->constrained('users')`

---

### `technology_evaluations`

**Migration File:** `2024_01_20_000002_create_technology_evaluations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `evaluation_type` | string | - |
| `status` | string | default: 'pending' |
| `score` | integer | nullable |
| `risk_level` | string | nullable |
| `findings` | text | nullable |
| `recommendations` | text | nullable |
| `comments` | text | nullable |
| `assigned_at` | timestamp | nullable |
| `started_at` | timestamp | nullable |
| `completed_at` | timestamp | nullable |

**Indexes:**
- ['technology_request_id', 'evaluation_type'], 'tech_eval_req_type_idx'
- ['evaluator_id', 'status'], 'tech_eval_user_status_idx'

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('evaluator_id')->constrained('users')`

---

### `evaluation_checklists`

**Migration File:** `2024_01_20_000002_create_technology_evaluations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `item` | string | - |
| `checked` | boolean | default: false |
| `notes` | text | nullable |

**Foreign Keys:**
- `$table->foreignId('technology_evaluation_id')->constrained('technology_evaluations')->onDelete('cascade')`

---

### `committee_reviews`

**Migration File:** `2024_01_20_000003_create_committee_reviews_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `decision` | string | default: 'pending' |
| `conditions` | text | nullable |
| `comments` | text | nullable |
| `meeting_minutes` | text | nullable |
| `digital_signature` | string | nullable |
| `meeting_date` | timestamp | nullable |
| `decision_date` | timestamp | nullable |

**Indexes:**
- ['technology_request_id', 'decision'], 'committee_rev_req_dec_idx'

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('created_by')->constrained('users')`

---

### `committee_votes`

**Migration File:** `2024_01_20_000003_create_committee_reviews_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `vote` | string | - |
| `comments` | text | nullable |
| `voted_at` | timestamp | - |

**Unique Constraints:**
- ['committee_review_id', 'committee_member_id']

**Foreign Keys:**
- `$table->foreignId('committee_review_id')->constrained('committee_reviews')->onDelete('cascade')`
- `$table->foreignId('committee_member_id')->constrained('users')`

---

### `technology_registry`

**Migration File:** `2024_01_20_000004_create_technology_registry_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `registry_number` | string | unique |
| `license_type` | string | - |
| `license_expiration` | date | nullable |
| `approval_certificate` | string | nullable |
| `owner_department_id` | unsignedBigInteger | nullable |
| `government_sector` | string | nullable |
| `compliance_status` | string | default: 'compliant' |
| `version` | string | nullable |
| `support_contact` | string | - |
| `maintenance_schedule` | text | nullable |
| `deployment_guide` | text | nullable |
| `technology_status` | string | default: 'active' |
| `registered_at` | timestamp | - |

**Indexes:**
- 'registry_number'
- ['technology_status', 'compliance_status'], 'tech_reg_status_idx'

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('registered_by')->constrained('users')`

---

### `technology_licenses`

**Migration File:** `2024_01_20_000004_create_technology_registry_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `license_key` | string | nullable |
| `license_file` | string | nullable |
| `issue_date` | date | - |
| `expiration_date` | date | nullable |
| `is_active` | boolean | default: true |
| `terms` | text | nullable |

**Foreign Keys:**
- `$table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade')`

---

### `deployment_projects`

**Migration File:** `2024_01_20_000005_create_deployment_projects_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `project_name` | string | - |
| `current_phase` | string | default: 'planning' |
| `progress_percentage` | integer | default: 0 |
| `start_date` | date | nullable |
| `end_date` | date | nullable |
| `objectives` | text | nullable |
| `success_metrics` | text | nullable |
| `status` | string | default: 'active' |

**Indexes:**
- ['current_phase', 'status']

**Foreign Keys:**
- `$table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade')`
- `$table->foreignId('project_manager_id')->constrained('users')`

---

### `deployment_sites`

**Migration File:** `2024_01_20_000005_create_deployment_projects_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `site_name` | string | - |
| `location` | string | - |
| `deployment_status` | string | default: 'pending' |
| `deployment_date` | date | nullable |
| `users_count` | integer | default: 0 |
| `notes` | text | nullable |

**Foreign Keys:**
- `$table->foreignId('deployment_project_id')->constrained('deployment_projects')->onDelete('cascade')`
- `$table->foreignId('site_manager_id')`

---

### `deployment_reports`

**Migration File:** `2024_01_20_000005_create_deployment_projects_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `report_type` | string | - |
| `content` | text | - |
| `issues` | text | nullable |
| `lessons_learned` | text | nullable |
| `user_feedback` | text | nullable |
| `report_date` | date | - |

**Foreign Keys:**
- `$table->foreignId('deployment_project_id')->constrained('deployment_projects')->onDelete('cascade')`
- `$table->foreignId('submitted_by')->constrained('users')`

---

### `technology_monitoring`

**Migration File:** `2024_01_20_000006_create_technology_monitoring_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `monitoring_type` | string | - |
| `status` | string | default: 'active' |
| `compliance_score` | integer | nullable |
| `risk_score` | integer | nullable |
| `performance_score` | integer | nullable |
| `availability_percentage` | decimal | nullable |
| `usage_count` | integer | default: 0 |
| `support_tickets` | integer | default: 0 |
| `last_check_date` | date | - |
| `next_check_date` | date | - |

**Indexes:**
- ['technology_registry_id', 'monitoring_type'], 'tech_mon_reg_type_idx'

**Foreign Keys:**
- `$table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade')`

---

### `technology_incidents`

**Migration File:** `2024_01_20_000007_create_technology_incidents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `incident_number` | string | unique |
| `incident_type` | string | - |
| `severity` | string | - |
| `status` | string | default: 'reported' |
| `title` | string | - |
| `description` | text | - |
| `impact` | text | nullable |
| `reported_at` | timestamp | - |
| `acknowledged_at` | timestamp | nullable |
| `resolved_at` | timestamp | nullable |
| `resolution` | text | nullable |
| `requires_revocation` | boolean | default: false |

**Indexes:**
- ['incident_number']
- ['severity', 'status']

**Foreign Keys:**
- `$table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade')`
- `$table->foreignId('reported_by')->constrained('users')`
- `$table->foreignId('assigned_to')`

---

### `technology_revocations`

**Migration File:** `2024_01_20_000007_create_technology_incidents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `reason` | text | - |
| `committee_decision` | text | nullable |
| `effective_date` | date | - |
| `corrective_actions` | text | nullable |
| `recovery_plan` | text | nullable |
| `is_permanent` | boolean | default: false |
| `review_date` | date | nullable |

**Foreign Keys:**
- `$table->foreignId('technology_registry_id')->constrained('technology_registry')->onDelete('cascade')`
- `$table->foreignId('technology_incident_id')`
- `$table->foreignId('revoked_by')->constrained('users')`

---

### `technology_documents`

**Migration File:** `2024_01_20_000008_create_technology_workflow_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `document_type` | string | - |
| `file_name` | string | - |
| `file_path` | string | - |
| `file_type` | string | - |
| `file_size` | integer | - |

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('uploaded_by')->constrained('users')`

---

### `technology_versions`

**Migration File:** `2024_01_20_000008_create_technology_workflow_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `version_number` | string | - |
| `changes` | text | nullable |
| `data_snapshot` | text | nullable |

**Indexes:**
- ['technology_request_id', 'version_number'], 'tech_ver_req_ver_idx'

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('created_by')->constrained('users')`

---

### `technology_comments`

**Migration File:** `2024_01_20_000008_create_technology_workflow_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `comment` | text | - |
| `comment_type` | string | default: 'general' |

**Foreign Keys:**
- `$table->foreignId('technology_request_id')->constrained('technology_requests')->onDelete('cascade')`
- `$table->foreignId('user_id')->constrained('users')`

---

### `technology_audit_logs`

**Migration File:** `2024_01_20_000009_create_technology_audit_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `auditable_type` | string | - |
| `auditable_id` | unsignedBigInteger | - |
| `action` | string | - |
| `old_values` | text | nullable |
| `new_values` | text | nullable |
| `ip_address` | string | nullable |
| `user_agent` | string | nullable |
| `performed_at` | timestamp | - |

**Indexes:**
- ['auditable_type', 'auditable_id']
- ['user_id', 'performed_at']
- 'action'

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `vendors`

**Migration File:** `2026_05_13_080913_create_vendors_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `status` | string | - |
| `score` | unsignedSmallInteger | default: 0 |
| `active_projects` | unsignedSmallInteger | default: 0 |
| `sla_breaches` | unsignedSmallInteger | default: 0 |
| `last_reviewed_at` | date | nullable |

---

### `cybersecurity_issues`

**Migration File:** `2026_05_13_080919_create_cybersecurity_issues_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `system` | string | - |
| `severity` | string | - |
| `status` | string | - |
| `detected_at` | dateTime | - |
| `resolved_at` | dateTime | nullable |

---

### `research_evaluations`

**Migration File:** `2026_07_06_122256_create_research_evaluations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `baseline_metrics` | text | nullable |
| `performance_improvements` | text | nullable |
| `research_findings` | text | - |
| `recommendations` | text | nullable |
| `lessons_learned` | text | nullable |
| `trl_level` | integer | - |
| `trl_justification` | text | nullable |
| `commercialization_potential` | text | nullable |
| `scalability_assessment` | text | nullable |
| `sustainability_assessment` | text | nullable |
| `transfer_recommended` | boolean | default: false |
| `evaluation_date` | date | - |

**Indexes:**
- 'research_project_id', 're_project_idx'
- 'trl_level', 're_trl_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('evaluated_by')->constrained('users')->onDelete('cascade')`

---

### `technology_transfers`

**Migration File:** `2026_07_06_122258_create_technology_transfers_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `transfer_code` | string | unique |
| `transfer_package` | text | nullable |
| `receiving_organization` | string | - |
| `deployment_plan` | text | nullable |
| `training_plan` | text | nullable |
| `documentation` | text | nullable |
| `intellectual_property` | text | nullable |
| `commercialization_status` | string | default: 'pending' |
| `deployment_status` | string | default: 'pending' |
| `transfer_date` | date | nullable |
| `deployment_date` | date | nullable |
| `success_metrics` | text | nullable |
| `impact_assessment` | text | nullable |

**Indexes:**
- 'research_project_id', 'tt_project_idx'
- 'commercialization_status', 'tt_commercial_idx'
- 'deployment_status', 'tt_deploy_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('transferred_by')->constrained('users')->onDelete('cascade')`

---

## Professional Licensing

### `professions`

**Migration File:** `2024_01_25_100000_create_professions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `code` | string | unique |
| `description` | text | nullable |
| `requires_exam` | boolean | default: false |
| `license_validity_years` | integer | default: 5 |
| `renewal_grace_period_days` | integer | default: 30 |
| `continuing_education_hours` | integer | default: 0 |
| `is_active` | boolean | default: true |

---

### `license_applications`

**Migration File:** `2024_01_25_100200_create_license_applications_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `application_number` | string | unique |
| `full_name` | string | - |
| `date_of_birth` | date | - |
| `gender` | string | - |
| `national_id` | string | unique |
| `passport_number` | string | nullable |
| `email` | string | - |
| `phone` | string | - |
| `address` | text | - |
| `city` | string | - |
| `region` | string | - |
| `country` | string | default: 'Ethiopia' |
| `postal_code` | string | nullable |
| `qualification_level` | string | - |
| `educational_institution` | string | - |
| `graduation_year` | integer | - |
| `experience_years` | integer | default: 0 |
| `previous_license_number` | string | nullable |
| `previous_license_country` | string | nullable |
| `status` | string | default: 'draft' |
| `review_comments` | text | nullable |
| `submitted_at` | timestamp | nullable |
| `approved_at` | timestamp | nullable |
| `rejected_at` | timestamp | nullable |

**Indexes:**
- 'application_number'
- 'national_id'
- 'status'
- 'submitted_at'

**Foreign Keys:**
- `$table->foreignId('applicant_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('profession_id')->constrained()->onDelete('restrict')`
- `$table->foreignId('specialization_id')`
- `$table->foreignId('reviewed_by')`

---

### `professional_documents`

**Migration File:** `2024_01_25_100300_create_professional_documents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `document_type` | string | - |
| `document_name` | string | - |
| `file_path` | string | - |
| `file_type` | string | - |
| `file_size` | bigInteger | - |
| `issuing_authority` | string | nullable |
| `issue_date` | date | nullable |
| `expiry_date` | date | nullable |
| `notes` | text | nullable |
| `is_verified` | boolean | default: false |
| `verified_at` | timestamp | nullable |

**Indexes:**
- ['application_id', 'document_type']

**Foreign Keys:**
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade')`
- `$table->foreignId('verified_by')`

---

### `educational_records`

**Migration File:** `2024_01_25_100400_create_educational_records_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `degree_type` | string | - |
| `field_of_study` | string | - |
| `institution_name` | string | - |
| `country` | string | - |
| `graduation_year` | integer | - |
| `grade_gpa` | string | nullable |

**Foreign Keys:**
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade')`
- `$table->foreignId('document_id')`

---

### `experience_records`

**Migration File:** `2024_01_25_100500_create_experience_records_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `organization_name` | string | - |
| `position` | string | - |
| `location` | string | - |
| `start_date` | date | - |
| `end_date` | date | nullable |
| `is_current` | boolean | default: false |
| `responsibilities` | text | nullable |
| `supervisor_name` | string | nullable |
| `supervisor_contact` | string | nullable |

**Foreign Keys:**
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade')`
- `$table->foreignId('document_id')`

---

### `verification_requests`

**Migration File:** `2024_01_25_100600_create_verification_requests_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `verification_type` | string | - |
| `verifier_organization` | string | nullable |
| `status` | string | default: 'pending' |
| `verification_details` | text | nullable |
| `comments` | text | nullable |
| `evidence` | json | nullable |
| `requested_at` | timestamp | nullable |
| `completed_at` | timestamp | nullable |

**Indexes:**
- ['application_id', 'verification_type']
- 'status'

**Foreign Keys:**
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade')`
- `$table->foreignId('verifier_id')`

---

### `examinations`

**Migration File:** `2024_01_25_100700_create_examinations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `exam_code` | string | unique |
| `exam_title` | string | - |
| `description` | text | nullable |
| `duration_minutes` | integer | - |
| `total_marks` | integer | - |
| `passing_marks` | integer | - |
| `exam_date` | date | - |
| `start_time` | time | - |
| `exam_center` | string | nullable |
| `exam_location` | string | nullable |
| `max_candidates` | integer | nullable |
| `is_active` | boolean | default: true |

**Indexes:**
- ['profession_id', 'exam_date']

**Foreign Keys:**
- `$table->foreignId('profession_id')->constrained()->onDelete('restrict')`
- `$table->foreignId('supervisor_id')`

---

### `exam_questions`

**Migration File:** `2024_01_25_100800_create_exam_questions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `question_type` | string | - |
| `question_text` | text | - |
| `options` | json | nullable |
| `correct_answer` | text | nullable |
| `marks` | integer | - |
| `order` | integer | default: 0 |

**Foreign Keys:**
- `$table->foreignId('examination_id')->constrained()->onDelete('cascade')`

---

### `exam_attempts`

**Migration File:** `2024_01_25_100900_create_exam_attempts_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `attempt_number` | integer | default: 1 |
| `started_at` | timestamp | nullable |
| `submitted_at` | timestamp | nullable |
| `score` | integer | nullable |
| `total_marks` | integer | - |
| `passing_marks` | integer | - |
| `result` | string | nullable |
| `evaluator_comments` | text | nullable |
| `evaluated_at` | timestamp | nullable |
| `is_appeal` | boolean | default: false |
| `appeal_reason` | text | nullable |

**Indexes:**
- ['candidate_id', 'examination_id']
- 'result'

**Foreign Keys:**
- `$table->foreignId('examination_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('cascade')`
- `$table->foreignId('candidate_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('evaluator_id')`

---

### `licenses`

**Migration File:** `2024_01_25_101000_create_licenses_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `license_number` | string | unique |
| `issue_date` | date | - |
| `expiry_date` | date | - |
| `status` | string | default: 'active' |
| `qr_code` | string | nullable |
| `digital_signature` | string | nullable |
| `certificate_path` | string | nullable |
| `issuing_authority_info` | text | nullable |
| `special_conditions` | text | nullable |
| `practice_restrictions` | text | nullable |
| `suspended_at` | timestamp | nullable |
| `revoked_at` | timestamp | nullable |
| `status_reason` | text | nullable |

**Indexes:**
- 'license_number'
- 'professional_id'
- 'status'
- 'expiry_date'

**Foreign Keys:**
- `$table->foreignId('application_id')->constrained('license_applications')->onDelete('restrict')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('profession_id')->constrained()->onDelete('restrict')`
- `$table->foreignId('specialization_id')`
- `$table->foreignId('issued_by')->constrained('users')`

---

### `professional_profiles`

**Migration File:** `2024_01_25_101100_create_professional_profiles_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `current_employer` | string | nullable |
| `employment_type` | string | nullable |
| `practice_location` | string | nullable |
| `practice_city` | string | nullable |
| `practice_region` | string | nullable |
| `practice_address` | text | nullable |
| `office_phone` | string | nullable |
| `office_email` | string | nullable |
| `specializations` | json | nullable |
| `practice_status` | string | default: 'active' |
| `years_of_practice` | integer | default: 0 |
| `compliance_score` | decimal | nullable |
| `continuing_education_hours` | integer | default: 0 |
| `is_public_searchable` | boolean | default: true |
| `bio` | text | nullable |
| `languages` | json | nullable |
| `photo_path` | string | nullable |

**Indexes:**
- 'user_id'
- 'practice_status'

**Foreign Keys:**
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('current_license_id')`

---

### `license_renewals`

**Migration File:** `2024_01_25_101200_create_license_renewals_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `renewal_number` | string | unique |
| `renewal_period_start` | date | - |
| `renewal_period_end` | date | - |
| `application_date` | timestamp | - |
| `status` | string | default: 'pending' |
| `is_late_renewal` | boolean | default: false |
| `grace_period_days` | integer | default: 0 |
| `required_ce_hours` | integer | - |
| `completed_ce_hours` | integer | default: 0 |
| `documents_updated` | boolean | default: false |
| `fee_paid` | boolean | default: false |
| `fee_amount` | decimal | nullable |
| `payment_reference` | string | nullable |
| `payment_date` | timestamp | nullable |
| `review_comments` | text | nullable |
| `approved_at` | timestamp | nullable |
| `rejected_at` | timestamp | nullable |

**Indexes:**
- 'license_id'
- 'professional_id'
- 'status'
- 'renewal_period_end'

**Foreign Keys:**
- `$table->foreignId('license_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('previous_license_id')`
- `$table->foreignId('reviewed_by')`

---

### `continuing_education`

**Migration File:** `2024_01_25_101300_create_continuing_education_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `course_title` | string | - |
| `provider` | string | - |
| `course_type` | string | - |
| `completion_date` | date | - |
| `hours` | integer | default: 0 |
| `credits` | integer | default: 0 |
| `certificate_number` | string | nullable |
| `is_verified` | boolean | default: false |
| `verified_at` | timestamp | nullable |
| `document_path` | string | nullable |

**Indexes:**
- ['professional_id', 'completion_date']

**Foreign Keys:**
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('license_id')`
- `$table->foreignId('verified_by')`

---

### `complaints`

**Migration File:** `2024_01_25_101400_create_complaints_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `complaint_number` | string | unique |
| `complainant_name` | string | nullable |
| `complainant_email` | string | nullable |
| `complainant_phone` | string | nullable |
| `is_anonymous` | boolean | default: false |
| `violation_type` | string | - |
| `severity` | string | - |
| `description` | text | - |
| `incident_date` | date | nullable |
| `incident_location` | string | nullable |
| `witnesses` | json | nullable |
| `evidence_files` | json | nullable |
| `status` | string | default: 'received' |
| `investigation_started_at` | timestamp | nullable |
| `investigation_completed_at` | timestamp | nullable |
| `investigation_summary` | text | nullable |

**Indexes:**
- 'complaint_number'
- 'professional_id'
- 'status'
- 'violation_type'

**Foreign Keys:**
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('license_id')`
- `$table->foreignId('filed_by')`
- `$table->foreignId('assigned_investigator')`

---

### `disciplinary_cases`

**Migration File:** `2024_01_25_101500_create_disciplinary_cases_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `case_number` | string | unique |
| `case_type` | string | - |
| `case_summary` | text | - |
| `violations` | json | nullable |
| `status` | string | default: 'investigating' |
| `investigation_team` | json | nullable |
| `investigation_findings` | text | nullable |
| `evidence_collected` | json | nullable |
| `investigation_completed_at` | timestamp | nullable |
| `committee_members` | json | nullable |
| `hearing_scheduled_at` | timestamp | nullable |
| `hearing_minutes` | text | nullable |
| `decision_date` | timestamp | nullable |
| `committee_decision` | text | nullable |
| `is_resolved` | boolean | default: false |
| `resolved_at` | timestamp | nullable |
| `resolution_summary` | text | nullable |

**Indexes:**
- 'case_number'
- 'professional_id'
- 'status'

**Foreign Keys:**
- `$table->foreignId('complaint_id')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('license_id')`
- `$table->foreignId('lead_investigator')`

---

### `disciplinary_actions`

**Migration File:** `2024_01_25_101600_create_disciplinary_actions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `action_type` | string | - |
| `action_description` | text | - |
| `severity_level` | integer | default: 1 |
| `effective_date` | date | - |
| `end_date` | date | nullable |
| `is_permanent` | boolean | default: false |
| `fine_amount` | decimal | nullable |
| `fine_currency` | string | default: 'ETB' |
| `fine_paid` | boolean | default: false |
| `fine_paid_at` | timestamp | nullable |
| `training_course` | string | nullable |
| `training_hours` | integer | nullable |
| `training_completed` | boolean | default: false |
| `training_completed_at` | timestamp | nullable |
| `practice_restrictions` | text | nullable |
| `suspension_terms` | text | nullable |
| `imposed_by_authority` | text | nullable |
| `status` | string | default: 'pending' |
| `implemented_at` | timestamp | nullable |
| `completed_at` | timestamp | nullable |
| `is_public` | boolean | default: true |
| `public_notice` | text | nullable |

**Indexes:**
- ['professional_id', 'action_type']
- 'status'

**Foreign Keys:**
- `$table->foreignId('case_id')->constrained('disciplinary_cases')->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('license_id')`
- `$table->foreignId('imposed_by')->constrained('users')`

---

### `hearings`

**Migration File:** `2024_01_25_101700_create_hearings_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `hearing_type` | string | - |
| `scheduled_at` | dateTime | - |
| `location` | string | nullable |
| `meeting_link` | string | nullable |
| `duration_minutes` | integer | default: 120 |
| `committee_members` | json | - |
| `professional_representative` | string | nullable |
| `witnesses` | json | nullable |
| `status` | string | default: 'scheduled' |
| `agenda` | text | nullable |
| `minutes` | text | nullable |
| `documents` | json | nullable |
| `evidence_presented` | json | nullable |
| `decision` | text | nullable |
| `recommendations` | json | nullable |
| `completed_at` | timestamp | nullable |

**Indexes:**
- ['case_id', 'scheduled_at']

**Foreign Keys:**
- `$table->foreignId('case_id')->constrained('disciplinary_cases')->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`

---

### `sanctions`

**Migration File:** `2024_01_25_101800_create_sanctions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `sanction_type` | string | - |
| `sanction_details` | text | - |
| `start_date` | date | - |
| `end_date` | date | nullable |
| `is_indefinite` | boolean | default: false |
| `terms_and_conditions` | text | nullable |
| `reinstatement_conditions` | text | nullable |
| `reinstatement_fee` | decimal | nullable |
| `status` | string | default: 'active' |
| `lifted_at` | timestamp | nullable |
| `lift_reason` | text | nullable |
| `is_public_record` | boolean | default: true |
| `public_notice_date` | date | nullable |

**Indexes:**
- ['professional_id', 'status']
- 'sanction_type'

**Foreign Keys:**
- `$table->foreignId('disciplinary_action_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('license_id')`
- `$table->foreignId('lifted_by')`

---

### `license_suspensions`

**Migration File:** `2024_01_25_101900_create_license_suspensions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `suspension_type` | string | - |
| `reason` | text | - |
| `start_date` | date | - |
| `scheduled_end_date` | date | nullable |
| `actual_end_date` | date | nullable |
| `duration_days` | integer | nullable |
| `authority_info` | text | nullable |
| `legal_basis` | text | nullable |
| `reinstatement_conditions` | text | nullable |
| `is_reinstated` | boolean | default: false |
| `reinstated_at` | timestamp | nullable |
| `reinstatement_notes` | text | nullable |
| `status` | string | default: 'active' |
| `professional_notified` | boolean | default: false |
| `notified_at` | timestamp | nullable |
| `public_posted` | boolean | default: false |
| `posted_at` | timestamp | nullable |

**Indexes:**
- ['license_id', 'status']
- 'professional_id'

**Foreign Keys:**
- `$table->foreignId('license_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('disciplinary_action_id')`
- `$table->foreignId('suspended_by')->constrained('users')`
- `$table->foreignId('reinstated_by')`

---

### `license_revocations`

**Migration File:** `2024_01_25_102000_create_license_revocations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `revocation_type` | string | - |
| `reason` | text | - |
| `legal_basis` | text | - |
| `revocation_date` | date | - |
| `effective_date` | date | - |
| `authority_info` | text | - |
| `committee_decision` | text | nullable |
| `committee_members` | json | nullable |
| `supporting_documents` | json | nullable |
| `can_reapply` | boolean | default: false |
| `earliest_reapplication_date` | date | nullable |
| `reapplication_conditions` | text | nullable |
| `recovery_requirements` | text | nullable |
| `appeal_filed` | boolean | default: false |
| `appeal_deadline` | date | nullable |
| `appeal_id` | unsignedBigInteger | nullable |
| `appeal_status` | string | nullable |
| `is_public_record` | boolean | default: true |
| `public_notice_date` | date | nullable |
| `public_notice_content` | text | nullable |
| `status` | string | default: 'active' |

**Indexes:**
- 'license_id'
- 'professional_id'
- 'revocation_date'

**Foreign Keys:**
- `$table->foreignId('license_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('disciplinary_case_id')`
- `$table->foreignId('revoked_by')->constrained('users')`

---

### `appeals`

**Migration File:** `2024_01_25_102100_create_appeals_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `appeal_number` | string | unique |
| `grounds_for_appeal` | text | - |
| `arguments` | text | - |
| `supporting_documents` | json | nullable |
| `witnesses` | json | nullable |
| `filed_date` | date | - |
| `deadline_date` | date | - |
| `status` | string | default: 'pending' |
| `appeal_board_members` | json | nullable |
| `review_started_at` | timestamp | nullable |
| `hearing_date` | dateTime | nullable |
| `hearing_location` | string | nullable |
| `hearing_minutes` | text | nullable |
| `decision` | string | nullable |
| `decision_rationale` | text | nullable |
| `new_terms` | json | nullable |
| `decision_date` | timestamp | nullable |
| `further_appeal_allowed` | boolean | default: false |
| `further_appeal_authority` | string | nullable |

**Indexes:**
- 'appeal_number'
- 'professional_id'
- 'status'

**Foreign Keys:**
- `$table->foreignId('professional_id')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('assigned_reviewer')`
- `$table->foreignId('decided_by')`

---

## Research & Innovation

### `research_ideas`

**Migration File:** `2026_07_06_122243_create_research_ideas_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `summary` | text | - |
| `problem_statement` | text | - |
| `objectives` | text | - |
| `expected_outcome` | text | - |
| `research_category` | string | - |
| `government_sector` | string | nullable |
| `priority` | string | default: 'medium' |
| `status` | string | default: 'draft' |
| `submitted_at` | timestamp | nullable |

**Indexes:**
- ['status', 'priority'], 'ri_status_priority_idx'
- 'submitted_by', 'ri_submitter_idx'
- 'created_at', 'ri_created_idx'

**Foreign Keys:**
- `$table->foreignId('submitted_by')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('sub_city_id')`

---

### `research_idea_attachments`

**Migration File:** `2026_07_06_122244_create_research_idea_attachments_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `file_name` | string | - |
| `file_path` | string | - |
| `file_type` | string | nullable |
| `file_size` | unsignedBigInteger | nullable |

**Indexes:**
- 'research_idea_id', 'ria_idea_idx'

**Foreign Keys:**
- `$table->foreignId('research_idea_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade')`

---

### `research_screenings`

**Migration File:** `2026_07_06_122245_create_research_screenings_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `strategic_alignment_score` | integer | default: 0 |
| `strategic_alignment_comment` | text | nullable |
| `feasibility_score` | integer | default: 0 |
| `feasibility_comment` | text | nullable |
| `governance_impact_score` | integer | default: 0 |
| `governance_impact_comment` | text | nullable |
| `resource_requirement_score` | integer | default: 0 |
| `resource_requirement_comment` | text | nullable |
| `innovation_level_score` | integer | default: 0 |
| `innovation_level_comment` | text | nullable |
| `risk_level_score` | integer | default: 0 |
| `risk_level_comment` | text | nullable |
| `total_score` | integer | default: 0 |
| `calculated_priority` | string | - |
| `decision` | string | default: 'pending' |
| `overall_comment` | text | nullable |

**Indexes:**
- 'research_idea_id', 'rs_idea_idx'
- 'evaluated_by', 'rs_evaluator_idx'

**Foreign Keys:**
- `$table->foreignId('research_idea_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('evaluated_by')->constrained('users')->onDelete('cascade')`

---

### `research_projects`

**Migration File:** `2026_07_06_122246_create_research_projects_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `project_code` | string | unique |
| `title` | string | - |
| `current_stage` | string | default: 'proposal_development' |
| `background` | text | nullable |
| `objectives` | text | nullable |
| `methodology` | text | nullable |
| `expected_deliverables` | text | nullable |
| `estimated_budget` | decimal | nullable |
| `required_resources` | text | nullable |
| `start_date` | date | nullable |
| `end_date` | date | nullable |
| `risk_analysis` | text | nullable |
| `success_metrics` | text | nullable |
| `progress_percentage` | integer | default: 0 |
| `trl_level` | string | default: '1' |

**Indexes:**
- 'current_stage', 'rp_stage_idx'
- 'project_lead_id', 'rp_lead_idx'
- ['start_date', 'end_date'], 'rp_dates_idx'

**Foreign Keys:**
- `$table->foreignId('research_idea_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('project_lead_id')`
- `$table->foreignId('sub_city_id')`

---

### `proposal_versions`

**Migration File:** `2026_07_06_122247_create_proposal_versions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `version_number` | integer | - |
| `background` | text | - |
| `objectives` | text | - |
| `methodology` | text | - |
| `expected_deliverables` | text | - |
| `estimated_budget` | decimal | - |
| `required_resources` | text | - |
| `timeline` | string | - |
| `risk_analysis` | text | - |
| `success_metrics` | text | - |
| `change_summary` | text | nullable |
| `is_current` | boolean | default: false |

**Indexes:**
- ['research_project_id', 'version_number'], 'pv_project_version_idx'
- 'is_current', 'pv_is_current_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('created_by')->constrained('users')->onDelete('cascade')`

---

### `proposal_reviews`

**Migration File:** `2026_07_06_122248_create_proposal_reviews_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `review_type` | string | - |
| `decision` | string | - |
| `comment` | text | nullable |
| `reviewed_at` | timestamp | - |

**Indexes:**
- ['research_project_id', 'review_type'], 'pr_project_review_type_idx'
- 'reviewer_id', 'pr_reviewer_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('proposal_version_id')`
- `$table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade')`

---

### `research_milestones`

**Migration File:** `2026_07_06_122249_create_research_milestones_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `description` | text | nullable |
| `planned_start_date` | date | - |
| `planned_end_date` | date | - |
| `actual_start_date` | date | nullable |
| `actual_end_date` | date | nullable |
| `progress_percentage` | integer | default: 0 |
| `status` | string | default: 'pending' |
| `deliverables` | text | nullable |
| `order` | integer | default: 0 |

**Indexes:**
- 'research_project_id', 'rm_project_idx'
- ['status', 'planned_end_date'], 'rm_status_date_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('assigned_to')`

---

### `research_tasks`

**Migration File:** `2026_07_06_122250_create_research_tasks_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `description` | text | nullable |
| `priority` | string | default: 'medium' |
| `status` | string | default: 'pending' |
| `due_date` | date | nullable |
| `completed_at` | date | nullable |
| `estimated_hours` | integer | nullable |
| `actual_hours` | integer | nullable |

**Indexes:**
- 'research_project_id', 'rt_project_idx'
- 'research_milestone_id', 'rt_milestone_idx'
- ['status', 'assigned_to'], 'rt_status_assigned_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('research_milestone_id')`
- `$table->foreignId('assigned_to')`

---

### `experiments`

**Migration File:** `2026_07_06_122251_create_experiments_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `experiment_code` | string | unique |
| `title` | string | - |
| `hypothesis` | text | nullable |
| `methodology` | text | nullable |
| `conducted_date` | date | - |
| `results` | text | nullable |
| `conclusion` | text | nullable |
| `observations` | text | nullable |
| `status` | string | default: 'planned' |

**Indexes:**
- 'research_project_id', 'exp_project_idx'
- 'status', 'exp_status_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('conducted_by')->constrained('users')->onDelete('cascade')`

---

### `prototype_versions`

**Migration File:** `2026_07_06_122252_create_prototype_versions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `version_number` | string | - |
| `title` | string | - |
| `description` | text | nullable |
| `features` | text | nullable |
| `improvements` | text | nullable |
| `known_issues` | text | nullable |
| `status` | string | default: 'development' |
| `release_date` | date | nullable |

**Indexes:**
- 'research_project_id', 'pv_project_idx'
- 'version_number', 'pv_version_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('created_by')->constrained('users')->onDelete('cascade')`

---

### `research_risks`

**Migration File:** `2026_07_06_122254_create_research_risks_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `description` | text | - |
| `category` | string | - |
| `probability` | string | - |
| `impact` | string | - |
| `mitigation_strategy` | text | nullable |
| `status` | string | default: 'open' |
| `identified_date` | date | - |
| `resolved_date` | date | nullable |

**Indexes:**
- 'research_project_id', 'rr_project_idx'
- ['status', 'impact'], 'rr_status_impact_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('identified_by')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('assigned_to')`

---

### `research_issues`

**Migration File:** `2026_07_06_122255_create_research_issues_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `description` | text | - |
| `type` | string | - |
| `priority` | string | default: 'medium' |
| `status` | string | default: 'open' |
| `resolution` | text | nullable |
| `reported_date` | date | - |
| `resolved_date` | date | nullable |

**Indexes:**
- 'research_project_id', 'ri_project_idx'
- ['status', 'priority'], 'ri_status_priority_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('reported_by')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('assigned_to')`

---

### `trl_assessments`

**Migration File:** `2026_07_06_122257_create_trl_assessments_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `trl_level` | integer | - |
| `previous_trl_level` | integer | nullable |
| `assessment_notes` | text | - |
| `evidence` | text | nullable |
| `next_level_requirements` | text | nullable |
| `assessment_date` | date | - |

**Indexes:**
- ['research_project_id', 'trl_level'], 'trl_project_level_idx'
- 'assessment_date', 'trl_date_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('assessed_by')->constrained('users')->onDelete('cascade')`

---

### `research_team_members`

**Migration File:** `2026_07_06_122260_create_research_team_members_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `role` | string | - |
| `responsibilities` | text | nullable |
| `joined_date` | date | - |
| `left_date` | date | nullable |
| `is_active` | boolean | default: true |

**Indexes:**
- 'research_project_id', 'rtm_project_idx'
- 'user_id', 'rtm_user_idx'

**Unique Constraints:**
- ['research_project_id', 'user_id'], 'rtm_project_user_unique'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`

---

### `research_documents`

**Migration File:** `2026_07_06_122261_create_research_documents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `document_type` | string | - |
| `title` | string | - |
| `description` | text | nullable |
| `file_name` | string | - |
| `file_path` | string | - |
| `file_type` | string | nullable |
| `file_size` | unsignedBigInteger | nullable |
| `version` | string | default: '1.0' |

**Indexes:**
- 'research_project_id', 'rd_project_idx'
- 'document_type', 'rd_type_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade')`

---

### `research_expenses`

**Migration File:** `2026_07_06_122262_create_research_expenses_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `category` | string | - |
| `description` | text | - |
| `amount` | decimal | - |
| `expense_date` | date | - |
| `vendor` | string | nullable |
| `receipt_number` | string | nullable |
| `payment_method` | string | nullable |
| `status` | string | default: 'pending' |
| `approved_at` | timestamp | nullable |

**Indexes:**
- 'research_project_id', 'rex_project_idx'
- ['category', 'expense_date'], 'rex_cat_date_idx'
- 'status', 'rex_status_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('submitted_by')->constrained('users')->onDelete('cascade')`
- `$table->foreignId('approved_by')`

---

### `research_time_logs`

**Migration File:** `2026_07_06_122263_create_research_time_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `log_date` | date | - |
| `hours` | decimal | - |
| `description` | text | nullable |
| `activity_type` | string | nullable |

**Indexes:**
- ['research_project_id', 'log_date'], 'rtl_project_date_idx'
- 'user_id', 'rtl_user_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('research_task_id')`
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`

---

### `research_comments`

**Migration File:** `2026_07_06_122264_create_research_comments_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `comment` | text | - |

**Indexes:**
- ['commentable_type', 'commentable_id'], 'rc_commentable_idx'
- 'user_id', 'rc_user_idx'

**Foreign Keys:**
- `$table->foreignId('user_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('parent_id')`

---

### `research_activity_logs`

**Migration File:** `2026_07_06_122265_create_research_activity_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `action` | string | - |
| `entity_type` | string | - |
| `entity_id` | unsignedBigInteger | - |
| `old_values` | json | nullable |
| `new_values` | json | nullable |
| `description` | text | nullable |
| `ip_address` | string | nullable |
| `user_agent` | string | nullable |

**Indexes:**
- ['entity_type', 'entity_id'], 'ral_entity_idx'
- ['user_id', 'created_at'], 'ral_user_created_idx'
- 'action', 'ral_action_idx'

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

## Institutions

### `institutions`

**Migration File:** `2026_06_19_000001_create_institutions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `amharic_name` | string | nullable |
| `type` | enum | - |
| `registration_number` | string | nullable, unique |
| `tin_number` | string | nullable |
| `email` | string | unique |
| `phone` | string | nullable |
| `alternative_phone` | string | nullable |
| `address` | text | nullable |
| `city` | string | default: 'Addis Ababa' |
| `woreda` | string | nullable |
| `website` | string | nullable |
| `description` | text | nullable |
| `status` | enum | default: 'PENDING' |
| `verified_at` | timestamp | nullable |
| `documents` | json | nullable |
| `metadata` | json | nullable |

**Indexes:**
- 'type'
- 'status'
- 'email'

**Foreign Keys:**
- `$table->foreignId('sub_city_id')`
- `$table->foreignId('verified_by')`

---

### `institution_documents`

**Migration File:** `2026_06_19_000003_create_institution_documents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `file_path` | string | - |
| `file_type` | string | - |
| `file_size` | integer | - |
| `category` | enum | default: 'other' |
| `description` | text | nullable |

**Indexes:**
- ['institution_id', 'category']
- 'uploaded_by'

**Foreign Keys:**
- `$table->foreignId('institution_id')->constrained('institutions')->onDelete('cascade')`
- `$table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade')`

---

### `institution_team_members`

**Migration File:** `2026_06_19_000004_create_institution_team_members_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `email` | string | unique |
| `name` | string | - |
| `role` | enum | default: 'viewer' |
| `status` | enum | default: 'invited' |
| `invitation_token` | string | nullable |
| `invited_at` | timestamp | nullable |
| `joined_at` | timestamp | nullable |

**Indexes:**
- ['institution_id', 'status']
- 'email'
- 'invitation_token'

**Foreign Keys:**
- `$table->foreignId('institution_id')->constrained('institutions')->onDelete('cascade')`
- `$table->foreignId('user_id')`

---

## OAuth & API

### `oauth_auth_codes`

**Migration File:** `2026_05_13_080621_create_oauth_auth_codes_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | char | - |
| `client_id` | foreignUuid | - |
| `scopes` | text | nullable |
| `revoked` | boolean | - |
| `expires_at` | dateTime | nullable |

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `oauth_access_tokens`

**Migration File:** `2026_05_13_080622_create_oauth_access_tokens_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | char | - |
| `client_id` | foreignUuid | - |
| `name` | string | nullable |
| `scopes` | text | nullable |
| `revoked` | boolean | - |
| `expires_at` | dateTime | nullable |

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `oauth_refresh_tokens`

**Migration File:** `2026_05_13_080623_create_oauth_refresh_tokens_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | char | - |
| `access_token_id` | char | indexed |
| `revoked` | boolean | - |
| `expires_at` | dateTime | nullable |

---

### `oauth_clients`

**Migration File:** `2026_05_13_080624_create_oauth_clients_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | uuid | - |
| `owner` | nullableMorphs | - |
| `name` | string | - |
| `secret` | string | nullable |
| `provider` | string | nullable |
| `redirect_uris` | text | - |
| `grant_types` | text | - |
| `revoked` | boolean | - |

---

### `oauth_device_codes`

**Migration File:** `2026_05_13_080625_create_oauth_device_codes_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `id` | char | - |
| `client_id` | foreignUuid | indexed |
| `user_code` | char | unique |
| `scopes` | text | - |
| `revoked` | boolean | - |
| `user_approved_at` | dateTime | nullable |
| `last_polled_at` | dateTime | nullable |
| `expires_at` | dateTime | nullable |

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

## Other

### `monitoring_metrics`

**Migration File:** `2024_01_20_000006_create_technology_monitoring_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `metric_name` | string | - |
| `metric_value` | string | - |
| `unit` | string | nullable |
| `status` | string | default: 'normal' |
| `recorded_at` | timestamp | - |

**Indexes:**
- ['technology_monitoring_id', 'recorded_at'], 'tech_mon_metrics_idx'

**Foreign Keys:**
- `$table->foreignId('technology_monitoring_id')->constrained('technology_monitoring')->onDelete('cascade')`

---

### `monitoring_alerts`

**Migration File:** `2024_01_20_000006_create_technology_monitoring_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `alert_type` | string | - |
| `severity` | string | - |
| `message` | string | - |
| `details` | text | nullable |
| `is_acknowledged` | boolean | default: false |
| `acknowledged_at` | timestamp | nullable |
| `triggered_at` | timestamp | - |

**Indexes:**
- ['severity', 'is_acknowledged']

**Foreign Keys:**
- `$table->foreignId('technology_monitoring_id')->constrained('technology_monitoring')->onDelete('cascade')`
- `$table->foreignId('acknowledged_by')`

---

### `incident_actions`

**Migration File:** `2024_01_20_000007_create_technology_incidents_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `action_type` | string | - |
| `description` | text | - |
| `performed_at` | timestamp | - |

**Foreign Keys:**
- `$table->foreignId('technology_incident_id')->constrained('technology_incidents')->onDelete('cascade')`
- `$table->foreignId('performed_by')->constrained('users')`

---

### `specializations`

**Migration File:** `2024_01_25_100100_create_specializations_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `code` | string | - |
| `description` | text | nullable |
| `is_active` | boolean | default: true |

**Unique Constraints:**
- ['profession_id', 'code']

**Foreign Keys:**
- `$table->foreignId('profession_id')->constrained()->onDelete('cascade')`

---

### `licensing_audit_logs`

**Migration File:** `2024_01_25_102300_create_licensing_audit_logs_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `event_type` | string | - |
| `auditable_type` | string | - |
| `auditable_id` | unsignedBigInteger | - |
| `action` | string | - |
| `old_values` | json | nullable |
| `new_values` | json | nullable |
| `description` | text | nullable |
| `ip_address` | string | nullable |
| `user_agent` | string | nullable |

**Indexes:**
- ['auditable_type', 'auditable_id']
- 'user_id'
- 'event_type'
- 'created_at'

**Foreign Keys:**
- `$table->foreignId('user_id')`

---

### `service_form_submissions`

**Migration File:** `2024_06_18_000000_create_service_form_submissions_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `service_type` | string | - |
| `reference_number` | string | unique |
| `form_data` | json | - |
| `submitted_by` | unsignedBigInteger | nullable |
| `submitted_email` | string | nullable |
| `submitted_name` | string | nullable |
| `status` | enum | default: 'pending' |
| `review_notes` | text | nullable |
| `reviewed_by` | unsignedBigInteger | nullable |
| `submission_timestamp` | timestamp | - |
| `reviewed_at` | timestamp | nullable |

**Indexes:**
- 'service_type'
- 'reference_number'
- 'status'
- 'submitted_email'
- 'submission_timestamp'

**Foreign Keys:**
- `$table->foreign('submitted_by')`
- `$table->foreign('reviewed_by')`

---

### `technologies`

**Migration File:** `2026_05_13_080911_create_technologies_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | - |
| `category` | string | - |
| `owner_office` | string | - |
| `status` | string | - |
| `classification` | string | - |
| `location` | string | - |
| `deployed_at` | date | nullable |

---

### `surveys`

**Migration File:** `2026_05_13_080915_create_surveys_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `responses` | unsignedInteger | default: 0 |
| `sentiment` | string | - |
| `status` | string | - |
| `created_by` | string | nullable |

---

### `reports`

**Migration File:** `2026_05_13_080916_create_reports_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `type` | string | - |
| `period` | string | - |
| `status` | string | - |
| `generated_at` | dateTime | nullable |

---

### `notifications`

**Migration File:** `2026_05_13_080917_create_notifications_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `message` | text | - |
| `channel` | string | - |
| `priority` | string | - |
| `recipient` | string | nullable |
| `read_at` | timestamp | nullable |

---

### `audits`

**Migration File:** `2026_05_13_080918_create_audits_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `title` | string | - |
| `office` | string | - |
| `status` | string | - |
| `score` | unsignedSmallInteger | nullable |
| `due_date` | date | nullable |
| `started_at` | date | nullable |

---

### `sub_cities`

**Migration File:** `2026_05_14_000001_create_sub_cities_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `name` | string | unique |
| `code` | string | unique |
| `description` | text | nullable |
| `address` | string | nullable |
| `phone` | string | nullable |
| `email` | string | nullable |
| `website` | string | nullable |
| `logo` | string | nullable |
| `admin_name` | string | nullable |
| `admin_email` | string | nullable |
| `admin_phone` | string | nullable |
| `settings` | json | nullable |
| `metadata` | json | nullable |
| `is_active` | boolean | default: true |
| `activated_at` | timestamp | nullable |
| `deactivated_at` | timestamp | nullable |
| `subscription_tier` | string | default: 'basic' |
| `subscription_expires_at` | timestamp | nullable |

---

### `system_settings`

**Migration File:** `2026_05_14_112543_create_system_settings_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `key` | string | unique |
| `value` | text | nullable |
| `category` | string | default: 'general' |
| `type` | string | default: 'string' |
| `description` | text | nullable |

---

### `progress_reports`

**Migration File:** `2026_07_06_122253_create_progress_reports_table.php`

**Columns:**

| Column | Type | Attributes |
|--------|------|------------|
| `` | id | - |
| `report_period` | string | - |
| `report_date` | date | - |
| `accomplishments` | text | nullable |
| `challenges` | text | nullable |
| `next_steps` | text | nullable |
| `progress_percentage` | integer | default: 0 |
| `budget_spent` | decimal | nullable |
| `budget_remaining` | decimal | nullable |

**Indexes:**
- 'research_project_id', 'prog_project_idx'
- 'report_date', 'prog_date_idx'

**Foreign Keys:**
- `$table->foreignId('research_project_id')->constrained()->onDelete('cascade')`
- `$table->foreignId('submitted_by')->constrained('users')->onDelete('cascade')`

---

## Database Statistics

- **Total Tables:** 107
- **Total Migration Files:** 88

**Tables by Module:**
- Core System: 10 tables
- Authentication & Authorization: 4 tables
- Workflow Management: 7 tables
- Technology Management: 24 tables
- Professional Licensing: 21 tables
- Research & Innovation: 19 tables
- Institutions: 3 tables
- OAuth & API: 5 tables
- Other: 14 tables

---

*This schema documentation was automatically generated from Laravel migration files.*
