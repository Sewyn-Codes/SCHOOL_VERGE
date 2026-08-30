-- ==========================================================================
-- ScholarVerge.com - Official PostgreSQL Production Database Schema
-- Multi-Tenant Academic Tutoring, Escrow Protection, and Super Admin Management
-- ==========================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Role-based authentication: student, tutor, superadmin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'superadmin')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    university VARCHAR(200) NOT NULL,
    academic_level VARCHAR(50) NOT NULL CHECK (academic_level IN ('highschool', 'undergraduate', 'masters', 'doctoral')),
    major_field VARCHAR(150) NOT NULL,
    preferred_citation VARCHAR(50) NOT NULL DEFAULT 'APA 7th',
    target_gpa NUMERIC(3, 2) DEFAULT 3.80,
    current_gpa NUMERIC(3, 2) DEFAULT 3.50,
    whatsapp_number VARCHAR(50),
    phone_number VARCHAR(50),
    country VARCHAR(100) DEFAULT 'United States',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    total_orders INTEGER DEFAULT 0,
    escrow_balance NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tutor Profiles Table
CREATE TABLE IF NOT EXISTS tutor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 5,
    rating NUMERIC(3, 2) DEFAULT 4.95,
    total_reviews INTEGER DEFAULT 0,
    success_rate VARCHAR(20) DEFAULT '99.8%',
    subjects TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    specialties TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    whatsapp_number VARCHAR(50) DEFAULT '+16677757597',
    direct_email VARCHAR(255) DEFAULT 'scholarverge@gmail.com',
    avatar_url TEXT NOT NULL,
    bio TEXT NOT NULL,
    active_load INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders & Escrow Vault Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES tutor_profiles(id) ON DELETE SET NULL,
    topic VARCHAR(300) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    academic_level VARCHAR(50) NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    word_count INTEGER GENERATED ALWAYS AS (page_count * 275) STORED,
    citation_style VARCHAR(50) NOT NULL DEFAULT 'APA 7th',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    instructions TEXT NOT NULL,
    attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (
        status IN ('pending_assignment', 'in_progress', 'draft_ready', 'review_pending', 'completed', 'cancelled')
    ),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    base_amount NUMERIC(10, 2) NOT NULL,
    escrow_amount NUMERIC(10, 2) NOT NULL,
    escrow_status VARCHAR(50) NOT NULL DEFAULT 'held_secure' CHECK (
        escrow_status IN ('held_secure', 'partially_released', 'released_to_tutor', 'refunded_to_student')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Turnitin & AI Authenticity Reports
CREATE TABLE IF NOT EXISTS turnitin_audits (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    report_uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    ai_score NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    similarity_score NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    sources_verified INTEGER DEFAULT 0,
    passed_audit BOOLEAN DEFAULT TRUE,
    pdf_report_url TEXT,
    verified_by VARCHAR(100) DEFAULT 'ScholarVerge Integrity Engine',
    audit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Live Chat Messages (Student <-> Tutor <-> Admin)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('student', 'tutor', 'superadmin')),
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Escrow Transactions Audit Ledger
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id SERIAL PRIMARY KEY,
    transaction_ref VARCHAR(100) NOT NULL UNIQUE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    action VARCHAR(50) NOT NULL CHECK (action IN ('deposit_hold', 'release_payout', 'refund_issued', 'adjustment')),
    gateway VARCHAR(50) DEFAULT 'Escrow Secure Vault',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================================
-- Initial Seed Data: Super Admin & Senior Tutors
-- ==========================================================================

-- Insert Super Admin User
INSERT INTO users (email, password_hash, role, status)
VALUES ('admin@scholarverge.com', 'scrypt:32768:8:1$admin_secure_hash', 'superadmin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Senior Tutors Users & Profiles
INSERT INTO users (email, password_hash, role, status)
VALUES 
    ('claire.bennett@scholarverge.com', 'scrypt:32768:8:1$tutor_hash_1', 'tutor', 'active'),
    ('oliver.harrison@scholarverge.com', 'scrypt:32768:8:1$tutor_hash_2', 'tutor', 'active'),
    ('sophia.mitchell@scholarverge.com', 'scrypt:32768:8:1$tutor_hash_3', 'tutor', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Tutor Profile: Claire Bennett
INSERT INTO tutor_profiles (
    user_id, full_name, title, degree, experience_years, rating, total_reviews, success_rate, 
    subjects, specialties, whatsapp_number, direct_email, avatar_url, bio, active_load, status
)
SELECT 
    id,
    'Claire Bennett',
    'Senior Academic Tutor & Legal-Technical Writing Specialist',
    'Master’s Degree in English Literature & Information Technology Law',
    6,
    4.98,
    1420,
    '99.8%',
    ARRAY['English', 'Information Technology', 'History', 'Law'],
    ARRAY['Legal Memorandums & Case Briefs (IRAC/CRAC)', 'IT Systems Architecture & Cyberlaw Compliance', 'Historiographical Synthesis & Archival Analysis', 'OSCOLA, Bluebook, APA 7th & Chicago Manual of Style'],
    '+16677757597',
    'scholarverge@gmail.com',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'I’m an enthusiastic academic tutor for over 6 years specializing in English, information technology, history, and law. With a strong academic background and a Master’s degree, I provide personalized guidance designed to match each student’s academic level, subject, and individual requirements.',
    8,
    'available'
FROM users WHERE email = 'claire.bennett@scholarverge.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert Tutor Profile: Oliver Harrison
INSERT INTO tutor_profiles (
    user_id, full_name, title, degree, experience_years, rating, total_reviews, success_rate, 
    subjects, specialties, whatsapp_number, direct_email, avatar_url, bio, active_load, status
)
SELECT 
    id,
    'Oliver Harrison',
    'Quantitative Finance & Applied Economics Senior Lead',
    'M.Sc. in Econometrics & Mathematical Statistics',
    5,
    4.97,
    1280,
    '99.7%',
    ARRAY['Business', 'Economics', 'Finance', 'Mathematics', 'Statistics'],
    ARRAY['Econometric Modeling & Time-Series Forecasting (R, Stata, Python)', 'Corporate Valuation & DCF Financial Models', 'Statistical Hypothesis Testing & ANOVA/Regression in SPSS', 'Harvard Business School Case Study Analysis'],
    '+16677757597',
    'scholarverge@gmail.com',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'I’m a seasoned academic tutor with over 5 years of experience specializing in business, economics, finance, mathematics, and statistics. I hold a Master’s degree in Econometrics and have helped hundreds of undergraduate and graduate students excel.',
    12,
    'available'
FROM users WHERE email = 'oliver.harrison@scholarverge.com'
ON CONFLICT (user_id) DO NOTHING;

-- Insert Tutor Profile: Sophia Mitchell
INSERT INTO tutor_profiles (
    user_id, full_name, title, degree, experience_years, rating, total_reviews, success_rate, 
    subjects, specialties, whatsapp_number, direct_email, avatar_url, bio, active_load, status
)
SELECT 
    id,
    'Sophia Mitchell',
    'Senior Clinical Nursing & Health Sciences Academic Specialist',
    'M.S.N. in Clinical Nursing & M.S. in Health Psychology',
    6,
    4.99,
    1650,
    '99.9%',
    ARRAY['Nursing', 'Healthcare', 'Psychology'],
    ARRAY['Evidence-Based Practice (EBP) & PICOT Question Synthesis', 'Nursing Care Plans (NANDA-I, NIC & NOC Interventions)', 'Systematic Literature Reviews & PRISMA Protocols', 'APA 7th Clinical Formatting & Peer-Reviewed Sourcing'],
    '+16677757597',
    'scholarverge@gmail.com',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    'I’m a masters degree holder and a dedicated academic tutor with a strong focus on nursing, healthcare, and psychology. My areas of support include nursing theory, healthcare concepts, psychology, research methods, case-study analysis, evidence-based practice, and academic writing.',
    15,
    'available'
FROM users WHERE email = 'sophia.mitchell@scholarverge.com'
ON CONFLICT (user_id) DO NOTHING;
