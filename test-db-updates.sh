#!/bin/bash
# Quick test script to verify property updates are saving to PostgreSQL

echo "🔍 Checking property updates to PostgreSQL..."
echo ""

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" server/.env; then
    echo "❌ ERROR: DATABASE_URL not found in server/.env"
    exit 1
fi

echo "✅ DATABASE_URL configured"
echo ""

# Check if PostgreSQL is running
echo "🔌 Testing PostgreSQL connection..."
if psql postgresql://postgres:postgres@localhost:5432/realtor -c "SELECT 1" 2>/dev/null; then
    echo "✅ PostgreSQL connection successful"
else
    echo "❌ ERROR: Cannot connect to PostgreSQL"
    echo "   Make sure PostgreSQL is running"
    exit 1
fi

echo ""
echo "📊 Current properties in database:"
psql postgresql://postgres:postgres@localhost:5432/realtor -c "SELECT COUNT(*) as total_properties FROM properties;"

echo ""
echo "🚀 To test property updates:"
echo ""
echo "1. Start your backend server:"
echo "   cd server && npm run dev"
echo ""
echo "2. Go to your admin panel and edit a property"
echo ""
echo "3. Check if it was saved to the database by running:"
echo "   psql postgresql://postgres:postgres@localhost:5432/realtor -c \\"
echo "     SELECT property_id, title, updated_at FROM properties ORDER BY updated_at DESC LIMIT 1;"
echo ""
echo "4. You should see a recent 'updated_at' timestamp"
echo ""
echo "✅ If the timestamp is recent, property updates are being saved to PostgreSQL!"
