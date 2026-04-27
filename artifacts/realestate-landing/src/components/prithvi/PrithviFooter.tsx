import React from "react";
import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import prithviLogo from "@assets/prithvi_real_1776791750045.jpg";
import { usePrithvi } from "@/store/prithviStore";

export default function PrithviFooter() {
  const { siteInfo } = usePrithvi();

  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={prithviLogo}
              alt="Prithvi Real Estate"
              className="w-12 h-12 rounded-xl object-contain bg-white p-1"
            />
            <div>
              <div className="font-bold text-white text-lg leading-tight">Prithvi Real Estate</div>
              <div className="text-green-300 text-xs">Madurai, Tamil Nadu</div>
            </div>
          </div>
          <p className="text-green-200 text-sm leading-relaxed">{siteInfo.tagline}</p>
        </div>

        {/* Areas */}
	        <div>
	          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Areas of Operation</h3>
	          <ul className="space-y-1.5">
	            {(siteInfo.areasOfOperation || []).slice(0, 7).map((area) => (
	              <li key={area} className="text-green-300 text-sm hover:text-white transition-colors cursor-pointer">
	                {area}
	              </li>
	            ))}
	          </ul>
	        </div>

        {/* Property Types */}
	        <div>
	          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Property Types</h3>
	          <ul className="space-y-1.5">
	            {(siteInfo.propertyTypes || []).map((t) => (
	              <li key={t} className="text-green-300 text-sm">
	                {t}
	              </li>
	            ))}
	          </ul>
	        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">Contact</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-green-300 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-green-400" />
              <span>{siteInfo.address}</span>
            </div>
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <Phone className="w-4 h-4 shrink-0 text-green-400" />
              <a href={`tel:${siteInfo.phone}`} className="hover:text-white">{siteInfo.phone}</a>
            </div>
            <div className="flex items-center gap-2 text-green-300 text-sm">
              <Mail className="w-4 h-4 shrink-0 text-green-400" />
              <a href={`mailto:${siteInfo.email}`} className="hover:text-white">{siteInfo.email}</a>
            </div>
          </div>
          <Link href="/prithvi/admin" className="inline-block mt-6 text-xs text-green-500 hover:text-green-300 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>

      <div className="border-t border-green-800 py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-green-400 text-xs">
          <span>© {new Date().getFullYear()} Prithvi Real Estate. All rights reserved.</span>
          <span>Sundaram Park, K K Nagar, Madurai — Tamil Nadu</span>
        </div>
      </div>
    </footer>
  );
}
