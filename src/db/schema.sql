-- ==========================================================
-- COMPLETE AFRICONNECT MARKETPLACE & ADVERTS SYSTEM (FIXED)
-- ==========================================================

-- 1. CATEGORIES TABLE (For organizing products)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES public.categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add description column if it doesn't exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('Electronics', 'Phones, laptops, gadgets'),
('Fashion', 'Clothing, shoes, accessories'),
('Home & Garden', 'Furniture, appliances, decor'),
('Vehicles', 'Cars, motorcycles, parts'),
('Services', 'Professional and personal services'),
('Education', 'Courses, tutoring, training')
ON CONFLICT (name) DO NOTHING;

-- 2. CREATE ENUM TYPES (Compatible with all PostgreSQL versions)
-- Create product_listing_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_listing_type') THEN
        CREATE TYPE public.product_listing_type AS ENUM ('sale', 'barter', 'freebie');
    END IF;
END
$$ LANGUAGE plpgsql;

-- Create product_status if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE public.product_status AS ENUM ('active', 'sold', 'delisted', 'pending_approval');
    END IF;
END
$$ LANGUAGE plpgsql;

-- Create advert_status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advert_status') THEN
        CREATE TYPE public.advert_status AS ENUM ('active', 'paused', 'expired', 'pending_payment');
    END IF;
END
$$ LANGUAGE plpgsql;

-- Create advert_placement if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'advert_placement') THEN
        CREATE TYPE public.advert_placement AS ENUM ('search_results', 'category_page', 'homepage_banner', 'sidebar');
    END IF;
END
$$ LANGUAGE plpgsql;

-- 3. PRODUCTS TABLE (Core marketplace items)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic Product Info
    title TEXT NOT NULL CHECK (length(title) >= 3),
    description TEXT NOT NULL CHECK (length(description) >= 20),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    
    -- Classification
    category_id INTEGER NOT NULL REFERENCES public.categories(id),
    listing_type public.product_listing_type NOT NULL DEFAULT 'sale',
    status public.product_status NOT NULL DEFAULT 'active',
    
    -- Media & Location
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    location_text TEXT, -- Human readable location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Inventory & Logistics
    quantity_available INTEGER DEFAULT 1 CHECK (quantity_available >= 0),
    is_digital BOOLEAN DEFAULT false,
    shipping_required BOOLEAN DEFAULT true,
    
    -- Visibility & Promotion
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Optional expiry for time-limited offers
);

-- Add missing columns to existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quantity_available INTEGER DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_required BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_listing_type ON public.products(listing_type);
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(latitude, longitude) 
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 4. ADVERTS TABLE (Promotional campaigns for products)
CREATE TABLE IF NOT EXISTS public.adverts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sme_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    
    -- Advert Content (can override product details for promotion)
    title TEXT NOT NULL CHECK (length(title) >= 5),
    description TEXT NOT NULL CHECK (length(description) >= 20),
    promotional_image_url TEXT,
    call_to_action TEXT DEFAULT 'Learn More',
    
    -- Campaign Settings
    status public.advert_status NOT NULL DEFAULT 'pending_payment',
    placement public.advert_placement NOT NULL DEFAULT 'search_results',
    daily_budget NUMERIC(8, 2) CHECK (daily_budget > 0),
    total_budget NUMERIC(10, 2) CHECK (total_budget > 0),
    
    -- Targeting
    target_categories INTEGER[] DEFAULT '{}', -- Array of category IDs
    target_locations TEXT[] DEFAULT '{}', -- Array of location names
    target_age_min INTEGER CHECK (target_age_min >= 13),
    target_age_max INTEGER CHECK (target_age_max <= 100),
    
    -- Schedule
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL CHECK (end_date > start_date),
    
    -- Performance Tracking
    impressions_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    amount_spent NUMERIC(10, 2) DEFAULT 0.00,
    
    -- Approval & Moderation
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT valid_age_range CHECK (target_age_max >= target_age_min OR (target_age_min IS NULL AND target_age_max IS NULL))
);

-- Add missing columns to existing adverts table
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS promotional_image_url TEXT;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS call_to_action TEXT DEFAULT 'Learn More';
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS placement public.advert_placement DEFAULT 'search_results';
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS daily_budget NUMERIC(8, 2);
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS total_budget NUMERIC(10, 2);
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS target_categories INTEGER[] DEFAULT '{}';
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS target_locations TEXT[] DEFAULT '{}';
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS target_age_min INTEGER;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS target_age_max INTEGER;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS impressions_count INTEGER DEFAULT 0;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS conversions_count INTEGER DEFAULT 0;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS amount_spent NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.adverts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Copy existing content to description for backward compatibility
UPDATE public.adverts SET description = content WHERE description IS NULL AND content IS NOT NULL;

-- Set default placement for existing adverts
UPDATE public.adverts SET placement = 'search_results' WHERE placement IS NULL;

-- Add constraints to existing table (compatible method)
DO $$
BEGIN
    -- Add valid_date_range constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_date_range' 
        AND conrelid = 'public.adverts'::regclass
    ) THEN
        ALTER TABLE public.adverts ADD CONSTRAINT valid_date_range CHECK (end_date > start_date);
    END IF;
    
    -- Add valid_age_range constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_age_range' 
        AND conrelid = 'public.adverts'::regclass
    ) THEN
        ALTER TABLE public.adverts ADD CONSTRAINT valid_age_range CHECK (target_age_max >= target_age_min OR (target_age_min IS NULL AND target_age_max IS NULL));
    END IF;
END
$$ LANGUAGE plpgsql;

-- Indexes for adverts
CREATE INDEX IF NOT EXISTS idx_adverts_sme ON public.adverts(sme_id);
CREATE INDEX IF NOT EXISTS idx_adverts_product ON public.adverts(product_id);
CREATE INDEX IF NOT EXISTS idx_adverts_status ON public.adverts(status);
CREATE INDEX IF NOT EXISTS idx_adverts_placement ON public.adverts(placement);
CREATE INDEX IF NOT EXISTS idx_adverts_active_period ON public.adverts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_adverts_performance ON public.adverts(impressions_count, clicks_count);

-- 5. ADVERT ANALYTICS (Detailed performance tracking)
CREATE TABLE IF NOT EXISTS public.advert_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advert_id UUID NOT NULL REFERENCES public.adverts(id) ON DELETE CASCADE,
    
    -- Daily metrics
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    amount_spent NUMERIC(8, 2) DEFAULT 0.00,
    
    -- Engagement metrics
    avg_click_through_rate DECIMAL(5, 4) DEFAULT 0.0000,
    avg_conversion_rate DECIMAL(5, 4) DEFAULT 0.0000,
    cost_per_click NUMERIC(6, 2) DEFAULT 0.00,
    cost_per_conversion NUMERIC(6, 2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(advert_id, date)
);

-- 6. PRODUCT VIEWS (Track product visibility)
CREATE TABLE IF NOT EXISTS public.product_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
    
    -- View context
    source VARCHAR(50), -- 'search', 'category', 'advert', 'direct'
    advert_id UUID REFERENCES public.adverts(id), -- If view came from an advert
    user_agent TEXT,
    ip_address INET,
    
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_date ON public.product_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_product_views_source ON public.product_views(source);

-- 7. PRODUCT FAVORITES (Wishlist functionality)
CREATE TABLE IF NOT EXISTS public.product_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- 8. SEARCH QUERIES (Track what users are searching for)
CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    category_filter INTEGER REFERENCES public.categories(id),
    min_price NUMERIC(12, 2),
    max_price NUMERIC(12, 2),
    location_filter TEXT,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FUNCTIONS FOR ADVERT MANAGEMENT (FIXED - using $$)

-- Function to automatically expire adverts
CREATE OR REPLACE FUNCTION public.expire_adverts()
RETURNS INTEGER 
LANGUAGE plpgsql
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.adverts 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND end_date <= NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- Function to calculate advert performance metrics
CREATE OR REPLACE FUNCTION public.calculate_advert_ctr(advert_uuid UUID)
RETURNS DECIMAL 
LANGUAGE plpgsql
AS $$
DECLARE
    ctr DECIMAL(5, 4) := 0.0000;
    total_impressions INTEGER;
    total_clicks INTEGER;
BEGIN
    SELECT impressions_count, clicks_count 
    INTO total_impressions, total_clicks
    FROM public.adverts 
    WHERE id = advert_uuid;
    
    IF total_impressions > 0 THEN
        ctr := (total_clicks::DECIMAL / total_impressions::DECIMAL) * 100;
    END IF;
    
    RETURN ctr;
END;
$$;

-- Function to get trending products (most viewed recently)
CREATE OR REPLACE FUNCTION public.get_trending_products(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    title TEXT,
    view_count_recent BIGINT,
    seller_name TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        COUNT(pv.id) as view_count_recent,
        pr.full_name
    FROM public.products p
    LEFT JOIN public.product_views pv ON p.id = pv.product_id 
        AND pv.viewed_at >= NOW() - (days_back || ' days')::INTERVAL
    LEFT JOIN public.profiles pr ON p.seller_id = pr.id
    WHERE p.status = 'active'
    GROUP BY p.id, p.title, pr.full_name
    ORDER BY view_count_recent DESC
    LIMIT limit_count;
END;
$$;

-- Function to calculate ROI for adverts
CREATE OR REPLACE FUNCTION public.calculate_advert_roi(advert_uuid UUID)
RETURNS DECIMAL 
LANGUAGE plpgsql
AS $$
DECLARE
    roi DECIMAL(8, 2) := 0.00;
    total_spent NUMERIC(10, 2);
    total_conversions INTEGER;
    avg_order_value NUMERIC(10, 2) := 50.00; -- Default assumption
BEGIN
    SELECT amount_spent, conversions_count 
    INTO total_spent, total_conversions
    FROM public.adverts 
    WHERE id = advert_uuid;
    
    IF total_spent > 0 AND total_conversions > 0 THEN
        roi := ((total_conversions * avg_order_value - total_spent) / total_spent) * 100;
    END IF;
    
    RETURN roi;
END;
$$;

-- Function to get advert performance summary
CREATE OR REPLACE FUNCTION public.get_advert_summary(sme_user_id UUID)
RETURNS TABLE (
    total_adverts BIGINT,
    active_adverts BIGINT,
    total_spent NUMERIC,
    total_impressions BIGINT,
    total_clicks BIGINT,
    avg_ctr DECIMAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_adverts,
        COUNT(*) FILTER (WHERE status = 'active') as active_adverts,
        COALESCE(SUM(amount_spent), 0) as total_spent,
        COALESCE(SUM(impressions_count), 0) as total_impressions,
        COALESCE(SUM(clicks_count), 0) as total_clicks,
        CASE 
            WHEN SUM(impressions_count) > 0 
            THEN ROUND((SUM(clicks_count)::DECIMAL / SUM(impressions_count)::DECIMAL) * 100, 2)
            ELSE 0 
        END as avg_ctr
    FROM public.adverts 
    WHERE sme_id = sme_user_id;
END;
$$;

-- 10. UPDATE TRIGGERS
DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_adverts_updated ON public.adverts;
CREATE TRIGGER on_adverts_updated
    BEFORE UPDATE ON public.adverts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 11. ROW LEVEL SECURITY POLICIES

-- Products policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Sellers can manage their products" ON public.products;
CREATE POLICY "Sellers can manage their products" ON public.products
    FOR ALL USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admins can moderate all products" ON public.products;
CREATE POLICY "Admins can moderate all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role_id = 5
        )
    );

-- Adverts policies
ALTER TABLE public.adverts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SMEs can manage their adverts" ON public.adverts;
CREATE POLICY "SMEs can manage their adverts" ON public.adverts
    FOR ALL USING (auth.uid() = sme_id);

DROP POLICY IF EXISTS "Public can view approved active adverts" ON public.adverts;
CREATE POLICY "Public can view approved active adverts" ON public.adverts
    FOR SELECT USING (status = 'active' AND is_approved = true);

DROP POLICY IF EXISTS "Admins can moderate all adverts" ON public.adverts;
CREATE POLICY "Admins can moderate all adverts" ON public.adverts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role_id = 5
        )
    );

-- Product views policies
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record product views" ON public.product_views;
CREATE POLICY "Anyone can record product views" ON public.product_views
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own view history" ON public.product_views;
CREATE POLICY "Users can view their own view history" ON public.product_views
    FOR SELECT USING (auth.uid() = viewer_id);

-- Product favorites policies
ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their favorites" ON public.product_favorites;
CREATE POLICY "Users can manage their favorites" ON public.product_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
ALTER TABLE public.advert_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SMEs can view their advert analytics" ON public.advert_analytics;
CREATE POLICY "SMEs can view their advert analytics" ON public.advert_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.adverts 
            WHERE id = advert_id AND sme_id = auth.uid()
        )
    );

-- 12. USEFUL VIEWS FOR REPORTING

-- View for active marketplace listings with seller info
CREATE OR REPLACE VIEW public.marketplace_view AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.currency,
    p.images,
    p.location_text,
    p.listing_type,
    p.view_count,
    p.favorite_count,
    p.created_at,
    c.name as category_name,
    pr.full_name as seller_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.adverts a 
            WHERE a.product_id = p.id 
            AND a.status = 'active' 
            AND a.is_approved = true
            AND NOW() BETWEEN a.start_date AND a.end_date
        ) THEN true 
        ELSE false 
    END as is_promoted
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.profiles pr ON p.seller_id = pr.id
WHERE p.status = 'active';

-- View for advert performance dashboard
CREATE OR REPLACE VIEW public.advert_performance_view AS
SELECT 
    a.id,
    a.title,
    a.status,
    a.daily_budget,
    a.amount_spent,
    a.impressions_count,
    a.clicks_count,
    a.conversions_count,
    CASE 
        WHEN a.impressions_count > 0 
        THEN ROUND((a.clicks_count::DECIMAL / a.impressions_count::DECIMAL) * 100, 2)
        ELSE 0 
    END as click_through_rate,
    CASE 
        WHEN a.clicks_count > 0 
        THEN ROUND(a.amount_spent / a.clicks_count, 2)
        ELSE 0 
    END as cost_per_click,
    p.title as product_title,
    pr.full_name as sme_name,
    a.start_date,
    a.end_date,
    a.created_at
FROM public.adverts a
LEFT JOIN public.products p ON a.product_id = p.id
LEFT JOIN public.profiles pr ON a.sme_id = pr.id;

-- View for SME dashboard summary
CREATE OR REPLACE VIEW public.sme_dashboard_view AS
SELECT 
    pr.id as sme_id,
    pr.full_name as sme_name,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT a.id) as total_adverts,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as active_adverts,
    COALESCE(SUM(a.amount_spent), 0) as total_ad_spend,
    COALESCE(SUM(a.impressions_count), 0) as total_impressions,
    COALESCE(SUM(a.clicks_count), 0) as total_clicks,
    COALESCE(SUM(p.view_count), 0) as total_product_views
FROM public.profiles pr
LEFT JOIN public.products p ON pr.id = p.seller_id
LEFT JOIN public.adverts a ON pr.id = a.sme_id
WHERE pr.role_id = 3 -- SME role
GROUP BY pr.id, pr.full_name;

-- Remove the old marketplace view that references columns that no longer exist
DROP VIEW IF EXISTS public.marketplace_listings;
