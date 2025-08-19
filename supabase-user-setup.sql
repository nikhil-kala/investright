-- Supabase User Management Setup
-- Run this in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- 2. Create user_sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 3. Create user_permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_name VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, permission_name)
);

-- 4. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for users table
-- For now, allow all operations - you can restrict this later based on your needs
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);

-- 6. Create policies for user_sessions table
-- Allow all operations for now - restrict later as needed
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);

-- 7. Create policies for user_permissions table
-- Allow all operations for now - restrict later as needed
CREATE POLICY "Allow all operations on user_permissions" ON user_permissions FOR ALL USING (true);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_name ON user_permissions(permission_name);

-- 9. Create function to hash passwords (you'll need to implement this in your app)
-- Note: In production, use proper password hashing libraries like bcrypt
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - implement proper hashing in your application
  -- For now, we'll use a simple hash for demonstration
  RETURN encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_username VARCHAR,
  admin_email VARCHAR,
  admin_password VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
  user_id INTEGER;
BEGIN
  -- Check if admin user already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = admin_email OR username = admin_username) THEN
    RAISE EXCEPTION 'Admin user already exists';
  END IF;
  
  -- Insert admin user
  INSERT INTO users (username, email, password_hash, role, is_active)
  VALUES (admin_username, admin_email, hash_password(admin_password), 'admin', true)
  RETURNING id INTO user_id;
  
  -- Grant admin permissions
  INSERT INTO user_permissions (user_id, permission_name, granted_by)
  VALUES 
    (user_id, 'user_management', user_id),
    (user_id, 'system_admin', user_id),
    (user_id, 'data_access', user_id),
    (user_id, 'analytics', user_id);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create the admin user with your specified credentials
-- Note: This will create the user with the hashed password
SELECT create_admin_user(
  'kale.nikhil@gmail.com', 
  'kale.nikhil@gmail.com', 
  'Invest123'
);

-- 12. Verify the admin user was created
SELECT 
  id,
  username,
  email,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'kale.nikhil@gmail.com';

-- 13. Show all permissions for the admin user
SELECT 
  u.username,
  u.email,
  up.permission_name,
  up.granted_at
FROM users u
JOIN user_permissions up ON u.id = up.user_id
WHERE u.email = 'kale.nikhil@gmail.com';

-- 14. Create a function to authenticate users
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email VARCHAR,
  user_password VARCHAR
)
RETURNS TABLE (
  user_id INTEGER,
  username VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_active
  FROM users u
  WHERE u.email = user_email 
    AND u.password_hash = hash_password(user_password)
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 15. Test authentication (this should return your admin user)
SELECT * FROM authenticate_user('kale.nikhil@gmail.com', 'Invest123');

-- 16. Show table structure
\d users;
\d user_sessions;
\d user_permissions;
