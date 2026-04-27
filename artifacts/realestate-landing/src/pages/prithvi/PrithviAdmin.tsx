import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
const LocationPicker = lazy(() => import("@/components/prithvi/LocationPicker"));
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, UserCircle, Phone, Settings, Plus, Pencil, Trash2, Check, X,
  ChevronLeft, Image, Tag, LogOut, MapPin, Youtube, UserCheck, CalendarCheck,
  RefreshCw, Mail, MessageSquare, BarChart2, TrendingUp, Eye, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  usePrithvi, PrithviProperty, PrithviAgent, PrithviContactEntry, PrithviFounder,
  PrithviPropertyType, PrithviPropertyStatus, LANDMARK_OPTIONS, generatePrithviId
} from "@/store/prithviStore";
import { isPrithviAuthed, setPrithviAuth } from "./PrithviAdminLogin";
import prithviLogo from "@assets/prithvi_real_1776791750045.jpg";
import { api, Lead, Booking, Analytics } from "@/api/client";

function PhotoUpload({ value, onChange, label, className }: { value: string; onChange: (v: string) => void; label?: string; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700 block">{label}</label>}
      <div
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-green-400 transition-colors"
        style={{ minHeight: 100 }}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-28 object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-gray-400 text-sm">
            <Image className="w-7 h-7 opacity-50" />
            <span>{uploading ? "Uploading..." : "Click to upload"}</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUploading(true);
            try { onChange(await api.uploadFile(f)); } catch { alert("Upload failed"); }
            finally { setUploading(false); }
          }} />
      </div>
      <Input placeholder="Or paste image URL" value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}

// ── PROPERTY FORM ──────────────────────────────────────────────────────────────
const PROP_TYPES: PrithviPropertyType[] = ["Commercial Land", "Residential Plots", "Flats / Apartments", "Independent House", "Farm / Agricultural Land", "Industrial Land"];
const PROP_STATUSES: PrithviPropertyStatus[] = ["Available", "Booking Open", "Coming Soon", "Sold"];
const CITIES = ["Madurai", "Dindigul", "Tiruchirappalli", "Other"];

function emptyProperty(): PrithviProperty {
  return {
    id: generatePrithviId(), title: "", type: "Residential Plots", status: "Available",
    price: "", priceValue: 0, bookingAmount: "", location: "", city: "Madurai",
    area: "", ownership: "Individual", saleType: "New", project: "",
    description: "", landmarks: [], nearbyPlaces: [], tags: [],
    images: [], youtubeLinks: [], featured: false,
    lat: undefined, lng: undefined,
  };
}

function PropertyForm({ initial, onSave, onCancel }: { initial: PrithviProperty; onSave: (p: PrithviProperty) => void; onCancel: () => void }) {
  const [form, setForm] = useState<PrithviProperty>(initial);
  const [newTag, setNewTag] = useState("");
  const [newNearby, setNewNearby] = useState("");
  const set = <K extends keyof PrithviProperty>(k: K, v: PrithviProperty[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addImage = () => set("images", [...form.images, ""]);
  const setImage = (i: number, v: string) => set("images", form.images.map((x, idx) => idx === i ? v : x));
  const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));

  const addVideo = () => set("youtubeLinks", [...form.youtubeLinks, ""]);
  const setVideo = (i: number, v: string) => set("youtubeLinks", form.youtubeLinks.map((x, idx) => idx === i ? v : x));
  const removeVideo = (i: number) => set("youtubeLinks", form.youtubeLinks.filter((_, idx) => idx !== i));

  const toggleLandmark = (l: string) => {
    const has = form.landmarks.includes(l);
    set("landmarks", has ? form.landmarks.filter((x) => x !== l) : [...form.landmarks, l]);
  };

  const addTag = () => { if (newTag.trim()) { set("tags", [...form.tags, newTag.trim()]); setNewTag(""); } };
  const removeTag = (t: string) => set("tags", form.tags.filter((x) => x !== t));

  const addNearby = () => { if (newNearby.trim()) { set("nearbyPlaces", [...form.nearbyPlaces, newNearby.trim()]); setNewNearby(""); } };
  const removeNearby = (t: string) => set("nearbyPlaces", form.nearbyPlaces.filter((x) => x !== t));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Property Title</label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 1200 Sq.ft. Commercial Plot in Thirumangalam" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.type} onChange={(e) => set("type", e.target.value as PrithviPropertyType)}>
            {PROP_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.status} onChange={(e) => set("status", e.target.value as PrithviPropertyStatus)}>
            {PROP_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Price (display)</label>
          <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹9.90 Lac" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Price Value (₹ for filters)</label>
          <Input type="number" value={form.priceValue || ""} onChange={(e) => set("priceValue", Number(e.target.value))} placeholder="990000" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Booking Amount</label>
          <Input value={form.bookingAmount} onChange={(e) => set("bookingAmount", e.target.value)} placeholder="e.g. ₹30,000" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Area</label>
          <Input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. 1200 Sq.ft." />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
          <Input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Thirumangalam, Madurai" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.city} onChange={(e) => set("city", e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Project Name</label>
          <Input value={form.project} onChange={(e) => set("project", e.target.value)} placeholder="e.g. Royal Meridien" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Ownership</label>
          <Input value={form.ownership} onChange={(e) => set("ownership", e.target.value)} placeholder="Individual" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Sale Type</label>
          <Input value={form.saleType} onChange={(e) => set("saleType", e.target.value)} placeholder="New / Resale" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="Property description..." />
      </div>

      {/* Landmarks */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Landmarks Nearby</label>
        <div className="flex flex-wrap gap-2">
          {LANDMARK_OPTIONS.map((l) => (
            <button key={l} type="button"
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.landmarks.includes(l) ? "bg-green-700 text-white border-green-700" : "border-gray-200 text-gray-600 hover:border-green-400"}`}
              onClick={() => toggleLandmark(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Places */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Nearby Places (detailed)</label>
        <div className="flex gap-2 mb-2">
          <Input value={newNearby} onChange={(e) => setNewNearby(e.target.value)} placeholder="e.g. AIIMS Hospital – 10 min"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNearby(); } }} />
          <Button type="button" size="sm" onClick={addNearby} className="shrink-0 bg-green-700 hover:bg-green-800">Add</Button>
        </div>
        <div className="space-y-1.5">
          {form.nearbyPlaces.map((p) => (
            <div key={p} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="flex-1 text-sm text-gray-700">{p}</span>
              <button type="button" onClick={() => removeNearby(p)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Tags / Features</label>
        <div className="flex gap-2 mb-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. DTCP Approved"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          <Button type="button" size="sm" onClick={addTag} className="shrink-0 bg-green-700 hover:bg-green-800"><Tag className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((t) => (
            <span key={t} className="flex items-center gap-1.5 bg-green-50 text-green-800 border border-green-200 text-sm px-3 py-1 rounded-full">
              {t} <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Property Images</label>
          <Button type="button" size="sm" variant="outline" onClick={addImage} className="flex items-center gap-1 border-green-200 text-green-700">
            <Plus className="w-3.5 h-3.5" /> Add Image
          </Button>
        </div>
        {form.images.length === 0 && <p className="text-sm text-gray-400">No images added yet. Click "Add Image" to start.</p>}
        <div className="space-y-4">
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex-1">
                <PhotoUpload value={img} onChange={(v) => setImage(i, v)} label={`Image ${i + 1}`} />
              </div>
              <button type="button" onClick={() => removeImage(i)} className="mt-6 text-red-400 hover:text-red-600 p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* YouTube Links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube Videos</label>
          <Button type="button" size="sm" variant="outline" onClick={addVideo} className="flex items-center gap-1 border-red-200 text-red-700">
            <Plus className="w-3.5 h-3.5" /> Add Video
          </Button>
        </div>
        {form.youtubeLinks.length === 0 && <p className="text-sm text-gray-400">No videos added. Paste YouTube URLs.</p>}
        <div className="space-y-2">
          {form.youtubeLinks.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={url} onChange={(e) => setVideo(i, e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="flex-1 text-sm" />
              <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-600 p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-green-600" /> Map Location (optional)
          </label>
          {form.lat != null && form.lng != null && (
            <button type="button" onClick={() => { set("lat", undefined); set("lng", undefined); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear location
            </button>
          )}
        </div>

        {/* Manual lat/lng inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
            <Input
              type="number" step="any"
              value={form.lat ?? ""}
              placeholder="e.g. 9.9252"
              onChange={(e) => {
                const v = e.target.value;
                set("lat", v === "" ? undefined : Number(v));
              }}
              className="text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
            <Input
              type="number" step="any"
              value={form.lng ?? ""}
              placeholder="e.g. 78.1198"
              onChange={(e) => {
                const v = e.target.value;
                set("lng", v === "" ? undefined : Number(v));
              }}
              className="text-sm font-mono"
            />
          </div>
        </div>

        <Suspense fallback={
          <div className="bg-gray-100 rounded-xl flex items-center justify-center" style={{ height: 320 }}>
            <p className="text-gray-400 text-sm">Loading map…</p>
          </div>
        }>
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            onPick={(lat, lng) => {
              set("lat", Math.round(lat * 1000000) / 1000000);
              set("lng", Math.round(lng * 1000000) / 1000000);
            }}
          />
        </Suspense>
        <p className="text-xs text-gray-400">
          Click the map to pin location · Drag the marker to adjust · Use the crosshair button to use your current location
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="pfeatured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
        <label htmlFor="pfeatured" className="text-sm font-medium text-gray-700">Show on home page (Featured)</label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save Property</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

// ── PROPERTIES TAB ─────────────────────────────────────────────────────────────
function PropertiesTab() {
  const { properties, addProperty, updateProperty, deleteProperty } = usePrithvi();
  const [editing, setEditing] = useState<PrithviProperty | null>(null);
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Properties</h2><p className="text-sm text-gray-500">{properties.length} listings</p></div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="bg-green-700 hover:bg-green-800 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        )}
      </div>
      {adding && <PropertyForm initial={emptyProperty()} onSave={(p) => { addProperty(p); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <PropertyForm initial={editing} onSave={(p) => { updateProperty(p); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
                    <div className="w-24 shrink-0">
                      <img src={p.images?.[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"} alt={p.title} className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"; }} />
                    </div>
                    <div className="p-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{p.title}</h3>
                  <p className="text-xs text-gray-400 truncate">{p.location}</p>
                  <p className="text-sm font-bold text-green-700 mt-1">{p.price || "Contact for price"}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{p.type}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.status}</span>
                            {p.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                            {(p.images?.length ?? 0) > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.images.length} img</span>}
                            {(p.youtubeLinks?.length ?? 0) > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">▶ video</span>}
                          </div>
                          <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
                            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {(p as any).views ?? 0} views</span>
                            <span className="flex items-center gap-0.5"><UserCheck className="w-3 h-3" /> {(p as any).leadsCount ?? 0} leads</span>
                            <span className="flex items-center gap-0.5"><CalendarCheck className="w-3 h-3" /> {(p as any).bookingsCount ?? 0} bkgs</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteProperty(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FOUNDER TAB ────────────────────────────────────────────────────────────────
function FounderTab() {
  const { founder, setFounder } = usePrithvi();
  const [form, setFormState] = useState<PrithviFounder>(founder);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof PrithviFounder>(k: K, v: PrithviFounder[K]) => setFormState((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900">Founder Profile</h2><p className="text-sm text-gray-500">Displayed on the About section</p></div>
      <form onSubmit={(e) => { e.preventDefault(); setFounder(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Name</label><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Title</label><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Experience</label><Input value={form.experience} onChange={(e) => set("experience", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Team Size</label><Input value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Office Address</label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} /></div>
        <PhotoUpload label="Founder Photo" value={form.image} onChange={(v) => set("image", v)} />
        <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Check className="w-4 h-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  );
}

// ── AGENTS TAB ─────────────────────────────────────────────────────────────────
function AgentForm({ initial, onSave, onCancel }: { initial: PrithviAgent; onSave: (a: PrithviAgent) => void; onCancel: () => void }) {
  const [form, setForm] = useState<PrithviAgent>(initial);
  const set = <K extends keyof PrithviAgent>(k: K, v: PrithviAgent[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Name</label><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Role</label><Input required value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={2} /></div>
      <PhotoUpload label="Agent Photo" value={form.image} onChange={(v) => set("image", v)} />
      <div className="flex gap-3">
        <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function AgentsTab() {
  const { agents, addAgent, updateAgent, deleteAgent } = usePrithvi();
  const [editing, setEditing] = useState<PrithviAgent | null>(null);
  const [adding, setAdding] = useState(false);
  const emptyAgent = (): PrithviAgent => ({ id: generatePrithviId(), name: "", role: "", phone: "", email: "", image: "", bio: "" });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Agents</h2><p className="text-sm text-gray-500">{agents.length} agents</p></div>
        {!adding && !editing && <Button onClick={() => setAdding(true)} className="bg-green-700 hover:bg-green-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Agent</Button>}
      </div>
      {adding && <AgentForm initial={emptyAgent()} onSave={(a) => { addAgent(a); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <AgentForm initial={editing} onSave={(a) => { updateAgent(a); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((a) => (
          <div key={a.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
            <div className="w-20 shrink-0">
              <img src={a.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} alt={a.name} className="w-full h-full object-cover object-top"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"; }} />
            </div>
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div><h3 className="font-semibold text-gray-800 text-sm">{a.name}</h3><p className="text-xs text-green-600">{a.role}</p><p className="text-xs text-gray-400 mt-0.5">{a.phone}</p></div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(a); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteAgent(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CONTACTS TAB ───────────────────────────────────────────────────────────────
function ContactForm({ initial, onSave, onCancel }: { initial: PrithviContactEntry; onSave: (c: PrithviContactEntry) => void; onCancel: () => void }) {
  const [form, setForm] = useState<PrithviContactEntry>(initial);
  const set = <K extends keyof PrithviContactEntry>(k: K, v: PrithviContactEntry[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Label</label><Input required value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Main Office" /></div>
        <div><label className="text-sm font-medium text-gray-700 mb-1 block">Number</label><Input required value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="+91 99946 00000" /></div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.type} onChange={(e) => set("type", e.target.value as PrithviContactEntry["type"])}>
            {(["Office", "Sales", "WhatsApp", "Support", "Other"] as PrithviContactEntry["type"][]).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function ContactsTab() {
  const { contacts, addContact, updateContact, deleteContact } = usePrithvi();
  const [editing, setEditing] = useState<PrithviContactEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const empty = (): PrithviContactEntry => ({ id: generatePrithviId(), label: "", number: "", type: "Office" });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Contact Numbers</h2></div>
        {!adding && !editing && <Button onClick={() => setAdding(true)} className="bg-green-700 hover:bg-green-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Number</Button>}
      </div>
      {adding && <ContactForm initial={empty()} onSave={(c) => { addContact(c); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ContactForm initial={editing} onSave={(c) => { updateContact(c); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-700 p-3 rounded-full shrink-0"><Phone className="w-4 h-4" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{c.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.type}</span>
                </div>
                <a href={`tel:${c.number}`} className="text-sm text-green-700 font-medium hover:underline">{c.number}</a>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(c); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteContact(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SITE INFO TAB ──────────────────────────────────────────────────────────────
function SiteInfoTab() {
  const { siteInfo, setSiteInfo } = usePrithvi();
  const [form, setFormState] = useState(siteInfo);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof typeof siteInfo>(k: K, v: (typeof siteInfo)[K]) => setFormState((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-gray-900">Site Information</h2><p className="text-sm text-gray-500">Contact details and footer content</p></div>
      <form onSubmit={(e) => { e.preventDefault(); setSiteInfo(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Agency Name</label><Input value={form.agencyName} onChange={(e) => set("agencyName", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Tagline</label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp</label><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">Address</label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700 mb-1 block">About</label><Textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={4} /></div>
        </div>
        <Button type="submit" className="bg-green-700 hover:bg-green-800 flex items-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Check className="w-4 h-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  );
}

// ── LEADS TAB ──────────────────────────────────────────────────────────────────
const LEAD_STATUSES: Lead["status"][] = ["new", "contacted", "visit scheduled", "closed"];
const LEAD_STATUS_COLORS: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  "visit scheduled": "bg-purple-100 text-purple-800",
  closed: "bg-green-100 text-green-800",
};

const TEMP_BADGE: Record<string, string> = {
  hot: "🔴 Hot",
  warm: "🟡 Warm",
  cold: "⚪ Cold",
};
const TEMP_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-800",
  warm: "bg-amber-100 text-amber-800",
  cold: "bg-gray-100 text-gray-600",
};

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [hotOnly, setHotOnly] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await api.getLeads("prithvi");
      setLeads(data);
    } catch { /* no leads yet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: Lead["status"]) => {
    setUpdating(id);
    try {
      const updated = await api.updateLead("prithvi", id, { status });
      setLeads((prev) => prev.map((l) => l.id === id ? updated : l));
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await api.deleteLead("prithvi", id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch { /* ignore */ }
  };

  const displayed = hotOnly ? leads.filter((l) => l.temperature === "hot") : leads;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500">{leads.length} enquiries · {leads.filter((l) => l.temperature === "hot").length} hot</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHotOnly((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${hotOnly ? "bg-red-100 text-red-800 border-red-200" : "bg-white text-gray-600 border-gray-200"}`}
          >
            🔴 Hot only
          </button>
          <Button variant="outline" size="sm" onClick={() => api.exportLeadsCSV(leads)} className="flex items-center gap-2 border-gray-200">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLeads} className="flex items-center gap-2 border-gray-200">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading leads…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">{hotOnly ? "No hot leads" : "No leads yet"}</p>
          <p className="text-sm text-gray-300 mt-1">Leads from property enquiries will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((lead) => (
            <div key={lead.id} className={`bg-white border rounded-xl p-4 ${lead.temperature === "hot" ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{lead.name || "Unknown"}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                    {lead.temperature && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TEMP_COLORS[lead.temperature] || "bg-gray-100 text-gray-600"}`}>
                        {TEMP_BADGE[lead.temperature] || lead.temperature}
                      </span>
                    )}
                    {lead.score != null && (
                      <span className="text-xs text-gray-400">Score: {lead.score}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-green-700 font-medium hover:underline">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:underline">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </a>
                    )}
                    <span>{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {lead.propertyTitle && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3" /> {lead.propertyTitle}
                    </p>
                  )}
                  {lead.message && (
                    <p className="text-xs text-gray-500 italic flex items-start gap-1">
                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" /> {lead.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={lead.status}
                    disabled={updating === lead.id}
                    onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
                    className="text-xs rounded-lg border border-gray-200 bg-white text-gray-700 px-2 py-1.5"
                  >
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=Hi ${lead.name || "there"}, we received your enquiry${lead.propertyTitle ? ` about ${lead.propertyTitle}` : ""}. How can we help you?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteLead(lead.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BOOKINGS TAB ────────────────────────────────────────────────────────────────
const BOOKING_STATUSES: Booking["status"][] = ["pending", "confirmed", "completed"];
const BOOKING_STATUS_COLORS: Record<Booking["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings("prithvi");
      setBookings(data);
    } catch { /* no bookings yet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    setUpdating(id);
    try {
      const updated = await api.updateBooking("prithvi", id, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? updated : b));
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await api.deleteBooking("prithvi", id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Site Visit Bookings</h2>
          <p className="text-sm text-gray-500">{bookings.length} visit{bookings.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings} className="flex items-center gap-2 border-gray-200">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No site visits booked</p>
          <p className="text-sm text-gray-300 mt-1">Visit bookings from property pages will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{booking.name || "Unknown"}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BOOKING_STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                    <a href={`tel:${booking.phone}`} className="flex items-center gap-1 text-green-700 font-medium hover:underline">
                      <Phone className="w-3 h-3" /> {booking.phone}
                    </a>
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <CalendarCheck className="w-3 h-3 text-green-600" />
                      {new Date(booking.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} &middot; {booking.time}
                    </span>
                  </div>
                  {booking.propertyTitle && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {booking.propertyTitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={booking.status}
                    disabled={updating === booking.id}
                    onChange={(e) => updateStatus(booking.id, e.target.value as Booking["status"])}
                    className="text-xs rounded-lg border border-gray-200 bg-white text-gray-700 px-2 py-1.5"
                  >
                    {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <a
                    href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}?text=Hi ${booking.name || "there"}, your site visit is confirmed for ${booking.date} at ${booking.time}. See you then!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => deleteBooking(booking.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ANALYTICS TAB ───────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics("prithvi");
      setAnalytics(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading analytics…</div>;
  if (!analytics) return <div className="text-center py-12 text-gray-400">No data available</div>;

  const maxLeads = Math.max(...analytics.leadsByDay.map((d) => d.count), 1);
  const maxBooks = Math.max(...analytics.bookingsByDay.map((d) => d.count), 1);
  const totalTemp = analytics.temperatureStats.hot + analytics.temperatureStats.warm + analytics.temperatureStats.cold;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">Business performance overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} className="flex items-center gap-2 border-gray-200">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: analytics.totalLeads, sub: `Today: ${analytics.todayLeads} · Week: ${analytics.weekLeads}`, color: "text-gray-900" },
          { label: "Total Bookings", value: analytics.totalBookings, sub: "Visit bookings", color: "text-gray-900" },
          { label: "Conversion Rate", value: `${analytics.conversionRate}%`, sub: "Bookings ÷ Leads", color: "text-green-700" },
          { label: "Hot Leads", value: analytics.temperatureStats.hot, sub: "Urgent enquiries", color: "text-red-600" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" /> Leads – Last 7 Days</p>
        <div className="flex items-end gap-1 h-28">
          {analytics.leadsByDay.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-600">{d.count > 0 ? d.count : ""}</span>
              <div className="w-full bg-green-500 rounded-t-sm transition-all" style={{ height: `${(d.count / maxLeads) * 96}px`, minHeight: d.count > 0 ? 3 : 0 }} />
              <span className="text-[9px] text-gray-400">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-blue-500" /> Bookings – Last 7 Days</p>
        <div className="flex items-end gap-1 h-20">
          {analytics.bookingsByDay.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-600">{d.count > 0 ? d.count : ""}</span>
              <div className="w-full bg-blue-400 rounded-t-sm transition-all" style={{ height: `${(d.count / maxBooks) * 64}px`, minHeight: d.count > 0 ? 3 : 0 }} />
              <span className="text-[9px] text-gray-400">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Lead Temperature Distribution</p>
          <div className="space-y-3">
            {([
              { label: "Hot", key: "hot" as const, bar: "bg-red-500", badge: "🔴" },
              { label: "Warm", key: "warm" as const, bar: "bg-amber-400", badge: "🟡" },
              { label: "Cold", key: "cold" as const, bar: "bg-gray-300", badge: "⚪" },
            ]).map(({ label, key, bar, badge }) => {
              const val = analytics.temperatureStats[key];
              const pct = totalTemp > 0 ? Math.round((val / totalTemp) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{badge} {label}</span>
                    <span className="font-medium">{val} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Top Properties by Views</p>
          <div className="space-y-2">
            {analytics.topProperties.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No property views yet</p>
            ) : analytics.topProperties.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs gap-2">
                <span className="text-gray-700 truncate flex-1">{p.title}</span>
                <div className="flex gap-3 text-gray-400 shrink-0">
                  <span>{p.views} <span className="text-[9px]">views</span></span>
                  <span>{p.leadsCount} <span className="text-[9px]">leads</span></span>
                  <span>{p.bookingsCount} <span className="text-[9px]">bkgs</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ADMIN ─────────────────────────────────────────────────────────────────
type PTab = "properties" | "founder" | "agents" | "contacts" | "siteinfo" | "leads" | "bookings" | "analytics";

const TABS: { id: PTab; label: string; icon: React.ReactNode }[] = [
  { id: "properties", label: "Properties", icon: <Building2 className="w-4 h-4" /> },
  { id: "leads", label: "Leads", icon: <UserCheck className="w-4 h-4" /> },
  { id: "bookings", label: "Bookings", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "founder", label: "Founder", icon: <UserCircle className="w-4 h-4" /> },
  { id: "agents", label: "Agents", icon: <Users className="w-4 h-4" /> },
  { id: "contacts", label: "Contacts", icon: <Phone className="w-4 h-4" /> },
  { id: "siteinfo", label: "Site Info", icon: <Settings className="w-4 h-4" /> },
];

export default function PrithviAdmin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<PTab>("properties");
  const { properties, agents, contacts } = usePrithvi();

  useEffect(() => {
    if (!isPrithviAuthed()) setLocation("/prithvi/admin");
  }, [setLocation]);

  if (!isPrithviAuthed()) return null;

  const counts: Partial<Record<PTab, number>> = {
    properties: properties.length,
    agents: agents.length,
    contacts: contacts.length,
  };

  const handleLogout = () => {
    setPrithviAuth(false);
    setLocation("/prithvi/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={prithviLogo} alt="Prithvi" className="w-10 h-10 rounded-xl object-contain bg-green-50 border border-green-100 p-1" />
            <div>
              <div className="font-bold text-gray-900 text-base leading-tight">Prithvi Real Estate</div>
              <div className="text-xs text-green-600 font-medium">Admin Panel</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/prithvi">
              <Button variant="outline" className="text-sm flex items-center gap-2 border-gray-200"><ChevronLeft className="w-4 h-4" /> View Site</Button>
            </Link>
            <Button variant="ghost" className="text-sm text-red-500 flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-52 shrink-0">
            <nav className="space-y-1 sticky top-24">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-green-700 text-white shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}>
                  <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
                  {counts[tab.id] !== undefined && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>{counts[tab.id]}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {activeTab === "properties" && <PropertiesTab />}
                {activeTab === "leads" && <LeadsTab />}
                {activeTab === "bookings" && <BookingsTab />}
                {activeTab === "analytics" && <AnalyticsTab />}
                {activeTab === "founder" && <FounderTab />}
                {activeTab === "agents" && <AgentsTab />}
                {activeTab === "contacts" && <ContactsTab />}
                {activeTab === "siteinfo" && <SiteInfoTab />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
