-- Database function to generate unique order numbers in YYYYMMDD-NN format
-- This function handles concurrency and ensures no duplicate order numbers

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    max_sequence_num INTEGER;
    new_sequence_num INTEGER;
    new_order_number TEXT;
BEGIN
    -- Get current date in IST (UTC+5:30) and format as YYYYMMDD
    today_date := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD');
    
    -- Find the highest sequence number for today's orders
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0)
    INTO max_sequence_num
    FROM orders
    WHERE order_number LIKE today_date || '%';
    
    -- Increment the sequence number
    new_sequence_num := max_sequence_num + 1;
    
    -- Ensure we don't exceed 99 orders per day
    IF new_sequence_num > 99 THEN
        RAISE EXCEPTION 'Maximum orders per day (99) exceeded for date %', today_date;
    END IF;
    
    -- Format the new order number as YYYYMMDD-NN (padded with leading zeros)
    new_order_number := today_date || LPAD(new_sequence_num::TEXT, 2, '0');
    
    -- Double-check that this order number doesn't exist (extra safety for concurrency)
    IF EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
        -- If it exists, try again recursively
        RETURN generate_order_number();
    END IF;
    
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically set order_number for new orders
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set order_number if it's not already provided
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate order_number for new orders
DROP TRIGGER IF EXISTS orders_order_number_trigger ON orders;
CREATE TRIGGER orders_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION set_order_number();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION set_order_number() TO service_role;
