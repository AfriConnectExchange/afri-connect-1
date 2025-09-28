-- AfriConnect Exchange - Complete Database Schema

-- ####################################################
-- # 1. Core User & Profile Management (Already partially exists from auth)
-- ####################################################

-- Profiles table (assuming it's created by Supabase Auth)
-- We might need to add columns to it via the Supabase UI or migrations.
-- ALTER TABLE public.profiles ADD COLUMN role_id INTEGER REFERENCES public.roles(id);
-- ALTER TABLE public.profiles ADD COLUMN kyc_status VARCHAR(20) DEFAULT 'not_started';
-- ... etc.

-- Roles for users
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Initial roles
INSERT INTO public.roles (name) VALUES ('buyer'), ('seller'), ('sme'), ('trainer') ON CONFLICT (name) DO NOTHING;

-- ####################################################
-- # 2. The Catalog: Products & Discovery (FR02)
-- ####################################################

-- To organize products into browsable groups
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_category_id INTEGER REFERENCES public.categories(id), -- For sub-categories
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The core of the marketplace: what is being sold, bartered, or given away
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    category_id INTEGER NOT NULL REFERENCES public.categories(id),
    listing_type VARCHAR(20) NOT NULL DEFAULT 'sale', -- 'sale', 'barter', 'freebie'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'sold', 'delisted'
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    location GEOGRAPHY(Point, 4326), -- For proximity search
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a spatial index for location-based searches
CREATE INDEX products_location_idx ON public.products USING GIST (location);

-- ############################################################
-- # 3. The Transaction Engine: Orders & Payments (FR03)
-- ############################################################

-- A record of every purchase agreement
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'confirmed', 'disputed', 'cancelled'
    payment_method VARCHAR(20), -- 'card', 'wallet', 'escrow', 'barter', 'cash'
    tracking_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table for orders with multiple products
CREATE TABLE IF NOT EXISTS public.order_items (
    order_id UUID NOT NULL REFERENCES public.orders(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);


-- Logs every financial event for auditing
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    profile_id UUID NOT NULL REFERENCES public.profiles(id), -- Who initiated it
    type VARCHAR(20) NOT NULL, -- 'payment', 'payout', 'refund'
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'succeeded', 'failed', 'pending'
    provider VARCHAR(20), -- 'stripe', 'paypal', 'flutterwave'
    provider_transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Manages the escrow state machine
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'funded', -- 'funded', 'released', 'disputed', 'refunded'
    release_at TIMESTAMPTZ, -- For auto-release feature
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Manages the Barter System
CREATE TABLE IF NOT EXISTS public.barter_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_id UUID NOT NULL REFERENCES public.profiles(id),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id),
    proposer_product_id UUID NOT NULL REFERENCES public.products(id),
    recipient_product_id UUID NOT NULL REFERENCES public.products(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'countered', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ####################################################
-- # 4. Reputation & Promotion (FR09 & FR04)
-- ####################################################

-- To handle user ratings and reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) UNIQUE, -- Ensures only one review per verified purchase
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id), -- The seller
    product_id UUID NOT NULL REFERENCES public.products(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    seller_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For paid promotions by SMEs
CREATE TABLE IF NOT EXISTS public.adverts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sme_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID REFERENCES public.products(id), -- Can link to a specific product
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'paused'
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ####################################################
-- # 5. User Support (FR12)
-- ####################################################

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id),
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
