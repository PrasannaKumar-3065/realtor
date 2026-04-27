"use strict";

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const path = require("path");

const propertiesRouter = require("./routes/properties");
const configRouter = require("./routes/config");
const uploadRouter = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ─── Static: uploaded images ────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/upload", uploadRouter);
app.use("/api/:agency/properties", propertiesRouter);
app.use("/api/:agency/config", configRouter);

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
