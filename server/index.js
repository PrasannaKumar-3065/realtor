"use strict";

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const path = require("path");

const propertiesRouter = require("./routes/properties");
const configRouter = require("./routes/config");
const uploadRouter = require("./routes/upload");
const leadsRouter = require("./routes/leads");
const bookingsRouter = require("./routes/bookings");
const analyticsRouter = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── Static: uploaded images ────────────────────────────────────────────────
// Uploaded files use unique IDs in their filenames, so they're effectively immutable —
// safe to cache aggressively. This is critical for 360° panoramas (multi-MB) so
// repeat views and scene transitions on mobile don't re-download the same image.
const UPLOADS_DIR = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "30d",
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // 30-day public cache; immutable filenames mean we don't need revalidation.
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      // Tell browsers/proxies to fetch a Range slice when supported (Pannellum does this for big jpgs)
      res.setHeader("Accept-Ranges", "bytes");
      // Help mobile browsers cross-origin (preview iframe is on a different host than the API)
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/upload", uploadRouter);
app.use("/api/:agency/properties", propertiesRouter);
app.use("/api/:agency/config", configRouter);
app.use("/api/:agency/leads", leadsRouter);
app.use("/api/:agency/bookings", bookingsRouter);
app.use("/api/:agency/analytics", analyticsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Serve built frontend in production ─────────────────────────────────────
if (IS_PRODUCTION) {
  const DIST = path.join(__dirname, "..", "artifacts", "realestate-landing", "dist", "public");
  app.use(express.static(DIST));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      res.sendFile(path.join(DIST, "index.html"));
    }
  });
}

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  const mode = IS_PRODUCTION ? "production" : "development";
  console.log(`\n  Real Estate API Server`);
  console.log(`  Mode:     ${mode}`);
  console.log(`  Listening: http://0.0.0.0:${PORT}`);
  console.log(`  Health:    http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
