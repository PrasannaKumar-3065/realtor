import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ChevronLeft, ChevronRight, Phone, Mail, Play, X,
  Plane, School, ShoppingBag, Landmark, Bus, Hospital, Tag,
  CalendarCheck, FileText, BadgeCheck, MessageCircle
} from "lucide-react";
import PrithviNavbar from "@/components/prithvi/PrithviNavbar";
import PrithviFooter from "@/components/prithvi/PrithviFooter";
import LeadFormModal from "@/components/prithvi/LeadFormModal";
import VisitBookingModal from "@/components/prithvi/VisitBookingModal";
import EMICalculator from "@/components/prithvi/EMICalculator";
const Panorama360Viewer = lazy(() => import("@/components/prithvi/Panorama360Viewer"));
import { usePrithvi, parseYouTubeEmbed, getYouTubeThumbnail } from "@/store/prithviStore";
import { api } from "@/api/client";

const PrithviMap = lazy(() => import("@/components/prithvi/PrithviMap"));

const LANDMARK_ICONS: Record<string, React.ReactNode> = {
  Airport: <Plane className="w-4 h-4" />,
  School: <School className="w-4 h-4" />,
  "Shopping Mall": <ShoppingBag className="w-4 h-4" />,
  Bank: <Landmark className="w-4 h-4" />,
  "Bus Stop": <Bus className="w-4 h-4" />,
  Hospital: <Hospital className="w-4 h-4" />,
  College: <School className="w-4 h-4" />,
};

type MediaItem =
  | { kind: "image"; src: string; index: number }
  | { kind: "video"; url: string; embed: string; thumb: string; index: number };

type LeadTrigger = "request-details" | "best-price" | "brochure" | "general";

export default function PrithviPropertyDetail() {
  const params = useParams<{ id: string }>();
  const { properties, siteInfo } = usePrithvi();
  const property = properties.find((p) => p.id === params.id);

  useEffect(() => {
    if (property?.id) {
      api.trackPropertyView("prithvi", property.id).catch(() => {});
    }
  }, [property?.id]);

  const [activeMedia, setActiveMedia] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [leadModal, setLeadModal] = useState<{ open: boolean; trigger: LeadTrigger }>({ open: false, trigger: "general" });
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PrithviNavbar />
        <div className="pt-32 text-center">
          <p className="text-gray-500 text-lg">Property not found.</p>
          <Link href="/prithvi/properties" className="mt-4 inline-block text-green-700 underline">Back to Properties</Link>
        </div>
      </div>
    );
  }

  const openLead = (trigger: LeadTrigger) => setLeadModal({ open: true, trigger });

  const mediaItems: MediaItem[] = [
    ...property.images.map((src, i) => ({ kind: "image" as const, src, index: i })),
    ...property.youtubeLinks
      .map((url, i) => {
        const embed = parseYouTubeEmbed(url);
        const thumb = getYouTubeThumbnail(url);
        if (!embed || !thumb) return null;
        return { kind: "video" as const, url, embed, thumb, index: property.images.length + i };
      })
      .filter(Boolean) as MediaItem[],
  ];

  const current = mediaItems[activeMedia];
  const prevMedia = () => setActiveMedia((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  const nextMedia = () => setActiveMedia((i) => (i + 1) % mediaItems.length);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <PrithviNavbar />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/prithvi" className="hover:text-green-700">Home</Link>
          <span>/</span>
          <Link href="/prithvi/properties" className="hover:text-green-700">Properties</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{property.title}</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Media + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
                  {mediaItems.length === 0 ? (
                    <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80" alt={property.title} className="w-full h-full object-cover opacity-70" />
                  ) : current?.kind === "image" ? (
                    <img
                      src={current.src}
                      alt={`${property.title} - image ${current.index + 1}`}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => { setLightboxIndex(activeMedia); setLightboxOpen(true); }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"; }}
                    />
                  ) : current?.kind === "video" ? (
                    <iframe
                      src={current.embed}
                      title={`${property.title} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null}

                  {/* Verified badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified Property
                  </div>

                  {mediaItems.length > 1 && (
                    <>
                      <button onClick={prevMedia} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextMedia} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {activeMedia + 1} / {mediaItems.length}
                      </div>
                    </>
                  )}
                </div>

                {mediaItems.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {mediaItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMedia(i)}
                        className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === activeMedia ? "border-green-600 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                        style={{ width: 72, height: 52 }}
                      >
                        {item.kind === "image" ? (
                          <img src={item.src} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"; }} />
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

              {/* 360° Virtual Tour */}
              {property.panoramaScenes && Object.keys(property.panoramaScenes.scenes || {}).length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">360°</span>
                      Virtual Tour
                    </h2>
                    <p className="text-xs text-gray-500">
                      {Object.keys(property.panoramaScenes.scenes).length} scene{Object.keys(property.panoramaScenes.scenes).length === 1 ? "" : "s"} · drag to look around · click hotspots to navigate
                    </p>
                  </div>
                  <Suspense fallback={<div className="h-[460px] bg-gray-100 rounded-xl flex items-center justify-center text-sm text-gray-400">Loading 360° tour…</div>}>
                    <Panorama360Viewer data={property.panoramaScenes} height={460} />
                  </Suspense>
                </div>
              )}

              {/* Property Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">{property.type}</span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${property.status === "Available" ? "bg-emerald-100 text-emerald-800" : property.status === "Booking Open" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>{property.status}</span>
                  {property.project && <span className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">{property.project}</span>}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="flex items-center gap-2 text-gray-500 mb-4"><MapPin className="w-4 h-4 text-green-600" /> {property.location}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div><div className="text-xs text-gray-400 mb-1">Plot Area</div><div className="font-bold text-gray-800">{property.area}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Booking Amount</div><div className="font-bold text-gray-800">{property.bookingAmount || "—"}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Ownership</div><div className="font-bold text-gray-800">{property.ownership || "Individual"}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Sale Type</div><div className="font-bold text-gray-800">{property.saleType || "New"}</div></div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={() => openLead("request-details")}
                    className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Request Details
                  </button>
                  <button
                    onClick={() => openLead("best-price")}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Tag className="w-4 h-4" /> Get Best Price
                  </button>
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 hover:bg-green-50 py-3 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" /> Schedule Visit
                  </button>
                </div>

                <h2 className="font-bold text-gray-900 text-lg mb-3">About this Property</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>

                <button
                  onClick={() => openLead("brochure")}
                  className="mt-4 flex items-center gap-2 text-green-700 text-sm font-semibold hover:text-green-800 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Download Brochure
                </button>
              </div>

              {/* Tags */}
              {property.tags.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-green-600" /> Features & Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag) => (
                      <span key={tag} className="bg-green-50 text-green-800 border border-green-200 text-sm font-medium px-3 py-1.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Landmarks */}
              {(property.landmarks.length > 0 || property.nearbyPlaces.length > 0) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Nearby & Landmarks</h2>
                  {property.landmarks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.landmarks.map((l) => (
                        <span key={l} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 text-sm font-medium px-3 py-2 rounded-full">
                          {LANDMARK_ICONS[l] || <MapPin className="w-4 h-4" />} {l}
                        </span>
                      ))}
                    </div>
                  )}
                  {property.nearbyPlaces.length > 0 && (
                    <ul className="space-y-2">
                      {property.nearbyPlaces.map((place) => (
                        <li key={place} className="flex items-start gap-2 text-gray-600 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                          {place}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* EMI Calculator */}
              <EMICalculator defaultPrice={property.priceValue} />

              {/* Location Map */}
              {property.lat != null && property.lng != null && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" /> Location on Map
                  </h2>
                  <Suspense fallback={
                    <div className="bg-gray-100 rounded-xl flex items-center justify-center" style={{ height: 320 }}>
                      <p className="text-gray-500 text-sm">Loading map…</p>
                    </div>
                  }>
                    <PrithviMap
                      properties={[{
                        id: property.id,
                        title: property.title,
                        price: property.price,
                        location: property.location,
                        city: property.city,
                        lat: property.lat,
                        lng: property.lng,
                      }]}
                      showDetailLink={false}
                      showGoogleMapsLink={true}
                      height="320px"
                    />
                  </Suspense>
                  <p className="text-xs text-gray-400 mt-2">Map is approximate. Contact us for exact directions.</p>
                </div>
              )}
            </div>

            {/* Right: Contact Card */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <div className="text-3xl font-bold text-green-700 mb-1">{property.price}</div>
                {property.bookingAmount && (
                  <p className="text-sm text-gray-500 mb-4">Booking: <strong className="text-gray-800">{property.bookingAmount}</strong></p>
                )}

                <div className="flex items-center gap-1.5 mb-5 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <BadgeCheck className="w-4 h-4" /> Verified Property Listing
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => openLead("request-details")}
                    className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-green-800 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> Request Details
                  </button>
                  <button
                    onClick={() => setBookingOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3.5 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors"
                  >
                    <CalendarCheck className="w-5 h-5" /> Schedule Visit
                  </button>
                  <a
                    href={`https://wa.me/${siteInfo.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${siteInfo.email}?subject=Enquiry: ${encodeURIComponent(property.title)}`}
                    className="w-full flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 py-3.5 rounded-xl font-bold text-base hover:bg-green-50 transition-colors"
                  >
                    <Mail className="w-5 h-5" /> Email Enquiry
                  </a>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-800 mb-1">Prithvi Real Estate</p>
                  <p className="text-xs text-gray-500">{siteInfo.address}</p>
                  <p className="text-xs text-gray-500 mt-1">{siteInfo.phone}</p>
                </div>
              </div>

              {/* Similar Properties */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Other Properties</h3>
                <div className="space-y-3">
                  {properties.filter((p) => p.id !== property.id).slice(0, 3).map((p) => (
                    <Link key={p.id} href={`/prithvi/property/${p.id}`}>
                      <div className="flex gap-3 hover:bg-gray-50 rounded-xl p-2 transition-colors cursor-pointer">
                        <div className="w-16 h-14 shrink-0 rounded-lg overflow-hidden">
                          <img src={p.images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"} alt="" className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=80"; }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.location}</p>
                          <p className="text-xs font-bold text-green-700 mt-0.5">{p.price}</p>
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

      {/* Sticky bottom bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 md:hidden shadow-lg">
        <a
          href={`tel:${siteInfo.phone}`}
          className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl font-bold text-sm"
        >
          <Phone className="w-4 h-4" /> Call Now
        </a>
        <a
          href={`https://wa.me/${siteInfo.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(property.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm"
        >
          <Phone className="w-4 h-4" /> WhatsApp
        </a>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}>
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setLightboxOpen(false)}>
              <X className="w-6 h-6" />
            </button>
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

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={leadModal.open}
        onClose={() => setLeadModal((s) => ({ ...s, open: false }))}
        trigger={leadModal.trigger}
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price}
      />

      {/* Visit Booking Modal */}
      <VisitBookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      <PrithviFooter />
    </div>
  );
}
