# Supabase Database Update Guide

## 🗄️ **How to Update Your Supabase Database**

### **Option 1: Using Supabase Dashboard (Recommended)**

1. **Go to your Supabase project dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Copy the entire content from `multi_domain_migration.sql`
   - Paste it into the SQL editor

4. **Run the Migration**
   - Click "Run" button
   - Wait for the execution to complete

### **Option 2: Using Supabase CLI**

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Run the migration**:
   ```bash
   supabase db push
   ```

### **Option 3: Using Database Connection**

If you have direct database access:

1. **Connect to your PostgreSQL database**
2. **Run the SQL commands** from `multi_domain_migration.sql`

## 📋 **What This Migration Creates**

### **Tables Created:**

1. **`multi_domain_scraping_history`**
   - Stores individual scraping results
   - Supports 5 domains: EG, SA, AE, COM, DE

2. **`price_comparison_results`**
   - Stores aggregated price comparisons
   - Best price analysis across domains

3. **`multi_domain_batches`**
   - Tracks scraping batch operations
   - Progress monitoring

### **Features Added:**

- ✅ **Indexes** for better performance
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Security policies** for data access
- ✅ **Comments** for documentation

## 🔍 **Verification Steps**

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'multi_domain%';

-- Check table structure
\d multi_domain_scraping_history;
\d price_comparison_results;
\d multi_domain_batches;
```

## 🚨 **Important Notes**

- **Backup your database** before running migrations
- **Test in development** environment first
- **Check for any errors** in the migration output
- **Verify RLS policies** match your authentication setup

## 🆘 **Troubleshooting**

### **If you get permission errors:**
- Check your Supabase project permissions
- Ensure you're logged in with the correct account

### **If tables already exist:**
- The migration uses `IF NOT EXISTS` so it's safe to run
- Existing data will be preserved

### **If you need to rollback:**
```sql
-- Drop tables (WARNING: This will delete all data)
DROP TABLE IF EXISTS multi_domain_scraping_history CASCADE;
DROP TABLE IF EXISTS price_comparison_results CASCADE;
DROP TABLE IF EXISTS multi_domain_batches CASCADE;
```

## ✅ **Success Indicators**

After successful migration, you should see:
- ✅ No error messages
- ✅ Tables created successfully
- ✅ Indexes created
- ✅ RLS policies applied
- ✅ Your multi-domain scraper should work with the database 