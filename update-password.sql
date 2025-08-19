-- Update Password for User kale.nikhil@gmail.com
-- Run this in your Supabase SQL Editor

-- First, let's check the current user
SELECT 
  id,
  username,
  email,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'kale.nikhil@gmail.com';

-- Update the password hash for the user
-- The new password is: Invest123
UPDATE users 
SET 
  password_hash = encode(sha256('Invest123'::bytea), 'hex'),
  updated_at = NOW()
WHERE email = 'kale.nikhil@gmail.com';

-- Verify the password was updated
SELECT 
  id,
  username,
  email,
  role,
  is_active,
  updated_at
FROM users 
WHERE email = 'kale.nikhil@gmail.com';

-- Test the new password with the authenticate_user function
SELECT * FROM authenticate_user('kale.nikhil@gmail.com', 'Invest123');

-- Show success message
SELECT 'Password updated successfully for user: kale.nikhil@gmail.com' as message;
