-- supabase/migrations/20240801120003_get_sales_for_seller.sql

-- Drop the function if it already exists to ensure the script is re-runnable
DROP FUNCTION IF EXISTS get_sales_for_seller(uuid);

-- Create the function that returns order details for a given seller
CREATE OR REPLACE FUNCTION get_sales_for_seller(p_seller_id uuid)
RETURNS TABLE (
    id uuid,
    created_at timestamptz,
    total_amount numeric,
    status text,
    buyer_id uuid,
    buyer_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        o.id,
        o.created_at,
        o.total_amount,
        o.status,
        o.buyer_id,
        p.full_name as buyer_name
    FROM
        orders o
    JOIN
        order_items oi ON o.id = oi.order_id
    LEFT JOIN
        profiles p ON o.buyer_id = p.id
    WHERE
        oi.seller_id = p_seller_id
    ORDER BY
        o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execution permission to the authenticated role
GRANT EXECUTE ON FUNCTION get_sales_for_seller(uuid) TO authenticated;
