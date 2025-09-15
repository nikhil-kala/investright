-- Update authenticate_user function to include created_at and last_login
-- Run this in your Supabase SQL Editor

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS authenticate_user(VARCHAR, VARCHAR);

-- Create the updated function with created_at and last_login fields
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email VARCHAR,
  user_password VARCHAR
)
RETURNS TABLE (
  user_id INTEGER,
  username VARCHAR,
  email VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    u.created_at,
    u.last_login
  FROM users u
  WHERE u.email = user_email 
    AND u.password_hash = hash_password(user_password)
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Test the updated function
SELECT 'Testing updated authenticate_user function...' as status;
SELECT * FROM authenticate_user('admin@investright.club', 'Invest123');

-- Show the function definition
SELECT 'Function definition:' as status;
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'authenticate_user';
