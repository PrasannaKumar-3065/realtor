import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell us what you need",
      description: "Call us or drop an enquiry. We'll discuss your budget, preferred areas, and whether you want a plot, flat, or villa. No pressure, just a chat."
    },
    {
      number: "02",
      title: "Curated Site Visits",
      description: "We don't waste your weekends. We'll shortlist 3-4 properties that actually match your criteria and arrange guided visits with our agents."
    },
    {
      number: "03",
      title: "Legal & Negotiation",
      description: "Once you like a property, we step in. We negotiate the best price in Hindi/Kannada/Telugu on your behalf and our lawyers verify the titles."
    },
    {
      number: "04",
      title: "Registration & Handover",
      description: "We handle the bank loan paperwork, schedule the sub-registrar appointment, and stand by you until the registration is complete."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            The process is simple when you have the right help.
          </h2>
          <p className="text-lg text-muted-foreground">
            We've streamlined the property buying experience so you don't have to take weeks off work to get things done.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-border/50 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-lg mb-6 relative group">
                <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-110 transition-transform duration-300 -z-10" />
                <span className="font-serif text-3xl font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
