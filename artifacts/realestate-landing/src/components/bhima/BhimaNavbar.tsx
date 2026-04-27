import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BhimaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#1e3a8a" />
      <path d="M20 8L8 18V32H16V24H24V32H32V18L20 8Z" fill="white" opacity="0.95" />
      <rect x="17" y="24" width="6" height="8" fill="#1e3a8a" />
      <circle cx="20" cy="17" r="3" fill="#f59e0b" />
    </svg>
  );
}

export { BhimaLogo };

export default function BhimaNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isHome = location === "/bhima" || location === "/bhima/";

  const navLinks = isHome
    ? [
        { label: "Properties", href: "#bhima-properties" },
        { label: "Services", href: "#bhima-services" },
        { label: "About", href: "#bhima-about" },
        { label: "Contact", href: "#bhima-contact" },
      ]
    : [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome ? "bg-white shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        <Link href="/bhima" className="flex items-center gap-3">
          <BhimaLogo size={40} />
          <div>
            <div className={`font-extrabold text-lg leading-tight tracking-wide ${isScrolled || !isHome ? "text-blue-900" : "text-white"}`}>
              BHIMA HOMES
            </div>
            <div className={`text-xs font-medium tracking-widest uppercase ${isScrolled || !isHome ? "text-blue-600" : "text-blue-200"}`}>
              & Properties
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}
              className={`text-sm font-medium transition-colors hover:text-amber-400 ${isScrolled || !isHome ? "text-gray-700" : "text-white"}`}>
              {link.label}
            </a>
          ))}
          {!isHome && (
            <Link href="/bhima" className="text-sm font-medium text-gray-700 hover:text-blue-700">Home</Link>
          )}
          <Link href="/bhima/properties"
            className={`text-sm font-semibold px-5 py-2 rounded-full transition-all ${
              location === "/bhima/properties"
                ? "bg-blue-900 text-white"
                : isScrolled || !isHome
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-white/20 backdrop-blur-sm text-white border border-white/40 hover:bg-white/30"
            }`}>
            All Properties
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className={`text-xs ${isScrolled || !isHome ? "text-gray-400" : "text-blue-200"}`}>Call us today</div>
            <a href="tel:+918230300000" className={`text-sm font-bold hover:text-amber-400 transition-colors ${isScrolled || !isHome ? "text-blue-900" : "text-white"}`}>
              +91 82303 00000
            </a>
          </div>
          <a href="tel:+918230300000"
            className="bg-amber-400 hover:bg-amber-500 text-blue-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors shadow-lg">
            Get Free Quote
          </a>
        </div>

        <button className={`md:hidden p-2 ${isScrolled || !isHome ? "text-blue-900" : "text-white"}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg">
            <div className="flex flex-col px-4 py-5 gap-3">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-gray-700 py-2 border-b border-gray-100 hover:text-blue-800">{link.label}</a>
              ))}
              <Link href="/bhima/properties" onClick={() => setMobileOpen(false)}
                className="text-base font-semibold text-blue-900 py-2 border-b border-gray-100">All Properties</Link>
              <div className="mt-3 flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                <div className="bg-blue-900 text-white p-2 rounded-full"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500">Call us</p>
                  <a href="tel:+918230300000" className="font-bold text-blue-900">+91 82303 00000</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
