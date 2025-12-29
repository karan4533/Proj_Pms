-- Create fresh admin user with simple password
-- Email: admin@ggs.com
-- Password: password123

-- Delete if exists
DELETE FROM members WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@ggs.com');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@ggs.com');
DELETE FROM users WHERE email = 'admin@ggs.com';

-- Insert new admin
INSERT INTO users (id, name, email, password, created_at, updated_at, skills)
VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    'Admin User',
    'admin@ggs.com',
    '$2b$10$rZ5h2LWzYq8VkK3mXJ5VYeHZKJxPQVz8xGxH3YJ5VYeHZKJxPQVz8O',  -- password123
    now(),
    now(),
    '["System Administration"]'::jsonb
);

-- Add admin to workspace
INSERT INTO members (workspace_id, user_id, role, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid,
    'ADMIN',
    now(),
    now()
);

-- Verify
SELECT email, name FROM users WHERE email = 'admin@ggs.com';
