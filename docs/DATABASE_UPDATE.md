# Database Update: Add data_source to amazon_scraping_history

## Overview
This update adds a new column `data_source` to the `amazon_scraping_history` table to track whether scraped data came from the main product page or from the "See All Buying Options" sidebar.

## Changes Made

### 1. New Column Added
- **Column Name**: `data_source`
- **Type**: `TEXT`
- **Constraints**: 
  - `NOT NULL`
  - Check constraint: must be either `'main_page'` or `'buying_options'`
- **Default Value**: `'main_page'` for existing records

### 2. Database Schema Changes
```sql
-- Add the new column
ALTER TABLE amazon_scraping_history ADD COLUMN data_source TEXT;

-- Add constraint to ensure valid values
ALTER TABLE amazon_scraping_history 
ADD CONSTRAINT check_data_source 
CHECK (data_source IN ('main_page', 'buying_options'));

-- Create index for better performance
CREATE INDEX idx_amazon_scraping_history_data_source ON amazon_scraping_history(data_source);
```

### 3. Application Code Changes
The following files have been updated to support the new column:

- `backend/amazon_puppeteer.cjs` - Tracks data source during scraping
- `src/services/AmazonScraper.ts` - Saves data source to database
- `src/pages/Index.tsx` - Displays data source in results table
- `src/pages/History.tsx` - Shows data source in history table
- `src/components/ProductResult.tsx` - Displays data source in product cards
- `src/pages/Home.tsx` - Shows statistics by data source

## How to Apply the Update

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_migration.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual Execution
1. Connect to your Supabase database
2. Execute each SQL command from `supabase_migration.sql` in order

## Data Source Values

- **`main_page`**: Data extracted from the main product page
- **`buying_options`**: Data extracted from "See All Buying Options" sidebar

## Benefits

1. **Transparency**: Users can see exactly where their data came from
2. **Data Quality**: Helps identify when the system needs to use alternative data sources
3. **Analytics**: Provides insights into scraping success rates from different sources
4. **Debugging**: Makes it easier to troubleshoot scraping issues

## Verification

After applying the migration, you can verify it worked by:

1. Checking the table structure in Supabase Dashboard
2. Running a test scrape and verifying the `data_source` column is populated
3. Checking that the History page displays the data source correctly

## Rollback (if needed)

If you need to rollback this change:

```sql
-- Remove the constraint first
ALTER TABLE amazon_scraping_history DROP CONSTRAINT check_data_source;

-- Remove the index
DROP INDEX idx_amazon_scraping_history_data_source;

-- Remove the column
ALTER TABLE amazon_scraping_history DROP COLUMN data_source;
```

## Notes

- Existing records will be set to `'main_page'` as the default value
- The application code has been updated to handle both old and new records
- No data loss will occur during this migration 