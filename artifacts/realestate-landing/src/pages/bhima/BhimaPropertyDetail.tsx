import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight, Phone, Mail, Play, X, Tag, Bed, Bath, Compass, Layers } from "lucide-react";
import BhimaNavbar from "@/components/bhima/BhimaNavbar";
import BhimaFooter from "@/components/bhima/BhimaFooter";
import { useBhima, parseBhimaYouTubeEmbed, getBhimaYouTubeThumbnail } from "@/store/bhimaStore";

type MediaItem =
  | { kind: "image"; src: string; index: number }
  | { kind: "video"; url: string; embed: string; thumb: string; index: number };

const STATUS_COLORS: Record<string, string> = {
  "Available": "bg-emerald-100 text-emerald-800",
  "Booking Open": "bg-amber-100 text-amber-800",
  "Under Construction": "bg-blue-100 text-blue-800",
  "Coming Soon": "bg-purple-100 text-purple-700",
  "Sold": "bg-gray-100 text-gray-600",
};

export default function BhimaPropertyDetail() {
  const params = useParams<{ id: string }>();
  const { properties, siteInfo } = useBhima();
  const property = properties.find((p) => p.id === params.id);
  const [activeMedia, setActiveMedia] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BhimaNavbar />
        <div className="pt-32 text-center">
          <p className="text-gray-500 text-lg">Property not found.</p>
          <Link href="/bhima/properties" className="mt-4 inline-block text-blue-700 underline">Back to Properties</Link>
        </div>
      </div>
    );
  }

  const mediaItems: MediaItem[] = [
    ...property.images.map((src, i) => ({ kind: "image" as const, src, index: i })),
    ...property.youtubeLinks.map((url, i) => {
      const embed = parseBhimaYouTubeEmbed(url);
      const thumb = getBhimaYouTubeThumbnail(url);
      if (!embed || !thumb) return null;
      return { kind: "video" as const, url, embed, thumb, index: property.images.length + i };
    }).filter(Boolean) as MediaItem[],
  ];

  const current = mediaItems[activeMedia];
  const prev = () => setActiveMedia((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  const next = () => setActiveMedia((i) => (i + 1) % mediaItems.length);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <BhimaNavbar />
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-blue-950 py-4">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-2 text-sm text-blue-300">
            <Link href="/bhima" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/bhima/properties" className="hover:text-amber-400 transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-white font-medium line-clamp-1">{property.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100">
                <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
                  {mediaItems.length === 0 ? (
                    <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80" alt="" className="w-full h-full object-cover opacity-60" />
                  ) : current?.kind === "image" ? (
                    <img src={current.src} alt={`${property.title}`}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => { setLightboxIndex(activeMedia); setLightboxOpen(true); }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"; }} />
                  ) : current?.kind === "video" ? (
                    <iframe src={current.embed} title="Property Video" className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : null}

                  {mediaItems.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition-all">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                        {activeMedia + 1} / {mediaItems.length}
                      </div>
                    </>
                  )}
                </div>
                {mediaItems.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                    {mediaItems.map((item, i) => (
                      <button key={i} onClick={() => setActiveMedia(i)}
                        className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeMedia ? "border-blue-700 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                        style={{ width: 80, height: 56 }}>
                        {item.kind === "image" ? (
                          <img src={item.src} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80"; }} />
                        ) : (
                          <div className="relative w-full h-full bg-black">
                            <img src={item.thumb} alt="" className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-red-600 text-white rounded-full p-1"><Play className="w-3 h-3 fill-white" /></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-7">
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">{property.type}</span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[property.status] || "bg-gray-100 text-gray-600"}`}>{property.status}</span>
                  {property.project && <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200">{property.project}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-blue-950 mb-3">{property.title}</h1>
                <p className="flex items-center gap-2 text-gray-500 mb-6"><MapPin className="w-4 h-4 text-blue-600" />{property.location}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: <Layers className="w-4 h-4 text-blue-600" />, label: "Area", value: property.area },
                    ...(property.bedrooms ? [{ icon: <Bed className="w-4 h-4 text-blue-600" />, label: "Bedrooms", value: `${property.bedrooms} BHK` }] : []),
                    ...(property.bathrooms ? [{ icon: <Bath className="w-4 h-4 text-blue-600" />, label: "Bathrooms", value: property.bathrooms }] : []),
                    ...(property.facing ? [{ icon: <Compass className="w-4 h-4 text-blue-600" />, label: "Facing", value: property.facing }] : []),
                    ...(property.floor ? [{ icon: <Layers className="w-4 h-4 text-blue-600" />, label: "Floor", value: property.floor }] : []),
                  ].slice(0, 4).map((item) => (
                    <div key={item.label} className="bg-blue-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">{item.icon} {item.label}</div>
                      <div className="font-bold text-blue-950 text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>

                <h2 className="font-black text-blue-950 text-lg mb-3">About this Property</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-7">
                  <h2 className="font-black text-blue-950 text-lg mb-5 flex items-center gap-2">
                    <span className="w-2 h-6 bg-amber-400 rounded inline-block" /> Premium Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="text-sm font-medium text-blue-900">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {property.tags.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-7">
                  <h2 className="font-black text-blue-950 text-lg mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-blue-600" /> Features & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((t) => (
                      <span key={t} className="bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby */}
              {(property.landmarks.length > 0 || property.nearbyPlaces.length > 0) && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-7">
                  <h2 className="font-black text-blue-950 text-lg mb-5 flex items-center gap-2">
                    <span className="w-2 h-6 bg-amber-400 rounded inline-block" /> Nearby & Landmarks
                  </h2>
                  {property.landmarks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {property.landmarks.map((l) => (
                        <span key={l} className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 text-sm font-semibold px-3 py-2 rounded-full">
                          <MapPin className="w-3.5 h-3.5" /> {l}
                        </span>
                      ))}
                    </div>
                  )}
                  {property.nearbyPlaces.length > 0 && (
                    <ul className="space-y-2">
                      {property.nearbyPlaces.map((place) => (
                        <li key={place} className="flex items-start gap-3 text-gray-600 text-sm bg-gray-50 rounded-xl p-3">
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" /> {place}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              <div className="bg-blue-950 rounded-3xl p-7 shadow-xl sticky top-24">
                <div className="text-3xl font-black text-amber-400 mb-1">{property.price}</div>
                <p className="text-blue-300 text-sm mb-6">{property.area} · {property.type}</p>
                <div className="space-y-3 mb-7">
                  <a href={`tel:${siteInfo.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 text-blue-950 py-4 rounded-2xl font-black text-base hover:bg-amber-500 transition-colors shadow-lg">
                    <Phone className="w-5 h-5" /> Call Now
                  </a>
                  <a href={`https://wa.me/${siteInfo.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I am interested in ${encodeURIComponent(property.title)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-emerald-700 transition-colors">
                    <Phone className="w-5 h-5" /> WhatsApp
                  </a>
                  <a href={`mailto:${siteInfo.email}?subject=Enquiry: ${encodeURIComponent(property.title)}`}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold text-base hover:bg-white/20 transition-colors">
                    <Mail className="w-5 h-5" /> Email Enquiry
                  </a>
                </div>
                <div className="border-t border-blue-800 pt-5">
                  <p className="text-sm font-bold text-white mb-1">Bhima Homes & Properties</p>
                  <p className="text-xs text-blue-400">{siteInfo.address}</p>
                  <p className="text-xs text-blue-400 mt-1">{siteInfo.phone}</p>
                </div>
              </div>

              {/* Similar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5">
                <h3 className="font-black text-blue-950 mb-4 text-sm">More Properties</h3>
                <div className="space-y-3">
                  {properties.filter((p) => p.id !== property.id).slice(0, 3).map((p) => (
                    <Link key={p.id} href={`/bhima/property/${p.id}`}>
                      <div className="flex gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors cursor-pointer">
                        <div className="w-16 h-14 shrink-0 rounded-lg overflow-hidden">
                          <img src={p.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80"} alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&q=80"; }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.location}</p>
                          <p className="text-xs font-black text-amber-600 mt-0.5">{p.price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setLightboxOpen(false)}><X className="w-6 h-6" /></button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + property.images.length) % property.images.length); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img src={property.images[lightboxIndex]} alt="" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % property.images.length); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
            <div className="absolute bottom-4 text-white text-sm">{lightboxIndex + 1} / {property.images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <BhimaFooter />
    </div>
  );
}
