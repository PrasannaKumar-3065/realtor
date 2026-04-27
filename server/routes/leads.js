"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

// GET /api/:agency/leads
router.get("/", async (req, res) => {
  try {
    const data = await db.getAllLeads(req.params.agency);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/:agency/leads
router.post("/", async (req, res) => {
  try {
    const { agency } = req.params;
    const { name, phone, email, message, propertyId, propertyTitle, source } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });
    const lead = await db.createLead(agency, { name, phone, email, message, propertyId, propertyTitle, source });
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/:agency/leads/:id
router.patch("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    const lead = await db.updateLead(agency, id, req.body);
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(err.message === "Lead not found" ? 404 : 500).json({ success: false, error: err.message });
  }
});

// DELETE /api/:agency/leads/:id
router.delete("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    await db.deleteLead(agency, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
