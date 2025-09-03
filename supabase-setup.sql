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

-- 3. Create users table for user management
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

-- 4. Create user_sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 5. Create conversations table for conversation management
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create chat_transcripts table for email functionality
CREATE TABLE IF NOT EXISTS chat_transcripts (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  conversation_summary TEXT,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- 7. Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public inserts (anyone can submit)
CREATE POLICY "Allow public inserts on contact_submissions" 
ON contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on chat_messages" 
ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on conversations" 
ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts on chat_transcripts" 
ON chat_transcripts FOR INSERT WITH CHECK (true);

-- Users can read their own messages and conversations
CREATE POLICY "Allow users to read their own chat messages" 
ON chat_messages FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow users to read their own conversations" 
ON conversations FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Admin dashboard requires listing all conversations across users.
-- For simplicity, enable public read on chat_messages and conversations. Tighten later if needed.
CREATE POLICY "Allow public read on chat_messages" 
ON chat_messages FOR SELECT USING (true);

CREATE POLICY "Allow public read on conversations" 
ON conversations FOR SELECT USING (true);

-- 9. Create policies for reading (users can only see their own messages)
CREATE POLICY "Allow public read on contact_submissions" 
ON contact_submissions FOR SELECT USING (true);

CREATE POLICY "Allow public read on chat_transcripts" 
ON chat_transcripts FOR SELECT USING (true);

-- 10. Create policies for users table
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_email ON chat_messages(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender);

CREATE INDEX IF NOT EXISTS idx_conversations_user_email ON conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_chat_transcripts_user_email ON chat_transcripts(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_created_at ON chat_transcripts(created_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 8. Insert some sample data for testing
INSERT INTO contact_submissions (name, email, subject, message) VALUES
('John Doe', 'john@example.com', 'Investment Question', 'I would like to know more about index funds.'),
('Jane Smith', 'jane@example.com', 'Platform Inquiry', 'What are the minimum investment amounts?')
ON CONFLICT DO NOTHING;

-- 9. Create sample users for testing
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@investright.com', encode(sha256('admin123'::bytea), 'hex'), 'admin', true),
('john_doe', 'john@example.com', encode(sha256('password123'::bytea), 'hex'), 'user', true),
('jane_smith', 'jane@example.com', encode(sha256('password123'::bytea), 'hex'), 'user', true),
('moderator1', 'mod@example.com', encode(sha256('password123'::bytea), 'hex'), 'moderator', true)
ON CONFLICT (email) DO NOTHING;

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

-- 10. Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder - implement proper hashing in your application
  -- For now, we'll use a simple hash for demonstration
  RETURN encode(sha256(password::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to create admin user
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
  IF EXISTS (SELECT 1 FROM users WHERE email = admin_email OR username = admin_email) THEN
    RAISE EXCEPTION 'Admin user already exists';
  END IF;
  
  -- Insert admin user
  INSERT INTO users (username, email, password_hash, role, is_active)
  VALUES (admin_username, admin_email, hash_password(admin_password), 'admin', true)
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Create a function to authenticate users
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

-- 13. Create a function to get user conversations
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

-- 14. Verify tables were created
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('contact_submissions', 'chat_messages', 'chat_transcripts', 'users', 'user_sessions')
ORDER BY table_name;

-- 15. Show table structure
\d contact_submissions;
\d chat_messages;
\d chat_transcripts;
\d users;
\d user_sessions;
