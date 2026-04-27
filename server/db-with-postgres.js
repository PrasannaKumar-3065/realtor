// Database layer with PostgreSQL support using Drizzle ORM
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

// Try to load Drizzle ORM database connection
let db = null;
let propertiesTable = null;
let leadsTable = null;
let agenciesTable = null;

try {
  // Attempt to load the compiled Drizzle ORM database
  const dbModule = require("../../lib/db/src/index.ts");
  db = dbModule.db;
  const schema = dbModule;
  propertiesTable = schema.propertiesTable;
  leadsTable = schema.leadsTable;
  agenciesTable = schema.agenciesTable;
  console.log("✓ PostgreSQL database connected via Drizzle ORM");
} catch (err) {
  console.warn("⚠ Could not connect to PostgreSQL. Falling back to JSON storage", err.message);
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

// ─── Helper: Convert property to database format ─────────────────────────────
function propertyToDBFormat(agency, data) {
  const agencyMap = { prithvi: 1, priya: 2, bhima: 3 };
  const agencyId = agencyMap[agency] || 1;

  return {
    propertyId: data.id || data.property_id,
    agencyId: agencyId,
    title: data.title,
    description: data.description,
    price: data.price ? parseFloat(data.price.toString()) : null,
    location: data.location,
    city: data.city,
    latitude: data.lat ? parseFloat(data.lat.toString()) : null,
    longitude: data.lng ? parseFloat(data.lng.toString()) : null,
    imageUrls: data.images || data.image_urls || [],
    features: data.features || [],
    bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
    bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
    area: data.area ? parseFloat(data.area.toString()) : null,
    propertyType: data.type || data.property_type,
    ownership: data.ownership,
    saleType: data.saleType || data.sale_type,
    projectName: data.project || data.project_name,
    landmarks: data.landmarks || [],
    nearbyPlaces: data.nearbyPlaces || data.nearby_places || [],
    tags: data.tags || [],
    status: data.status || "available",
    featured: data.featured || false,
    views: data.views || 0,
    leadsCount: data.leadsCount || 0,
    youtubeLinks: data.youtubeLinks || [],
  };
}

// ─── Properties ───────────────────────────────────────────────────────────────
async function getAllProperties(agency) {
  // Try to load from PostgreSQL first
  if (db && propertiesTable) {
    try {
      const { eq } = require("drizzle-orm");
      const agencyMap = { prithvi: 1, priya: 2, bhima: 3 };
      const agencyId = agencyMap[agency] || 1;

      const props = await db
        .select()
        .from(propertiesTable)
        .where(eq(propertiesTable.agencyId, agencyId));

      return props.map((p) => ({
        id: p.propertyId,
        title: p.title,
        description: p.description,
        price: p.price,
        location: p.location,
        city: p.city,
        lat: p.latitude,
        lng: p.longitude,
        images: p.imageUrls || [],
        features: p.features || [],
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        type: p.propertyType,
        ownership: p.ownership,
        saleType: p.saleType,
        project: p.projectName,
        landmarks: p.landmarks || [],
        nearbyPlaces: p.nearbyPlaces || [],
        tags: p.tags || [],
        status: p.status,
        featured: p.featured,
        views: p.views,
        leadsCount: p.leadsCount,
        youtubeLinks: p.youtubeLinks || [],
      }));
    } catch (err) {
      console.error("Error fetching from PostgreSQL:", err.message);
      // Fall through to JSON
    }
  }

  // Fall back to JSON
  return readJSON(agency, "properties") || [];
}

async function upsertProperty(agency, id, data) {
  const now = new Date().toISOString();
  const props = await getAllProperties(agency);
  const idx = props.findIndex((p) => p.id === id);

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

  // Try to save to PostgreSQL
  if (db && propertiesTable) {
    try {
      const { eq, sql } = require("drizzle-orm");
      const dbFormat = propertyToDBFormat(agency, updatedProperty);

      if (idx >= 0) {
        // Update existing
        await db.update(propertiesTable).set(dbFormat).where(eq(propertiesTable.propertyId, id));
      } else {
        // Insert new
        await db.insert(propertiesTable).values(dbFormat);
      }
      console.log(`✓ Property ${id} saved to PostgreSQL`);
    } catch (err) {
      console.error(`⚠ Failed to save property to PostgreSQL: ${err.message}`);
      // Continue anyway - JSON is still saved
    }
  }

  return updatedProperty;
}

async function deleteProperty(agency, id) {
  const props = (await getAllProperties(agency)).filter((p) => p.id !== id);
  writeJSON(agency, "properties", props);

  // Try to delete from PostgreSQL
  if (db && propertiesTable) {
    try {
      const { eq } = require("drizzle-orm");
      await db.delete(propertiesTable).where(eq(propertiesTable.propertyId, id));
      console.log(`✓ Property ${id} deleted from PostgreSQL`);
    } catch (err) {
      console.error(`⚠ Failed to delete property from PostgreSQL: ${err.message}`);
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

  // If there are similar leads from same person, boost score
  if (existingLeads) {
    const samePerson = existingLeads.filter((l) => l.phone === data.phone || l.email === data.email);
    if (samePerson.length > 0) score += 20;
  }

  return Math.min(score, 150);
}

function getTemperature(score) {
  if (score >= 80) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

// ─── Leads ────────────────────────────────────────────────────────────────────
function getAllLeads(agency) {
  return readJSON(agency, "leads") || [];
}

function createLead(agency, id, data) {
  const leads = getAllLeads(agency);
  const existingLeads = leads;
  const score = calcLeadScore(data, existingLeads);
  const temperature = getTemperature(score);

  const lead = {
    id,
    agency,
    ...data,
    score,
    temperature,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  leads.push(lead);
  writeJSON(agency, "leads", leads);
  return lead;
}

function updateLead(agency, id, data) {
  const leads = getAllLeads(agency);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;

  leads[idx] = { ...leads[idx], ...data };
  writeJSON(agency, "leads", leads);
  return leads[idx];
}

function deleteLead(agency, id) {
  const leads = getAllLeads(agency).filter((l) => l.id !== id);
  writeJSON(agency, "leads", leads);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
function getAllBookings(agency) {
  return readJSON(agency, "bookings") || [];
}

function createBooking(agency, id, data) {
  const bookings = getAllBookings(agency);
  const booking = {
    id,
    agency,
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  writeJSON(agency, "bookings", bookings);
  return booking;
}

function updateBooking(agency, id, data) {
  const bookings = getAllBookings(agency);
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) return null;

  bookings[idx] = { ...bookings[idx], ...data };
  writeJSON(agency, "bookings", bookings);
  return bookings[idx];
}

function deleteBooking(agency, id) {
  const bookings = getAllBookings(agency).filter((b) => b.id !== id);
  writeJSON(agency, "bookings", bookings);
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
