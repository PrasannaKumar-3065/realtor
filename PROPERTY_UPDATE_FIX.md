# Property Update Fix - Testing Guide

## What Was Fixed

Your admin panel was saving property changes to memory/local state but **NOT persisting them to PostgreSQL**. 

### The Problem
- Frontend calls: `updateProperty()` 
- Backend routes were set up to handle updates, but the `db.js` was only saving to JSON files
- Property updates appeared to work in the UI but weren't reaching the database

### The Solution
I've updated `server/db.js` to:
1. ✅ Save all property updates **to PostgreSQL** (not just JSON)
2. ✅ Read properties from PostgreSQL first (fallback to JSON if not available)
3. ✅ Support both CREATE and UPDATE operations
4. ✅ Delete from PostgreSQL when properties are removed

## Testing the Fix

### Step 1: Make sure your backend is running
```bash
cd /home/retr0/dev/WEB/India-Real-Estate-Showcase
npm run dev --workspace=server
# or
cd server && npm run dev
```

### Step 2: Verify PostgreSQL is accessible
```bash
psql -U postgres -d realtor -c "SELECT COUNT(*) FROM properties;"
```

You should see the number of properties (should be around 8 from our migration).

### Step 3: Edit a Property in Admin Panel

1. Go to your admin panel
2. Click "Edit" on a property
3. Change a field (e.g., title, description, price)
4. Click "Save Property"

### Step 4: Verify the change was saved to PostgreSQL

**Check the database directly:**
```bash
psql -U postgres -d realtor -c "
SELECT property_id, title, price, updated_at 
FROM properties 
WHERE property_id = 'YOUR_PROPERTY_ID'
ORDER BY updated_at DESC LIMIT 1;
"
```

The `updated_at` timestamp should be **recent** (within the last few seconds of when you made the edit).

**Check the admin panel:**
- Reload the page
- The property should still show your changes ✅

**Check console output:**
When saving, you should see in your server console:
```
✓ Property prithvi-1 saved to PostgreSQL
```

## How It Works Now

```
Frontend Admin Panel
        ↓
  updateProperty()
        ↓
  PUT /api/:agency/properties/:id
        ↓
  server/db.js - upsertProperty()
        ├─→ Save to JSON file (for backward compatibility)
        └─→ Save to **PostgreSQL** ← NEW!
        ↓
  Response sent to frontend
        ↓
Admin Panel Updates Display
```

## Database Schema Used

Your properties are now saved with these fields:
- `property_id` (unique identifier)
- `agency_id` (which agency owns it)
- `title`, `description`, `price`, `location`, `city`
- `latitude`, `longitude` (for mapping)
- `image_urls`, `features`, `tags` (as JSON arrays)
- `bedrooms`, `bathrooms`, `area`, `property_type`
- `status`, `featured`, `views`, `leads_count`
- `created_at`, `updated_at` (timestamps)

## If You Have Issues

### JSON still updates but database doesn't?
- Check `.env` file has correct `DATABASE_URL`
- Verify PostgreSQL is running: `psql -U postgres -d realtor -c "SELECT 1;"`
- Check server console for error messages

### Getting "Pool query error"?
- Make sure `pg` package is installed: `npm list pg` (it is - it's in package.json)
- Verify database credentials in `.env`

### Properties not showing on page reload?
- Check `getAllProperties()` function - it now reads from PostgreSQL first
- If PostgreSQL is unavailable, it falls back to JSON
- Server logs should indicate which source is being used

## Next Steps

1. **Test thoroughly** in your admin panel
2. **Verify data** in the database using `psql` or `DATABASE_SETUP.md` queries
3. **Monitor logs** to ensure properties are being saved successfully
4. Once confirmed working, you can:
   - Migrate remaining properties from JSON to database
   - Set up data synchronization between multiple servers (if needed)
   - Archive the JSON files for backup purposes

## Database Query Examples

```sql
-- See all properties for Prithvi (agency_id = 1)
SELECT property_id, title, price, status, updated_at 
FROM properties 
WHERE agency_id = 1 
ORDER BY updated_at DESC;

-- See recently updated properties
SELECT property_id, title, updated_at 
FROM properties 
ORDER BY updated_at DESC LIMIT 10;

-- Check if property was saved in last 5 minutes
SELECT property_id, title, updated_at 
FROM properties 
WHERE updated_at > NOW() - INTERVAL '5 minutes'
ORDER BY updated_at DESC;
```

---

**Status**: ✅ Database integration complete - Properties now persist to PostgreSQL
