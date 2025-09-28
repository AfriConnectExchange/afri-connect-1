-- 1. Populating the Roles Table
-- This inserts the different user roles that we can assign to profiles.
-- The IDs match what we have been using in the frontend logic (e.g., role_id: 1 for Buyer).

INSERT INTO public.roles (id, name, description) VALUES
(1, 'Buyer', 'Can browse and purchase products, write reviews, and track orders.'),
(2, 'Seller', 'Can list products for sale, manage inventory, and view sales analytics.'),
(3, 'SME', 'A small to medium enterprise with access to advanced seller tools and advertising.'),
(4, 'Trainer', 'Can create and sell educational courses on the platform.'),
(5, 'Admin', 'Has full access to moderate the platform, manage users, and resolve disputes.')
ON CONFLICT (id) DO NOTHING;


-- 2. Create the function to decrement product quantity
-- This is a secure database function that our 'Create Order' API will call.
-- It prevents stock from going below zero and ensures that inventory is updated correctly when an order is placed.

CREATE OR REPLACE FUNCTION public.decrement_product_quantity(p_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.products
  SET quantity_available = quantity_available - p_quantity
  WHERE id = p_id AND quantity_available >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % has insufficient stock or does not exist.', p_id;
  END IF;
END;
$$;
