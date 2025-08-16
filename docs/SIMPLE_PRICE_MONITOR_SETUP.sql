-- Simple Price Monitor Database Setup
-- This file creates the basic tables for the price monitoring feature

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
    scrape_interval INTEGER NOT NULL DEFAULT 60,
    alert_threshold DECIMAL(5,2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for price history tracking
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES price_monitor_products(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    region VARCHAR(10) NOT NULL
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
    alert_type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_asin ON price_monitor_products(asin);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_active ON price_monitor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_monitor_products_next_scrape ON price_monitor_products(next_scrape);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id); 