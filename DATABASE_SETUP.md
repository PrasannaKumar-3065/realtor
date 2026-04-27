# Database Setup Guide - India Real Estate Showcase

## Overview

This project uses PostgreSQL as the primary database with Drizzle ORM for type-safe database access. The setup includes comprehensive schema definitions, type-safe Drizzle ORM models, and migration scripts.

## Files Created

### 1. **schema-migrations.sql**
   - Complete PostgreSQL schema with all table definitions
   - Includes 10+ tables for complete real estate platform functionality
   - Foreign key relationships and proper constraints
   - Indexes for query optimization
   - Initial agency setup

### 2. **data-migration.sql**
   - Migrates existing JSON data from `server/data/` to PostgreSQL
   - Agency master data
   - Properties, leads, agents, contacts, founders
   - Sample properties from all agencies
   - Review and booking data

### 3. **Drizzle ORM Schema Files** (in `lib/db/src/schema/`)
   - `agencies.ts` - Agency master data
   - `agents.ts` - Agent information
   - `leads.ts` - Lead management
   - `bookings.ts` - Booking management
   - `contacts.ts` - Contact information
   - `founders.ts` - Agency founder/owner info
   - `reviews.ts` - Customer reviews and ratings
   - `property-views.ts` - Property view tracking
   - `site-info.ts` - Site/agency metadata
   - `properties.ts` - Property listings (already existed)

## Setup Instructions

### Step 1: Ensure PostgreSQL is Running

```bash
# On Linux
sudo systemctl start postgresql

# On macOS with Homebrew
brew services start postgresql

# On Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:latest
```

### Step 2: Create Database

```bash
# Using psql
psql -U postgres -h localhost

# Inside psql
CREATE DATABASE realtor;
\q
```

### Step 3: Run Schema Migration

```bash
# Execute the schema file
psql -U postgres -d realtor -f schema-migrations.sql

# Or from the workspace root
psql postgresql://postgres:postgres@localhost:5432/realtor < schema-migrations.sql
```

### Step 4: Run Data Migration

```bash
# Execute the data migration
psql -U postgres -d realtor -f data-migration.sql

# Or with full connection string
psql postgresql://postgres:postgres@localhost:5432/realtor < data-migration.sql
```

### Step 5: Verify Installation

```bash
# Connect to the database
psql postgresql://postgres:postgres@localhost:5432/realtor

# List all tables
\dt

# Check agencies
SELECT * FROM agencies;

# Check properties count by agency
SELECT a.name, COUNT(p.id) FROM agencies a LEFT JOIN properties p ON a.id = p.agency_id GROUP BY a.name;

# Exit
\q
```

## Environment Configuration

Ensure your `.env` file is properly configured:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realtor
```

For production, use secure credentials:
```env
DATABASE_URL=postgresql://username:password@host:port/database_name
```

## Database Schema Overview

### Core Tables

#### agencies
Stores information about real estate agencies
- Supports multiple agencies (Prithvi, Priya, Bhima)
- Unique agency_key for references

#### properties
Main properties listing table
- Stores all property types (apartment, villa, commercial, plot)
- Includes location, pricing, features
- Tracks views and leads count

#### agents
Real estate agents/professionals
- Linked to agencies
- Includes contact and specialization info

#### leads
Potential customers/leads
- Linked to properties and agencies
- Includes lead scoring and temperature
- Tracks source (form, visit, call)

#### bookings
Property booking management
- Links customers to properties
- Tracks booking amount and status
- Scheduled visits

#### contacts
Agency contact points
- Multiple contact types (Office, WhatsApp, Sales)
- Marks primary contact

#### founders
Agency owner/founder information
- Team size, experience, bio

#### reviews
Customer reviews and ratings
- Property and agency ratings
- Review status (pending, approved, rejected)

#### property_views
Track who viewed which property
- IP tracking
- Email tracking
- Timestamp tracking

#### site_info
Agency metadata and information
- About, mission, vision
- Social media links

## Using Drizzle ORM

The Drizzle ORM models are now available in the codebase. You can import and use them:

```typescript
import { db, propertiesTable, agentsTable, leadsTable } from '@/lib/db';

// Query properties
const properties = await db
  .select()
  .from(propertiesTable)
  .where(eq(propertiesTable.status, 'available'));

// Insert new lead
await db.insert(leadsTable).values({
  leadId: 'lead-123',
  agencyId: 1,
  name: 'John Doe',
  phone: '+91 9876543210',
  // ... other fields
});

// Query with relationships
import { leftJoin } from 'drizzle-orm';
const propertiesWithAgencies = await db
  .select()
  .from(propertiesTable)
  .leftJoin(agenciesTable, eq(propertiesTable.agencyId, agenciesTable.id));
```

## Data Structure Reference

### Properties Structure
```typescript
{
  propertyId: string;        // Unique identifier
  agencyId: number;          // Link to agency
  title: string;             // Property title
  description: string;       // Detailed description
  price: decimal;            // Price in currency
  location: string;          // Address
  city: string;              // City name
  latitude/longitude: decimal; // GPS coordinates
  bedrooms: integer;         // Number of bedrooms
  bathrooms: integer;        // Number of bathrooms
  area: decimal;             // Property area in sq ft
  propertyType: string;      // Type (apartment, villa, etc)
  features: jsonb;           // Array of features
  status: string;            // available, sold, hold
  imageUrls: jsonb;          // Array of image URLs
  tags: jsonb;               // Array of tags
}
```

### Leads Structure
```typescript
{
  leadId: string;            // Unique identifier
  agencyId: number;          // Link to agency
  name: string;              // Customer name
  phone: string;             // Contact number
  email: string;             // Email address
  message: string;           // Inquiry message
  propertyId: string;        // Interested property
  source: string;            // form, visit, call
  score: integer;            // Lead score (10-100+)
  temperature: string;       // cold, warm, hot
  status: string;            // new, contacted, qualified
}
```

## Common Queries

### Get all properties from an agency
```sql
SELECT * FROM properties 
WHERE agency_id = (SELECT id FROM agencies WHERE agency_key = 'prithvi');
```

### Get hot leads with details
```sql
SELECT l.*, p.title as property_title, a.name as agency_name
FROM leads l
LEFT JOIN properties p ON l.property_id = p.property_id
LEFT JOIN agencies a ON l.agency_id = a.id
WHERE l.temperature = 'hot'
ORDER BY l.score DESC;
```

### Properties grouped by type and status
```sql
SELECT property_type, status, COUNT(*) as count, AVG(price) as avg_price
FROM properties
GROUP BY property_type, status;
```

## Troubleshooting

### Issue: "DATABASE_URL must be set"
**Solution**: Check your `.env` file has the correct DATABASE_URL

### Issue: "FATAL: database 'realtor' does not exist"
**Solution**: Run Step 3 (Create Database) first

### Issue: Foreign key constraint failed
**Solution**: Run schema-migrations.sql before data-migration.sql

### Issue: Duplicate key value violates unique constraint
**Solution**: The data might already be inserted. Use `ON CONFLICT` clauses (already included in migration scripts)

## Next Steps

1. **Run Drizzle Migrations**: When schema changes are needed
   ```bash
   npm exec drizzle-kit generate:pg
   npm exec drizzle-kit migrate
   ```

2. **Generate API Types**: Use the generated Zod schemas for API validation
   ```typescript
   import { insertPropertySchema, type InsertProperty } from '@/lib/db';
   ```

3. **Create API Routes**: Build your API endpoints using the database layer

4. **Setup Monitoring**: Add database monitoring and query optimization as needed

## Useful Commands

```bash
# Connection check
psql postgresql://postgres:postgres@localhost:5432/realtor

# Backup database
pg_dump postgresql://postgres:postgres@localhost:5432/realtor > backup.sql

# Restore database
psql postgresql://postgres:postgres@localhost:5432/realtor < backup.sql

# See table structure
\d table_name

# See all indexes
\di
```

## Support & Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)

---

**Last Updated**: April 28, 2026
**Database Version**: PostgreSQL 12+
**ORM**: Drizzle ORM
