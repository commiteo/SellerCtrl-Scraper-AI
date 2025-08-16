-- Migration: Add data_source column to amazon_scraping_history table
-- This migration adds a new column to track the source of scraped data

-- Add data_source column to amazon_scraping_history table
ALTER TABLE amazon_scraping_history 
ADD COLUMN data_source TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN amazon_scraping_history.data_source IS 'Source of the scraped data: main_page or buying_options';

-- Create an index for better query performance
CREATE INDEX idx_amazon_scraping_history_data_source ON amazon_scraping_history(data_source);

-- Update existing records to have a default value
UPDATE amazon_scraping_history 
SET data_source = 'main_page' 
WHERE data_source IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE amazon_scraping_history 
ALTER COLUMN data_source SET NOT NULL;

-- Add a check constraint to ensure valid values
ALTER TABLE amazon_scraping_history 
ADD CONSTRAINT check_data_source 
CHECK (data_source IN ('main_page', 'buying_options'));

-- Grant necessary permissions (if using RLS)
-- ALTER TABLE amazon_scraping_history ENABLE ROW LEVEL SECURITY;
-- GRANT SELECT, INSERT, UPDATE ON amazon_scraping_history TO authenticated;
-- GRANT SELECT ON amazon_scraping_history TO anon; 