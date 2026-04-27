import React from "react";
import { Link } from "wouter";
import { Phone, Mail, MapPin, Building2 } from "lucide-react";
import { BhimaLogo } from "./BhimaNavbar";
import { useBhima } from "@/store/bhimaStore";

export default function BhimaFooter() {
  const { siteInfo } = useBhima();

  return (
    <footer className="bg-blue-950 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <BhimaLogo size={44} />
            <div>
              <div className="font-extrabold text-white text-lg tracking-wide leading-tight">BHIMA HOMES</div>
              <div className="text-blue-300 text-xs tracking-widest uppercase">& Properties</div>
            </div>
          </div>
          <p className="text-blue-300 text-sm leading-relaxed mb-4">{siteInfo.tagline}</p>
          <p className="text-blue-400 text-xs">Est. {siteInfo.established} · Madurai, Tamil Nadu</p>
        </div>

	        <div>
	          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-amber-400">Areas</h3>
	          <ul className="space-y-1.5">
	            {(siteInfo.areasOfOperation || []).slice(0, 8).map((area) => (
	              <li key={area} className="text-blue-300 text-sm hover:text-white transition-colors cursor-pointer">{area}</li>
	            ))}
	          </ul>
	        </div>

	        <div>
	          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-amber-400">Properties</h3>
	          <ul className="space-y-1.5">
	            {(siteInfo.propertyTypes || []).slice(0, 8).map((t) => (
	              <li key={t} className="text-blue-300 text-sm flex items-center gap-2">
	                <Building2 className="w-3 h-3 text-blue-500 shrink-0" /> {t}
	              </li>
	            ))}
	          </ul>
	        </div>

        <div>
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-amber-400">Contact</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-blue-300 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
              <span>{siteInfo.address}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Phone className="w-4 h-4 shrink-0 text-blue-400" />
              <a href={`tel:${siteInfo.phone}`} className="hover:text-white">{siteInfo.phone}</a>
            </div>
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Mail className="w-4 h-4 shrink-0 text-blue-400" />
              <a href={`mailto:${siteInfo.email}`} className="hover:text-white">{siteInfo.email}</a>
            </div>
          </div>
          <Link href="/bhima/admin" className="inline-block mt-6 text-xs text-blue-600 hover:text-blue-400 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>

      <div className="border-t border-blue-900 py-5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-blue-500 text-xs">
          <span>© {new Date().getFullYear()} Bhima Homes and Properties. All rights reserved.</span>
          <span>Building Foundations That Last — Since {siteInfo.established}</span>
        </div>
      </div>
    </footer>
  );
}
