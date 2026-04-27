import React from 'react';
import { Home, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 md:py-20 border-t-4 border-primary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white leading-none">Priya Estates</h2>
                <p className="text-[0.65rem] text-primary uppercase tracking-wider font-semibold mt-0.5">Since 2006</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Your trusted partner in finding the perfect home. With over 18 years of experience, we help families across Bangalore, Hyderabad, and Pune secure their future.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li><a href="#properties" className="hover:text-primary transition-colors">Featured Properties</a></li>
              <li><a href="#why-us" className="hover:text-primary transition-colors">Why Choose Us</a></li>
              <li><a href="#agents" className="hover:text-primary transition-colors">Meet Our Team</a></li>
              <li><a href="#reviews" className="hover:text-primary transition-colors">Client Reviews</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact Office</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-6">Property Types</h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li><a href="#" className="hover:text-primary transition-colors">Residential Plots</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">2BHK & 3BHK Flats</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Independent Villas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gated Communities</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Commercial Spaces</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  #42, 100 Ft Road, Indiranagar,<br />
                  Next to Metro Station,<br />
                  Bangalore, Karnataka 560038
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hello@priyaestates.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© {new Date().getFullYear()} Priya Estates. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
