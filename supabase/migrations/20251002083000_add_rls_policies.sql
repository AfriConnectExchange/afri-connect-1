-- Enable RLS for all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barter_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;


-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products." ON public.products;
DROP POLICY IF EXISTS "Users can update their own products." ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products." ON public.products;

DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;

DROP POLICY IF EXISTS "Users can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Sellers can view orders for their products." ON public.orders;

DROP POLICY IF EXISTS "Users can view items in their own orders." ON public.order_items;

DROP POLICY IF EXISTS "Reviews are viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for products they purchased." ON public.reviews;

DROP POLICY IF EXISTS "Users can see their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;

DROP POLICY IF EXISTS "Users can view their own transactions." ON public.transactions;

DROP POLICY IF EXISTS "Users can manage their own barter proposals." ON public.barter_proposals;

DROP POLICY IF EXISTS "Users can view their own escrow transactions." ON public.escrow_transactions;


-- ----------------
-- PROFILES
-- ----------------
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );
  
-- ----------------
-- PRODUCTS
-- ----------------
CREATE POLICY "Products are viewable by everyone."
  ON public.products FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own products."
  ON public.products FOR INSERT
  WITH CHECK ( auth.uid() = seller_id );
  
CREATE POLICY "Users can update their own products."
  ON public.products FOR UPDATE
  USING ( auth.uid() = seller_id )
  WITH CHECK ( auth.uid() = seller_id );

CREATE POLICY "Users can delete their own products."
  ON public.products FOR DELETE
  USING ( auth.uid() = seller_id );

-- ----------------
-- CATEGORIES
-- ----------------
CREATE POLICY "Categories are viewable by everyone."
  ON public.categories FOR SELECT
  USING ( true );

-- ----------------
-- ORDERS
-- ----------------
CREATE POLICY "Users can view their own orders."
  ON public.orders FOR SELECT
  USING ( auth.uid() = buyer_id );
  
-- Note: A policy for sellers to view orders containing their items is more complex
-- and is best handled by a secure RPC function (`get_sales_for_seller`), which is already in place.

-- ----------------
-- ORDER ITEMS
-- ----------------
CREATE POLICY "Users can view items in their own orders."
  ON public.order_items FOR SELECT
  USING ( (SELECT buyer_id FROM public.orders WHERE id = order_id) = auth.uid() );
  
-- ----------------
-- REVIEWS
-- ----------------
CREATE POLICY "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert reviews for products they purchased."
  ON public.reviews FOR INSERT
  WITH CHECK ( auth.uid() = reviewer_id AND (SELECT buyer_id FROM public.orders WHERE id = order_id) = auth.uid() );

-- ----------------
-- NOTIFICATIONS
-- ----------------
CREATE POLICY "Users can see their own notifications."
  ON public.notifications FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update their own notifications."
  ON public.notifications FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );

-- ----------------
-- TRANSACTIONS
-- ----------------
CREATE POLICY "Users can view their own transactions."
  ON public.transactions FOR SELECT
  USING ( auth.uid() = profile_id );
  
-- ----------------
-- BARTER PROPOSALS
-- ----------------
CREATE POLICY "Users can manage their own barter proposals."
  ON public.barter_proposals FOR ALL
  USING ( auth.uid() = proposer_id OR auth.uid() = recipient_id )
  WITH CHECK ( auth.uid() = proposer_id OR auth.uid() = recipient_id );

-- ----------------
-- ESCROW TRANSACTIONS
-- ----------------
CREATE POLICY "Users can view their own escrow transactions."
  ON public.escrow_transactions FOR SELECT
  USING ( (SELECT buyer_id FROM public.orders WHERE id = order_id) = auth.uid() OR (SELECT seller_id FROM order_items WHERE order_id = escrow_transactions.order_id LIMIT 1) = auth.uid() );

