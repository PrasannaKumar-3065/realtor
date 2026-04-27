import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/api/client";

export type PropertyType = "Plot" | "Apartment" | "Villa" | "Row House" | "Commercial";
export type PropertyStatus = "Ready to Move" | "Under Construction" | "New Launch" | "Fast Selling" | "Premium Amenities";

export interface Property {
	id: string;
	title: string;
	type: PropertyType;
	status: PropertyStatus;
	price: string;
	priceValue: number;
	location: string;
	city: string;
	area: string;
	beds?: number;
	baths?: number;
	image: string;
	description: string;
	featured: boolean;
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

function inferCity(location: unknown): string {
	const loc = asString(location).trim();
	const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
	return parts.length >= 2 ? parts[parts.length - 1] : (parts[0] || "");
}

function normalizeType(v: unknown): PropertyType {
	const s = asString(v).trim().toLowerCase();
	if (s.includes("apartment") || s.includes("flat") || s.includes("studio")) return "Apartment";
	if (s.includes("villa") || s.includes("house")) return "Villa";
	if (s.includes("row")) return "Row House";
	if (s.includes("commercial")) return "Commercial";
	if (s.includes("plot") || s.includes("land")) return "Plot";
	return "Plot";
}

function normalizeStatus(v: unknown): PropertyStatus {
	const s = asString(v).trim().toLowerCase();
	if (s === "under construction" || s === "under_construction" || s === "underconstruction") return "Under Construction";
	if (s === "new launch" || s === "new_launch" || s === "newlaunch") return "New Launch";
	if (s === "fast selling" || s === "fast_selling" || s === "fastselling") return "Fast Selling";
	if (s === "premium amenities" || s === "premium_amenities" || s === "premiumamenities") return "Premium Amenities";
	return "Ready to Move";
}

function normalizePriyaProperty(raw: unknown): Property {
	const r = (raw ?? {}) as Record<string, unknown>;
	const id = asString(r.id ?? r.property_id ?? r.propertyId, `priya-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`);
	const priceValue = asNumber(r.priceValue ?? r.price, 0);
	const price = typeof r.price === "string"
		? r.price
		: (priceValue ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(priceValue) : "");
	const images = asStringArray(r.images ?? r.image_urls ?? r.imageUrls);

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
		beds: typeof r.beds === "number" ? r.beds : (typeof r.bedrooms === "number" ? r.bedrooms : undefined),
		baths: typeof r.baths === "number" ? r.baths : (typeof r.bathrooms === "number" ? r.bathrooms : undefined),
		image: asString(r.image, images[0] || ""),
		description: asString(r.description),
		featured: Boolean(r.featured),
	};
}

export interface Review {
	id: string;
	name: string;
	purchase: string;
  text: string;
  rating: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  areas: string;
  phone: string;
  email: string;
  image: string;
}

export interface Founder {
  name: string;
  title: string;
  bio: string;
  image: string;
  phone: string;
  email: string;
  linkedIn: string;
}

export interface ContactEntry {
  id: string;
  label: string;
  number: string;
  type: "WhatsApp" | "Office" | "Sales" | "Support" | "Other";
}

const defaultFounder: Founder = {
  name: "Priya Suresh",
  title: "Founder & Managing Director",
  bio: "Priya Suresh founded Priya Estates with a vision to make quality real estate accessible across India's top metro cities.",
  image: "",
  phone: "+91 98765 43210",
  email: "priya@priyaestates.in",
  linkedIn: "",
};

interface AppData {
  properties: Property[];
  reviews: Review[];
  agents: Agent[];
  founder: Founder;
  contacts: ContactEntry[];
  isLoading: boolean;
}

interface DataContextType extends AppData {
  setProperties: (p: Property[]) => void;
  setReviews: (r: Review[]) => void;
  setAgents: (a: Agent[]) => void;
  setFounder: (f: Founder) => void;
  setContacts: (c: ContactEntry[]) => void;
  addProperty: (p: Property) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;
  addReview: (r: Review) => void;
  updateReview: (r: Review) => void;
  deleteReview: (id: string) => void;
  addAgent: (a: Agent) => void;
  updateAgent: (a: Agent) => void;
  deleteAgent: (id: string) => void;
  addContact: (c: ContactEntry) => void;
  updateContact: (c: ContactEntry) => void;
  deleteContact: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setPropertiesState] = useState<Property[]>([]);
  const [reviews, setReviewsState] = useState<Review[]>([]);
  const [agents, setAgentsState] = useState<Agent[]>([]);
  const [founder, setFounderState] = useState<Founder>(defaultFounder);
  const [contacts, setContactsState] = useState<ContactEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

	function normalizeFounder(raw: unknown): Founder {
		const r = (raw ?? {}) as Record<string, unknown>;
		return {
			name: asString(r.name, defaultFounder.name),
			title: asString(r.title, defaultFounder.title),
			bio: asString(r.bio, defaultFounder.bio),
			image: asString(r.image, defaultFounder.image),
			phone: asString(r.phone, defaultFounder.phone),
			email: asString(r.email, defaultFounder.email),
			linkedIn: asString(r.linkedIn, defaultFounder.linkedIn),
		};
	}

	useEffect(() => {
		Promise.all([
			api.getProperties("priya").then((d) => setPropertiesState((d as unknown[]).map(normalizePriyaProperty))).catch(() => {}),
			api.getConfig<unknown>("priya", "reviews").then((d) => setReviewsState(Array.isArray(d) ? (d as Review[]) : [])).catch(() => {}),
			api.getConfig<unknown>("priya", "agents").then((d) => setAgentsState(Array.isArray(d) ? (d as Agent[]) : [])).catch(() => {}),
			api.getConfig<unknown>("priya", "founder").then((d) => setFounderState(normalizeFounder(d))).catch(() => {}),
			api.getConfig<unknown>("priya", "contacts").then((d) => setContactsState(Array.isArray(d) ? (d as ContactEntry[]) : [])).catch(() => {}),
		]).finally(() => setIsLoading(false));
	}, []);

  // Optimistic + sync to API
  const setProperties = (p: Property[]) => {
    setPropertiesState(p);
  };
  const addProperty = (p: Property) => {
    setPropertiesState((prev) => [...prev, p]);
    api.addProperty("priya", p).catch(console.error);
  };
  const updateProperty = (p: Property) => {
    setPropertiesState((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    api.updateProperty("priya", p.id, p).catch(console.error);
  };
  const deleteProperty = (id: string) => {
    setPropertiesState((prev) => prev.filter((x) => x.id !== id));
    api.deleteProperty("priya", id).catch(console.error);
  };

  const setReviews = (r: Review[]) => setReviewsState(r);
  const addReview = (r: Review) => {
    setReviewsState((prev) => {
      const next = [...prev, r];
      api.setConfig("priya", "reviews", next).catch(console.error);
      return next;
    });
  };
  const updateReview = (r: Review) => {
    setReviewsState((prev) => {
      const next = prev.map((x) => (x.id === r.id ? r : x));
      api.setConfig("priya", "reviews", next).catch(console.error);
      return next;
    });
  };
  const deleteReview = (id: string) => {
    setReviewsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("priya", "reviews", next).catch(console.error);
      return next;
    });
  };

  const setAgents = (a: Agent[]) => setAgentsState(a);
  const addAgent = (a: Agent) => {
    setAgentsState((prev) => {
      const next = [...prev, a];
      api.setConfig("priya", "agents", next).catch(console.error);
      return next;
    });
  };
  const updateAgent = (a: Agent) => {
    setAgentsState((prev) => {
      const next = prev.map((x) => (x.id === a.id ? a : x));
      api.setConfig("priya", "agents", next).catch(console.error);
      return next;
    });
  };
  const deleteAgent = (id: string) => {
    setAgentsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("priya", "agents", next).catch(console.error);
      return next;
    });
  };

  const setFounder = (f: Founder) => {
    const next = normalizeFounder(f);
    setFounderState(next);
    api.setConfig("priya", "founder", next).catch(console.error);
  };

  const setContacts = (c: ContactEntry[]) => setContactsState(c);
  const addContact = (c: ContactEntry) => {
    setContactsState((prev) => {
      const next = [...prev, c];
      api.setConfig("priya", "contacts", next).catch(console.error);
      return next;
    });
  };
  const updateContact = (c: ContactEntry) => {
    setContactsState((prev) => {
      const next = prev.map((x) => (x.id === c.id ? c : x));
      api.setConfig("priya", "contacts", next).catch(console.error);
      return next;
    });
  };
  const deleteContact = (id: string) => {
    setContactsState((prev) => {
      const next = prev.filter((x) => x.id !== id);
      api.setConfig("priya", "contacts", next).catch(console.error);
      return next;
    });
  };

  return (
    <DataContext.Provider value={{
      properties, reviews, agents, founder, contacts, isLoading,
      setProperties, setReviews, setAgents, setFounder, setContacts,
      addProperty, updateProperty, deleteProperty,
      addReview, updateReview, deleteReview,
      addAgent, updateAgent, deleteAgent,
      addContact, updateContact, deleteContact,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

export function generateId() {
  return `priya-${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
