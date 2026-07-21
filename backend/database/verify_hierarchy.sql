-- Hierarchical User Management Verification Script
-- Run this to verify your setup

-- Check all users with their roles
SELECT 
    u.id,
    u.name,
    u.email,
    u.department,
    GROUP_CONCAT(r.display_name SEPARATOR ', ') as roles,
    u.is_active
FROM users u
LEFT JOIN role_user ru ON u.id = ru.user_id
LEFT JOIN roles r ON ru.role_id = r.id
WHERE u.user_type = 'INTERNAL'
GROUP BY u.id, u.name, u.email, u.department, u.is_active
ORDER BY 
    CASE 
        WHEN r.name = 'bureau_head' THEN 1
        WHEN r.name LIKE '%_sector_head' THEN 2
        WHEN r.name LIKE '%_director' THEN 3
        WHEN r.name LIKE '%_team_leader' OR r.name LIKE '%_manager' THEN 4
        ELSE 5
    END,
    u.name;

-- Count users by role
SELECT 
    r.display_name,
    r.name,
    COUNT(ru.user_id) as user_count
FROM roles r
LEFT JOIN role_user ru ON r.id = ru.role_id
GROUP BY r.id, r.display_name, r.name
ORDER BY user_count DESC;

-- Check department distribution
SELECT 
    department,
    COUNT(*) as user_count,
    GROUP_CONCAT(DISTINCT r.display_name SEPARATOR ', ') as roles_in_dept
FROM users u
LEFT JOIN role_user ru ON u.id = ru.user_id
LEFT JOIN roles r ON ru.role_id = r.id
WHERE u.department IS NOT NULL
GROUP BY department
ORDER BY user_count DESC;

-- Verify organizational hierarchy (top 3 levels)
SELECT 
    'Level 1: Bureau Head' as level,
    COUNT(*) as count
FROM users u
JOIN role_user ru ON u.id = ru.user_id
JOIN roles r ON ru.role_id = r.id
WHERE r.name = 'bureau_head'

UNION ALL

SELECT 
    'Level 2: Sector Heads/Directors',
    COUNT(DISTINCT u.id)
FROM users u
JOIN role_user ru ON u.id = ru.user_id
JOIN roles r ON ru.role_id = r.id
WHERE r.name IN (
    'smart_city_sector_head',
    'development_sector_head',
    'operation_sector_head',
    'capacity_building_director',
    'research_director',
    'security_director',
    'project_director',
    'software_development_director',
    'infrastructure_director',
    'maintenance_director',
    'data_center_director',
    'quality_director'
)

UNION ALL

SELECT 
    'Level 3: Team Leaders/Managers',
    COUNT(DISTINCT u.id)
FROM users u
JOIN role_user ru ON u.id = ru.user_id
JOIN roles r ON ru.role_id = r.id
WHERE r.name IN (
    'training_team_leader',
    'software_team_leader',
    'maintenance_team_leader',
    'project_manager'
)

UNION ALL

SELECT 
    'Level 4: Officers/Engineers/Developers',
    COUNT(DISTINCT u.id)
FROM users u
JOIN role_user ru ON u.id = ru.user_id
JOIN roles r ON ru.role_id = r.id
WHERE r.name IN (
    'training_officer',
    'research_officer',
    'security_officer',
    'software_developer',
    'infrastructure_engineer',
    'support_officer',
    'cloud_engineer',
    'quality_officer'
);

-- Find users without roles (should be none for INTERNAL users)
SELECT 
    u.id,
    u.name,
    u.email,
    u.user_type,
    'NO ROLES ASSIGNED' as warning
FROM users u
LEFT JOIN role_user ru ON u.id = ru.user_id
WHERE ru.role_id IS NULL
AND u.user_type = 'INTERNAL';

-- Find duplicate role assignments (same user, same role multiple times)
SELECT 
    u.name,
    u.email,
    r.display_name,
    COUNT(*) as assignment_count,
    'DUPLICATE ASSIGNMENT' as warning
FROM role_user ru
JOIN users u ON ru.user_id = u.id
JOIN roles r ON ru.role_id = r.id
GROUP BY u.id, r.id, u.name, u.email, r.display_name
HAVING COUNT(*) > 1;
