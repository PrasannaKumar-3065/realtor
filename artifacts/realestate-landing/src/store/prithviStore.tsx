import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/api/client";

export type PrithviPropertyType =
  | "Commercial Land"
  | "Residential Plots"
  | "Flats / Apartments"
  | "Independent House"
  | "Farm / Agricultural Land"
  | "Industrial Land";

export type PrithviPropertyStatus = "Available" | "Booking Open" | "Sold" | "Coming Soon";

export const LANDMARK_OPTIONS = [
  "Airport", "School", "Shopping Mall", "Bank", "Bus Stop",
  "Hospital", "College", "Railway Station", "Highway", "Park",
];

export interface PrithviProperty {
  id: string;
  title: string;
  type: PrithviPropertyType;
  status: PrithviPropertyStatus;
  price: string;
  priceValue: number;
  bookingAmount: string;
  location: string;
  city: string;
  area: string;
  ownership: string;
  saleType: string;
  project: string;
  description: string;
  landmarks: string[];
  nearbyPlaces: string[];
  tags: string[];
  images: string[];
  youtubeLinks: string[];
  featured: boolean;
  lat?: number;
  lng?: number;
}

export interface PrithviAgent {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
  bio: string;
}

export interface PrithviFounder {
  name: string;
  title: string;
  experience: string;
  address: string;
  phone: string;
  email: string;
  teamSize: string;
  bio: string;
  image: string;
}

export interface PrithviContactEntry {
  id: string;
  label: string;
  number: string;
  type: "Office" | "Sales" | "WhatsApp" | "Support" | "Other";
}

export interface PrithviSiteInfo {
  agencyName: string;
  tagline: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  established: string;
  areasOfOperation: string[];
  propertyTypes: string[];
}

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => asString(x)).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith("{")) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) return parsed.map((x) => asString(x)).filter(Boolean);
      } catch {
        // ignore
      }
    }
    return [t];
  }
  return [];
}

function normalizeStatus(v: unknown): PrithviPropertyStatus {
  const s = asString(v).trim().toLowerCase();
  if (s === "available") return "Available";
  if (s === "booking open" || s === "booking_open" || s === "bookingopen") return "Booking Open";
  if (s === "coming soon" || s === "coming_soon" || s === "comingsoon") return "Coming Soon";
  if (s === "sold") return "Sold";
  return "Available";
}

function normalizeType(v: unknown): PrithviPropertyType {
  const s = asString(v).trim().toLowerCase();
  if (s.includes("industrial")) return "Industrial Land";
  if (s.includes("farm") || s.includes("agri") || s.includes("agricultural")) return "Farm / Agricultural Land";
  if (s.includes("commercial")) return "Commercial Land";
  if (s.includes("apartment") || s.includes("flat") || s.includes("studio")) return "Flats / Apartments";
  if (s.includes("house") || s.includes("villa")) return "Independent House";
  if (s.includes("plot") || s.includes("land")) return "Residential Plots";
  return "Residential Plots";
}

function inferCity(location: unknown): string {
  const loc = asString(location).trim();
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : (parts[0] || "Other");
}

function normalizePrithviFounder(raw: unknown): PrithviFounder {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    name: asString(r.name, defaultFounder.name),
    title: asString(r.title, defaultFounder.title),
    experience: asString(r.experience, defaultFounder.experience),
    address: asString(r.address, defaultFounder.address),
    phone: asString(r.phone, defaultFounder.phone),
    email: asString(r.email, defaultFounder.email),
    teamSize: asString(r.teamSize, defaultFounder.teamSize),
    bio: asString(r.bio, defaultFounder.bio),
    image: asString(r.image, defaultFounder.image),
  };
}

function normalizePrithviSiteInfo(raw: unknown): PrithviSiteInfo {
  const r = (raw ?? {}) as Record<string, unknown>;
  const hasAreas = Object.prototype.hasOwnProperty.call(r, "areasOfOperation");
  const hasTypes = Object.prototype.hasOwnProperty.call(r, "propertyTypes");
  return {
    agencyName: asString(r.agencyName, defaultSiteInfo.agencyName),
    tagline: asString(r.tagline, defaultSiteInfo.tagline),
    about: asString(r.about, defaultSiteInfo.about),
    address: asString(r.address, defaultSiteInfo.address),
    phone: asString(r.phone, defaultSiteInfo.phone),
    email: asString(r.email, defaultSiteInfo.email),
    whatsapp: asString(r.whatsapp, defaultSiteInfo.whatsapp),
    established: asString(r.established, defaultSiteInfo.established),
    areasOfOperation: hasAreas ? asStringArray(r.areasOfOperation) : defaultSiteInfo.areasOfOperation,
    propertyTypes: hasTypes ? asStringArray(r.propertyTypes) : defaultSiteInfo.propertyTypes,
  };
}

function normalizePrithviProperty(raw: unknown): PrithviProperty {
  const r = (raw ?? {}) as Record<string, unknown>;
  const id = asString(r.id ?? r.property_id ?? r.propertyId, generatePrithviId());
  const priceValue = asNumber(r.priceValue ?? r.price, 0);
  const price = typeof r.price === "string"
    ? r.price
    : (priceValue ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(priceValue) : "");

  return {
    id,
    title: asString(r.title),
    type: normalizeType(r.type ?? r.property_type ?? r.propertyType),
    status: normalizeStatus(r.status),
    price,
    priceValue,
    bookingAmount: asString(r.bookingAmount),
    location: asString(r.location),
    city: asString(r.city, inferCity(r.location)),
    area: asString(r.area),
    ownership: asString(r.ownership),
    saleType: asString(r.saleType),
    project: asString(r.project),
    description: asString(r.description),
    landmarks: asStringArray(r.landmarks),
    nearbyPlaces: asStringArray(r.nearbyPlaces),
    tags: asStringArray(r.tags),
    images: asStringArray(r.images ?? r.image_urls ?? r.imageUrls),
    youtubeLinks: asStringArray(r.youtubeLinks ?? r.youtube_links),
    featured: Boolean(r.featured),
    lat: typeof r.lat === "number" ? r.lat : (typeof r.latitude === "number" ? r.latitude : undefined),
    lng: typeof r.lng === "number" ? r.lng : (typeof r.longitude === "number" ? r.longitude : undefined),
  };
}

const defaultFounder: PrithviFounder = {
  name: "Subbulakshmi Saravanan",
  title: "Founder & CEO",
  experience: "12+ Years",
  address: "No. 5, Kamarajar Salai, Anna Nagar, Madurai – 625 020",
  phone: "+91 98421 00000",
  email: "subbulakshmi@prithvirealestate.in",
  teamSize: "12",
  bio: "Subbulakshmi Saravanan established Prithvi Real Estate in 2012 with a commitment to eco-friendly and sustainable property development in Madurai.",
  image: "",
};

const defaultSiteInfo: PrithviSiteInfo = {
  agencyName: "Prithvi Real Estate",
  tagline: "Growing Roots in Tamil Nadu Soil",
  about: "Prithvi Real Estate is a Madurai-based property consultancy specializing in DTCP approved layouts, agricultural land, and residential properties across Tamil Nadu.",
  address: "No. 5, Kamarajar Salai, Anna Nagar, Madurai – 625 020",
  phone: "+91 98421 00000",
  email: "info@prithvirealestate.in",
  whatsapp: "+91 98421 00000",
  established: "2012",
  areasOfOperation: ["Madurai", "Sivaganga", "Dindigul", "Virudhunagar", "Theni", "Ramanathapuram"],
  propertyTypes: ["Commercial Land", "Residential Plots", "Flats / Apartments", "Independent House", "Farm / Agricultural Land", "Industrial Land"],
};

interface PrithviData {
  properties: PrithviProperty[];
  founder: PrithviFounder;
  agents: PrithviAgent[];
  contacts: PrithviContactEntry[];
  siteInfo: PrithviSiteInfo;
  isLoading: boolean;
}

interface PrithviContextType extends PrithviData {
  setProperties: (p: PrithviProperty[]) => void;
  addProperty: (p: PrithviProperty) => void;
  updateProperty: (p: PrithviProperty) => void;
  deleteProperty: (id: string) => void;
  setFounder: (f: PrithviFounder) => void;
  setAgents: (a: PrithviAgent[]) => void;
  addAgent: (a: PrithviAgent) => void;
  updateAgent: (a: PrithviAgent) => void;
  deleteAgent: (id: string) => void;
  setContacts: (c: PrithviContactEntry[]) => void;
  addContact: (c: PrithviContactEntry) => void;
  updateContact: (c: PrithviContactEntry) => void;
  deleteContact: (id: string) => void;
  setSiteInfo: (s: PrithviSiteInfo) => void;
}

const PrithviContext = createContext<PrithviContextType | null>(null);

export function PrithviProvider({ children }: { children: ReactNode }) {
  const [properties, setPropertiesState] = useState<PrithviProperty[]>([]);
  const [founder, setFounderState] = useState<PrithviFounder>(defaultFounder);
  const [agents, setAgentsState] = useState<PrithviAgent[]>([]);
  const [contacts, setContactsState] = useState<PrithviContactEntry[]>([]);
  const [siteInfo, setSiteInfoState] = useState<PrithviSiteInfo>(defaultSiteInfo);
  const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			api.getProperties("prithvi").then((d) => setPropertiesState((d as unknown[]).map(normalizePrithviProperty))).catch(() => {}),
			api.getConfig<unknown>("prithvi", "founder").then((d) => setFounderState(normalizePrithviFounder(d))).catch(() => {}),
			api.getConfig<unknown>("prithvi", "agents").then((d) => setAgentsState(Array.isArray(d) ? (d as PrithviAgent[]) : [])).catch(() => {}),
			api.getConfig<unknown>("prithvi", "contacts").then((d) => setContactsState(Array.isArray(d) ? (d as PrithviContactEntry[]) : [])).catch(() => {}),
			api.getConfig<unknown>("prithvi", "siteInfo").then((d) => setSiteInfoState(normalizePrithviSiteInfo(d))).catch(() => {}),
		]).finally(() => setIsLoading(false));
	}, []);

  const setProperties = (p: PrithviProperty[]) => setPropertiesState(p);
  const addProperty = (p: PrithviProperty) => {
    setPropertiesState((prev) => [...prev, p]);
    api.addProperty("prithvi", p).catch(console.error);
  };
  const updateProperty = (p: PrithviProperty) => {
    setPropertiesState((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    api.updateProperty("prithvi", p.id, p).catch(console.error);
  };
  const deleteProperty = (id: string) => {
    setPropertiesState((prev) => prev.filter((x) => x.id !== id));
    api.deleteProperty("prithvi", id).catch(console.error);
  };

  const setFounder = (f: PrithviFounder) => {
    const next = normalizePrithviFounder(f);
    setFounderState(next);
    api.setConfig("prithvi", "founder", next).catch(console.error);
  };

  const setAgents = (a: PrithviAgent[]) => setAgentsState(a);
  const addAgent = (a: PrithviAgent) => {
    setAgentsState((prev) => {
      const next = [...prev, a];
      api.setConfig("prithvi", "agents", next).catch(console.error);
      return next;
    });
  };
  const updateAgent = (a: PrithviAgent) => {
    setAgentsState((prev) => {
      const next = prev.map((x) => (x.id === a.id ? a : x));
      api.setConfig("prithvi", "agents", next).catch(console.error);
      return next;
    });
  };
  const deleteAgent = (id: string) => {
    setAgentsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("prithvi", "agents", next).catch(console.error);
      return next;
    });
  };

  const setContacts = (c: PrithviContactEntry[]) => setContactsState(c);
  const addContact = (c: PrithviContactEntry) => {
    setContactsState((prev) => {
      const next = [...prev, c];
      api.setConfig("prithvi", "contacts", next).catch(console.error);
      return next;
    });
  };
  const updateContact = (c: PrithviContactEntry) => {
    setContactsState((prev) => {
      const next = prev.map((x) => (x.id === c.id ? c : x));
      api.setConfig("prithvi", "contacts", next).catch(console.error);
      return next;
    });
  };
  const deleteContact = (id: string) => {
    setContactsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("prithvi", "contacts", next).catch(console.error);
      return next;
    });
  };

  const setSiteInfo = (s: PrithviSiteInfo) => {
    const next = normalizePrithviSiteInfo(s);
    setSiteInfoState(next);
    api.setConfig("prithvi", "siteInfo", next).catch(console.error);
  };

  return (
    <PrithviContext.Provider value={{
      properties, founder, agents, contacts, siteInfo, isLoading,
      setProperties, addProperty, updateProperty, deleteProperty,
      setFounder,
      setAgents, addAgent, updateAgent, deleteAgent,
      setContacts, addContact, updateContact, deleteContact,
      setSiteInfo,
    }}>
      {children}
    </PrithviContext.Provider>
  );
}

export function usePrithvi() {
  const ctx = useContext(PrithviContext);
  if (!ctx) throw new Error("usePrithvi must be used inside PrithviProvider");
  return ctx;
}

export function generatePrithviId() {
  return `prithvi-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function parseYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const embed = parseYouTubeEmbed(url);
  if (!embed) return null;
  return `https://img.youtube.com/vi/${embed.split("/embed/")[1]}/hqdefault.jpg`;
}
