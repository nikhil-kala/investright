-- Check Database Status and Troubleshoot Login Issues
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist
SELECT 'Checking if tables exist...' as status;

SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_sessions', 'user_permissions');

-- 2. If users table exists, check its structure
SELECT 'Checking users table structure...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if any users exist
SELECT 'Checking if users exist...' as status;

SELECT 
  COUNT(*) as user_count
FROM users;

-- 4. If users exist, show them (without password hashes)
SELECT 'Showing existing users...' as status;

SELECT 
  id,
  username,
  email,
  role,
  is_active,
  created_at
FROM users;

-- 5. Check if functions exist
SELECT 'Checking if authentication functions exist...' as status;

SELECT 
  routine_name,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('authenticate_user', 'hash_password', 'create_admin_user');

-- 6. Test the hash_password function if it exists
SELECT 'Testing password hashing...' as status;

SELECT 
  'Invest123' as password,
  encode(sha256('Invest123'::bytea), 'hex') as expected_hash;

-- 7. Summary
SELECT '=== SUMMARY ===' as summary;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '✅ Users table exists'
    ELSE '❌ Users table missing - Run supabase-user-setup.sql first'
  END as users_table_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM users) 
    THEN '✅ Users exist in database'
    ELSE '❌ No users found - Run supabase-user-setup.sql first'
  END as users_exist_status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'authenticate_user') 
    THEN '✅ Authentication function exists'
    ELSE '❌ Authentication function missing - Run supabase-user-setup.sql first'
  END as auth_function_status;
