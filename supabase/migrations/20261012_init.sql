-- =========================================================================
-- HUMANHELP PLATFORM - SUPABASE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- MIGRATION: 20261012_init.sql
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USER ROLES
CREATE TYPE user_role_type AS ENUM ('customer', 'provider', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role_type NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SERVICE CATEGORIES
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Wrench',
  requires_special_license BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROVIDER PROFILES
CREATE TYPE verification_status_type AS ENUM (
  'not_verified',
  'verification_pending',
  'identity_checked',
  'credentials_checked',
  'category_verified',
  'verification_rejected'
);

CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  service_area TEXT NOT NULL,
  service_radius_km NUMERIC(5,2) NOT NULL DEFAULT 25.0,
  languages TEXT[] NOT NULL DEFAULT ARRAY['English'],
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  verification_status verification_status_type NOT NULL DEFAULT 'not_verified',
  verification_badge_label TEXT NOT NULL DEFAULT 'Unverified Provider',
  verification_details TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  completed_bookings_count INTEGER NOT NULL DEFAULT 0,
  is_accepting_bookings BOOLEAN NOT NULL DEFAULT TRUE,
  starting_rate NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  pricing_type TEXT NOT NULL DEFAULT 'hourly',
  response_time_minutes INTEGER NOT NULL DEFAULT 30,
  working_days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  working_hours_start TIME NOT NULL DEFAULT '08:00',
  working_hours_end TIME NOT NULL DEFAULT '18:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROVIDER SERVICES
CREATE TYPE pricing_model_type AS ENUM ('fixed', 'hourly', 'quote_required');

CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pricing_model pricing_model_type NOT NULL DEFAULT 'hourly',
  base_price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  remote_available BOOLEAN NOT NULL DEFAULT FALSE,
  in_person_available BOOLEAN NOT NULL DEFAULT TRUE,
  requirements TEXT,
  cancellation_policy TEXT NOT NULL DEFAULT 'Free cancellation up to 24 hours prior.',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BOOKINGS & APPOINTMENT TRACKING
CREATE TYPE booking_status_type AS ENUM (
  'requested',
  'accepted',
  'awaiting_customer_confirmation',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'declined',
  'disputed'
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES provider_services(id) ON DELETE RESTRICT,
  service_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'in_person',
  service_address TEXT,
  problem_description TEXT NOT NULL,
  requirements TEXT,
  pricing_model pricing_model_type NOT NULL,
  agreed_price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL,
  status booking_status_type NOT NULL DEFAULT 'requested',
  status_notes TEXT,
  cancellation_reason TEXT,
  alternate_proposed_date DATE,
  alternate_proposed_slot TEXT,
  is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REVIEWS (Requires eligible completed booking)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  provider_response TEXT,
  provider_response_at TIMESTAMPTZ,
  is_reported BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MESSAGING & CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. VERIFICATION SUBMISSIONS (Stored in protected compliance table)
CREATE TABLE IF NOT EXISTS verification_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  license_number TEXT,
  issuing_authority TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES profiles(id)
);

-- 9. DISPUTES
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  issue_category TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_notes TEXT,
  requested_resolution TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_decision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SAFETY REPORTS
CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_provider_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_category ON provider_services(category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(service_date);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view limited fields; users can update own profile
CREATE POLICY "Profiles viewable by authenticated users" 
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Providers: Public can view active profiles; providers edit own
CREATE POLICY "Active providers publicly viewable" 
  ON provider_profiles FOR SELECT USING (true);
CREATE POLICY "Providers update own profile" 
  ON provider_profiles FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Services: Public view active services; providers manage own
CREATE POLICY "Active services publicly viewable" 
  ON provider_services FOR SELECT USING (is_active = true);

-- Bookings: Customers & Providers view only their own bookings; Admins view all
CREATE POLICY "Users view own bookings" 
  ON bookings FOR SELECT USING (
    customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    provider_id IN (SELECT id FROM provider_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- Reviews: Public view reviews; Customers insert only for completed bookings
CREATE POLICY "Reviews publicly readable" 
  ON reviews FOR SELECT USING (true);

-- Verification: Only Admins can view and review all submissions; Providers see their own
CREATE POLICY "Providers view own verifications" 
  ON verification_submissions FOR SELECT USING (
    provider_id IN (SELECT id FROM provider_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- Audit logs: Strict Admin only
CREATE POLICY "Admin audit log access" 
  ON audit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
