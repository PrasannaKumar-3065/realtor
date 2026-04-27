"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

// ─── PostgreSQL (optional) ────────────────────────────────────────────────────
let pool = null;
if (process.env.DATABASE_URL) {
  try {
    const { Pool } = require("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL client error:", err);
    });
  } catch (err) {
    console.error("Failed to initialize PostgreSQL pool:", err.message);
    pool = null;
  }
}

const AGENCY_ID_CACHE = new Map();
async function getAgencyId(agency) {
  if (AGENCY_ID_CACHE.has(agency)) return AGENCY_ID_CACHE.get(agency);
  const fallback = { prithvi: 1, priya: 2, bhima: 3 }[agency] || 1;
  if (!pool) return fallback;
  try {
    const res = await pool.query("SELECT id FROM agencies WHERE agency_key = $1", [agency]);
    const id = res.rows[0]?.id || fallback;
    AGENCY_ID_CACHE.set(agency, id);
    return id;
  } catch {
    return fallback;
  }
}

async function ensureAgencyConfigTable() {
  if (!pool) return;
  if (ensureAgencyConfigTable._done) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agency_config (
      id SERIAL PRIMARY KEY,
      agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
      section VARCHAR(100) NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (agency_id, section)
    )
  `);
  ensureAgencyConfigTable._done = true;
}
ensureAgencyConfigTable._done = false;

function toFiniteNumber(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
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

// ─── Properties ───────────────────────────────────────────────────────────────
async function getAllProperties(agency) {
  // Try to load from PostgreSQL first if available
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
          price: toFiniteNumber(row.price) ?? 0,
          location: row.location,
          city: row.city,
          lat: toFiniteNumber(row.latitude) ?? 0,
          lng: toFiniteNumber(row.longitude) ?? 0,
          images: row.image_urls || [],
          features: row.features || [],
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          area: toFiniteNumber(row.area) ?? 0,
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
          bookingsCount: row.bookings_count || 0,
          youtubeLinks: row.youtube_links || [],
        }));
      }
    } catch (err) {
      console.error("Info: PostgreSQL not available, falling back to JSON:", err.message);
      // Fall through to JSON
    }
  }
  
  // Fall back to JSON
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
  
  // Try to save to PostgreSQL
  try {
    if (!pool) throw new Error("PostgreSQL not configured");

    const agencyId = await getAgencyId(agency);
    const priceFromValue = toFiniteNumber(data.priceValue);
    const priceFromRaw = toFiniteNumber(data.price);
    
    const dbData = {
      propertyId: id,
      agencyId: agencyId,
      title: data.title,
      description: data.description,
      price: priceFromValue ?? priceFromRaw,
      location: data.location,
      city: data.city,
      latitude: data.lat ? parseFloat(data.lat.toString()) : null,
      longitude: data.lng ? parseFloat(data.lng.toString()) : null,
      image_urls: JSON.stringify(data.images || data.image_urls || []),
      features: JSON.stringify(data.features || []),
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      area: data.area ? parseFloat(data.area.toString()) : null,
      property_type: data.type || data.property_type,
      ownership: data.ownership,
      sale_type: data.saleType || data.sale_type,
      project_name: data.project || data.project_name,
      landmarks: JSON.stringify(data.landmarks || []),
      nearby_places: JSON.stringify(data.nearbyPlaces || data.nearby_places || []),
      tags: JSON.stringify(data.tags || []),
      status: data.status || "available",
      featured: data.featured || false,
      views: data.views || 0,
      leads_count: data.leadsCount || 0,
      youtube_links: JSON.stringify(data.youtubeLinks || []),
    };

    if (idx >= 0) {
      // Update existing
      const updateQuery = `
        UPDATE properties 
        SET title = $1, description = $2, price = COALESCE($3, price), location = $4, city = $5,
            latitude = $6, longitude = $7, image_urls = $8::jsonb, features = $9::jsonb,
            bedrooms = $10, bathrooms = $11, area = $12, property_type = $13,
            ownership = $14, sale_type = $15, project_name = $16, landmarks = $17::jsonb,
            nearby_places = $18::jsonb, tags = $19::jsonb, status = $20, featured = $21,
            views = $22, leads_count = $23, youtube_links = $24::jsonb, updated_at = NOW()
        WHERE property_id = $25
      `;
      
      await pool.query(updateQuery, [
        dbData.title, dbData.description, dbData.price, dbData.location, dbData.city,
        dbData.latitude, dbData.longitude, dbData.image_urls, dbData.features,
        dbData.bedrooms, dbData.bathrooms, dbData.area, dbData.property_type,
        dbData.ownership, dbData.sale_type, dbData.project_name, dbData.landmarks,
        dbData.nearby_places, dbData.tags, dbData.status, dbData.featured,
        dbData.views, dbData.leads_count, dbData.youtube_links, id
      ]);
    } else {
      // Insert new
      const insertQuery = `
        INSERT INTO properties (
          property_id, agency_id, title, description, price, location, city,
          latitude, longitude, image_urls, features, bedrooms, bathrooms, area,
          property_type, ownership, sale_type, project_name, landmarks, nearby_places,
          tags, status, featured, views, leads_count, youtube_links
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20::jsonb, $21::jsonb, $22, $23, $24, $25, $26::jsonb)
      `;
      
      await pool.query(insertQuery, [
        dbData.propertyId, dbData.agencyId, dbData.title, dbData.description, dbData.price, dbData.location, dbData.city,
        dbData.latitude, dbData.longitude, dbData.image_urls, dbData.features, dbData.bedrooms, dbData.bathrooms, dbData.area,
        dbData.property_type, dbData.ownership, dbData.sale_type, dbData.project_name, dbData.landmarks, dbData.nearby_places,
        dbData.tags, dbData.status, dbData.featured, dbData.views, dbData.leads_count, dbData.youtube_links
      ]);
    }
    
    console.log(`✓ Property ${id} saved to PostgreSQL`);
  } catch (err) {
    console.error(`⚠ Failed to save property to PostgreSQL: ${err.message}`);
    // Continue anyway - JSON is still saved
  }
  
  return updatedProperty;
}

async function deleteProperty(agency, id) {
  const props = (await getAllProperties(agency)).filter((p) => p.id !== id);
  writeJSON(agency, "properties", props);
  
  // Try to delete from PostgreSQL
  try {
    if (!pool) throw new Error("PostgreSQL not configured");
    const deleteQuery = "DELETE FROM properties WHERE property_id = $1";
    await pool.query(deleteQuery, [id]);
    console.log(`✓ Property ${id} deleted from PostgreSQL`);
  } catch (err) {
    console.error(`⚠ Failed to delete property from PostgreSQL: ${err.message}`);
  }
}

async function incrementPropertyField(agency, propertyId, field) {
  const props = readJSON(agency, "properties") || [];
  const idx = props.findIndex((p) => p.id === propertyId);
  if (idx >= 0) {
    props[idx][field] = (props[idx][field] || 0) + 1;
    writeJSON(agency, "properties", props);
  }

  if (!pool) return;
  try {
    if (field === "views") {
      await pool.query("UPDATE properties SET views = COALESCE(views,0) + 1, updated_at = NOW() WHERE property_id = $1", [propertyId]);
    }
    if (field === "leadsCount") {
      await pool.query("UPDATE properties SET leads_count = COALESCE(leads_count,0) + 1, updated_at = NOW() WHERE property_id = $1", [propertyId]);
    }
    if (field === "bookingsCount") {
      // Column not in base schema; ignore if not present.
      await pool.query("UPDATE properties SET updated_at = NOW() WHERE property_id = $1", [propertyId]);
    }
  } catch {
    // ignore
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
  const isReturning = existingLeads.some((l) => l.phone === data.phone);
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

async function getAllLeads(agency) {
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      const result = await pool.query(
        "SELECT * FROM leads WHERE agency_id = $1 ORDER BY created_at DESC",
        [agencyId]
      );
      if (result.rows.length > 0) {
        return result.rows.map((row) => ({
          id: row.lead_id,
          agency,
          name: row.name || "",
          phone: row.phone || "",
          email: row.email || "",
          message: row.message || "",
          propertyId: row.property_id || "",
          propertyTitle: row.property_title || "",
          source: row.source || "form",
          score: row.score ?? 10,
          temperature: row.temperature || scoreToTemperature(row.score ?? 10),
          status: row.status || "new",
          createdAt: (row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at) || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Info: PostgreSQL not available for leads, falling back to JSON:", err.message);
    }
  }
  return readJSON(agency, "leads") || [];
}

async function createLead(agency, data) {
  const leads = await getAllLeads(agency);
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

  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      await pool.query(
        `INSERT INTO leads (lead_id, agency_id, name, phone, email, message, property_id, property_title, source, score, temperature, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (lead_id) DO UPDATE SET
           name=EXCLUDED.name, phone=EXCLUDED.phone, email=EXCLUDED.email, message=EXCLUDED.message,
           property_id=EXCLUDED.property_id, property_title=EXCLUDED.property_title, source=EXCLUDED.source,
           score=EXCLUDED.score, temperature=EXCLUDED.temperature, status=EXCLUDED.status, updated_at=NOW()`,
        [
          id,
          agencyId,
          lead.name,
          lead.phone,
          lead.email,
          lead.message,
          lead.propertyId || null,
          lead.propertyTitle,
          lead.source,
          lead.score,
          lead.temperature,
          lead.status,
        ]
      );
    } catch (err) {
      console.error(`⚠ Failed to save lead to PostgreSQL: ${err.message}`);
    }
  }

  if (data.propertyId) {
    await incrementPropertyField(agency, data.propertyId, "leadsCount");
  }
  return lead;
}

async function updateLead(agency, id, data) {
  const leads = await getAllLeads(agency);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error("Lead not found");
  leads[idx] = { ...leads[idx], ...data, id, agency };
  if ("score" in data || "message" in data || "source" in data) {
    const score = leads[idx].score || 0;
    leads[idx].temperature = scoreToTemperature(score);
  }
  writeJSON(agency, "leads", leads);

  if (pool) {
    try {
      await pool.query(
        "UPDATE leads SET status = $1, temperature = $2, score = $3, updated_at = NOW() WHERE lead_id = $4",
        [leads[idx].status, leads[idx].temperature, leads[idx].score, id]
      );
    } catch (err) {
      console.error(`⚠ Failed to update lead in PostgreSQL: ${err.message}`);
    }
  }
  return leads[idx];
}

async function deleteLead(agency, id) {
  const leads = (await getAllLeads(agency)).filter((l) => l.id !== id);
  writeJSON(agency, "leads", leads);

  if (pool) {
    try {
      await pool.query("DELETE FROM leads WHERE lead_id = $1", [id]);
    } catch (err) {
      console.error(`⚠ Failed to delete lead from PostgreSQL: ${err.message}`);
    }
  }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
function generateBookingId() {
  return `booking-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

async function getAllBookings(agency) {
  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      const result = await pool.query(
        `SELECT b.*, p.title AS property_title
         FROM bookings b
         LEFT JOIN properties p ON p.property_id = b.property_id
         WHERE b.agency_id = $1
         ORDER BY b.created_at DESC`,
        [agencyId]
      );
      if (result.rows.length > 0) {
        return result.rows.map((row) => ({
          // notes may include extra booking metadata (e.g. time/propertyTitle)
          // stored as JSON string by this API.
          id: row.booking_id,
          agency,
          name: row.customer_name || "",
          phone: row.customer_phone || "",
          propertyId: row.property_id || "",
          propertyTitle: (() => {
            const joined = row.property_title;
            if (typeof joined === "string" && joined.trim()) return joined;
            const notes = row.notes;
            if (typeof notes !== "string" || !notes.trim()) return "";
            try {
              const parsed = JSON.parse(notes);
              return typeof parsed?.propertyTitle === "string" ? parsed.propertyTitle : "";
            } catch {
              return "";
            }
          })(),
          date: row.booking_date ? (row.booking_date instanceof Date ? row.booking_date.toISOString().slice(0, 10) : String(row.booking_date)) : "",
          time: (() => {
            const notes = row.notes;
            if (typeof notes !== "string" || !notes.trim()) return "";
            try {
              const parsed = JSON.parse(notes);
              return typeof parsed?.time === "string" ? parsed.time : "";
            } catch {
              return "";
            }
          })(),
          status: row.booking_status || "pending",
          createdAt: (row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at) || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Info: PostgreSQL not available for bookings, falling back to JSON:", err.message);
    }
  }
  return readJSON(agency, "bookings") || [];
}

async function createBooking(agency, data) {
  const bookings = await getAllBookings(agency);
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

  if (pool) {
    try {
      const agencyId = await getAgencyId(agency);
      const bookingDate = booking.date ? booking.date : null;
      await pool.query(
        `INSERT INTO bookings (booking_id, agency_id, property_id, customer_name, customer_phone, booking_date, booking_status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (booking_id) DO UPDATE SET
           customer_name=EXCLUDED.customer_name, customer_phone=EXCLUDED.customer_phone,
           booking_date=EXCLUDED.booking_date, booking_status=EXCLUDED.booking_status, notes=EXCLUDED.notes, updated_at=NOW()`,
        [id, agencyId, booking.propertyId, booking.name, booking.phone, bookingDate, booking.status, JSON.stringify({ time: booking.time, propertyTitle: booking.propertyTitle })]
      );
    } catch (err) {
      console.error(`⚠ Failed to save booking to PostgreSQL: ${err.message}`);
    }
  }

  if (data.propertyId) {
    await incrementPropertyField(agency, data.propertyId, "bookingsCount");
  }
  return booking;
}

async function updateBooking(agency, id, data) {
  const bookings = await getAllBookings(agency);
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error("Booking not found");
  bookings[idx] = { ...bookings[idx], ...data, id, agency };
  writeJSON(agency, "bookings", bookings);

  if (pool) {
    try {
      await pool.query(
        "UPDATE bookings SET booking_status = $1, updated_at = NOW() WHERE booking_id = $2",
        [bookings[idx].status, id]
      );
    } catch (err) {
      console.error(`⚠ Failed to update booking in PostgreSQL: ${err.message}`);
    }
  }
  return bookings[idx];
}

async function deleteBooking(agency, id) {
  const bookings = (await getAllBookings(agency)).filter((b) => b.id !== id);
  writeJSON(agency, "bookings", bookings);

  if (pool) {
    try {
      await pool.query("DELETE FROM bookings WHERE booking_id = $1", [id]);
    } catch (err) {
      console.error(`⚠ Failed to delete booking from PostgreSQL: ${err.message}`);
    }
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────
const configCache = {};

async function getConfig(agency, section) {
  if (pool) {
    try {
      await ensureAgencyConfigTable();
      const agencyId = await getAgencyId(agency);
      const res = await pool.query(
        "SELECT data FROM agency_config WHERE agency_id = $1 AND section = $2",
        [agencyId, section]
      );
      if (res.rows[0]?.data != null) return res.rows[0].data;
    } catch (err) {
      console.error("Info: PostgreSQL not available for config, falling back to JSON:", err.message);
    }
  }
  if (!configCache[agency]) {
    configCache[agency] = {};
    const dir = path.join(DATA_DIR, agency);
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir)) {
        if (file.endsWith(".json") && file !== "properties.json" && file !== "leads.json" && file !== "bookings.json") {
          const key = file.replace(".json", "");
          const data = readJSON(agency, key);
          if (data !== null) configCache[agency][key] = data;
        }
      }
    }
  }
  if (!section) return configCache[agency];
  const jsonValue = configCache[agency][section] ?? null;

  // If DB is enabled but this section wasn't in DB yet, seed it once from JSON.
  if (pool && jsonValue !== null) {
    try {
      await ensureAgencyConfigTable();
      const agencyId = await getAgencyId(agency);
      await pool.query(
        `INSERT INTO agency_config (agency_id, section, data)
         VALUES ($1,$2,$3::jsonb)
         ON CONFLICT (agency_id, section) DO NOTHING`,
        [agencyId, section, JSON.stringify(jsonValue)]
      );
    } catch {
      // ignore
    }
  }

  return jsonValue;
}

async function setConfig(agency, section, data) {
  configCache[agency] ||= {};
  const prev = configCache[agency][section];
  const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);
  configCache[agency][section] = isPlainObject(prev) && isPlainObject(data) ? { ...prev, ...data } : data;
  writeJSON(agency, section, configCache[agency][section]);

  if (pool) {
    try {
      await ensureAgencyConfigTable();
      const agencyId = await getAgencyId(agency);
      await pool.query(
        `INSERT INTO agency_config (agency_id, section, data)
         VALUES ($1,$2,$3::jsonb)
         ON CONFLICT (agency_id, section) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [agencyId, section, JSON.stringify(configCache[agency][section] ?? null)]
      );
    } catch (err) {
      console.error(`⚠ Failed to save config to PostgreSQL: ${err.message}`);
    }
  }

  return configCache[agency][section];
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

async function getAnalytics(agency) {
  const leads = await getAllLeads(agency);
  const bookings = await getAllBookings(agency);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalLeads = leads.length;
  const totalBookings = bookings.length;
  const conversionRate = totalLeads > 0 ? +((totalBookings / totalLeads) * 100).toFixed(1) : 0;

  const todayLeads = leads.filter((l) => l.createdAt.startsWith(today)).length;
  const weekLeads = leads.filter((l) => new Date(l.createdAt) >= weekAgo).length;
  const monthLeads = leads.filter((l) => new Date(l.createdAt) >= monthAgo).length;

  const days7 = getLast7Days();
  const leadsByDay = days7.map((date) => ({
    date,
    count: leads.filter((l) => l.createdAt.startsWith(date)).length,
  }));
  const bookingsByDay = days7.map((date) => ({
    date,
    count: bookings.filter((b) => b.createdAt.startsWith(date)).length,
  }));

  const temperatureStats = {
    hot: leads.filter((l) => l.temperature === "hot").length,
    warm: leads.filter((l) => l.temperature === "warm").length,
    cold: leads.filter((l) => l.temperature === "cold").length,
  };

  const topProperties = (await getAllProperties(agency))
    .map((p) => ({ id: p.id, title: p.title, views: p.views || 0, leadsCount: p.leadsCount || 0, bookingsCount: p.bookingsCount || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return { totalLeads, totalBookings, conversionRate, todayLeads, weekLeads, monthLeads, leadsByDay, bookingsByDay, temperatureStats, topProperties };
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
