import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/store/dataStore';
import { Link } from 'wouter';

export default function FeaturedListings() {
  const { properties } = useData();
  const featured = properties.filter((p) => p.featured).slice(0, 6);

  return (
    <section id="properties" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Handpicked Properties
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We don't just list everything. We visit, verify, and select properties that make good homes and solid investments. Here are some of our best currently available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 group"
              data-testid={`featured-property-${listing.id}`}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
                  }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                    {listing.type}
                  </span>
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                    {listing.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1">
                    {listing.title}
                  </h3>
                </div>

                <p className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 text-primary" /> {listing.location}
                </p>

                <div className="text-2xl font-bold text-foreground mb-6">
                  {listing.price}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mb-6 flex-wrap gap-2">
                  {listing.beds !== undefined && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <Bed className="w-4 h-4" /> {listing.beds} Beds
                    </div>
                  )}
                  {listing.baths !== undefined && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <Bath className="w-4 h-4" /> {listing.baths} Baths
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                    <Square className="w-4 h-4" /> {listing.area}
                  </div>
                </div>

                <Button className="w-full flex items-center gap-2" variant="outline" data-testid={`btn-contact-${listing.id}`}>
                  <Phone className="w-4 h-4" /> Contact Agent
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/properties">
            <Button size="lg" className="px-8 rounded-full" data-testid="btn-view-all-properties">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
