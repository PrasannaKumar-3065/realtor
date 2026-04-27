"use strict";

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const id = generateId();
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded or invalid file type." });
    }
    const { filename, originalname, mimetype, size } = req.file;
    const id = generateId();
    db.saveUpload(id, filename, originalname, mimetype, size);
    const url = `/uploads/${filename}`;
    res.json({ success: true, url, filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
