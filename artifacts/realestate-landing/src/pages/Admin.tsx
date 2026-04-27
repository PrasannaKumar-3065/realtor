import React, { useState, useRef } from "react";
import { useData, Property, Review, Agent, Founder, ContactEntry, PropertyType, PropertyStatus } from "@/store/dataStore";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2, Star, Users, UserCircle, Phone, Plus, Pencil, Trash2,
  Check, X, Image, Home, ChevronLeft
} from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function PhotoUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div
        className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
        style={{ minHeight: 120 }}
        onClick={() => inputRef.current?.click()}
        data-testid="photo-upload-area"
      >
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-28 gap-2 text-muted-foreground text-sm">
            <Image className="w-8 h-8 opacity-40" />
            <span>{uploading ? "Uploading..." : "Click to upload photo"}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setUploading(true);
            try { onChange(await api.uploadFile(f)); } catch { alert("Upload failed"); }
            finally { setUploading(false); }
          }}
          data-testid="input-photo-upload"
        />
      </div>
      <Input
        placeholder="Or paste image URL"
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm"
        data-testid="input-image-url"
      />
    </div>
  );
}

// ─── PROPERTIES TAB ────────────────────────────────────────────────────────────

const PROPERTY_TYPES: PropertyType[] = ["Plot", "Apartment", "Villa", "Row House", "Commercial"];
const PROPERTY_STATUSES: PropertyStatus[] = [
  "Ready to Move",
  "Under Construction",
  "New Launch",
  "Fast Selling",
  "Premium Amenities",
];
const CITIES = ["Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai"];

function emptyProperty(): Property {
  return {
    id: generateId(),
    title: "",
    type: "Apartment",
    status: "Ready to Move",
    price: "",
    priceValue: 0,
    location: "",
    city: "Bangalore",
    area: "",
    beds: undefined,
    baths: undefined,
    image: "",
    description: "",
    featured: false,
  };
}

function PropertyForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Property;
  onSave: (p: Property) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Property>(initial);
  const set = <K extends keyof Property>(k: K, v: Property[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Property Title</label>
          <Input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Luxury 3BHK Apartment" data-testid="input-property-title" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Price (display)</label>
          <Input required value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹1.2 Cr" data-testid="input-property-price" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Price Value (for filters, in ₹)</label>
          <Input type="number" required value={form.priceValue || ""} onChange={(e) => set("priceValue", Number(e.target.value))} placeholder="e.g. 12000000" data-testid="input-property-price-value" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Location</label>
          <Input required value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Koramangala, Bangalore" data-testid="input-property-location" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">City</label>
          <select className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2" value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="select-property-city">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Property Type</label>
          <select className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2" value={form.type} onChange={(e) => set("type", e.target.value as PropertyType)} data-testid="select-property-type">
            {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
          <select className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2" value={form.status} onChange={(e) => set("status", e.target.value as PropertyStatus)} data-testid="select-property-status">
            {PROPERTY_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Area</label>
          <Input required value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. 1850 sq ft" data-testid="input-property-area" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Bedrooms (optional)</label>
          <Input type="number" value={form.beds ?? ""} onChange={(e) => set("beds", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 3" data-testid="input-property-beds" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Bathrooms (optional)</label>
          <Input type="number" value={form.baths ?? ""} onChange={(e) => set("baths", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 3" data-testid="input-property-baths" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of the property..." rows={3} data-testid="textarea-property-description" />
      </div>
      <PhotoUpload label="Property Image" value={form.image} onChange={(v) => set("image", v)} />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} data-testid="checkbox-property-featured" />
        <label htmlFor="featured" className="text-sm font-medium text-foreground">Show on home page (Featured)</label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex items-center gap-2" data-testid="btn-save-property"><Check className="w-4 h-4" /> Save Property</Button>
        <Button type="button" variant="outline" onClick={onCancel} data-testid="btn-cancel-property"><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function PropertiesTab() {
  const { properties, addProperty, updateProperty, deleteProperty } = useData();
  const [editing, setEditing] = useState<Property | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Properties</h2>
          <p className="text-sm text-muted-foreground">{properties.length} listings</p>
        </div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="flex items-center gap-2" data-testid="btn-add-property">
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        )}
      </div>

      {adding && (
        <PropertyForm
          initial={emptyProperty()}
          onSave={(p) => { addProperty(p); setAdding(false); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {editing && (
        <PropertyForm
          initial={editing}
          onSave={(p) => { updateProperty(p); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden flex gap-0" data-testid={`admin-property-${p.id}`}>
            <div className="w-24 shrink-0">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&q=80"; }} />
            </div>
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{p.location}</p>
                  <p className="text-sm font-bold text-primary mt-1">{p.price}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.type}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.status}</span>
                    {p.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(p); setAdding(false); }} data-testid={`btn-edit-property-${p.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteProperty(p.id)} data-testid={`btn-delete-property-${p.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REVIEWS TAB ───────────────────────────────────────────────────────────────

function ReviewForm({ initial, onSave, onCancel }: { initial: Review; onSave: (r: Review) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Review>(initial);
  const set = <K extends keyof Review>(k: K, v: Review[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Customer Name</label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ramesh & Sunita Nair" data-testid="input-review-name" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Purchase Description</label>
          <Input required value={form.purchase} onChange={(e) => set("purchase", e.target.value)} placeholder="e.g. Bought 3BHK in Whitefield" data-testid="input-review-purchase" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Review Text</label>
        <Textarea required value={form.text} onChange={(e) => set("text", e.target.value)} rows={3} placeholder="Customer's review..." data-testid="textarea-review-text" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Rating (1–5)</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => set("rating", n)} className={`p-1 ${n <= form.rating ? "text-yellow-500" : "text-muted-foreground"}`} data-testid={`btn-star-${n}`}>
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">{form.rating} stars</span>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex items-center gap-2" data-testid="btn-save-review"><Check className="w-4 h-4" /> Save Review</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function ReviewsTab() {
  const { reviews, addReview, updateReview, deleteReview } = useData();
  const [editing, setEditing] = useState<Review | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyReview = (): Review => ({ id: generateId(), name: "", purchase: "", text: "", rating: 5 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
        </div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="flex items-center gap-2" data-testid="btn-add-review">
            <Plus className="w-4 h-4" /> Add Review
          </Button>
        )}
      </div>

      {adding && <ReviewForm initial={emptyReview()} onSave={(r) => { addReview(r); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ReviewForm initial={editing} onSave={(r) => { updateReview(r); setEditing(null); }} onCancel={() => setEditing(null)} />}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-5" data-testid={`admin-review-${r.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{r.name}</span>
                  <span className="text-xs text-muted-foreground">— {r.purchase}</span>
                </div>
                <div className="flex text-yellow-500 mb-2">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-sm text-muted-foreground italic">"{r.text}"</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(r); setAdding(false); }} data-testid={`btn-edit-review-${r.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteReview(r.id)} data-testid={`btn-delete-review-${r.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FOUNDER TAB ──────────────────────────────────────────────────────────────

function FounderTab() {
  const { founder, setFounder } = useData();
  const [form, setFormState] = useState<Founder>(founder);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Founder>(k: K, v: Founder[K]) => setFormState((f) => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFounder(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Founder Profile</h2>
        <p className="text-sm text-muted-foreground">This appears in the About / Founder section of the website</p>
      </div>
      <form onSubmit={handleSave} className="space-y-4 bg-card border border-border rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="input-founder-name" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Title / Designation</label>
            <Input required value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="input-founder-title" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-founder-phone" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-founder-email" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1 block">LinkedIn URL</label>
            <Input value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} data-testid="input-founder-linkedin" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Bio</label>
          <Textarea required value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} data-testid="textarea-founder-bio" />
        </div>
        <PhotoUpload label="Founder Photo" value={form.image} onChange={(v) => set("image", v)} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex items-center gap-2" data-testid="btn-save-founder">
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Check className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── AGENTS TAB ───────────────────────────────────────────────────────────────

function AgentForm({ initial, onSave, onCancel }: { initial: Agent; onSave: (a: Agent) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Agent>(initial);
  const set = <K extends keyof Agent>(k: K, v: Agent[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="input-agent-name" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Role / Designation</label>
          <Input required value={form.role} onChange={(e) => set("role", e.target.value)} data-testid="input-agent-role" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Experience</label>
          <Input required value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="e.g. 10 Years" data-testid="input-agent-experience" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Specialty</label>
          <Input required value={form.specialty} onChange={(e) => set("specialty", e.target.value)} placeholder="e.g. Plots & Land" data-testid="input-agent-specialty" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Areas Covered</label>
          <Input required value={form.areas} onChange={(e) => set("areas", e.target.value)} placeholder="e.g. Whitefield, Sarjapur" data-testid="input-agent-areas" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Phone Number</label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" data-testid="input-agent-phone" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-agent-email" />
        </div>
      </div>
      <PhotoUpload label="Agent Photo" value={form.image} onChange={(v) => set("image", v)} />
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex items-center gap-2" data-testid="btn-save-agent"><Check className="w-4 h-4" /> Save Agent</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

function AgentsTab() {
  const { agents, addAgent, updateAgent, deleteAgent } = useData();
  const [editing, setEditing] = useState<Agent | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyAgent = (): Agent => ({
    id: generateId(), name: "", role: "", experience: "", specialty: "", areas: "", phone: "", email: "", image: ""
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agents</h2>
          <p className="text-sm text-muted-foreground">{agents.length} agents</p>
        </div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="flex items-center gap-2" data-testid="btn-add-agent">
            <Plus className="w-4 h-4" /> Add Agent
          </Button>
        )}
      </div>

      {adding && <AgentForm initial={emptyAgent()} onSave={(a) => { addAgent(a); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <AgentForm initial={editing} onSave={(a) => { updateAgent(a); setEditing(null); }} onCancel={() => setEditing(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-xl overflow-hidden flex gap-0" data-testid={`admin-agent-${a.id}`}>
            <div className="w-24 shrink-0">
              <img src={a.image} alt={a.name} className="w-full h-full object-cover object-top"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"; }} />
            </div>
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{a.name}</h3>
                  <p className="text-xs text-primary font-medium">{a.role}</p>
                  <p className="text-xs text-muted-foreground">{a.specialty} • {a.experience}</p>
                  <p className="text-xs text-muted-foreground">{a.areas}</p>
                  {a.phone && <p className="text-xs font-medium text-foreground mt-1">{a.phone}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(a); setAdding(false); }} data-testid={`btn-edit-agent-${a.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteAgent(a.id)} data-testid={`btn-delete-agent-${a.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONTACTS TAB ──────────────────────────────────────────────────────────────

const CONTACT_TYPES: ContactEntry["type"][] = ["Office", "Sales", "WhatsApp", "Support", "Other"];

function ContactForm({ initial, onSave, onCancel }: { initial: ContactEntry; onSave: (c: ContactEntry) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ContactEntry>(initial);
  const set = <K extends keyof ContactEntry>(k: K, v: ContactEntry[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Label</label>
          <Input required value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Main Office" data-testid="input-contact-label" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Phone Number</label>
          <Input required value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="+91 98765 43210" data-testid="input-contact-number" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Type</label>
          <select className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2" value={form.type} onChange={(e) => set("type", e.target.value as ContactEntry["type"])} data-testid="select-contact-type">
            {CONTACT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit" className="flex items-center gap-2" data-testid="btn-save-contact"><Check className="w-4 h-4" /> Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4" /> Cancel</Button>
      </div>
    </form>
  );
}

const TYPE_COLORS: Record<ContactEntry["type"], string> = {
  Office: "bg-blue-100 text-blue-700",
  Sales: "bg-green-100 text-green-700",
  WhatsApp: "bg-emerald-100 text-emerald-700",
  Support: "bg-purple-100 text-purple-700",
  Other: "bg-gray-100 text-gray-700",
};

function ContactsTab() {
  const { contacts, addContact, updateContact, deleteContact } = useData();
  const [editing, setEditing] = useState<ContactEntry | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyContact = (): ContactEntry => ({ id: generateId(), label: "", number: "", type: "Office" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contact Numbers</h2>
          <p className="text-sm text-muted-foreground">All public contact numbers displayed across the site</p>
        </div>
        {!adding && !editing && (
          <Button onClick={() => setAdding(true)} className="flex items-center gap-2" data-testid="btn-add-contact">
            <Plus className="w-4 h-4" /> Add Number
          </Button>
        )}
      </div>

      {adding && <ContactForm initial={emptyContact()} onSave={(c) => { addContact(c); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {editing && <ContactForm initial={editing} onSave={(c) => { updateContact(c); setEditing(null); }} onCancel={() => setEditing(null)} />}

      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4" data-testid={`admin-contact-${c.id}`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="bg-primary/10 text-primary p-3 rounded-full shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">{c.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                </div>
                <a href={`tel:${c.number}`} className="text-sm text-primary font-medium hover:underline">{c.number}</a>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(c); setAdding(false); }} data-testid={`btn-edit-contact-${c.id}`}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteContact(c.id)} data-testid={`btn-delete-contact-${c.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

type Tab = "properties" | "reviews" | "founder" | "agents" | "contacts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "properties", label: "Properties", icon: <Building2 className="w-4 h-4" /> },
  { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
  { id: "founder", label: "Founder", icon: <UserCircle className="w-4 h-4" /> },
  { id: "agents", label: "Agents", icon: <Users className="w-4 h-4" /> },
  { id: "contacts", label: "Contacts", icon: <Phone className="w-4 h-4" /> },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const { properties, reviews, agents, contacts } = useData();

  const counts: Record<Tab, number | null> = {
    properties: properties.length,
    reviews: reviews.length,
    founder: null,
    agents: agents.length,
    contacts: contacts.length,
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Admin Header */}
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-foreground leading-none">Priya Estates</h1>
              <p className="text-xs text-muted-foreground font-medium">Admin Panel</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 text-sm" data-testid="btn-back-to-site">
              <ChevronLeft className="w-4 h-4" /> View Site
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="md:w-56 shrink-0">
            <nav className="space-y-1 sticky top-24">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-background hover:shadow-sm"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
                  {counts[tab.id] !== null && (
                    <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {counts[tab.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "properties" && <PropertiesTab />}
                {activeTab === "reviews" && <ReviewsTab />}
                {activeTab === "founder" && <FounderTab />}
                {activeTab === "agents" && <AgentsTab />}
                {activeTab === "contacts" && <ContactsTab />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
