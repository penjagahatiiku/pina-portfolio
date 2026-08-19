-- ============================================
-- PINA Subholding Portfolio Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS table (Admin info for PINA subholding)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  profession VARCHAR(255),
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS table
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  images_gallery JSONB DEFAULT '[]'::jsonb,
  live_demo_url VARCHAR(500),
  github_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  completion_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TECHNOLOGIES table
-- ============================================
CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500),
  category VARCHAR(100)
);

-- ============================================
-- PROJECT_TECHNOLOGIES junction table
-- ============================================
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

-- ============================================
-- ORDERS table (Service requests)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read access for portfolio data
CREATE POLICY "Public can read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public can read projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Public can read technologies" ON technologies
  FOR SELECT USING (true);

CREATE POLICY "Public can read project_technologies" ON project_technologies
  FOR SELECT USING (true);

-- Public can insert orders (service requests)
CREATE POLICY "Public can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Service role has full access (bypasses RLS by default)
-- These policies are for the anon key; service role key bypasses RLS

-- ============================================
-- Seed Data - Default admin user
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO users (username, password_hash, email, bio, profession, social_links)
VALUES (
  'admin',
  '$2b$10$rqDGn3kMXnXxGgKmE7j3/.TQT0tXvF8PmPgERS.DdHdqQAuz7gXOm',
  'admin@pinasubholding.com',
  'PINA subholding adalah perusahaan konsultan IT dan pengembangan perangkat lunak yang berfokus pada solusi digital inovatif. Kami menggabungkan keahlian teknis dengan desain kreatif untuk menghadirkan produk digital berkualitas tinggi yang memenuhi kebutuhan bisnis modern.',
  'IT Consultant & Software House',
  '[{"platform": "GitHub", "url": "https://github.com/pinasubholding"}, {"platform": "LinkedIn", "url": "https://linkedin.com/company/pinasubholding"}, {"platform": "Twitter", "url": "https://twitter.com/pinasubholding"}, {"platform": "Instagram", "url": "https://instagram.com/pinasubholding"}]'
) ON CONFLICT (username) DO NOTHING;

-- Seed Technologies
INSERT INTO technologies (name, icon_url, category) VALUES
  ('React', null, 'Frontend'),
  ('Next.js', null, 'Frontend'),
  ('TypeScript', null, 'Frontend'),
  ('Tailwind CSS', null, 'Frontend'),
  ('Node.js', null, 'Backend'),
  ('Express', null, 'Backend'),
  ('PostgreSQL', null, 'Database'),
  ('Supabase', null, 'Backend'),
  ('Three.js', null, 'Frontend'),
  ('Figma', null, 'Design'),
  ('Docker', null, 'DevOps'),
  ('Vercel', null, 'DevOps'),
  ('Python', null, 'Backend'),
  ('Flutter', null, 'Mobile'),
  ('Firebase', null, 'Backend')
ON CONFLICT DO NOTHING;

-- Seed sample projects (using the admin user)
DO $$
DECLARE
  admin_id UUID;
  proj1_id UUID;
  proj2_id UUID;
  proj3_id UUID;
  tech_react UUID;
  tech_next UUID;
  tech_ts UUID;
  tech_tailwind UUID;
  tech_supabase UUID;
  tech_three UUID;
  tech_node UUID;
  tech_postgres UUID;
  tech_flutter UUID;
  tech_firebase UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE username = 'admin';
  
  SELECT id INTO tech_react FROM technologies WHERE name = 'React';
  SELECT id INTO tech_next FROM technologies WHERE name = 'Next.js';
  SELECT id INTO tech_ts FROM technologies WHERE name = 'TypeScript';
  SELECT id INTO tech_tailwind FROM technologies WHERE name = 'Tailwind CSS';
  SELECT id INTO tech_supabase FROM technologies WHERE name = 'Supabase';
  SELECT id INTO tech_three FROM technologies WHERE name = 'Three.js';
  SELECT id INTO tech_node FROM technologies WHERE name = 'Node.js';
  SELECT id INTO tech_postgres FROM technologies WHERE name = 'PostgreSQL';
  SELECT id INTO tech_flutter FROM technologies WHERE name = 'Flutter';
  SELECT id INTO tech_firebase FROM technologies WHERE name = 'Firebase';

  -- Project 1
  INSERT INTO projects (id, user_id, title, description, thumbnail_url, images_gallery, live_demo_url, github_url, is_featured, completion_date)
  VALUES (
    uuid_generate_v4(), admin_id,
    'E-Commerce Platform Modern',
    'Platform e-commerce lengkap dengan fitur keranjang belanja, pembayaran terintegrasi, dan dashboard admin yang komprehensif. Dibangun dengan arsitektur modern untuk performa optimal.',
    null, '[]', 'https://demo.example.com', 'https://github.com/pinasubholding/ecommerce', true, '2026-03-15'
  ) RETURNING id INTO proj1_id;

  -- Project 2
  INSERT INTO projects (id, user_id, title, description, thumbnail_url, images_gallery, live_demo_url, github_url, is_featured, completion_date)
  VALUES (
    uuid_generate_v4(), admin_id,
    'Smart Dashboard Analytics',
    'Dashboard analitik real-time dengan visualisasi data interaktif, grafik dinamis, dan laporan otomatis. Mendukung multiple data source dan custom KPI tracking.',
    null, '[]', 'https://dashboard.example.com', 'https://github.com/pinasubholding/dashboard', true, '2026-01-20'
  ) RETURNING id INTO proj2_id;

  -- Project 3
  INSERT INTO projects (id, user_id, title, description, thumbnail_url, images_gallery, live_demo_url, github_url, is_featured, completion_date)
  VALUES (
    uuid_generate_v4(), admin_id,
    'Mobile Banking App',
    'Aplikasi mobile banking dengan fitur transfer, pembayaran tagihan, investasi, dan laporan keuangan personal. Didesain dengan fokus pada keamanan dan pengalaman pengguna.',
    null, '[]', null, 'https://github.com/pinasubholding/banking-app', true, '2025-11-10'
  ) RETURNING id INTO proj3_id;

  -- Link technologies to projects
  INSERT INTO project_technologies (project_id, technology_id) VALUES
    (proj1_id, tech_next), (proj1_id, tech_ts), (proj1_id, tech_tailwind), (proj1_id, tech_supabase), (proj1_id, tech_postgres),
    (proj2_id, tech_react), (proj2_id, tech_ts), (proj2_id, tech_node), (proj2_id, tech_tailwind), (proj2_id, tech_three),
    (proj3_id, tech_flutter), (proj3_id, tech_firebase), (proj3_id, tech_node);
END $$;
