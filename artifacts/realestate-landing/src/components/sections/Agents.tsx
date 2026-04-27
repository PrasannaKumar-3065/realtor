import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/store/dataStore';

export default function Agents() {
  const { agents } = useData();

  return (
    <section id="agents" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Meet the people who know your neighborhood.
          </h2>
          <p className="text-lg text-muted-foreground">
            No call centers. No automated bots. Just experienced local professionals who have spent years understanding property values in these exact streets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm group"
              data-testid={`agent-card-${agent.id}`}
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
                  }}
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-1">
                  {agent.name}
                </h3>
                <p className="text-primary font-medium text-sm mb-4">
                  {agent.role}
                </p>

                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <p><strong>Experience:</strong> {agent.experience}</p>
                  <p><strong>Specialty:</strong> {agent.specialty}</p>
                  <p><strong>Areas:</strong> {agent.areas}</p>
                </div>

                <div className="flex gap-3 justify-center">
                  {agent.phone ? (
                    <a href={`tel:${agent.phone}`}>
                      <Button variant="outline" size="icon" className="rounded-full" data-testid={`btn-agent-phone-${agent.id}`}>
                        <Phone className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                  {agent.email ? (
                    <a href={`mailto:${agent.email}`}>
                      <Button variant="outline" size="icon" className="rounded-full" data-testid={`btn-agent-email-${agent.id}`}>
                        <Mail className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
