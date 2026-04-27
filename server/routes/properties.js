"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

function generateId(agency) {
  return `${agency}-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

// GET /api/:agency/properties
router.get("/", async (req, res) => {
  try {
    const data = await db.getAllProperties(req.params.agency);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/:agency/properties
router.post("/", async (req, res) => {
  try {
    const { agency } = req.params;
    const id = req.body.id || generateId(agency);
    const property = await db.upsertProperty(agency, id, req.body);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/:agency/properties/:id
router.put("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    const property = await db.upsertProperty(agency, id, req.body);
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/:agency/properties/:id
router.delete("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    await db.deleteProperty(agency, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/:agency/properties/:id/view — increment view counter
router.post("/:id/view", async (req, res) => {
  try {
    const { agency, id } = req.params;
    await db.incrementPropertyField(agency, id, "views");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
