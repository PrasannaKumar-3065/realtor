import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, Phone, SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";
import { useData, Property, PropertyType, PropertyStatus } from "@/store/dataStore";

const CITIES = ["All Cities", "Bangalore", "Hyderabad", "Pune"];
const TYPES: (PropertyType | "All Types")[] = ["All Types", "Plot", "Apartment", "Villa", "Row House", "Commercial"];
const STATUSES: (PropertyStatus | "All Status")[] = [
  "All Status",
  "Ready to Move",
  "Under Construction",
  "New Launch",
  "Fast Selling",
  "Premium Amenities",
];
const BUDGET_RANGES = [
  { label: "Any Budget", min: 0, max: Infinity },
  { label: "Under ₹50 Lakhs", min: 0, max: 5000000 },
  { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr – ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2 Cr", min: 20000000, max: Infinity },
];

function PropertyCard({ property, index }: { property: Property; index: number }) {
  return (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 group"
      data-testid={`property-card-${property.id}`}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";
          }}
        />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
            {property.type}
          </span>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
            {property.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-lg font-bold text-foreground mb-1 line-clamp-1">{property.title}</h3>
        <p className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {property.location}
        </p>

        {property.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{property.description}</p>
        )}

        <div className="text-xl font-bold text-foreground mb-4">{property.price}</div>

        <div className="flex items-center gap-4 border-t border-border pt-3 mb-4 flex-wrap">
          {property.beds !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Bed className="w-3.5 h-3.5" /> {property.beds} Beds
            </div>
          )}
          {property.baths !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Bath className="w-3.5 h-3.5" /> {property.baths} Baths
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Square className="w-3.5 h-3.5" /> {property.area}
          </div>
        </div>

        <Button className="w-full flex items-center gap-2" variant="outline" data-testid={`btn-contact-${property.id}`}>
          <Phone className="w-4 h-4" /> Contact Agent
        </Button>
      </div>
    </motion.div>
  );
}

export default function Properties() {
  const { properties } = useData();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All Cities");
  const [type, setType] = useState<PropertyType | "All Types">("All Types");
  const [status, setStatus] = useState<PropertyStatus | "All Status">("All Status");
  const [budget, setBudget] = useState(BUDGET_RANGES[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (city !== "All Cities" && p.city !== city) return false;
      if (type !== "All Types" && p.type !== type) return false;
      if (status !== "All Status" && p.status !== status) return false;
      if (p.priceValue < budget.min || p.priceValue > budget.max) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.location.toLowerCase().includes(q) &&
          !p.city.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [properties, city, type, status, budget, search]);

  const clearFilters = () => {
    setCity("All Cities");
    setType("All Types");
    setStatus("All Status");
    setBudget(BUDGET_RANGES[0]);
    setSearch("");
  };

  const hasFilters =
    city !== "All Cities" ||
    type !== "All Types" ||
    status !== "All Status" ||
    budget.label !== "Any Budget" ||
    search !== "";

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Page Header */}
        <div className="bg-secondary border-b border-border py-10">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">All Properties</h1>
            <p className="text-muted-foreground text-base">
              Browse our verified listings across Bangalore, Hyderabad and Pune
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          {/* Search + Filter Toggle Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, location or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-properties"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 shrink-0"
              onClick={() => setFiltersOpen(!filtersOpen)}
              data-testid="btn-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </Button>
            {hasFilters && (
              <Button variant="ghost" className="flex items-center gap-1 text-sm shrink-0" onClick={clearFilters}>
                <X className="w-3.5 h-3.5" /> Clear all
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  City
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  data-testid="select-city"
                >
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Property Type
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType | "All Types")}
                  data-testid="select-type"
                >
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Budget
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={budget.label}
                  onChange={(e) => {
                    const found = BUDGET_RANGES.find((b) => b.label === e.target.value);
                    if (found) setBudget(found);
                  }}
                  data-testid="select-budget"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b.label}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus | "All Status")}
                  data-testid="select-status"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              <span className="font-semibold text-foreground">{properties.length}</span> properties
            </p>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <div className="text-6xl mb-4 opacity-30">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-lg font-medium">No properties match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search or clearing filters</p>
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((property, i) => (
                <PropertyCard key={property.id} property={property} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
