"use strict";

const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const db = require("../db");

// Allow very large equirectangular sources (sharp needs to enable big-image processing)
sharp.cache(false);
sharp.concurrency(1);

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const UPLOADS_360_DIR = path.join(UPLOADS_DIR, "360");

if (!fs.existsSync(UPLOADS_360_DIR)) {
  fs.mkdirSync(UPLOADS_360_DIR, { recursive: true });
}

// Equirectangular panorama compression target.
// 4096×2048 is ample for in-browser WebGL viewing and ~5–10× smaller than raw 8K input.
const PANO_MAX_WIDTH = 4096;
const PANO_JPEG_QUALITY = 82;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function makeStorage(targetDir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, targetDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      const id = generateId();
      cb(null, `${id}${ext}`);
    },
  });
}

const imageFileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
  storage: makeStorage(UPLOADS_DIR),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: imageFileFilter,
});

// 360 panoramas can be much larger (equirectangular images are big)
const upload360 = multer({
  storage: makeStorage(UPLOADS_360_DIR),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: imageFileFilter,
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

// POST /api/upload/360 — for 360° panorama scene images
// Re-encodes the panorama as optimised mozjpeg (max 4096px wide, q82, no metadata).
// Equirectangular sources are commonly 8K+ — this typically shrinks the file 5–10×
// without visible quality loss in a WebGL viewer, dramatically improving mobile load times.
router.post("/360", upload360.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded or invalid file type." });
  }
  const { filename, path: uploadedPath, originalname, mimetype } = req.file;
  const baseName = path.basename(filename, path.extname(filename));
  const optimisedName = `${baseName}.jpg`;
  const optimisedPath = path.join(UPLOADS_360_DIR, optimisedName);

  try {
    // Use a temp output path so we never overwrite the source mid-stream
    const tmpPath = `${optimisedPath}.tmp`;
    const info = await sharp(uploadedPath, { limitInputPixels: false, failOn: "none" })
      .rotate() // honour EXIF orientation, then strip metadata
      .resize({ width: PANO_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: PANO_JPEG_QUALITY, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
      .toFile(tmpPath);

    // Replace original with optimised version
    await fsp.rename(tmpPath, optimisedPath);
    if (uploadedPath !== optimisedPath) {
      await fsp.unlink(uploadedPath).catch(() => {});
    }

    const id = generateId();
    db.saveUpload(id, `360/${optimisedName}`, originalname, "image/jpeg", info.size);
    res.json({
      success: true,
      url: `/uploads/360/${optimisedName}`,
      filename: optimisedName,
      width: info.width,
      height: info.height,
      bytes: info.size,
    });
  } catch (err) {
    console.error("[upload/360] compression failed:", err.message);
    // Fall back to the raw upload so we never silently lose the user's file
    try {
      const stat = await fsp.stat(uploadedPath);
      const id = generateId();
      db.saveUpload(id, `360/${filename}`, originalname, mimetype, stat.size);
      return res.json({
        success: true,
        url: `/uploads/360/${filename}`,
        filename,
        bytes: stat.size,
        warning: "Stored without compression: " + err.message,
      });
    } catch (innerErr) {
      return res.status(500).json({ success: false, error: innerErr.message });
    }
  }
});

module.exports = router;
