"use strict";

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DATA_DIR = path.join(__dirname, "data");

// Create a connection pool for PostgreSQL
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
}

// ─── File helpers ─────────────────────────────────────────────────────────────
function ensureDir(agency) {
  const dir = path.join(DATA_DIR, agency);
  fs.mkdirSync(dir, { recursive: true });
}

function readJSON(agency, section) {
  try {
    const file = path.join(DATA_DIR, agency, `${section}.json`);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function writeJSON(agency, section, data) {
  ensureDir(agency);
  const file = path.join(DATA_DIR, agency, `${section}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// ─── Helper: Get agency ID ─────────────────────────────────────────────────────
async function getAgencyId(agency) {
  if (!pool) return { prithvi: 1, priya: 2, bhima: 3 }[agency] || 1;
  
  try {
    const result = await pool.query("SELECT id FROM agencies WHERE agency_key = $1", [agency]);
    return result.rows[0]?.id || ({ prithvi: 1, priya: 2, bhima: 3 }[agency] || 1);
  } catch (err) {
    return { prithvi: 1, priya: 2, bhima: 3 }[agency] || 1;
  }
}

// ─── Properties ───────────────────────────────────────────────────────────────
async function getAllProperties(agency) {
  // Try PostgreSQL first
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      const result = await pool.query(
        "SELECT * FROM properties WHERE agency_id = $1 ORDER BY created_at DESC",
        [agencyId]
      );

      if (result.rows.length > 0) {
        return result.rows.map((row) => ({
          id: row.property_id,
          title: row.title,
          description: row.description,
          price: parseFloat(row.price || 0),
          location: row.location,
          city: row.city,
          lat: parseFloat(row.latitude || 0),
          lng: parseFloat(row.longitude || 0),
          images: row.image_urls || [],
          features: row.features || [],
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          area: parseFloat(row.area || 0),
          type: row.property_type,
          ownership: row.ownership,
          saleType: row.sale_type,
          project: row.project_name,
          landmarks: row.landmarks || [],
          nearbyPlaces: row.nearby_places || [],
          tags: row.tags || [],
          status: row.status,
          featured: row.featured,
          views: row.views || 0,
          leadsCount: row.leads_count || 0,
          youtubeLinks: row.youtube_links || [],
        }));
      }
    } catch (err) {
      console.error("PostgreSQL error in getAllProperties:", err.message);
    }
  }

  // Fallback to JSON
  return readJSON(agency, "properties") || [];
}

async function upsertProperty(agency, id, data) {
  const props = await getAllProperties(agency);
  const idx = props.findIndex((p) => p.id === id);
  const now = new Date().toISOString();
  let updatedProperty;

  if (idx >= 0) {
    updatedProperty = {
      ...props[idx],
      ...data,
      id,
      views: props[idx].views || 0,
      leadsCount: props[idx].leadsCount || 0,
      bookingsCount: props[idx].bookingsCount || 0,
      updatedAt: now,
    };
    props[idx] = updatedProperty;
  } else {
    updatedProperty = {
      ...data,
      id,
      views: 0,
      leadsCount: 0,
      bookingsCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    props.push(updatedProperty);
  }

  // Save to JSON
  writeJSON(agency, "properties", props);

  // Save to PostgreSQL
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);

      const dbData = {
        propertyId: id,
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        location: data.location,
        city: data.city,
        latitude: data.lat ? parseFloat(data.lat) : null,
        longitude: data.lng ? parseFloat(data.lng) : null,
        imageUrls: JSON.stringify(data.images || []),
        features: JSON.stringify(data.features || []),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area: data.area ? parseFloat(data.area) : null,
        propertyType: data.type || data.property_type,
        ownership: data.ownership,
        saleType: data.saleType || data.sale_type,
        projectName: data.project || data.project_name,
        landmarks: JSON.stringify(data.landmarks || []),
        nearbyPlaces: JSON.stringify(data.nearbyPlaces || []),
        tags: JSON.stringify(data.tags || []),
        status: data.status || "available",
        featured: data.featured || false,
        views: data.views || 0,
        leadsCount: data.leadsCount || 0,
        youtubeLinks: JSON.stringify(data.youtubeLinks || []),
      };

      if (idx >= 0) {
        // Update
        await pool.query(
          `UPDATE properties SET 
            title = $1, description = $2, price = $3, location = $4, city = $5,
            latitude = $6, longitude = $7, image_urls = $8::jsonb, features = $9::jsonb,
            bedrooms = $10, bathrooms = $11, area = $12, property_type = $13,
            ownership = $14, sale_type = $15, project_name = $16, landmarks = $17::jsonb,
            nearby_places = $18::jsonb, tags = $19::jsonb, status = $20, featured = $21,
            views = $22, leads_count = $23, youtube_links = $24::jsonb, updated_at = NOW()
           WHERE property_id = $25`,
          [
            dbData.title, dbData.description, dbData.price, dbData.location, dbData.city,
            dbData.latitude, dbData.longitude, dbData.imageUrls, dbData.features,
            dbData.bedrooms, dbData.bathrooms, dbData.area, dbData.propertyType,
            dbData.ownership, dbData.saleType, dbData.projectName, dbData.landmarks,
            dbData.nearbyPlaces, dbData.tags, dbData.status, dbData.featured,
            dbData.views, dbData.leadsCount, dbData.youtubeLinks, id
          ]
        );
      } else {
        // Insert
        await pool.query(
          `INSERT INTO properties (
            property_id, agency_id, title, description, price, location, city,
            latitude, longitude, image_urls, features, bedrooms, bathrooms, area,
            property_type, ownership, sale_type, project_name, landmarks, nearby_places,
            tags, status, featured, views, leads_count, youtube_links
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20::jsonb, $21::jsonb, $22, $23, $24, $25, $26::jsonb)`,
          [
            dbData.propertyId, agencyId, dbData.title, dbData.description, dbData.price, dbData.location, dbData.city,
            dbData.latitude, dbData.longitude, dbData.imageUrls, dbData.features,
            dbData.bedrooms, dbData.bathrooms, dbData.area, dbData.propertyType,
            dbData.ownership, dbData.saleType, dbData.projectName, dbData.landmarks,
            dbData.nearbyPlaces, dbData.tags, dbData.status, dbData.featured,
            dbData.views, dbData.leadsCount, dbData.youtubeLinks
          ]
        );
      }

      console.log(`✓ Property ${id} saved to PostgreSQL`);
    } catch (err) {
      console.error(`✖ PostgreSQL error saving property: ${err.message}`);
    }
  }

  return updatedProperty;
}

async function deleteProperty(agency, id) {
  const props = (await getAllProperties(agency)).filter((p) => p.id !== id);
  writeJSON(agency, "properties", props);

  if (pool) {
    try {
      await pool.query("DELETE FROM properties WHERE property_id = $1", [id]);
      console.log(`✓ Property ${id} deleted from PostgreSQL`);
    } catch (err) {
      console.error(`✖ PostgreSQL error deleting property: ${err.message}`);
    }
  }
}

function incrementPropertyField(agency, propertyId, field) {
  const props = readJSON(agency, "properties") || [];
  const idx = props.findIndex((p) => p.id === propertyId);
  if (idx >= 0) {
    props[idx][field] = (props[idx][field] || 0) + 1;
    writeJSON(agency, "properties", props);
  }
}

// ─── Uploads ──────────────────────────────────────────────────────────────────
const uploadsData = {};

function saveUpload(filename, metadata) {
  uploadsData[filename] = { filename, ...metadata, uploadedAt: new Date().toISOString() };
  return uploadsData[filename];
}

function getUpload(filename) {
  return uploadsData[filename] || null;
}

// ─── Lead Scoring ─────────────────────────────────────────────────────────────
const HOT_KEYWORDS = ["urgent", "call me", "visit", "today", "asap", "immediately", "interested", "book"];

function calcLeadScore(data, existingLeads) {
  let score = 10;
  if (data.source === "visit") score += 50;
  const msg = (data.message || "").toLowerCase();
  if (HOT_KEYWORDS.some((kw) => msg.includes(kw))) score += 30;
  const isReturning = existingLeads?.some((l) => l.phone === data.phone);
  if (isReturning) score += 20;
  return score;
}

function scoreToTemperature(score) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

// ─── Leads ────────────────────────────────────────────────────────────────────
function generateLeadId() {
  return `lead-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function getAllLeads(agency) {
  return readJSON(agency, "leads") || [];
}

async function createLead(agency, data) {
  const leads = getAllLeads(agency);
  const id = generateLeadId();
  const score = calcLeadScore(data, leads);
  const lead = {
    id,
    agency,
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    message: data.message || "",
    propertyId: data.propertyId || "",
    propertyTitle: data.propertyTitle || "",
    source: data.source || "form",
    score,
    temperature: scoreToTemperature(score),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  writeJSON(agency, "leads", leads);

  // Save to PostgreSQL
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      await pool.query(
        `INSERT INTO leads (lead_id, agency_id, name, phone, email, message, property_id, property_title, source, score, temperature, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [id, agencyId, lead.name, lead.phone, lead.email, lead.message, lead.propertyId, lead.propertyTitle, lead.source, lead.score, lead.temperature, lead.status]
      );
      console.log(`✓ Lead ${id} saved to PostgreSQL`);
    } catch (err) {
      console.error(`✖ PostgreSQL error saving lead: ${err.message}`);
    }
  }

  if (data.propertyId) {
    incrementPropertyField(agency, data.propertyId, "leadsCount");
  }
  return lead;
}

async function updateLead(agency, id, data) {
  const leads = getAllLeads(agency);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Lead not found");
  leads[idx] = { ...leads[idx], ...data, id, agency };
  if ("score" in data || "message" in data || "source" in data) {
    const score = leads[idx].score || 0;
    leads[idx].temperature = scoreToTemperature(score);
  }
  writeJSON(agency, "leads", leads);

  // Update in PostgreSQL
  if (pool) {
    try {
      await pool.query(
        `UPDATE leads SET status = $1, temperature = $2 WHERE lead_id = $3`,
        [leads[idx].status, leads[idx].temperature, id]
      );
    } catch (err) {
      console.error(`✖ PostgreSQL error updating lead: ${err.message}`);
    }
  }

  return leads[idx];
}

function deleteLead(agency, id) {
  const leads = getAllLeads(agency).filter((l) => l.id !== id);
  writeJSON(agency, "leads", leads);

  if (pool) {
    pool.query("DELETE FROM leads WHERE lead_id = $1", [id]).catch((err) => {
      console.error(`✖ PostgreSQL error deleting lead: ${err.message}`);
    });
  }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
function generateBookingId() {
  return `booking-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function getAllBookings(agency) {
  return readJSON(agency, "bookings") || [];
}

async function createBooking(agency, data) {
  const bookings = getAllBookings(agency);
  const id = generateBookingId();
  const booking = {
    id,
    agency,
    name: data.name || "",
    phone: data.phone || "",
    propertyId: data.propertyId || "",
    propertyTitle: data.propertyTitle || "",
    date: data.date || "",
    time: data.time || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  writeJSON(agency, "bookings", bookings);

  // Save to PostgreSQL
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      await pool.query(
        `INSERT INTO bookings (booking_id, agency_id, property_id, customer_name, customer_phone, booking_status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, agencyId, data.propertyId, booking.name, booking.phone, booking.status]
      );
      console.log(`✓ Booking ${id} saved to PostgreSQL`);
    } catch (err) {
      console.error(`✖ PostgreSQL error saving booking: ${err.message}`);
    }
  }

  if (data.propertyId) {
    incrementPropertyField(agency, data.propertyId, "bookingsCount");
  }
  return booking;
}

function updateBooking(agency, id, data) {
  const bookings = getAllBookings(agency);
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error("Booking not found");
  bookings[idx] = { ...bookings[idx], ...data, id, agency };
  writeJSON(agency, "bookings", bookings);

  // Update in PostgreSQL
  if (pool) {
    pool.query(
      `UPDATE bookings SET booking_status = $1 WHERE booking_id = $2`,
      [bookings[idx].status, id]
    ).catch((err) => {
      console.error(`✖ PostgreSQL error updating booking: ${err.message}`);
    });
  }

  return bookings[idx];
}

function deleteBooking(agency, id) {
  const bookings = getAllBookings(agency).filter((b) => b.id !== id);
  writeJSON(agency, "bookings", bookings);

  if (pool) {
    pool.query("DELETE FROM bookings WHERE booking_id = $1", [id]).catch((err) => {
      console.error(`✖ PostgreSQL error deleting booking: ${err.message}`);
    });
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────
const configCache = {};

function getConfig(agency, section) {
  const cacheKey = `${agency}:${section}`;
  if (configCache[cacheKey]) return configCache[cacheKey];

  const data = readJSON(agency, section);
  if (data !== null) configCache[cacheKey] = data;
  return data;
}

function setConfig(agency, section, data) {
  writeJSON(agency, section, data);
  const cacheKey = `${agency}:${section}`;
  configCache[cacheKey] = data;
  return data;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function getLast7Days() {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getAnalytics(agency) {
  const leads = getAllLeads(agency);
  const bookings = getAllBookings(agency);
  const properties = readJSON(agency, "properties") || [];

  const last7 = getLast7Days();
  const dailyData = last7.map((date) => ({
    date,
    leads: leads.filter((l) => l.createdAt?.startsWith(date)).length,
    bookings: bookings.filter((b) => b.createdAt?.startsWith(date)).length,
  }));

  return {
    totalLeads: leads.length,
    hotLeads: leads.filter((l) => l.temperature === "hot").length,
    totalBookings: bookings.length,
    totalProperties: properties.length,
    daily: dailyData,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getAllProperties,
  upsertProperty,
  deleteProperty,
  incrementPropertyField,
  saveUpload,
  getUpload,
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getConfig,
  setConfig,
  getAnalytics,
};
