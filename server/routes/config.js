"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

// GET /api/:agency/config/:section
router.get("/:section", async (req, res) => {
  try {
    const { agency, section } = req.params;
    const data = await db.getConfig(agency, section);
    if (data === null) {
      return res.status(404).json({ success: false, error: "Config section not found" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/:agency/config/:section
router.put("/:section", async (req, res) => {
  try {
    const { agency, section } = req.params;
    const data = await db.setConfig(agency, section, req.body);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
