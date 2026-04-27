import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left side text */}
            <div className="p-10 md:p-16 bg-primary text-primary-foreground">
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
                Let's find your next home.
              </h2>
              <p className="text-white/80 text-lg mb-10 leading-relaxed">
                Drop us a message with what you're looking for. One of our senior agents will call you back within 2 hours during business hours.
              </p>
              
              <div className="space-y-6 text-white/90">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-white/60 mb-1">Office Hours</p>
                  <p>Monday - Saturday: 9:30 AM to 7:00 PM</p>
                  <p>Sunday: 10:00 AM to 2:00 PM</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-white/60 mb-1">Direct Line</p>
                  <p className="text-2xl font-bold text-white">+91 98765 43210</p>
                </div>
              </div>
            </div>

            {/* Right side form */}
            <div className="p-10 md:p-16">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Your Name</label>
                  <Input placeholder="e.g. Ramesh Kumar" className="bg-background border-border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Phone Number</label>
                    <Input placeholder="+91" className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Email Address</label>
                    <Input type="email" placeholder="ramesh@example.com" className="bg-background border-border" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">I am interested in</label>
                  <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="" disabled selected>Select property type...</option>
                    <option>Buying an Apartment</option>
                    <option>Buying a Plot</option>
                    <option>Buying a Villa</option>
                    <option>Commercial Property</option>
                    <option>Selling my property</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Message (Optional)</label>
                  <Textarea 
                    placeholder="Tell us your preferred areas, budget, or specific requirements..." 
                    className="min-h-[120px] bg-background border-border" 
                  />
                </div>

                <Button className="w-full py-6 text-lg font-bold" type="submit">
                  Send Enquiry
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  We never share your personal details with third-party promoters.
                </p>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
