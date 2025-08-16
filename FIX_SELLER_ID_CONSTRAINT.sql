-- ===== FIX SELLER_ID CONSTRAINT ISSUE =====

-- Option 1: Make seller_id nullable (Recommended)
ALTER TABLE seller_history 
ALTER COLUMN seller_id DROP NOT NULL;

-- Option 2: Add default value for seller_id
-- ALTER TABLE seller_history 
-- ALTER COLUMN seller_id SET DEFAULT 'unknown';

-- Option 3: Update existing null values
UPDATE seller_history 
SET seller_id = 'unknown' 
WHERE seller_id IS NULL;

-- Add comment
COMMENT ON COLUMN seller_history.seller_id IS 'Seller ID from Amazon (can be null if not available)'; 