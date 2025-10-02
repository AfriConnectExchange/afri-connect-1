-- supabase/migrations/YYYYMMDDHHMMSS_create_order_functions.sql

-- First, define a custom type for the items in an order
-- We need to check if the type exists before creating it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_type') THEN
        CREATE TYPE order_item_type AS (
            product_id UUID,
            quantity INT,
            price NUMERIC,
            seller_id UUID
        );
    END IF;
END$$;


-- Function to create an order and its items atomically
CREATE OR REPLACE FUNCTION create_order_with_items(
    buyer_id_param UUID,
    total_amount_param NUMERIC,
    payment_method_param TEXT,
    shipping_address_param JSONB,
    items order_item_type[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_id UUID;
    item order_item_type;
BEGIN
    -- 1. Create an 'orders' record
    INSERT INTO public.orders (
        buyer_id,
        total_amount,
        currency,
        status,
        payment_method,
        shipping_address
    )
    VALUES (
        buyer_id_param,
        total_amount_param,
        'GBP', -- Assuming GBP
        'processing',
        payment_method_param,
        shipping_address_param
    )
    RETURNING id INTO new_order_id;

    -- 2. Create 'order_items' records
    IF array_length(items, 1) > 0 THEN
        FOREACH item IN ARRAY items
        LOOP
            INSERT INTO public.order_items (
                order_id,
                product_id,
                quantity,
                price_at_purchase,
                seller_id
            )
            VALUES (
                new_order_id,
                item.product_id,
                item.quantity,
                item.price,
                item.seller_id
            );
        END LOOP;
    END IF;

    -- 3. Return the new order's ID
    RETURN new_order_id;
END;
$$;

-- Function to safely decrement product quantity
CREATE OR REPLACE FUNCTION decrement_product_quantity(p_id UUID, p_quantity INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.products
    SET quantity_available = quantity_available - p_quantity
    WHERE id = p_id;
END;
$$;


-- Function to get all sales for a specific seller
CREATE OR REPLACE FUNCTION get_sales_for_seller(p_seller_id UUID)
RETURNS SETOF orders AS $$
BEGIN
    RETURN QUERY
    SELECT o.*
    FROM public.orders o
    WHERE EXISTS (
        SELECT 1
        FROM public.order_items oi
        WHERE oi.order_id = o.id AND oi.seller_id = p_seller_id
    );
END;
$$
LANGUAGE plpgsql;
