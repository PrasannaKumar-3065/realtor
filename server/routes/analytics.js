"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

// GET /api/:agency/analytics
router.get("/", async (req, res) => {
  try {
    const data = await db.getAnalytics(req.params.agency);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
