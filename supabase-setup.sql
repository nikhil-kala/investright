-- Supabase Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create chat_messages table with improved structure
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'bot')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id VARCHAR(255) NOT NULL
);

-- 3. Create chat_transcripts table for email functionality
CREATE TABLE IF NOT EXISTS chat_transcripts (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  conversation_summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- 4. Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_transcripts ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for public inserts (anyone can submit)
CREATE POLICY "Allow public inserts on contact_submissions" 
ON contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on chat_messages" 
ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on chat_transcripts" 
ON chat_transcripts FOR INSERT WITH CHECK (true);

-- 6. Create policies for reading (users can only see their own messages)
CREATE POLICY "Allow public read on contact_submissions" 
ON contact_submissions FOR SELECT USING (true);

CREATE POLICY "Allow users to read their own chat messages" 
ON chat_messages FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow public read on chat_transcripts" 
ON chat_transcripts FOR SELECT USING (true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_email ON chat_messages(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);

CREATE INDEX IF NOT EXISTS idx_chat_transcripts_user_email ON chat_transcripts(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_created_at ON chat_transcripts(created_at);

-- 8. Insert some sample data for testing
INSERT INTO contact_submissions (name, email, subject, message) VALUES
('John Doe', 'john@example.com', 'Investment Question', 'I would like to know more about index funds.'),
('Jane Smith', 'jane@example.com', 'Platform Inquiry', 'What are the minimum investment amounts?')
ON CONFLICT DO NOTHING;

-- 9. Create a function to get conversation summary
CREATE OR REPLACE FUNCTION get_conversation_summary(conv_id VARCHAR)
RETURNS TABLE (
  message_count INTEGER,
  first_message TEXT,
  last_message TEXT,
  conversation_duration INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as message_count,
    MIN(message_text) as first_message,
    MAX(message_text) as last_message,
    MAX(timestamp) - MIN(timestamp) as conversation_duration
  FROM chat_messages 
  WHERE conversation_id = conv_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create a function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_email_param VARCHAR)
RETURNS TABLE (
  conversation_id VARCHAR,
  message_count BIGINT,
  first_message_time TIMESTAMP WITH TIME ZONE,
  last_message_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.conversation_id,
    COUNT(*) as message_count,
    MIN(cm.timestamp) as first_message_time,
    MAX(cm.timestamp) as last_message_time
  FROM chat_messages cm
  WHERE cm.user_email = user_email_param
  GROUP BY cm.conversation_id
  ORDER BY MAX(cm.timestamp) DESC;
END;
$$ LANGUAGE plpgsql;

-- 11. Verify tables were created
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('contact_submissions', 'chat_messages', 'chat_transcripts')
ORDER BY table_name;

-- 12. Show table structure
\d contact_submissions;
\d chat_messages;
\d chat_transcripts;
