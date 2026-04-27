import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, CheckCircle2, Building2, Users, Award, ArrowRight, Plane, School, ShoppingBag, Landmark, Bus } from "lucide-react";
import PrithviNavbar from "@/components/prithvi/PrithviNavbar";
import PrithviFooter from "@/components/prithvi/PrithviFooter";
import { usePrithvi } from "@/store/prithviStore";
import prithviLogo from "@assets/prithvi_real_1776791750045.jpg";

const LANDMARK_ICONS: Record<string, React.ReactNode> = {
  Airport: <Plane className="w-3.5 h-3.5" />,
  School: <School className="w-3.5 h-3.5" />,
  "Shopping Mall": <ShoppingBag className="w-3.5 h-3.5" />,
  Bank: <Landmark className="w-3.5 h-3.5" />,
  "Bus Stop": <Bus className="w-3.5 h-3.5" />,
};

function PropertyCard({ property }: { property: ReturnType<typeof usePrithvi>["properties"][0] }) {
  return (
    <Link href={`/prithvi/property/${property.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer" data-testid={`prithvi-prop-card-${property.id}`}>
        <div className="relative h-52 overflow-hidden">
          <img
            src={property.images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"; }}
          />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className="bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-md">{property.type}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${property.status === "Available" ? "bg-emerald-100 text-emerald-800" : property.status === "Booking Open" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>{property.status}</span>
          </div>
          {property.youtubeLinks.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <span>▶</span> Video
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{property.title}</h3>
          <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />{property.location}
          </p>
          <div className="text-xl font-bold text-green-700 mb-3">{property.price}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 flex-wrap">
            <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">{property.area}</span>
            {property.bookingAmount && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">Booking: {property.bookingAmount}</span>}
          </div>
          {property.landmarks.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {property.landmarks.slice(0, 4).map((l) => (
                <span key={l} className="flex items-center gap-1 bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-100">
                  {LANDMARK_ICONS[l] || <MapPin className="w-3 h-3" />} {l}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Prithvi Real Estate</span>
            <span className="text-green-700 text-sm font-semibold flex items-center gap-1">View Details <ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PrithviHome() {
  const { properties, siteInfo, founder } = usePrithvi();
  const featured = properties.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <PrithviNavbar />

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center pt-20 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-green-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-2 mb-6">
                <img src={prithviLogo} alt="Prithvi" className="w-14 h-14 rounded-2xl object-contain bg-white p-1.5" />
                <div>
                  <div className="text-green-300 text-sm font-semibold uppercase tracking-wider">Prithvi Real Estate</div>
                  <div className="text-green-100 text-xs">26+ Years of Trust in Tamil Nadu</div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Find Your Perfect<br />
                <span className="text-green-300">Plot or Property</span><br />
                in Madurai
              </h1>
              <p className="text-green-100 text-lg leading-relaxed mb-8 max-w-xl">
                Trusted by hundreds of families across Madurai, Dindigul and Tiruchirappalli. We bring you verified, DTCP approved properties at the best prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#prithvi-properties" className="bg-white text-green-800 px-7 py-3.5 rounded-full font-bold text-base hover:bg-green-50 transition-colors">
                  Browse Properties
                </a>
                <a href="tel:+919994600000" className="border-2 border-white text-white px-7 py-3.5 rounded-full font-bold text-base hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hidden md:grid grid-cols-2 gap-4">
              {[
                { label: "Years of Experience", value: "26+", icon: <Award className="w-6 h-6 text-green-400" /> },
                { label: "Properties Sold", value: "500+", icon: <Building2 className="w-6 h-6 text-green-400" /> },
                { label: "Happy Families", value: "400+", icon: <Users className="w-6 h-6 text-green-400" /> },
                { label: "Team Size", value: "51–100", icon: <Users className="w-6 h-6 text-green-400" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                  {stat.icon}
                  <div className="text-3xl font-bold text-white mt-2">{stat.value}</div>
                  <div className="text-green-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section id="prithvi-properties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Our Listings</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-500 mt-2">Verified, DTCP approved plots and commercial land across Tamil Nadu</p>
            </div>
            <Link href="/prithvi/properties" className="text-green-700 font-semibold text-sm flex items-center gap-1 whitespace-nowrap hover:gap-2 transition-all" data-testid="prithvi-view-all-link">
              View All Properties <ArrowRight className="w-4 h-4" />
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

      {/* AREAS OF OPERATION */}
      <section id="prithvi-areas" className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Where We Operate</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Areas of Operation</h2>
            <p className="text-gray-500 mt-2">We cover prime localities across Madurai, Dindigul and Tiruchirappalli</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(siteInfo.areasOfOperation || []).map((area, i) => (
              <motion.div key={area} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-green-100 rounded-xl p-4 flex items-center gap-3 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
                <div className="bg-green-100 text-green-700 p-2 rounded-lg shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-gray-700 font-medium text-sm">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Why Prithvi</div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built on Trust, Transparency and 26 Years of Knowledge</h2>
              <div className="space-y-5">
                {[
                  { title: "100% Verified Properties", desc: "Every listing is personally verified by our team before it goes live." },
                  { title: "DTCP Approved Plots", desc: "We only deal in government-approved layouts with clear titles." },
                  { title: "Transparent Pricing", desc: "No hidden charges. What you see is what you pay." },
                  { title: "End-to-End Assistance", desc: "From site visit to registration — we handle everything for you." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full shrink-0 mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(siteInfo.propertyTypes || []).slice(0, 6).map((pt) => (
                <div key={pt} className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <Building2 className="w-7 h-7 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-700 font-medium text-sm">{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER / ABOUT */}
      <section id="prithvi-about" className="py-20 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-green-300 font-semibold text-sm uppercase tracking-wider mb-2">Our Founder</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{founder.name}</h2>
              <p className="text-green-200 text-sm font-medium mb-6">{founder.title} · {founder.experience}</p>
              <p className="text-green-100 text-base leading-relaxed mb-8">{founder.bio}</p>
              <div className="flex flex-wrap gap-4">
                <a href={`tel:${founder.phone}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                  <Phone className="w-4 h-4" /> {founder.phone}
                </a>
                <a href={`mailto:${founder.email}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                  <Mail className="w-4 h-4" /> Email Us
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              {founder.image ? (
                <img src={founder.image} alt={founder.name} className="w-64 h-64 rounded-3xl object-cover border-4 border-green-600 shadow-2xl" />
              ) : (
                <div className="w-64 h-64 rounded-3xl bg-green-800 border-4 border-green-600 flex flex-col items-center justify-center gap-4">
                  <img src={prithviLogo} alt="Prithvi" className="w-24 h-24 object-contain rounded-2xl bg-white p-2" />
                  <p className="text-green-300 text-sm text-center px-4">Upload founder photo from Admin Panel</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="prithvi-contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Get In Touch</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Talk to Our Team</h2>
            <p className="text-gray-500 mt-2">We're always available to help you find the right property</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a href={`tel:${siteInfo.phone}`} className="flex flex-col items-center bg-green-50 border border-green-100 rounded-2xl p-8 text-center hover:shadow-md transition-all group">
              <div className="bg-green-700 text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
              <p className="text-green-700 font-semibold">{siteInfo.phone}</p>
            </a>
            <a href={`https://wa.me/${siteInfo.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center bg-green-50 border border-green-100 rounded-2xl p-8 text-center hover:shadow-md transition-all group">
              <div className="bg-emerald-600 text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
              <p className="text-emerald-700 font-semibold">{siteInfo.whatsapp}</p>
            </a>
            <a href={`mailto:${siteInfo.email}`} className="flex flex-col items-center bg-green-50 border border-green-100 rounded-2xl p-8 text-center hover:shadow-md transition-all group">
              <div className="bg-green-700 text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
              <p className="text-green-700 font-semibold text-sm">{siteInfo.email}</p>
            </a>
          </div>

          <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <MapPin className="w-10 h-10 text-green-600 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Visit Our Office</h3>
              <p className="text-gray-600">{siteInfo.address}</p>
            </div>
          </div>
        </div>
      </section>

      <PrithviFooter />
    </div>
  );
}
