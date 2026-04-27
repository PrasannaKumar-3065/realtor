import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin, Phone, Mail, ArrowRight, CheckCircle2, Building2, Users, Award,
  Star, Shield, Zap
} from "lucide-react";
import BhimaNavbar, { BhimaLogo } from "@/components/bhima/BhimaNavbar";
import BhimaFooter from "@/components/bhima/BhimaFooter";
import { useBhima } from "@/store/bhimaStore";

const STATUS_COLORS: Record<string, string> = {
  "Available": "bg-emerald-100 text-emerald-800",
  "Booking Open": "bg-amber-100 text-amber-800",
  "Under Construction": "bg-blue-100 text-blue-800",
  "Coming Soon": "bg-purple-100 text-purple-700",
  "Sold": "bg-gray-100 text-gray-600",
};

function PropertyCard({ property }: { property: ReturnType<typeof useBhima>["properties"][0] }) {
  return (
    <Link href={`/bhima/property/${property.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
        <div className="relative h-56 overflow-hidden">
          <img src={property.images[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
            alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className="bg-blue-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">{property.type}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[property.status] || "bg-gray-100 text-gray-600"}`}>{property.status}</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-white font-bold text-xl drop-shadow">{property.price}</span>
            {property.youtubeLinks.length > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">▶ Video</span>
            )}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">{property.title}</h3>
          <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />{property.location}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap mb-3">
            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium text-gray-600">{property.area}</span>
            {property.bedrooms && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{property.bedrooms} BHK</span>}
            {property.facing && <span className="bg-gray-50 px-2 py-1 rounded-full">{property.facing} Facing</span>}
          </div>
          {property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {property.amenities.slice(0, 3).map((a) => (
                <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">{a}</span>
              ))}
              {property.amenities.length > 3 && <span className="text-xs text-gray-400">+{property.amenities.length - 3} more</span>}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Bhima Homes</span>
            <span className="text-blue-700 text-sm font-bold flex items-center gap-1">View Details <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BhimaHome() {
  const { properties, siteInfo, founder, services } = useBhima();
  const featured = properties.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <BhimaNavbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80" alt="Bhima Homes Hero"
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full py-32">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-amber-400" />
                <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Est. {siteInfo.established}</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
                Your Dream<br />
                <span className="text-amber-400">Home</span> Awaits
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed mb-10 max-w-xl">
                {siteInfo.tagline} — Bhima Homes brings you premium properties across Madurai with professional architecture, legal verification and end-to-end service.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#bhima-properties"
                  className="bg-amber-400 hover:bg-amber-500 text-blue-950 font-black px-8 py-4 rounded-full text-base transition-all shadow-xl hover:shadow-amber-400/30 hover:scale-105">
                  Browse Properties
                </a>
                <a href="tel:+918230300000"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-8 py-4 rounded-full text-base hover:bg-white/20 transition-all flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Free Consultation
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 bg-blue-900/90 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
            {[
              { value: "16+", label: "Years of Experience" },
              { value: "500+", label: "Properties Delivered" },
              { value: "1000+", label: "Happy Clients" },
              { value: "2", label: "Cities — Madurai & Coimbatore" },
            ].map((s) => (
              <div key={s.label} className="text-center md:px-8">
                <div className="text-2xl md:text-3xl font-black text-amber-400">{s.value}</div>
                <div className="text-blue-200 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* WELCOME / ABOUT STRIP */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-10 bg-amber-400 rounded" />
                <span className="text-blue-700 font-semibold text-sm uppercase tracking-widest">About Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-blue-950 mb-6">
                Welcome to BHIMA HOMES — Building Foundations That Last
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6 text-base">{siteInfo.about}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Shield className="w-5 h-5" />, label: "Legal Verification" },
                  { icon: <Award className="w-5 h-5" />, label: "TNRERA Approved" },
                  { icon: <Users className="w-5 h-5" />, label: "Expert Team" },
                  { icon: <Zap className="w-5 h-5" />, label: "Fast Registration" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl p-3 shadow-sm">
                    <div className="text-blue-700 bg-blue-50 p-2 rounded-lg">{f.icon}</div>
                    <span className="text-gray-700 font-medium text-sm">{f.label}</span>
                  </div>
                ))}
              </div>
              <a href="#bhima-contact"
                className="inline-flex items-center gap-2 bg-blue-900 text-white font-bold px-7 py-3.5 rounded-full hover:bg-blue-800 transition-colors">
                Talk to Us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" alt="Bhima Homes"
                className="rounded-3xl shadow-2xl w-full object-cover h-80 md:h-[480px]" />
              <div className="absolute -bottom-6 -left-6 bg-blue-900 text-white rounded-2xl p-5 shadow-xl">
                <div className="text-3xl font-black text-amber-400">16+</div>
                <div className="text-sm text-blue-200 mt-1">Years Building Trust</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="bhima-services" className="py-20 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Our Specialization</span>
              <div className="h-px w-12 bg-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">What We Do Best</h2>
            <p className="text-blue-300 mt-3 max-w-xl mx-auto">From architecture to legal verification — a complete property solution under one roof</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-blue-900/50 border border-blue-800 rounded-2xl p-6 hover:bg-blue-800/50 hover:border-amber-400/30 transition-all group">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                <p className="text-blue-300 text-sm leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section id="bhima-properties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-1 w-10 bg-amber-400 rounded" />
                <span className="text-blue-700 font-semibold text-sm uppercase tracking-widest">Our Listings</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-blue-950">Featured Properties</h2>
              <p className="text-gray-500 mt-2">Handpicked premium homes and commercial spaces in Madurai</p>
            </div>
            <Link href="/bhima/properties"
              className="text-blue-700 font-bold text-sm flex items-center gap-1 whitespace-nowrap hover:gap-3 transition-all border border-blue-200 px-5 py-2.5 rounded-full hover:bg-blue-50">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="bhima-about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-widest">Areas We Serve</span>
              <div className="h-px w-12 bg-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950">Operating Across Madurai & Coimbatore</h2>
	          </div>
	          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
	            {(siteInfo.areasOfOperation || []).map((area, i) => (
	              <motion.div key={area} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
	                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
	                <div className="bg-blue-100 text-blue-700 p-2 rounded-lg shrink-0"><MapPin className="w-4 h-4" /></div>
	                <span className="text-gray-700 font-medium text-sm">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              {founder.image ? (
                <img src={founder.image} alt={founder.name} className="w-72 h-72 rounded-3xl object-cover object-top shadow-2xl border-4 border-amber-400" />
              ) : (
                <div className="w-72 h-72 rounded-3xl bg-blue-800 border-4 border-amber-400 flex flex-col items-center justify-center gap-4 shadow-2xl">
                  <BhimaLogo size={64} />
                  <p className="text-blue-300 text-sm text-center px-4">Upload founder photo from Admin</p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-10 bg-amber-400 rounded" />
                <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Leadership</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{founder.name}</h2>
              <p className="text-blue-300 text-sm font-medium mb-2">{founder.title}</p>
              <p className="text-amber-400 text-sm font-bold mb-6">{founder.experience}</p>
              <p className="text-blue-100 text-base leading-relaxed mb-8">{founder.bio}</p>
              <div className="flex flex-wrap gap-4">
                <a href={`tel:${founder.phone}`}
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold px-6 py-3 rounded-full text-sm transition-colors">
                  <Phone className="w-4 h-4" /> {founder.phone}
                </a>
                <a href={`mailto:${founder.email}`}
                  className="flex items-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-widest">Why Bhima Homes</span>
              <div className="h-px w-12 bg-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950">The Complete Property Solution</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Professional Team", desc: "Our team of architects, civil engineers and legal experts ensures every project is executed perfectly.", icon: <Users className="w-6 h-6" /> },
              { title: "Legal Verification", desc: "Complete title verification, legal opinions from experts, and hassle-free registration assistance.", icon: <Shield className="w-6 h-6" /> },
              { title: "Post-Purchase Support", desc: "We don't stop at the sale. We help with approvals, modifications and technical queries after purchase.", icon: <CheckCircle2 className="w-6 h-6" /> },
              { title: "Vaastu Compliance", desc: "All properties and designs verified for Vaastu Shastra principles for positive, prosperous living.", icon: <Star className="w-6 h-6" /> },
              { title: "Wide Portfolio", desc: "From studio apartments to industrial land — we cover every property type your business or family needs.", icon: <Building2 className="w-6 h-6" /> },
              { title: "Transparent Process", desc: "No hidden charges, no surprises. We walk you through every step from site visit to registration.", icon: <Award className="w-6 h-6" /> },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="bg-blue-900 text-amber-400 p-3 rounded-xl h-fit shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="bhima-contact" className="py-20 bg-gradient-to-br from-blue-950 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-amber-400" />
              <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">Contact Us</span>
              <div className="h-px w-12 bg-amber-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Get Your Free Consultation</h2>
            <p className="text-blue-300 mt-3">Talk to our experts about your property requirements</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: <Phone className="w-7 h-7" />, label: "Call Us", value: siteInfo.phone, href: `tel:${siteInfo.phone}`, color: "bg-amber-400 text-blue-950" },
              { icon: <Phone className="w-7 h-7" />, label: "WhatsApp", value: siteInfo.whatsapp, href: `https://wa.me/${siteInfo.whatsapp.replace(/[^0-9]/g, "")}`, color: "bg-emerald-500 text-white" },
              { icon: <Mail className="w-7 h-7" />, label: "Email Us", value: siteInfo.email, href: `mailto:${siteInfo.email}`, color: "bg-blue-600 text-white" },
            ].map((c) => (
              <a key={c.label} href={c.href} target={c.label === "WhatsApp" ? "_blank" : undefined} rel="noopener noreferrer"
                className="flex flex-col items-center bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center transition-all group">
                <div className={`${c.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg`}>{c.icon}</div>
                <h3 className="font-bold text-white mb-1">{c.label}</h3>
                <p className="text-blue-200 text-sm">{c.value}</p>
              </a>
            ))}
          </div>
          <div className="mt-10 flex items-start gap-4 bg-white/10 rounded-2xl p-6 max-w-4xl mx-auto border border-white/10">
            <MapPin className="w-10 h-10 text-amber-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Visit Our Office</h3>
              <p className="text-blue-200">{siteInfo.address}</p>
            </div>
          </div>
        </div>
      </section>

      <BhimaFooter />
    </div>
  );
}
