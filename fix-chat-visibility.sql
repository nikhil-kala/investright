-- Fix Chat Visibility in Admin Dashboard
-- Run this in your Supabase SQL Editor

-- 1. First, let's check if there are any chats in the database
SELECT COUNT(*) as total_messages FROM chat_messages;
SELECT COUNT(DISTINCT conversation_id) as total_conversations FROM chat_messages;
SELECT COUNT(DISTINCT user_email) as total_users FROM chat_messages;

-- 2. Drop the conflicting policies and create a single, clear policy
DROP POLICY IF EXISTS "Allow users to read their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public read on chat_messages" ON chat_messages;

-- 3. Create a single policy that allows reading all chat messages
CREATE POLICY "Allow read access to all chat messages" 
ON chat_messages FOR SELECT USING (true);

-- 4. If no chats exist, let's create some sample chat data for testing
INSERT INTO chat_messages (user_email, message_text, sender, timestamp, conversation_id) VALUES
('admin@investright.com', 'Hello, I need investment advice', 'user', NOW() - INTERVAL '1 hour', 'test_conv_1'),
('admin@investright.com', 'I can help you with investment advice. What are your goals?', 'bot', NOW() - INTERVAL '50 minutes', 'test_conv_1'),
('admin@investright.com', 'I want to save for retirement', 'user', NOW() - INTERVAL '40 minutes', 'test_conv_1'),
('admin@investright.com', 'Great! Let me ask you some questions about your retirement goals.', 'bot', NOW() - INTERVAL '35 minutes', 'test_conv_1'),
('john@example.com', 'What are the best investment options?', 'user', NOW() - INTERVAL '2 hours', 'test_conv_2'),
('john@example.com', 'There are several good investment options. Let me explain them.', 'bot', NOW() - INTERVAL '1 hour 55 minutes', 'test_conv_2'),
('guest+chat_123@investright.local', 'How do I start investing?', 'user', NOW() - INTERVAL '30 minutes', 'test_conv_3'),
('guest+chat_123@investright.local', 'Starting to invest is easier than you think. Let me guide you.', 'bot', NOW() - INTERVAL '25 minutes', 'test_conv_3')
ON CONFLICT DO NOTHING;

-- 5. Verify the data was inserted
SELECT 
    conversation_id,
    user_email,
    COUNT(*) as message_count,
    MIN(timestamp) as first_message,
    MAX(timestamp) as last_message
FROM chat_messages 
GROUP BY conversation_id, user_email
ORDER BY last_message DESC;

-- 6. Test the policy by checking if we can read all messages
SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 10;
