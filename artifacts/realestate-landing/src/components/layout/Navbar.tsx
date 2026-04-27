import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isHome = location === '/';
  const isAdmin = location === '/admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const homeLinks = [
    { name: 'Properties', href: '#properties' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'Our Agents', href: '#agents' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  if (isAdmin) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-background/95 backdrop-blur-sm shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-foreground leading-none">Priya Estates</h1>
              <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">Since 2006</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {isHome ? (
              homeLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </a>
              ))
            ) : (
              <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Home
              </Link>
            )}
            <Link
              href="/properties"
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-full ${
                location === '/properties'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/80 hover:text-primary border border-border hover:border-primary'
              }`}
              data-testid="nav-all-properties"
            >
              All Properties
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs text-muted-foreground">Call us today</span>
              <a href="tel:+919876543210" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                +91 98765 43210
              </a>
            </div>
            <Button className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="btn-enquire-now">
              Enquire Now
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="btn-mobile-menu"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col px-4 py-6 gap-4">
              {isHome && homeLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-foreground py-2 border-b border-border/50"
                  data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </a>
              ))}
              <Link
                href="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-primary py-2 border-b border-border/50 font-semibold"
                data-testid="mobile-nav-all-properties"
              >
                All Properties
              </Link>
              <div className="mt-4 flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Call our office</p>
                  <a href="tel:+919876543210" className="font-bold hover:text-primary">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
