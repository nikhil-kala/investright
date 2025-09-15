-- Delete users with UID 6-10 from the database
-- This script will safely remove users and their associated data

-- First, let's check which users exist with UID 6-10
SELECT id, username, email, role, created_at, is_active 
FROM users 
WHERE id BETWEEN 6 AND 10
ORDER BY id;

-- Delete chat messages for these users
DELETE FROM chat_messages 
WHERE user_id BETWEEN 6 AND 10;

-- Delete conversations for these users
DELETE FROM conversations 
WHERE user_id BETWEEN 6 AND 10;

-- Delete chat transcripts for these users
DELETE FROM chat_transcripts 
WHERE user_id BETWEEN 6 AND 10;

-- Delete user sessions for these users
DELETE FROM user_sessions 
WHERE user_id BETWEEN 6 AND 10;

-- Delete contact submissions for these users (if any)
DELETE FROM contact_submissions 
WHERE user_id BETWEEN 6 AND 10;

-- Finally, delete the users themselves
DELETE FROM users 
WHERE id BETWEEN 6 AND 10;

-- Verify the deletion
SELECT 'Users deleted successfully' as status;
SELECT COUNT(*) as remaining_users FROM users;
SELECT id, username, email FROM users ORDER BY id;
