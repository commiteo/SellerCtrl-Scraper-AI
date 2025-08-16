-- Price Monitor Database Setup
-- This file creates the necessary tables for the price monitoring feature

-- Table for monitored products
CREATE TABLE IF NOT EXISTS price_monitor_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asin VARCHAR(10) NOT NULL,
    title TEXT,
    current_price DECIMAL(10,2),
    previous_price DECIMAL(10,2),
    price_change DECIMAL(10,2),
    price_change_percentage DECIMAL(5,2),
    last_scraped TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_scrape TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    region VARCHAR(10) NOT NULL DEFAULT 'eg',
    scrape_interval INTEGER NOT NULL DEFAULT 60, -- in minutes
    alert_threshold DECIMAL(5,2) DEFAULT 5.0, -- percentage change to trigger alert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_asin CHECK (length(asin) = 10),
    CONSTRAINT valid_interval CHECK (scrape_interval >= 1),
    CONSTRAINT valid_threshold CHECK (alert_threshold >= 0 AND alert_threshold <= 100)
);

-- Table for price history tracking
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    region VARCHAR(10) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_price CHECK (price >= 0)
);

-- Table for price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    price_change DECIMAL(10,2) NOT NULL,
    price_change_percentage DECIMAL(5,2) NOT NULL,
    alert_type VARCHAR(20) NOT NULL, -- 'increase', 'decrease', 'threshold'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('increase', 'decrease', 'threshold'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_asin ON price_monitor_products(asin);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_active ON price_monitor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_next_scrape ON price_monitor_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_scraped_at ON price_history(scraped_at);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON price_alerts(created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_price_monitor_products_updated_at 
    BEFORE UPDATE ON price_monitor_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate price change when price is updated
CREATE OR REPLACE FUNCTION calculate_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If there's a previous price, calculate the change
    IF OLD.current_price IS NOT NULL AND NEW.current_price IS NOT NULL THEN
        NEW.previous_price := OLD.current_price;
        NEW.price_change := NEW.current_price - OLD.current_price;
        NEW.price_change_percentage := (NEW.price_change / OLD.current_price) * 100;
        
        -- Check if price change exceeds alert threshold
        IF ABS(NEW.price_change_percentage) >= NEW.alert_threshold THEN
            INSERT INTO price_alerts (
                product_id, 
                asin, 
                old_price, 
                new_price, 
                price_change, 
                price_change_percentage, 
                alert_type
            ) VALUES (
                NEW.id,
                NEW.asin,
                OLD.current_price,
                NEW.current_price,
                NEW.price_change,
                NEW.price_change_percentage,
                CASE 
                    WHEN NEW.price_change > 0 THEN 'increase'
                    WHEN NEW.price_change < 0 THEN 'decrease'
                    ELSE 'threshold'
                END
            );
        END IF;
    END IF;
    
    -- Update last_scraped timestamp
    NEW.last_scraped := NOW();
    
    -- Calculate next scrape time
    NEW.next_scrape := NOW() + (NEW.scrape_interval || ' minutes')::INTERVAL;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically calculate price changes
CREATE TRIGGER calculate_price_change_trigger
    BEFORE UPDATE ON price_monitor_products
    FOR EACH ROW EXECUTE FUNCTION calculate_price_change();

-- Function to insert price history when price is updated
CREATE OR REPLACE FUNCTION insert_price_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into price history when price changes
    IF OLD.current_price IS DISTINCT FROM NEW.current_price THEN
        INSERT INTO price_history (
            product_id,
            asin,
            price,
            region
        ) VALUES (
            NEW.id,
            NEW.asin,
            NEW.current_price,
            NEW.region
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically insert price history
CREATE TRIGGER insert_price_history_trigger
    AFTER UPDATE ON price_monitor_products
    FOR EACH ROW EXECUTE FUNCTION insert_price_history();

-- Insert some sample data for testing
INSERT INTO price_monitor_products (
    asin, 
    title, 
    current_price, 
    region, 
    scrape_interval, 
    alert_threshold
) VALUES 
    ('B08N5WRWNW', 'Sample Product 1', 29.99, 'eg', 60, 5.0),
    ('B002QYW8LW', 'Sample Product 2', 45.50, 'sa', 120, 3.0)
ON CONFLICT DO NOTHING;

-- Create a view for easy monitoring dashboard
CREATE OR REPLACE VIEW price_monitor_dashboard AS
SELECT 
    p.id,
    p.asin,
    p.title,
    p.current_price,
    p.previous_price,
    p.price_change,
    p.price_change_percentage,
    p.last_scraped,
    p.next_scrape,
    p.is_active,
    p.region,
    p.scrape_interval,
    p.alert_threshold,
    CASE 
        WHEN p.next_scrape <= NOW() THEN 'Due'
        WHEN p.next_scrape <= NOW() + INTERVAL '1 hour' THEN 'Soon'
        ELSE 'Scheduled'
    END as scrape_status,
    COUNT(ph.id) as history_count,
    COUNT(pa.id) as alert_count
FROM price_monitor_products p
LEFT JOIN price_history ph ON p.id = ph.product_id
LEFT JOIN price_alerts pa ON p.id = pa.product_id AND pa.is_read = false
GROUP BY p.id, p.asin, p.title, p.current_price, p.previous_price, p.price_change, 
         p.price_change_percentage, p.last_scraped, p.next_scrape, p.is_active, 
         p.region, p.scrape_interval, p.alert_threshold;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON TABLE price_monitor_products TO your_user;
-- GRANT ALL PRIVILEGES ON TABLE price_history TO your_user;
-- GRANT ALL PRIVILEGES ON TABLE price_alerts TO your_user;
-- GRANT ALL PRIVILEGES ON VIEW price_monitor_dashboard TO your_user; 