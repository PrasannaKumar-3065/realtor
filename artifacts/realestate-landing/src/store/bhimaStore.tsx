import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/api/client";

export type BhimaPropertyType =
  | "Flats / Apartments"
  | "Independent House"
  | "Builder Floor"
  | "Farm House"
  | "Commercial Shops"
  | "Showroom"
  | "Office Space"
  | "Business Center"
  | "Residential Plots"
  | "Farm / Agricultural Land"
  | "Commercial Plots"
  | "Industrial Land"
  | "Guest House"
  | "Hotel & Restaurant"
  | "Warehouse / Godown"
  | "Factory"
  | "Penthouse"
  | "Studio Apartments";

export type BhimaPropertyStatus = "Available" | "Booking Open" | "Sold" | "Coming Soon" | "Under Construction";

export const BHIMA_LANDMARK_OPTIONS = [
  "Airport", "School", "Shopping Mall", "Bank", "Bus Stop",
  "Hospital", "College", "Railway Station", "Highway", "Park", "Metro", "IT Hub",
];

export interface BhimaProperty {
  id: string;
  title: string;
  type: BhimaPropertyType;
  status: BhimaPropertyStatus;
  price: string;
  priceValue: number;
  location: string;
  city: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  facing: string;
  floor: string;
  project: string;
  description: string;
  landmarks: string[];
  nearbyPlaces: string[];
  amenities: string[];
  tags: string[];
  images: string[];
  youtubeLinks: string[];
  featured: boolean;
}

export interface BhimaService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface BhimaFounder {
  name: string;
  title: string;
  experience: string;
  address: string;
  phone: string;
  email: string;
  bio: string;
  image: string;
}

export interface BhimaContactEntry {
  id: string;
  label: string;
  number: string;
  type: "Office" | "Sales" | "WhatsApp" | "Support" | "Other";
}

export interface BhimaSiteInfo {
  agencyName: string;
  tagline: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  areasOfOperation: string[];
  propertyTypes: string[];
  established: string;
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

function normalizeStatus(v: unknown): BhimaPropertyStatus {
  const s = asString(v).trim().toLowerCase();
  if (s === "available") return "Available";
  if (s === "booking open" || s === "booking_open" || s === "bookingopen") return "Booking Open";
  if (s === "coming soon" || s === "coming_soon" || s === "comingsoon") return "Coming Soon";
  if (s === "sold") return "Sold";
  if (s === "under construction" || s === "under_construction" || s === "underconstruction") return "Under Construction";
  return "Available";
}

function normalizeType(v: unknown): BhimaPropertyType {
  const s = asString(v).trim().toLowerCase();
  if (s.includes("industrial")) return "Industrial Land";
  if (s.includes("warehouse") || s.includes("godown")) return "Warehouse / Godown";
  if (s.includes("factory")) return "Factory";
  if (s.includes("hotel") || s.includes("restaurant")) return "Hotel & Restaurant";
  if (s.includes("guest")) return "Guest House";
  if (s.includes("farm") || s.includes("agri") || s.includes("agricultural")) return "Farm / Agricultural Land";
  if (s.includes("commercial") && s.includes("shop")) return "Commercial Shops";
  if (s.includes("showroom")) return "Showroom";
  if (s.includes("office") || s.includes("business")) return "Office Space";
  if (s.includes("apartment") || s.includes("flat") || s.includes("studio")) return "Flats / Apartments";
  if (s.includes("house") || s.includes("villa")) return "Independent House";
  if (s.includes("plot") || s.includes("land") || s.includes("commercial")) return "Residential Plots";
  return "Residential Plots";
}

function inferCity(location: unknown): string {
  const loc = asString(location).trim();
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : (parts[0] || "Other");
}

function normalizeBhimaFounder(raw: unknown): BhimaFounder {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    name: asString(r.name, defaultFounder.name),
    title: asString(r.title, defaultFounder.title),
    experience: asString(r.experience, defaultFounder.experience),
    address: asString(r.address, defaultFounder.address),
    phone: asString(r.phone, defaultFounder.phone),
    email: asString(r.email, defaultFounder.email),
    bio: asString(r.bio, defaultFounder.bio),
    image: asString(r.image, defaultFounder.image),
  };
}

function normalizeBhimaSiteInfo(raw: unknown): BhimaSiteInfo {
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
    areasOfOperation: hasAreas ? asStringArray(r.areasOfOperation) : defaultSiteInfo.areasOfOperation,
    propertyTypes: hasTypes ? asStringArray(r.propertyTypes) : defaultSiteInfo.propertyTypes,
    established: asString(r.established, defaultSiteInfo.established),
  };
}

function normalizeBhimaProperty(raw: unknown): BhimaProperty {
  const r = (raw ?? {}) as Record<string, unknown>;
  const id = asString(r.id ?? r.property_id ?? r.propertyId, generateBhimaId());
  const priceValue = asNumber(r.priceValue ?? r.price, 0);
  const price = typeof r.price === "string"
    ? r.price
    : (priceValue ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(priceValue) : "");

  const bedroomsNum = asNumber(r.bedrooms, 0);
  const bathroomsNum = asNumber(r.bathrooms, 0);
  const bedrooms = bedroomsNum > 0 ? String(bedroomsNum) : "";
  const bathrooms = bathroomsNum > 0 ? String(bathroomsNum) : "";

  return {
    id,
    title: asString(r.title),
    type: normalizeType(r.type ?? r.property_type ?? r.propertyType),
    status: normalizeStatus(r.status),
    price,
    priceValue,
    location: asString(r.location),
    city: asString(r.city, inferCity(r.location)),
    area: asString(r.area),
    bedrooms,
    bathrooms,
    facing: asString(r.facing),
    floor: asString(r.floor),
    project: asString(r.project),
    description: asString(r.description),
    landmarks: asStringArray(r.landmarks),
    nearbyPlaces: asStringArray(r.nearbyPlaces),
    amenities: asStringArray(r.amenities ?? r.features),
    tags: asStringArray(r.tags),
    images: asStringArray(r.images ?? r.image_urls ?? r.imageUrls),
    youtubeLinks: asStringArray(r.youtubeLinks ?? r.youtube_links),
    featured: Boolean(r.featured),
  };
}

const defaultFounder: BhimaFounder = {
  name: "Pradeep Jaikumar",
  title: "Founder & Managing Director",
  experience: "16+ Years of Experience",
  address: "52A, 120 feet Surveyor Colony Road, Mattuthavani, Madurai",
  phone: "+91 82303 00000",
  email: "info@bhimahomes.in",
  bio: "Pradeep Jaikumar founded Bhima Homes and Properties in 2010 with a vision to bring professional-grade property consulting to Madurai.",
  image: "",
};

const defaultSiteInfo: BhimaSiteInfo = {
  agencyName: "Bhima Homes and Properties",
  tagline: "Building Foundations That Last",
  about: "Bhima Homes and Properties is a property development company led by professionals including Architects, Civil Engineers, and elite real estate consultants. Since 2010.",
  address: "52A, 120 feet Surveyor Colony Road, Mattuthavani, Madurai",
  phone: "+91 82303 00000",
  email: "info@bhimahomes.in",
  whatsapp: "+91 82303 00000",
  established: "2010",
  areasOfOperation: ["Agrini, Madurai", "Airport Road, Madurai", "Anna Nagar, Madurai", "Avaniyapuram, Madurai", "Bypass Road, Madurai", "Mattuthavani, Madurai", "Coimbatore"],
  propertyTypes: ["Flats / Apartments", "Independent House", "Commercial Shops", "Office Space", "Residential Plots", "Studio Apartments"],
};

interface BhimaData {
  properties: BhimaProperty[];
  founder: BhimaFounder;
  services: BhimaService[];
  contacts: BhimaContactEntry[];
  siteInfo: BhimaSiteInfo;
  isLoading: boolean;
}

interface BhimaContextType extends BhimaData {
  setProperties: (p: BhimaProperty[]) => void;
  addProperty: (p: BhimaProperty) => void;
  updateProperty: (p: BhimaProperty) => void;
  deleteProperty: (id: string) => void;
  setFounder: (f: BhimaFounder) => void;
  setServices: (s: BhimaService[]) => void;
  addService: (s: BhimaService) => void;
  updateService: (s: BhimaService) => void;
  deleteService: (id: string) => void;
  setContacts: (c: BhimaContactEntry[]) => void;
  addContact: (c: BhimaContactEntry) => void;
  updateContact: (c: BhimaContactEntry) => void;
  deleteContact: (id: string) => void;
  setSiteInfo: (s: BhimaSiteInfo) => void;
}

const BhimaContext = createContext<BhimaContextType | null>(null);

export function BhimaProvider({ children }: { children: ReactNode }) {
  const [properties, setPropertiesState] = useState<BhimaProperty[]>([]);
  const [founder, setFounderState] = useState<BhimaFounder>(defaultFounder);
  const [services, setServicesState] = useState<BhimaService[]>([]);
  const [contacts, setContactsState] = useState<BhimaContactEntry[]>([]);
  const [siteInfo, setSiteInfoState] = useState<BhimaSiteInfo>(defaultSiteInfo);
  const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			api.getProperties("bhima").then((d) => setPropertiesState((d as unknown[]).map(normalizeBhimaProperty))).catch(() => {}),
			api.getConfig<unknown>("bhima", "founder").then((d) => setFounderState(normalizeBhimaFounder(d))).catch(() => {}),
			api.getConfig<unknown>("bhima", "services").then((d) => setServicesState(Array.isArray(d) ? (d as BhimaService[]) : [])).catch(() => {}),
			api.getConfig<unknown>("bhima", "contacts").then((d) => setContactsState(Array.isArray(d) ? (d as BhimaContactEntry[]) : [])).catch(() => {}),
			api.getConfig<unknown>("bhima", "siteInfo").then((d) => setSiteInfoState(normalizeBhimaSiteInfo(d))).catch(() => {}),
		]).finally(() => setIsLoading(false));
	}, []);

  const setProperties = (p: BhimaProperty[]) => setPropertiesState(p);
  const addProperty = (p: BhimaProperty) => {
    setPropertiesState((prev) => [...prev, p]);
    api.addProperty("bhima", p).catch(console.error);
  };
  const updateProperty = (p: BhimaProperty) => {
    setPropertiesState((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    api.updateProperty("bhima", p.id, p).catch(console.error);
  };
  const deleteProperty = (id: string) => {
    setPropertiesState((prev) => prev.filter((x) => x.id !== id));
    api.deleteProperty("bhima", id).catch(console.error);
  };

  const setFounder = (f: BhimaFounder) => {
    const next = normalizeBhimaFounder(f);
    setFounderState(next);
    api.setConfig("bhima", "founder", next).catch(console.error);
  };

  const setServices = (s: BhimaService[]) => setServicesState(s);
  const addService = (s: BhimaService) => {
    setServicesState((prev) => {
      const next = [...prev, s];
      api.setConfig("bhima", "services", next).catch(console.error);
      return next;
    });
  };
  const updateService = (s: BhimaService) => {
    setServicesState((prev) => {
      const next = prev.map((x) => (x.id === s.id ? s : x));
      api.setConfig("bhima", "services", next).catch(console.error);
      return next;
    });
  };
  const deleteService = (id: string) => {
    setServicesState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("bhima", "services", next).catch(console.error);
      return next;
    });
  };

  const setContacts = (c: BhimaContactEntry[]) => setContactsState(c);
  const addContact = (c: BhimaContactEntry) => {
    setContactsState((prev) => {
      const next = [...prev, c];
      api.setConfig("bhima", "contacts", next).catch(console.error);
      return next;
    });
  };
  const updateContact = (c: BhimaContactEntry) => {
    setContactsState((prev) => {
      const next = prev.map((x) => (x.id === c.id ? c : x));
      api.setConfig("bhima", "contacts", next).catch(console.error);
      return next;
    });
  };
  const deleteContact = (id: string) => {
    setContactsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("bhima", "contacts", next).catch(console.error);
      return next;
    });
  };

  const setSiteInfo = (s: BhimaSiteInfo) => {
    const next = normalizeBhimaSiteInfo(s);
    setSiteInfoState(next);
    api.setConfig("bhima", "siteInfo", next).catch(console.error);
  };

  return (
    <BhimaContext.Provider value={{
      properties, founder, services, contacts, siteInfo, isLoading,
      setProperties, addProperty, updateProperty, deleteProperty,
      setFounder,
      setServices, addService, updateService, deleteService,
      setContacts, addContact, updateContact, deleteContact,
      setSiteInfo,
    }}>
      {children}
    </BhimaContext.Provider>
  );
}

export function useBhima() {
  const ctx = useContext(BhimaContext);
  if (!ctx) throw new Error("useBhima must be used within BhimaProvider");
  return ctx;
}

export function generateBhimaId() {
  return `bhima-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function parseBhimaYouTubeEmbed(url: string): string | null {
  if (!url) return null;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?]+)/, /youtube\.com\/embed\/([^?]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function getBhimaYouTubeThumbnail(url: string): string | null {
  const embed = parseBhimaYouTubeEmbed(url);
  if (!embed) return null;
  return `https://img.youtube.com/vi/${embed.split("/embed/")[1]}/hqdefault.jpg`;
}
