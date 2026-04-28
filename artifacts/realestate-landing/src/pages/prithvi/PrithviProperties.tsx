import React, { useState, useMemo, lazy, Suspense } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Search, SlidersHorizontal, X, ArrowRight, Plane, School, ShoppingBag, Landmark, Bus, Hospital, List, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PrithviNavbar from "@/components/prithvi/PrithviNavbar";
import PrithviFooter from "@/components/prithvi/PrithviFooter";
import { usePrithvi, PrithviPropertyType, PrithviPropertyStatus } from "@/store/prithviStore";

const PrithviMap = lazy(() => import("@/components/prithvi/PrithviMap"));

const CITIES = ["All Cities", "Madurai", "Dindigul", "Tiruchirappalli"];
const TYPES: (PrithviPropertyType | "All Types")[] = [
  "All Types",
  "Commercial Land",
  "Residential Plots",
  "Flats / Apartments",
  "Independent House",
  "Farm / Agricultural Land",
  "Industrial Land",
];
const STATUSES: (PrithviPropertyStatus | "All Status")[] = [
  "All Status",
  "Available",
  "Booking Open",
  "Coming Soon",
  "Sold",
];
const BUDGETS = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "Under ₹5 Lac", min: 0, max: 500000 },
  { label: "₹5 Lac – ₹15 Lac", min: 500000, max: 1500000 },
  { label: "₹15 Lac – ₹50 Lac", min: 1500000, max: 5000000 },
  { label: "Above ₹50 Lac", min: 5000000, max: Infinity },
];

const LANDMARK_ICONS: Record<string, React.ReactNode> = {
  Airport: <Plane className="w-3 h-3" />,
  School: <School className="w-3 h-3" />,
  "Shopping Mall": <ShoppingBag className="w-3 h-3" />,
  Bank: <Landmark className="w-3 h-3" />,
  "Bus Stop": <Bus className="w-3 h-3" />,
  Hospital: <Hospital className="w-3 h-3" />,
};

export default function PrithviProperties() {
  const { properties } = usePrithvi();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [type, setType] = useState<PrithviPropertyType | "All Types">("All Types");
  const [status, setStatus] = useState<PrithviPropertyStatus | "All Status">("All Status");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (city !== "All Cities" && p.city !== city) return false;
      if (type !== "All Types" && p.type !== type) return false;
      if (status !== "All Status" && p.status !== status) return false;
      if (p.priceValue > 0 && (p.priceValue < budget.min || p.priceValue > budget.max)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [properties, city, type, status, budget, search]);

  const mappableProps = useMemo(
    () => filtered.filter((p) => p.lat != null && p.lng != null).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      location: p.location,
      city: p.city,
      lat: p.lat!,
      lng: p.lng!,
    })),
    [filtered]
  );

  const hasFilters = city !== "All Cities" || type !== "All Types" || status !== "All Status" || budget.label !== "Any Budget" || search !== "";

  const clearFilters = () => {
    setCity("All Cities"); setType("All Types"); setStatus("All Status"); setBudget(BUDGETS[0]); setSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <PrithviNavbar />

      <main className="pt-20">
        <div className="bg-green-800 py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">All Properties</h1>
            <p className="text-green-200 text-base">Browse verified listings across Madurai, Dindigul and Tiruchirappalli</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Search + Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9 border-gray-200" placeholder="Search by name or location..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="prithvi-search" />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-green-200 text-green-700" onClick={() => setFiltersOpen(!filtersOpen)} data-testid="prithvi-filter-btn">
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {hasFilters && <span className="bg-green-700 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>}
            </Button>
            {hasFilters && (
              <Button variant="ghost" className="text-sm text-gray-500 flex items-center gap-1" onClick={clearFilters}>
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "City", options: CITIES, value: city, set: setCity },
                { label: "Type", options: TYPES, value: type, set: setType as (v: string) => void },
                { label: "Status", options: STATUSES, value: status, set: setStatus as (v: string) => void },
              ].map(({ label, options, value, set }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                  <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={value as string} onChange={(e) => set(e.target.value)}>
                    {(options as string[]).map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Budget</label>
                <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={budget.label}
                  onChange={(e) => { const b = BUDGETS.find((x) => x.label === e.target.value); if (b) setBudget(b); }}>
                  {BUDGETS.map((b) => <option key={b.label}>{b.label}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          {/* Count + View Toggle */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing <strong className="text-gray-800">{filtered.length}</strong> of <strong className="text-gray-800">{properties.length}</strong> properties
              {mappableProps.length > 0 && view === "list" && (
                <span className="text-gray-400 ml-1">· {mappableProps.length} on map</span>
              )}
            </p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "list" ? "bg-white text-green-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "map" ? "bg-white text-green-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Map className="w-3.5 h-3.5" /> Map
              </button>
            </div>
          </div>

          {/* Map View */}
          {view === "map" && (
            <div className="mb-8">
              {mappableProps.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 flex items-center justify-center" style={{ height: 420 }}>
                  <div className="text-center">
                    <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No mapped properties in current filter</p>
                    <p className="text-gray-400 text-sm mt-1">Try clearing filters or switch to List view</p>
                  </div>
                </div>
              ) : (
                <Suspense fallback={
                  <div className="bg-gray-100 rounded-2xl flex items-center justify-center" style={{ height: 420 }}>
                    <p className="text-gray-500 text-sm">Loading map…</p>
                  </div>
                }>
                  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                    <PrithviMap properties={mappableProps} showDetailLink={true} height="480px" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right">Click any marker to see property details</p>
                </Suspense>
              )}
            </div>
          )}

          {/* List View */}
          {view === "list" && (
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <MapPin className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600">No properties found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="mt-5 border border-gray-300 text-gray-600 px-5 py-2 rounded-full text-sm">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/prithvi/property/${p.id}`}>
                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer" data-testid={`prithvi-prop-${p.id}`}>
                          <div className="relative h-52 overflow-hidden">
                            <img src={p.images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"}
                              alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"; }} />
                            <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                              <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">{p.type}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${p.status === "Available" ? "bg-emerald-100 text-emerald-800" : p.status === "Booking Open" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                            </div>
                            <div className="absolute bottom-3 right-3 flex gap-2">
                              {p.panoramaScenes && Object.keys(p.panoramaScenes.scenes || {}).length > 0 && (
                                <div className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1" title="360° Tour available">
                                  <span>360°</span>
                                </div>
                              )}
                              {p.youtubeLinks.length > 0 && (
                                <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">▶ Video</div>
                              )}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{p.title}</h3>
                            <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-3"><MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />{p.location}</p>
                            <div className="text-xl font-bold text-green-700 mb-3">{p.price}</div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
                              <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">{p.area}</span>
                              {p.bookingAmount && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">Booking: {p.bookingAmount}</span>}
                            </div>
                            {p.landmarks.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                                {p.landmarks.slice(0, 4).map((l) => (
                                  <span key={l} className="flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-100">
                                    {LANDMARK_ICONS[l] || <MapPin className="w-3 h-3" />} {l}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-400">Prithvi Real Estate</span>
                              <span className="text-green-700 text-sm font-semibold flex items-center gap-1">View <ArrowRight className="w-3.5 h-3.5" /></span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PrithviFooter />
    </div>
  );
}
