"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../db");

// GET /api/:agency/bookings
router.get("/", async (req, res) => {
  try {
    const data = await db.getAllBookings(req.params.agency);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/:agency/bookings
router.post("/", async (req, res) => {
  try {
    const { agency } = req.params;
    const { name, phone, propertyId, propertyTitle, date, time } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });
    if (!propertyId) return res.status(400).json({ success: false, error: "PropertyId is required" });
    if (!date) return res.status(400).json({ success: false, error: "Date is required" });
    const booking = await db.createBooking(agency, { name, phone, propertyId, propertyTitle, date, time });
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/:agency/bookings/:id
router.patch("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    const booking = await db.updateBooking(agency, id, req.body);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(err.message === "Booking not found" ? 404 : 500).json({ success: false, error: err.message });
  }
});

// DELETE /api/:agency/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const { agency, id } = req.params;
    await db.deleteBooking(agency, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
