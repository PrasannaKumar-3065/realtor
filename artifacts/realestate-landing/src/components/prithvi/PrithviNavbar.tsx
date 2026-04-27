import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import prithviLogo from "@assets/prithvi_real_1776791750045.jpg";

export default function PrithviNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isHome = location === "/prithvi" || location === "/prithvi/";

  const navLinks = isHome
    ? [
        { label: "Properties", href: "#prithvi-properties" },
        { label: "Areas", href: "#prithvi-areas" },
        { label: "About", href: "#prithvi-about" },
        { label: "Contact", href: "#prithvi-contact" },
      ]
    : [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? "bg-white shadow-md py-2"
          : "bg-white/90 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/prithvi" className="flex items-center gap-3" data-testid="prithvi-logo-link">
          <img
            src={prithviLogo}
            alt="Prithvi Real Estate"
            className="w-12 h-12 rounded-xl object-contain bg-green-50 p-1 border border-green-100"
          />
          <div>
            <div className="font-bold text-green-800 text-lg leading-tight">Prithvi Real Estate</div>
            <div className="text-xs text-green-600 font-medium tracking-wide">Madurai, Tamil Nadu</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
              data-testid={`prithvi-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </a>
          ))}
          {!isHome && (
            <Link href="/prithvi" className="text-sm font-medium text-gray-700 hover:text-green-700">
              Home
            </Link>
          )}
          <Link
            href="/prithvi/properties"
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all ${
              location === "/prithvi/properties"
                ? "bg-green-700 text-white"
                : "border border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            }`}
            data-testid="prithvi-nav-all-properties"
          >
            All Properties
          </Link>
        </nav>

        {/* Phone CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">Call us</div>
            <a href="tel:+919994600000" className="text-sm font-bold text-green-800 hover:text-green-600">
              +91 99946 00000
            </a>
          </div>
          <a
            href="tel:+919994600000"
            className="bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-800 transition-colors"
            data-testid="prithvi-btn-enquire"
          >
            Enquire Now
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-green-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          data-testid="prithvi-btn-mobile-menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-green-100 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-5 gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-gray-700 py-2 border-b border-gray-100"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/prithvi/properties"
                onClick={() => setMobileOpen(false)}
                className="text-base font-semibold text-green-700 py-2 border-b border-gray-100"
              >
                All Properties
              </Link>
              <div className="mt-3 flex items-center gap-3 bg-green-50 rounded-xl p-4">
                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Call our office</p>
                  <a href="tel:+919994600000" className="font-bold text-green-800">+91 99946 00000</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
