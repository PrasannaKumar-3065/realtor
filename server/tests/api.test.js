"use strict";

/**
 * API Integration Tests for Prithvi Real Estate
 * Run with: node server/tests/api.test.js
 */

const http = require("http");

const BASE = "http://localhost:8080";
let passed = 0;
let failed = 0;

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

async function run() {
  console.log("\n🧪 Prithvi Real Estate API Tests\n");

  // ─── Health ───────────────────────────────────────────────────────────────
  console.log("Health");
  await test("GET /api/health returns ok", async () => {
    const res = await req("GET", "/api/health");
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.status === "ok", "status field not ok");
  });

  // ─── Properties ───────────────────────────────────────────────────────────
  console.log("\nProperties");
  await test("GET /api/prithvi/properties returns array", async () => {
    const res = await req("GET", "/api/prithvi/properties");
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.success === true, "success not true");
    assert(Array.isArray(res.body.data), "data is not array");
  });

  await test("GET /api/prithvi/properties returns 4+ properties", async () => {
    const res = await req("GET", "/api/prithvi/properties");
    assert(res.body.data.length >= 4, `only ${res.body.data.length} properties found`);
  });

  await test("GET /api/prithvi/properties items have required fields", async () => {
    const res = await req("GET", "/api/prithvi/properties");
    const p = res.body.data[0];
    assert(p.id, "missing id");
    assert(p.title, "missing title");
    assert(p.price, "missing price");
  });

  let prithvi1Id = "prithvi-1";
  await test("POST /api/prithvi/properties/:id/view increments view count", async () => {
    const res = await req("POST", `/api/prithvi/properties/${prithvi1Id}/view`);
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.success === true, "success not true");
  });

  // ─── Leads ────────────────────────────────────────────────────────────────
  console.log("\nLeads");
  let createdLeadId = null;

  await test("POST /api/prithvi/leads creates lead with score & temperature", async () => {
    const res = await req("POST", "/api/prithvi/leads", {
      name: "Test Lead",
      phone: "9876543210",
      email: "test@test.com",
      message: "I want to visit today urgently",
      propertyId: "prithvi-1",
      propertyTitle: "DTCP Approved Plot",
      source: "form",
    });
    assert(res.status === 200 || res.status === 201, `status ${res.status}`);
    assert(res.body.success === true, "success not true");
    assert(res.body.data.id, "missing lead id");
    assert(typeof res.body.data.score === "number", "missing score");
    assert(res.body.data.score >= 10, `score too low: ${res.body.data.score}`);
    assert(["hot", "warm", "cold"].includes(res.body.data.temperature), `bad temperature: ${res.body.data.temperature}`);
    createdLeadId = res.body.data.id;
  });

  await test("POST /api/prithvi/leads with source=visit scores hot (>=70)", async () => {
    const res = await req("POST", "/api/prithvi/leads", {
      name: "Hot Visitor",
      phone: "9000000001",
      message: "urgent visit today",
      propertyId: "prithvi-1",
      propertyTitle: "Plot",
      source: "visit",
    });
    assert(res.body.data.score >= 70, `score was ${res.body.data.score}, expected >=70`);
    assert(res.body.data.temperature === "hot", `expected hot, got ${res.body.data.temperature}`);
  });

  await test("GET /api/prithvi/leads returns array", async () => {
    const res = await req("GET", "/api/prithvi/leads");
    assert(res.status === 200, `status ${res.status}`);
    assert(Array.isArray(res.body.data), "not array");
    assert(res.body.data.length > 0, "no leads returned");
  });

  await test("PATCH /api/prithvi/leads/:id updates status", async () => {
    if (!createdLeadId) throw new Error("No lead to update");
    const res = await req("PATCH", `/api/prithvi/leads/${createdLeadId}`, { status: "contacted" });
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.data.status === "contacted", `status was ${res.body.data.status}`);
  });

  // ─── Bookings ─────────────────────────────────────────────────────────────
  console.log("\nBookings");
  let createdBookingId = null;

  await test("POST /api/prithvi/bookings creates booking", async () => {
    const res = await req("POST", "/api/prithvi/bookings", {
      name: "Visit Buyer",
      phone: "9876543211",
      propertyId: "prithvi-2",
      propertyTitle: "Agricultural Land",
      date: "2026-05-10",
      time: "11:00 AM",
    });
    assert(res.status === 200 || res.status === 201, `status ${res.status}`);
    assert(res.body.success === true, "success not true");
    assert(res.body.data.id, "missing booking id");
    assert(res.body.data.status === "pending", `status was ${res.body.data.status}`);
    createdBookingId = res.body.data.id;
  });

  await test("GET /api/prithvi/bookings returns array", async () => {
    const res = await req("GET", "/api/prithvi/bookings");
    assert(res.status === 200, `status ${res.status}`);
    assert(Array.isArray(res.body.data), "not array");
  });

  await test("PATCH /api/prithvi/bookings/:id confirms booking", async () => {
    if (!createdBookingId) throw new Error("No booking to update");
    const res = await req("PATCH", `/api/prithvi/bookings/${createdBookingId}`, { status: "confirmed" });
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.data.status === "confirmed", `status was ${res.body.data.status}`);
  });

  // ─── Analytics ────────────────────────────────────────────────────────────
  console.log("\nAnalytics");
  await test("GET /api/prithvi/analytics returns all required fields", async () => {
    const res = await req("GET", "/api/prithvi/analytics");
    assert(res.status === 200, `status ${res.status}`);
    assert(res.body.success === true, "success not true");
    const d = res.body.data;
    assert(typeof d.totalLeads === "number", "missing totalLeads");
    assert(typeof d.totalBookings === "number", "missing totalBookings");
    assert(typeof d.conversionRate === "number", "missing conversionRate");
    assert(Array.isArray(d.leadsByDay), "missing leadsByDay");
    assert(Array.isArray(d.bookingsByDay), "missing bookingsByDay");
    assert(d.leadsByDay.length === 7, `leadsByDay should have 7 entries, has ${d.leadsByDay.length}`);
    assert(typeof d.temperatureStats === "object", "missing temperatureStats");
    assert(typeof d.temperatureStats.hot === "number", "missing temperatureStats.hot");
  });

  await test("GET /api/prithvi/analytics conversion rate is accurate", async () => {
    const res = await req("GET", "/api/prithvi/analytics");
    const d = res.body.data;
    const expectedRate = d.totalLeads > 0 ? +((d.totalBookings / d.totalLeads) * 100).toFixed(1) : 0;
    assert(d.conversionRate === expectedRate, `conversion rate mismatch: ${d.conversionRate} vs expected ${expectedRate}`);
  });

  await test("GET /api/prithvi/analytics topProperties is array", async () => {
    const res = await req("GET", "/api/prithvi/analytics");
    assert(Array.isArray(res.body.data.topProperties), "missing topProperties");
  });

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  console.log("\nCleanup");
  await test("DELETE /api/prithvi/leads/:id removes lead", async () => {
    if (!createdLeadId) throw new Error("No lead to delete");
    const res = await req("DELETE", `/api/prithvi/leads/${createdLeadId}`);
    assert(res.status === 200, `status ${res.status}`);
  });

  await test("DELETE /api/prithvi/bookings/:id removes booking", async () => {
    if (!createdBookingId) throw new Error("No booking to delete");
    const res = await req("DELETE", `/api/prithvi/bookings/${createdBookingId}`);
    assert(res.status === 200, `status ${res.status}`);
  });

  // ─── Summary ──────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} test(s) failed`);
    process.exit(1);
  } else {
    console.log(`🎉 All tests passed!`);
  }
}

run().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
