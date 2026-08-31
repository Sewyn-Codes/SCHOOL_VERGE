-- =========================================================================
-- ScholarVerge.com - PostgreSQL Enterprise Relational Multi-Tenant Schema
-- Multi-Tenant Academic Tutoring, Turnitin Originality, Offline WhatsApp Payments,
-- 1-on-1 Consultation Bookings, Direct Document Email Dispatch & Verified Reviews
-- =========================================================================

-- 1. Users Table (Core Authentication & Credentials)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_uuid VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'student' | 'superadmin'
    auth_provider VARCHAR(50) DEFAULT 'local', -- 'local' | 'google'
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table (Multi-Tenant Academic Profiles)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    university VARCHAR(255) NOT NULL,
    academic_level VARCHAR(100) NOT NULL,
    major_field VARCHAR(255) NOT NULL,
    preferred_citation VARCHAR(50) DEFAULT 'APA 7th',
    target_gpa NUMERIC(3, 2) DEFAULT 3.90,
    current_gpa NUMERIC(3, 2) DEFAULT 3.72,
    whatsapp_number VARCHAR(50) DEFAULT '+16677757597',
    avatar_url TEXT,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verified Tutors Table
CREATE TABLE IF NOT EXISTS tutors (
    id SERIAL PRIMARY KEY,
    tutor_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    subjects TEXT NOT NULL,
    whatsapp_number VARCHAR(50) DEFAULT '+16677757597',
    direct_email VARCHAR(255) DEFAULT 'scholarverge@gmail.com',
    rating NUMERIC(3, 2) DEFAULT 4.98,
    total_reviews INTEGER DEFAULT 1400,
    active_load INTEGER DEFAULT 8,
    status VARCHAR(50) DEFAULT 'available',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table (Offline WhatsApp Payment Coordination)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(50) REFERENCES students(student_id),
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    tutor_name VARCHAR(255) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    academic_level VARCHAR(100) NOT NULL,
    pages INTEGER NOT NULL,
    citation_style VARCHAR(100) NOT NULL,
    deadline VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    progress_percentage INTEGER DEFAULT 45,
    price_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'offline_whatsapp',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending_whatsapp_confirmation',
    turnitin_ai_score NUMERIC(4, 2) DEFAULT 0.00,
    turnitin_similarity NUMERIC(4, 2) DEFAULT 0.40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_payment_status CHECK (
        payment_status IN ('pending_whatsapp_confirmation', 'payment_verified', 'paid', 'refunded')
    )
);

-- 5. 1-on-1 Consultation Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    tutor_name VARCHAR(255) NOT NULL,
    session_type VARCHAR(255) NOT NULL,
    scheduled_date VARCHAR(50) NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'Google Meet',
    meeting_link TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Document & Rubric Direct Email Dispatches Table
CREATE TABLE IF NOT EXISTS document_uploads (
    id SERIAL PRIMARY KEY,
    upload_id VARCHAR(50) UNIQUE NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    assignment_topic VARCHAR(500) NOT NULL,
    instructions TEXT,
    citation_style VARCHAR(100) DEFAULT 'APA 7th',
    deadline VARCHAR(100),
    target_email VARCHAR(255) DEFAULT 'scholarverge@gmail.com',
    status VARCHAR(50) DEFAULT 'dispatched_to_email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Verified Post-Delivery Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    tutor_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    grade_received VARCHAR(50) DEFAULT 'A+',
    highlights TEXT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    verified_order_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    reset_token VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
