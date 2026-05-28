-- =============================================
-- PORTFOLIO PLATFORM — DATABASE SCHEMA
-- Run: psql -U your_user -d portfolio_platform -f schema.sql
-- =============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table (one per user)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline VARCHAR(200),           -- e.g. "Full Stack Developer"
  bio TEXT,
  photo_url VARCHAR(500),
  phone VARCHAR(30),
  location VARCHAR(100),
  linkedin_url VARCHAR(300),
  github_url VARCHAR(300),
  website_url VARCHAR(300),
  resume_url VARCHAR(500),
  skills TEXT[],                   -- array of skill strings
  contact_email VARCHAR(255),      -- email shown on public profile (can differ from login email)
  is_public BOOLEAN DEFAULT true,
  slug VARCHAR(100) UNIQUE,        -- e.g. "john-doe" → /portfolio/john-doe
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  issuer VARCHAR(200) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(200),
  credential_url VARCHAR(500),
  file_url VARCHAR(500),           -- Cloudinary URL
  file_type VARCHAR(20),           -- 'pdf' or 'image'
  is_verified BOOLEAN DEFAULT false,  -- admin can verify
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  live_url VARCHAR(500),
  github_url VARCHAR(500),
  image_url VARCHAR(500),
  tech_stack TEXT[],
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table (contact form → user's Gmail)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_company VARCHAR(200),
  subject VARCHAR(300) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Profile view logs (for analytics)
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_ip VARCHAR(50),
  viewer_agent TEXT,
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_user_id);
CREATE INDEX idx_messages_unread ON messages(recipient_user_id, is_read);
