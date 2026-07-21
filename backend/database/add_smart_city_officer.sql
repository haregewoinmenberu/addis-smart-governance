-- Add Smart City Officer Role
-- Run this in your MySQL client or via Laravel tinker

-- 1. Insert the Smart City Officer role if it doesn't exist
INSERT INTO roles (name, display_name, description, created_at, updated_at)
SELECT 'smart_city_officer', 'Smart City Officer', 'Implements smart city initiatives and coordinates with stakeholders.', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'smart_city_officer'
);

-- 2. Get the role ID
SET @role_id = (SELECT id FROM roles WHERE name = 'smart_city_officer');

-- 3. Assign permissions to Smart City Officer
INSERT INTO permission_role (permission_id, role_id, created_at, updated_at)
SELECT p.id, @role_id, NOW(), NOW()
FROM permissions p
WHERE p.name IN (
    'view_dashboard',
    'view_requests',
    'receive_requests',
    'view_research',
    'view_reports',
    'view_notifications',
    'send_notifications'
)
AND NOT EXISTS (
    SELECT 1 FROM permission_role pr 
    WHERE pr.permission_id = p.id AND pr.role_id = @role_id
);

-- 4. Verify the setup
SELECT 
    r.name,
    r.display_name,
    COUNT(pr.permission_id) as permission_count
FROM roles r
LEFT JOIN permission_role pr ON r.id = pr.role_id
WHERE r.name = 'smart_city_officer'
GROUP BY r.id, r.name, r.display_name;

-- 5. Show Smart City Sector Head can now create users
SELECT 
    'Smart City Sector Head' as role,
    'Can now create Smart City Officers' as capability,
    (SELECT COUNT(*) FROM roles WHERE name = 'smart_city_officer') as officer_role_exists;
