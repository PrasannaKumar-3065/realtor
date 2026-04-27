import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 z-10" />
        <img 
          src="/images/villa-banjara.png" 
          alt="Beautiful Indian Villa" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-6 border border-primary/20">
              Trusted by 4,000+ Indian Families
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Find the perfect home for your <span className="text-primary italic">family's future.</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl leading-relaxed">
              From plots in Whitefield to ready-to-move flats in Koramangala. 
              We've spent 18 years helping families like yours make the right property decisions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card p-4 md:p-6 rounded-2xl shadow-xl border border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4">
              
              {/* City Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> City
                </label>
                <select className="w-full bg-transparent border-b border-border pb-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none">
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Pune</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Property Type
                </label>
                <select className="w-full bg-transparent border-b border-border pb-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none">
                  <option>2BHK / 3BHK Apartment</option>
                  <option>Residential Plot</option>
                  <option>Independent Villa</option>
                  <option>Commercial Space</option>
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Budget Range
                </label>
                <select className="w-full bg-transparent border-b border-border pb-2 text-foreground font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none">
                  <option>₹40 Lakhs - ₹80 Lakhs</option>
                  <option>₹80 Lakhs - ₹1.5 Cr</option>
                  <option>₹1.5 Cr - ₹3 Cr</option>
                  <option>₹3 Cr +</option>
                </select>
              </div>

            </div>

            <Button className="w-full py-6 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center gap-2">
              <Search className="w-5 h-5" /> Search Properties
            </Button>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
