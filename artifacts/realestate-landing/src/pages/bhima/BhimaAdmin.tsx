import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Users, UserCircle, Phone, Settings, Plus, Pencil, Trash2, Check, X,
  ChevronLeft, Image, Tag, LogOut, MapPin, Youtube, Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useBhima, BhimaProperty, BhimaService, BhimaContactEntry, BhimaFounder,
  BhimaPropertyType, BhimaPropertyStatus, BHIMA_LANDMARK_OPTIONS, generateBhimaId
} from "@/store/bhimaStore";
import { isBhimaAuthed, setBhimaAuth } from "./BhimaAdminLogin";
import { BhimaLogo } from "@/components/bhima/BhimaNavbar";

import { api } from "@/api/client";

function PhotoUpload({ value, onChange, label, className }: { value: string; onChange: (v: string) => void; label?: string; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-bold text-gray-700 block">{label}</label>}
      <div className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        style={{ minHeight: 100 }} onClick={() => ref.current?.click()}>
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

const PROP_TYPES: BhimaPropertyType[] = [
  "Flats / Apartments", "Independent House", "Builder Floor", "Farm House",
  "Commercial Shops", "Showroom", "Office Space", "Business Center",
  "Residential Plots", "Farm / Agricultural Land", "Commercial Plots",
  "Industrial Land", "Guest House", "Hotel & Restaurant",
  "Warehouse / Godown", "Factory", "Penthouse", "Studio Apartments",
];
const PROP_STATUSES: BhimaPropertyStatus[] = ["Available", "Booking Open", "Under Construction", "Coming Soon", "Sold"];
const CITIES = ["Madurai", "Coimbatore", "Other"];

function emptyProperty(): BhimaProperty {
  return {
    id: generateBhimaId(), title: "", type: "Flats / Apartments", status: "Available",
    price: "", priceValue: 0, location: "", city: "Madurai",
    area: "", bedrooms: "", bathrooms: "", facing: "", floor: "",
    project: "", description: "",
    landmarks: [], nearbyPlaces: [], amenities: [], tags: [],
    images: [], youtubeLinks: [], featured: false,
  };
}

function PropertyForm({ initial, onSave, onCancel }: { initial: BhimaProperty; onSave: (p: BhimaProperty) => void; onCancel: () => void }) {
  const [form, setForm] = useState<BhimaProperty>(initial);
  const [newTag, setNewTag] = useState("");
  const [newNearby, setNewNearby] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const set = <K extends keyof BhimaProperty>(k: K, v: BhimaProperty[K]) => setForm((f) => ({ ...f, [k]: v }));

  const addImage = () => set("images", [...form.images, ""]);
  const setImage = (i: number, v: string) => set("images", form.images.map((x, idx) => idx === i ? v : x));
  const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));
  const addVideo = () => set("youtubeLinks", [...form.youtubeLinks, ""]);
  const setVideo = (i: number, v: string) => set("youtubeLinks", form.youtubeLinks.map((x, idx) => idx === i ? v : x));
  const removeVideo = (i: number) => set("youtubeLinks", form.youtubeLinks.filter((_, idx) => idx !== i));
  const toggleLandmark = (l: string) => {
    set("landmarks", form.landmarks.includes(l) ? form.landmarks.filter((x) => x !== l) : [...form.landmarks, l]);
  };
  const addTag = () => { if (newTag.trim()) { set("tags", [...form.tags, newTag.trim()]); setNewTag(""); } };
  const removeTag = (t: string) => set("tags", form.tags.filter((x) => x !== t));
  const addNearby = () => { if (newNearby.trim()) { set("nearbyPlaces", [...form.nearbyPlaces, newNearby.trim()]); setNewNearby(""); } };
  const removeNearby = (t: string) => set("nearbyPlaces", form.nearbyPlaces.filter((x) => x !== t));
  const addAmenity = () => { if (newAmenity.trim()) { set("amenities", [...form.amenities, newAmenity.trim()]); setNewAmenity(""); } };
  const removeAmenity = (t: string) => set("amenities", form.amenities.filter((x) => x !== t));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-bold text-gray-700 mb-1 block">Property Title *</label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Premium 3 BHK Apartment in Anna Nagar" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Type *</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.type} onChange={(e) => set("type", e.target.value as BhimaPropertyType)}>
            {PROP_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Status *</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.status} onChange={(e) => set("status", e.target.value as BhimaPropertyStatus)}>
            {PROP_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Price (display)</label>
          <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹75 Lakhs" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Price Value (₹ for filters)</label>
          <Input type="number" value={form.priceValue || ""} onChange={(e) => set("priceValue", Number(e.target.value))} placeholder="7500000" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Location *</label>
          <Input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Anna Nagar, Madurai" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">City *</label>
          <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.city} onChange={(e) => set("city", e.target.value)}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Area *</label>
          <Input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. 1,450 Sq.ft." />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Bedrooms</label>
          <Input value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="e.g. 3" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Bathrooms</label>
          <Input value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="e.g. 2" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Facing</label>
          <Input value={form.facing} onChange={(e) => set("facing", e.target.value)} placeholder="e.g. East, North" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Floor</label>
          <Input value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 3rd – 8th Floor" />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Project Name</label>
          <Input value={form.project} onChange={(e) => set("project", e.target.value)} placeholder="e.g. Blu Bell Apartments" />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} placeholder="Property description..." />
      </div>

      {/* Landmarks */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 block">Landmarks Nearby</label>
        <div className="flex flex-wrap gap-2">
          {BHIMA_LANDMARK_OPTIONS.map((l) => (
            <button key={l} type="button"
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.landmarks.includes(l) ? "bg-blue-900 text-white border-blue-900" : "border-gray-200 text-gray-600 hover:border-blue-400"}`}
              onClick={() => toggleLandmark(l)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Nearby Places */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 block">Nearby Places (detailed)</label>
        <div className="flex gap-2 mb-2">
          <Input value={newNearby} onChange={(e) => setNewNearby(e.target.value)} placeholder="e.g. Madurai Airport – 5 min"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNearby(); } }} />
          <Button type="button" size="sm" onClick={addNearby} className="shrink-0 bg-blue-900 hover:bg-blue-800">Add</Button>
        </div>
        <div className="space-y-1.5">
          {form.nearbyPlaces.map((p) => (
            <div key={p} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="flex-1 text-sm text-gray-700">{p}</span>
              <button type="button" onClick={() => removeNearby(p)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 block">Amenities</label>
        <div className="flex gap-2 mb-2">
          <Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="e.g. Swimming Pool"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }} />
          <Button type="button" size="sm" onClick={addAmenity} className="shrink-0 bg-blue-900 hover:bg-blue-800"><Zap className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.amenities.map((a) => (
            <span key={a} className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-sm px-3 py-1 rounded-full">
              {a} <button type="button" onClick={() => removeAmenity(a)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-2 block">Tags / Features</label>
        <div className="flex gap-2 mb-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. TNRERA Approved"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
          <Button type="button" size="sm" onClick={addTag} className="shrink-0 bg-blue-900 hover:bg-blue-800"><Tag className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((t) => (
            <span key={t} className="flex items-center gap-1.5 bg-blue-900 text-white text-sm px-3 py-1 rounded-full">
              {t} <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-gray-700">Property Images</label>
          <Button type="button" size="sm" variant="outline" onClick={addImage} className="flex items-center gap-1 border-blue-200 text-blue-700">
            <Plus className="w-3.5 h-3.5" /> Add Image
          </Button>
        </div>
        {form.images.length === 0 && <p className="text-sm text-gray-400">No images yet. Click "Add Image".</p>}
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

      {/* YouTube */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /> YouTube Videos</label>
          <Button type="button" size="sm" variant="outline" onClick={addVideo} className="flex items-center gap-1 border-red-200 text-red-700">
            <Plus className="w-3.5 h-3.5" /> Add Video
          </Button>
        </div>
        {form.youtubeLinks.length === 0 && <p className="text-sm text-gray-400">No videos. Paste YouTube URLs.</p>}
        <div className="space-y-2">
          {form.youtubeLinks.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input value={url} onChange={(e) => setVideo(i, e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="flex-1 text-sm" />
              <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="bfeatured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
        <label htmlFor="bfeatured" className="text-sm font-bold text-gray-700">Show on home page (Featured)</label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button type="submit" className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save Property</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function PropertiesTab() {
  const { properties, addProperty, updateProperty, deleteProperty } = useBhima();
  const [editing, setEditing] = useState<BhimaProperty | null>(null);
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black text-blue-950">Properties</h2><p className="text-sm text-gray-500">{properties.length} listings</p></div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Property</Button>
        )}
      </div>
      {adding && <PropertyForm initial={emptyProperty()} onSave={(p) => { addProperty(p); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <PropertyForm initial={editing} onSave={(p) => { updateProperty(p); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex hover:shadow-md transition-shadow">
            <div className="w-24 shrink-0">
              <img src={p.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80"} alt={p.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80"; }} />
            </div>
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{p.title}</h3>
                  <p className="text-xs text-gray-400 truncate">{p.location}</p>
                  <p className="text-sm font-black text-amber-600 mt-1">{p.price || "Contact for price"}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{p.type}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.status}</span>
                    {p.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Featured</span>}
                    {p.images.length > 0 && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.images.length} img</span>}
                    {p.youtubeLinks.length > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">▶ video</span>}
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

function FounderTab() {
  const { founder, setFounder } = useBhima();
  const [form, setFormState] = useState<BhimaFounder>(founder);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof BhimaFounder>(k: K, v: BhimaFounder[K]) => setFormState((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-black text-blue-950">Founder Profile</h2></div>
      <form onSubmit={(e) => { e.preventDefault(); setFounder(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Name</label><Input required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Title</label><Input required value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Experience</label><Input value={form.experience} onChange={(e) => set("experience", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 mb-1 block">Address</label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
        <div><label className="text-sm font-bold text-gray-700 mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} /></div>
        <PhotoUpload label="Founder Photo" value={form.image} onChange={(v) => set("image", v)} />
        <Button type="submit" className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Check className="w-4 h-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  );
}

function ServicesTab() {
  const { services, addService, updateService, deleteService } = useBhima();
  const [editing, setEditing] = useState<BhimaService | null>(null);
  const [adding, setAdding] = useState(false);
  const empty = (): BhimaService => ({ id: generateBhimaId(), title: "", description: "", icon: "🏠" });

  function ServiceForm({ initial, onSave, onCancel }: { initial: BhimaService; onSave: (s: BhimaService) => void; onCancel: () => void }) {
    const [form, setForm] = useState<BhimaService>(initial);
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Emoji Icon</label><Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🏠" /></div>
          <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 mb-1 block">Title *</label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
          <div className="md:col-span-3"><label className="text-sm font-bold text-gray-700 mb-1 block">Description</label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black text-blue-950">Services</h2><p className="text-sm text-gray-500">{services.length} services</p></div>
        {!adding && !editing && <Button onClick={() => setAdding(true)} className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Service</Button>}
      </div>
      {adding && <ServiceForm initial={empty()} onSave={(s) => { addService(s); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ServiceForm initial={editing} onSave={(s) => { updateService(s); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {services.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <h3 className="font-bold text-gray-800">{s.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{s.description}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(s); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteService(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsTab() {
  const { contacts, addContact, updateContact, deleteContact } = useBhima();
  const [editing, setEditing] = useState<BhimaContactEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const empty = (): BhimaContactEntry => ({ id: generateBhimaId(), label: "", number: "", type: "Office" });

  function ContactForm({ initial, onSave, onCancel }: { initial: BhimaContactEntry; onSave: (c: BhimaContactEntry) => void; onCancel: () => void }) {
    const [form, setForm] = useState<BhimaContactEntry>(initial);
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Label</label><Input required value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Number</label><Input required value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} /></div>
          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">Type</label>
            <select className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2" value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BhimaContactEntry["type"] }))}>
              {(["Office", "Sales", "WhatsApp", "Support", "Other"] as BhimaContactEntry["type"][]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Check className="w-4 h-4" /> Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black text-blue-950">Contact Numbers</h2></div>
        {!adding && !editing && <Button onClick={() => setAdding(true)} className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Add</Button>}
      </div>
      {adding && <ContactForm initial={empty()} onSave={(c) => { addContact(c); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ContactForm initial={editing} onSave={(c) => { updateContact(c); setEditing(null); }} onCancel={() => setEditing(null)} />}
      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full shrink-0"><Phone className="w-4 h-4" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-sm">{c.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.type}</span>
                </div>
                <a href={`tel:${c.number}`} className="text-sm text-blue-700 font-medium">{c.number}</a>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(c); setAdding(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteContact(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteInfoTab() {
  const { siteInfo, setSiteInfo } = useBhima();
  const [form, setFormState] = useState(siteInfo);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof typeof siteInfo>(k: K, v: (typeof siteInfo)[K]) => setFormState((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-black text-blue-950">Site Information</h2></div>
      <form onSubmit={(e) => { e.preventDefault(); setSiteInfo(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="space-y-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Agency Name</label><Input value={form.agencyName} onChange={(e) => set("agencyName", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Tagline</label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">WhatsApp</label><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div><label className="text-sm font-bold text-gray-700 mb-1 block">Established Year</label><Input value={form.established} onChange={(e) => set("established", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 mb-1 block">Address</label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 mb-1 block">About</label><Textarea value={form.about} onChange={(e) => set("about", e.target.value)} rows={4} /></div>
        </div>
        <Button type="submit" className="bg-blue-900 hover:bg-blue-800 flex items-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Check className="w-4 h-4" /> Save Changes</>}
        </Button>
      </form>
    </div>
  );
}

type BTab = "properties" | "founder" | "services" | "contacts" | "siteinfo";
const TABS: { id: BTab; label: string; icon: React.ReactNode }[] = [
  { id: "properties", label: "Properties", icon: <Building2 className="w-4 h-4" /> },
  { id: "founder", label: "Founder", icon: <UserCircle className="w-4 h-4" /> },
  { id: "services", label: "Services", icon: <Zap className="w-4 h-4" /> },
  { id: "contacts", label: "Contacts", icon: <Phone className="w-4 h-4" /> },
  { id: "siteinfo", label: "Site Info", icon: <Settings className="w-4 h-4" /> },
];

export default function BhimaAdmin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<BTab>("properties");
  const { properties, services, contacts } = useBhima();

  useEffect(() => {
    if (!isBhimaAuthed()) setLocation("/bhima/admin");
  }, [setLocation]);

  if (!isBhimaAuthed()) return null;

  const counts: Partial<Record<BTab, number>> = {
    properties: properties.length,
    services: services.length,
    contacts: contacts.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 border-b border-blue-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BhimaLogo size={38} />
            <div>
              <div className="font-black text-white text-base tracking-wide leading-tight">BHIMA HOMES</div>
              <div className="text-xs text-amber-400 font-bold tracking-wider">Admin Panel</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/bhima">
              <Button variant="outline" className="text-sm flex items-center gap-2 border-blue-700 text-white hover:bg-blue-900">
                <ChevronLeft className="w-4 h-4" /> View Site
              </Button>
            </Link>
            <Button variant="ghost" className="text-sm text-red-400 flex items-center gap-2 hover:text-red-300 hover:bg-blue-900"
              onClick={() => { setBhimaAuth(false); setLocation("/bhima/admin"); }}>
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
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-blue-900 text-white shadow-sm" : "text-gray-600 hover:bg-white hover:shadow-sm"}`}>
                  <span className="flex items-center gap-2">{tab.icon} {tab.label}</span>
                  {counts[tab.id] !== undefined && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${activeTab === tab.id ? "bg-amber-400 text-blue-950" : "bg-gray-200 text-gray-600"}`}>{counts[tab.id]}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {activeTab === "properties" && <PropertiesTab />}
                {activeTab === "founder" && <FounderTab />}
                {activeTab === "services" && <ServicesTab />}
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
