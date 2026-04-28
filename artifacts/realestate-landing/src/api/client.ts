const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export interface Lead {
  id: string;
  agency: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  source: "form" | "visit" | "whatsapp" | "brochure";
  score: number;
  temperature: "hot" | "warm" | "cold";
  status: "new" | "contacted" | "visit scheduled" | "closed";
  createdAt: string;
}

export interface Booking {
  id: string;
  agency: string;
  name: string;
  phone: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
}

export interface AnalyticsDayPoint {
  date: string;
  count: number;
}

export interface Analytics {
  totalLeads: number;
  totalBookings: number;
  conversionRate: number;
  todayLeads: number;
  weekLeads: number;
  monthLeads: number;
  leadsByDay: AnalyticsDayPoint[];
  bookingsByDay: AnalyticsDayPoint[];
  temperatureStats: { hot: number; warm: number; cold: number };
  topProperties: { id: string; title: string; views: number; leadsCount: number; bookingsCount: number }[];
}

export const api = {
  // Properties
  getProperties: (agency: string) => req<unknown[]>("GET", `/api/${agency}/properties`),
  addProperty: (agency: string, data: unknown) => req<unknown>("POST", `/api/${agency}/properties`, data),
  updateProperty: (agency: string, id: string, data: unknown) => req<unknown>("PUT", `/api/${agency}/properties/${id}`, data),
  deleteProperty: (agency: string, id: string) => req<void>("DELETE", `/api/${agency}/properties/${id}`),
  trackPropertyView: (agency: string, id: string) => req<void>("POST", `/api/${agency}/properties/${id}/view`),

  // Config sections (founder, agents, services, contacts, siteInfo, reviews)
  getConfig: <T>(agency: string, section: string) => req<T>("GET", `/api/${agency}/config/${section}`),
  setConfig: <T>(agency: string, section: string, data: T) => req<T>("PUT", `/api/${agency}/config/${section}`, data as unknown),

  // Leads
  getLeads: (agency: string) => req<Lead[]>("GET", `/api/${agency}/leads`),
  createLead: (agency: string, data: Omit<Lead, "id" | "agency" | "score" | "temperature" | "status" | "createdAt">) =>
    req<Lead>("POST", `/api/${agency}/leads`, data),
  updateLead: (agency: string, id: string, data: Partial<Lead>) =>
    req<Lead>("PATCH", `/api/${agency}/leads/${id}`, data),
  deleteLead: (agency: string, id: string) => req<void>("DELETE", `/api/${agency}/leads/${id}`),

  // Bookings
  getBookings: (agency: string) => req<Booking[]>("GET", `/api/${agency}/bookings`),
  createBooking: (agency: string, data: Omit<Booking, "id" | "agency" | "status" | "createdAt">) =>
    req<Booking>("POST", `/api/${agency}/bookings`, data),
  updateBooking: (agency: string, id: string, data: Partial<Booking>) =>
    req<Booking>("PATCH", `/api/${agency}/bookings/${id}`, data),
  deleteBooking: (agency: string, id: string) => req<void>("DELETE", `/api/${agency}/bookings/${id}`),

  // Analytics
  getAnalytics: (agency: string) => req<Analytics>("GET", `/api/${agency}/analytics`),

  // Upload
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url as string;
  },

  // Upload a 360° panorama image (saved under /uploads/360/)
  uploadPanorama: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/upload/360`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Panorama upload failed");
    const json = await res.json();
    return json.url as string;
  },

  // Export leads as CSV
  exportLeadsCSV: (leads: Lead[]): void => {
    const header = ["Name", "Phone", "Email", "Property", "Source", "Score", "Temperature", "Status", "Date", "Message"];
    const rows = leads.map((l) => [
      l.name, l.phone, l.email, l.propertyTitle, l.source || "form",
      l.score || 0, l.temperature || "cold", l.status,
      new Date(l.createdAt).toLocaleString("en-IN"), `"${(l.message || "").replace(/"/g, "'")}"`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
