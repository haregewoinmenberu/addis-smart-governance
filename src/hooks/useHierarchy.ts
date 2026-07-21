import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for managing hierarchical user management
 */
export function useHierarchy() {
  const { user } = useAuth();

  // Fetch hierarchy info
  const { data: hierarchyInfo, isLoading: hierarchyLoading } = useQuery({
    queryKey: ["users", "hierarchy-info"],
    queryFn: () => usersApi.getHierarchyInfo(),
    enabled: !!user,
  });

  // Fetch manageable roles
  const { data: manageableRolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["users", "manageable-roles"],
    queryFn: () => usersApi.getManageableRoles(),
    enabled: !!user,
  });

  const manageableRoles = manageableRolesData?.data || [];
  const canCreateUsers = manageableRolesData?.meta?.can_create_users || false;
  const hierarchyLevel = manageableRolesData?.meta?.hierarchy_level || 0;

  return {
    // Hierarchy information
    hierarchyInfo,
    hierarchyLoading,
    
    // Manageable roles
    manageableRoles,
    rolesLoading,
    canCreateUsers,
    hierarchyLevel,
    
    // Derived states
    hasManagementCapability: canCreateUsers && manageableRoles.length > 0,
    canManageCount: hierarchyInfo?.capabilities?.can_manage_count || 0,
    
    // Helper functions
    canAssignRole: (roleName: string) => {
      return manageableRoles.some(role => role.name === roleName);
    },
    
    getRolesByLevel: () => {
      // Group roles by their typical hierarchy level
      const levelMap: Record<number, typeof manageableRoles> = {
        1: [], // Bureau level
        2: [], // Sector/Director level
        3: [], // Team Leader/Manager level
        4: [], // Officer/Engineer level
      };
      
      manageableRoles.forEach(role => {
        const name = role.name;
        
        if (name === 'bureau_head') {
          levelMap[1].push(role);
        } else if (name.includes('sector_head') || name.includes('director')) {
          levelMap[2].push(role);
        } else if (name.includes('team_leader') || name.includes('manager')) {
          levelMap[3].push(role);
        } else {
          levelMap[4].push(role);
        }
      });
      
      return levelMap;
    },
  };
}
