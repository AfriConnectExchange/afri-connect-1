-- #################################################################
-- # SECTION 0: HELPER FUNCTIONS & EXTENSIONS
-- #################################################################

-- Enable PostGIS extension for geography/location features
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- #################################################################
-- # SECTION 1: CORE AUTHENTICATION & USER MANAGEMENT (FR01, FR10)
-- #################################################################

-- ENUM types for data integrity
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'deactivated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'verified', 'rejected');
    END IF;
END$$;


-- Roles for users
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
-- Initial roles
INSERT INTO public.roles (id, name, description) VALUES
(1, 'buyer', 'Can browse and purchase products.'),
(2, 'seller', 'Can list and sell products, requires KYC.'),
(3, 'sme', 'Business account with access to promotional features.'),
(4, 'trainer', 'Can create and manage courses in the LMS.'),
(5, 'admin', 'Platform administrator with full access.')
ON CONFLICT (id) DO NOTHING;


-- Enhanced Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email VARCHAR(255) UNIQUE, -- Kept for easier querying, synced with auth.users
    phone_number TEXT UNIQUE,
    avatar_url TEXT,
    location TEXT,
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES public.roles(id),
    kyc_status public.kyc_status NOT NULL DEFAULT 'not_started',
    account_status public.account_status NOT NULL DEFAULT 'active',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    free_access_expires_at TIMESTAMPTZ,
    -- Business details for SMEs
    business_name TEXT,
    business_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- Add trigger for updated_at
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, free_access_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.phone,
    NOW() + INTERVAL '3 months'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Trigger to call the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- #################################################################
-- # SECTION 2: THE MARKETPLACE CATALOG (FR02)
-- #################################################################
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_listing_type') THEN
        CREATE TYPE public.product_listing_type AS ENUM ('sale', 'barter', 'freebie');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE public.product_status AS ENUM ('active', 'sold', 'delisted');
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_category_id INTEGER REFERENCES public.categories(id)
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    category_id INTEGER NOT NULL REFERENCES public.categories(id),
    listing_type public.product_listing_type NOT NULL DEFAULT 'sale',
    status public.product_status NOT NULL DEFAULT 'active',
    images JSONB DEFAULT '[]'::jsonb,
    location extensions.geography(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE INDEX IF NOT EXISTS products_location_idx ON public.products USING GIST (location);


-- #################################################################
-- # SECTION 3: THE TRANSACTION ENGINE (FR03, FR13)
-- #################################################################

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'confirmed', 'disputed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('card', 'wallet', 'paypal', 'cash');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE public.transaction_type AS ENUM ('payment', 'payout', 'refund', 'remittance');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE public.transaction_status AS ENUM ('succeeded', 'failed', 'pending');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'escrow_status') THEN
        CREATE TYPE public.escrow_status AS ENUM ('funded', 'released', 'disputed', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'barter_status') THEN
        CREATE TYPE public.barter_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'cancelled');
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method,
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id), 
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    type public.transaction_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status public.transaction_status NOT NULL,
    provider VARCHAR(20),
    provider_transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    status public.escrow_status NOT NULL DEFAULT 'funded',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_escrow_updated ON public.escrow_transactions;
CREATE TRIGGER on_escrow_updated
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.barter_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_id UUID NOT NULL REFERENCES public.profiles(id),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id),
    proposer_product_id UUID NOT NULL REFERENCES public.products(id),
    recipient_product_id UUID NOT NULL REFERENCES public.products(id),
    status public.barter_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
DROP TRIGGER IF EXISTS on_barter_proposals_updated ON public.barter_proposals;
CREATE TRIGGER on_barter_proposals_updated
  BEFORE UPDATE ON public.barter_proposals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- #################################################################
-- # SECTION 4: REPUTATION & PROMOTION (FR04, FR09)
-- #################################################################

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advert_status') THEN
        CREATE TYPE public.advert_status AS ENUM ('active', 'paused', 'expired');
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    seller_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.adverts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sme_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID REFERENCES public.products(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status public.advert_status NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- #################################################################
-- # SECTION 5: MISSING MODULES (FR05, FR06, FR08)
-- #################################################################

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES public.categories(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    course_id UUID NOT NULL REFERENCES public.courses(id),
    progress NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'remittance_status') THEN
        CREATE TYPE public.remittance_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    END IF;
END$$;
CREATE TABLE IF NOT EXISTS public.remittances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    recipient_email TEXT,
    recipient_phone TEXT,
    amount_sent NUMERIC(10, 2) NOT NULL,
    currency_sent VARCHAR(3) NOT NULL,
    amount_received NUMERIC(10, 2) NOT NULL,
    currency_received VARCHAR(3) NOT NULL,
    exchange_rate NUMERIC(10, 6),
    status public.remittance_status NOT NULL DEFAULT 'pending',
    transaction_id UUID REFERENCES public.transactions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- #################################################################
-- # SECTION 6: SECURITY - ROW LEVEL SECURITY (RLS) POLICIES
-- #################################################################

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barter_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adverts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remittances ENABLE ROW LEVEL SECURITY;


-- POLICIES

-- For PROFILES table:
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are public." ON public.profiles;
CREATE POLICY "Profiles are public."
  ON public.profiles FOR SELECT
  USING (true);


-- For PRODUCTS table:
DROP POLICY IF EXISTS "Public can view active products." ON public.products;
CREATE POLICY "Public can view active products."
  ON public.products FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Users can create their own products." ON public.products;
CREATE POLICY "Users can create their own products."
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
CREATE POLICY "Users can update their own products."
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id);
  
DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;
CREATE POLICY "Users can delete their own products."
  ON public.products FOR DELETE
  USING (auth.uid() = seller_id);


-- For ORDERS table:
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);
  
DROP POLICY IF EXISTS "Users can create their own orders." ON public.orders;
CREATE POLICY "Users can create their own orders."
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);


-- For REVIEWS table:
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can write reviews for their own orders" ON public.reviews;
CREATE POLICY "Users can write reviews for their own orders"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

