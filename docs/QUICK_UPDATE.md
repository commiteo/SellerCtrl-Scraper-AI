# 🚀 Quick Database Update Guide

## What's New?
Added `data_source` column to track whether Amazon data comes from main page or "See All Buying Options".

## How to Apply (Choose One Method)

### Method 1: Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy the entire content of `supabase_migration.sql`
5. Paste and click **Run**

### Method 2: Using Script
```bash
npm run db:update
```

### Method 3: Manual SQL
Run this in Supabase SQL Editor:
```sql
-- Add data_source column
ALTER TABLE amazon_scraping_history ADD COLUMN data_source TEXT;

-- Update existing records
UPDATE amazon_scraping_history SET data_source = 'main_page' WHERE data_source IS NULL;

-- Make column NOT NULL
ALTER TABLE amazon_scraping_history ALTER COLUMN data_source SET NOT NULL;

-- Add constraint
ALTER TABLE amazon_scraping_history ADD CONSTRAINT check_data_source CHECK (data_source IN ('main_page', 'buying_options'));
```

## Verify Update
1. Check History page shows "Data Source" column
2. Run a test scrape - should show source in results
3. Check Home page shows data source statistics

## Values
- `main_page`: Data from main product page
- `buying_options`: Data from "See All Buying Options" sidebar

## Need Help?
Check `DATABASE_UPDATE.md` for detailed instructions. 