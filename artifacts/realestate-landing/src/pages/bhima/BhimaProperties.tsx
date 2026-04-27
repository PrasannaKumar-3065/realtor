import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Search, SlidersHorizontal, X, ArrowRight, Bed, Bath } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BhimaNavbar from "@/components/bhima/BhimaNavbar";
import BhimaFooter from "@/components/bhima/BhimaFooter";
import { useBhima, BhimaPropertyType, BhimaPropertyStatus } from "@/store/bhimaStore";

const CITIES = ["All Cities", "Madurai", "Coimbatore"];
const TYPES: (BhimaPropertyType | "All Types")[] = [
  "All Types", "Flats / Apartments", "Independent House", "Studio Apartments",
  "Commercial Shops", "Office Space", "Residential Plots", "Commercial Plots",
  "Farm / Agricultural Land", "Penthouse", "Showroom", "Warehouse / Godown",
];
const STATUSES: (BhimaPropertyStatus | "All")[] = ["All", "Available", "Booking Open", "Under Construction", "Coming Soon", "Sold"];
const BUDGETS = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "Under ₹50 Lakhs", min: 0, max: 5000000 },
  { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr – ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2 Cr", min: 20000000, max: Infinity },
];
const STATUS_COLORS: Record<string, string> = {
  "Available": "bg-emerald-100 text-emerald-800",
  "Booking Open": "bg-amber-100 text-amber-800",
  "Under Construction": "bg-blue-100 text-blue-800",
  "Coming Soon": "bg-purple-100 text-purple-700",
  "Sold": "bg-gray-100 text-gray-600",
};

export default function BhimaProperties() {
  const { properties } = useBhima();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [type, setType] = useState<BhimaPropertyType | "All Types">("All Types");
  const [status, setStatus] = useState<BhimaPropertyStatus | "All">("All");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => properties.filter((p) => {
    if (city !== "All Cities" && p.city !== city) return false;
    if (type !== "All Types" && p.type !== type) return false;
    if (status !== "All" && p.status !== status) return false;
    if (p.priceValue > 0 && (p.priceValue < budget.min || p.priceValue > budget.max)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q) && !p.type.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [properties, city, type, status, budget, search]);

  const hasFilters = city !== "All Cities" || type !== "All Types" || status !== "All" || budget.label !== "Any Budget" || search !== "";

  const clearFilters = () => { setCity("All Cities"); setType("All Types"); setStatus("All"); setBudget(BUDGETS[0]); setSearch(""); };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <BhimaNavbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-blue-950 py-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-amber-400" />
              <span className="text-amber-400 font-semibold text-xs uppercase tracking-widest">All Properties</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Find Your Perfect Property</h1>
            <p className="text-blue-300">Browse our complete portfolio across Madurai and Coimbatore</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9" placeholder="Search by name, location or type..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setFiltersOpen(!filtersOpen)}>
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {hasFilters && <span className="bg-blue-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>}
            </Button>
            {hasFilters && (
              <Button variant="ghost" className="text-sm text-gray-500 flex items-center gap-1" onClick={clearFilters}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
              {[
                { label: "City", options: CITIES, value: city, set: setCity },
                { label: "Type", options: TYPES as string[], value: type, set: setType as (v: string) => void },
                { label: "Status", options: STATUSES as string[], value: status, set: setStatus as (v: string) => void },
              ].map(({ label, options, value, set }) => (
                <div key={label}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                  <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={value} onChange={(e) => set(e.target.value)}>
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Budget</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={budget.label}
                  onChange={(e) => { const b = BUDGETS.find((x) => x.label === e.target.value); if (b) setBudget(b); }}>
                  {BUDGETS.map((b) => <option key={b.label}>{b.label}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          <p className="text-sm text-gray-500 mb-6">Showing <strong className="text-gray-800">{filtered.length}</strong> of <strong className="text-gray-800">{properties.length}</strong> properties</p>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">No properties found</p>
              <button onClick={clearFilters} className="mt-5 border border-gray-300 text-gray-600 px-5 py-2 rounded-full text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/bhima/property/${p.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
                      <div className="relative h-52 overflow-hidden">
                        <img src={p.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"} alt={p.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                          <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">{p.type}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="text-white font-bold text-xl drop-shadow">{p.price}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{p.title}</h3>
                        <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-3"><MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />{p.location}</p>
                        <div className="flex items-center gap-2 text-xs flex-wrap mb-3">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{p.area}</span>
                          {p.bedrooms && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><Bed className="w-3 h-3" />{p.bedrooms} BHK</span>}
                          {p.facing && <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-full">{p.facing}</span>}
                        </div>
                        {p.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.amenities.slice(0, 3).map((a) => <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{a}</span>)}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">Bhima Homes</span>
                          <span className="text-blue-700 text-sm font-bold flex items-center gap-1">View <ArrowRight className="w-3.5 h-3.5" /></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BhimaFooter />
    </div>
  );
}
