-- Grant basic table-level permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barter_proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.escrow_transactions TO authenticated;

-- Grant basic read-only permissions to anonymous users for public data
GRANT SELECT ON TABLE public.products TO anon;
GRANT SELECT ON TABLE public.categories TO anon;
GRANT SELECT ON TABLE public.reviews TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;


-- 1. PROFILES TABLE
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
-- Create Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- 2. PRODUCTS TABLE
-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Users can create products." ON public.products;
DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;
-- Create Policies
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can create products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own products." ON public.products FOR UPDATE USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own products." ON public.products FOR DELETE USING (auth.uid() = seller_id);


-- 3. CATEGORIES TABLE
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
-- Create Policies
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);


-- 4. ORDERS TABLE
-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Users can create orders." ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their products." ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders (e.g. to delivered)." ON public.orders;
-- Create Policies
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view orders for their products." ON public.orders FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.order_items
    WHERE order_items.order_id = orders.id AND order_items.seller_id = auth.uid()
  )
);
CREATE POLICY "Users can update their own orders (e.g. to delivered)." ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);


-- 5. ORDER_ITEMS TABLE
-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view items in their own orders." ON public.order_items;
DROP POLICY IF EXISTS "Sellers can view items in orders containing their products." ON public.order_items;
-- Create Policies
CREATE POLICY "Users can view items in their own orders." ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()
  )
);
CREATE POLICY "Sellers can view items in orders containing their products." ON public.order_items FOR SELECT USING (auth.uid() = seller_id);


-- 6. REVIEWS TABLE
-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Reviews are public." ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for products they purchased." ON public.reviews;
-- Create Policies
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for products they purchased." ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = reviews.order_id AND orders.buyer_id = auth.uid()
  )
);


-- 7. NOTIFICATIONS TABLE
-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications (e.g. mark as read)." ON public.notifications;
-- Create Policies
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications (e.g. mark as read)." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- 8. TRANSACTIONS TABLE
-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;
-- Create Policies
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = profile_id);


-- 9. BARTER_PROPOSALS TABLE
-- Enable RLS
ALTER TABLE public.barter_proposals ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view proposals they sent or received." ON public.barter_proposals;
-- Create Policies
CREATE POLICY "Users can view proposals they sent or received." ON public.barter_proposals FOR SELECT USING (auth.uid() = proposer_id OR auth.uid() = recipient_id);


-- 10. ESCROW_TRANSACTIONS TABLE
-- Enable RLS
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own escrow transactions." ON public.escrow_transactions;
-- Create Policies
CREATE POLICY "Users can view their own escrow transactions." ON public.escrow_transactions FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = escrow_transactions.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);
