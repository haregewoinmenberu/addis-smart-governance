// Extended RBAC Types for the organization structure

export type OrganizationalRoleName =
  // Bureau Level
  | 'bureau_head'
  // Smart City Sector
  | 'smart_city_sector_head'
  // Capacity Building
  | 'capacity_building_director'
  | 'training_team_leader'
  | 'training_officer'
  // Research
  | 'research_director'
  | 'research_officer'
  // Security
  | 'security_director'
  | 'security_officer'
  // Development Sector
  | 'development_sector_head'
  // Project Management
  | 'project_director'
  | 'project_manager'
  // Software Development
  | 'software_development_director'
  | 'software_team_leader'
  | 'software_developer'
  // Infrastructure
  | 'infrastructure_director'
  | 'infrastructure_engineer'
  // Operations
  | 'operation_sector_head'
  | 'maintenance_director'
  | 'maintenance_team_leader'
  | 'support_officer'
  // Data Center
  | 'data_center_director'
  | 'cloud_engineer'
  // Quality
  | 'quality_director'
  | 'quality_officer';

// Combine with base roles
export type ExtendedRoleName = OrganizationalRoleName;

// Role hierarchy levels
export enum RoleLevel {
  BUREAU = 1,
  SECTOR_HEAD = 2,
  DIRECTOR = 3,
  TEAM_LEADER = 4,
  OFFICER = 5,
}

// Role categories
export enum RoleCategory {
  LEADERSHIP = 'leadership',
  MANAGEMENT = 'management',
  TECHNICAL = 'technical',
  SUPPORT = 'support',
  QUALITY = 'quality',
}

// Role hierarchy mapping
export const roleHierarchy: Record<string, RoleLevel> = {
  bureau_head: RoleLevel.BUREAU,
  smart_city_sector_head: RoleLevel.SECTOR_HEAD,
  development_sector_head: RoleLevel.SECTOR_HEAD,
  operation_sector_head: RoleLevel.SECTOR_HEAD,
  capacity_building_director: RoleLevel.DIRECTOR,
  research_director: RoleLevel.DIRECTOR,
  security_director: RoleLevel.DIRECTOR,
  project_director: RoleLevel.DIRECTOR,
  software_development_director: RoleLevel.DIRECTOR,
  infrastructure_director: RoleLevel.DIRECTOR,
  maintenance_director: RoleLevel.DIRECTOR,
  data_center_director: RoleLevel.DIRECTOR,
  quality_director: RoleLevel.DIRECTOR,
  training_team_leader: RoleLevel.TEAM_LEADER,
  software_team_leader: RoleLevel.TEAM_LEADER,
  maintenance_team_leader: RoleLevel.TEAM_LEADER,
  training_officer: RoleLevel.OFFICER,
  research_officer: RoleLevel.OFFICER,
  security_officer: RoleLevel.OFFICER,
  project_manager: RoleLevel.OFFICER,
  software_developer: RoleLevel.OFFICER,
  infrastructure_engineer: RoleLevel.OFFICER,
  support_officer: RoleLevel.OFFICER,
  cloud_engineer: RoleLevel.OFFICER,
  quality_officer: RoleLevel.OFFICER,
};

// Role category mapping
export const roleCategories: Record<string, RoleCategory> = {
  bureau_head: RoleCategory.LEADERSHIP,
  smart_city_sector_head: RoleCategory.LEADERSHIP,
  development_sector_head: RoleCategory.LEADERSHIP,
  operation_sector_head: RoleCategory.LEADERSHIP,
  capacity_building_director: RoleCategory.MANAGEMENT,
  research_director: RoleCategory.MANAGEMENT,
  security_director: RoleCategory.MANAGEMENT,
  project_director: RoleCategory.MANAGEMENT,
  software_development_director: RoleCategory.MANAGEMENT,
  infrastructure_director: RoleCategory.MANAGEMENT,
  maintenance_director: RoleCategory.MANAGEMENT,
  data_center_director: RoleCategory.MANAGEMENT,
  quality_director: RoleCategory.QUALITY,
  training_team_leader: RoleCategory.MANAGEMENT,
  software_team_leader: RoleCategory.TECHNICAL,
  maintenance_team_leader: RoleCategory.SUPPORT,
  training_officer: RoleCategory.SUPPORT,
  research_officer: RoleCategory.TECHNICAL,
  security_officer: RoleCategory.TECHNICAL,
  project_manager: RoleCategory.MANAGEMENT,
  software_developer: RoleCategory.TECHNICAL,
  infrastructure_engineer: RoleCategory.TECHNICAL,
  support_officer: RoleCategory.SUPPORT,
  cloud_engineer: RoleCategory.TECHNICAL,
  quality_officer: RoleCategory.QUALITY,
};
