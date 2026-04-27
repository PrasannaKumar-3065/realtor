"use strict";
/**
 * PostgreSQL database using pg client
 */

const { Pool } = require("pg");

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ─── Properties ────────────────────────────────────────────────────────────────
function mapProperty(row) {
  return {
    ...row,
    images: row.image_urls || [],
    features: row.features || [],
  };
}

async function getAllProperties(agency) { 
  const result = await pool.query(
    "SELECT * FROM properties WHERE agency = $1",
    [agency]
  );
  return result.rows.map(mapProperty);
}

async function upsertProperty(agency, id, data) {
  const existingResult = await pool.query(
    "SELECT * FROM properties WHERE property_id = $1",
    [id]
  );

  if (existingResult.rows.length > 0) {
    // Update existing
    const updateResult = await pool.query(
      `UPDATE properties SET title = $1, description = $2, price = $3, location = $4, 
       latitude = $5, longitude = $6, image_urls = $7, features = $8, 
       bedrooms = $9, bathrooms = $10, area = $11, property_type = $12, 
       status = $13, updated_at = NOW()
       WHERE property_id = $14 RETURNING *`,
      [
        data.title,
        data.description,
        data.price,
        data.location,
        data.latitude,
        data.longitude,
        JSON.stringify(data.imageUrls || data.images || []),
        JSON.stringify(data.features || []),
        data.bedrooms,
        data.bathrooms,
        data.area,
        data.propertyType,
        data.status,
        id,
      ]
    );
    return mapProperty(updateResult.rows[0]);
  } else {
    // Insert new
    const insertResult = await pool.query(
      `INSERT INTO properties 
       (property_id, agency, title, description, price, location, latitude, longitude,
        image_urls, features, bedrooms, bathrooms, area, property_type, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
       RETURNING *`,
      [
        id,
        agency,
        data.title,
        data.description,
        data.price,
        data.location,
        data.latitude,
        data.longitude,
        JSON.stringify(data.imageUrls || data.images || []),
        JSON.stringify(data.features || []),
        data.bedrooms,
        data.bathrooms,
        data.area,
        data.propertyType,
        data.status || "available",
      ]
    );
    return mapProperty(insertResult.rows[0]);
  }
}

async function deleteProperty(agency, id) {
  await pool.query("DELETE FROM properties WHERE property_id = $1", [id]);
}

// ─── Uploads ────────────────────────────────────────────────────────────────
const uploadsData = {};

function saveUpload(filename, metadata) {
  uploadsData[filename] = {
    filename,
    ...metadata,
    uploadedAt: new Date().toISOString(),
  };
  return uploadsData[filename];
}

function getUpload(filename) {
  return uploadsData[filename] || null;
}

// ─── Config & Other Data ────────────────────────────────────────────────────
const configData = {};

function getConfig(agency, section) {
  const agencyConfig = configData[agency];
  if (!agencyConfig) return null;
  if (!section) return agencyConfig;
  return agencyConfig[section] ?? null;
}

function setConfig(agency, section, data) {
  configData[agency] ||= {};

  const prev = configData[agency][section];
  const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

  // Merge object configs (founder/siteInfo), overwrite arrays (agents/contacts/etc)
  configData[agency][section] = isPlainObject(prev) && isPlainObject(data) ? { ...prev, ...data } : data;
  return configData[agency][section];
}

module.exports = {
  getAllProperties,
  upsertProperty,
  deleteProperty,
  saveUpload,
  getUpload,
  getConfig,
  setConfig,
};
