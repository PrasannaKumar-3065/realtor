import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Handshake, ScrollText, Users } from 'lucide-react';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "100% Verified Titles",
      description: "Our legal team scrutinizes every document. If a property's paperwork isn't clean, we don't sell it. Period."
    },
    {
      icon: <Handshake className="w-8 h-8 text-primary" />,
      title: "No Hidden Margins",
      description: "We charge a straight 1% brokerage from buyers. No markup tricks, no sudden surprises during registration."
    },
    {
      icon: <ScrollText className="w-8 h-8 text-primary" />,
      title: "End-to-End Support",
      description: "From loan processing to registration at the sub-registrar office, our team stays with you until the keys are in your hand."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Local Market Knowledge",
      description: "We know these neighborhoods block by block. We can tell you about water supply, future metro plans, and school zones."
    }
  ];

  return (
    <section id="why-us" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] transform -rotate-3 -z-10" />
              <img 
                src="/images/agent-pradeep.png" 
                alt="Priya Estates Team" 
                className="w-full rounded-2xl shadow-2xl object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-xl border border-border max-w-xs hidden sm:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    P
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-tight">Pradeep Kumar</h4>
                    <p className="text-xs text-muted-foreground">Founder, Priya Estates</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 italic">
                  "A home is the biggest purchase a family makes. We treat every client's money with the same respect we treat our own."
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why families trust us with their life savings.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              The real estate market can be confusing and intimidating. We act as your guide, protector, and negotiator throughout the entire journey.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {reasons.map((reason, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <div className="bg-background w-16 h-16 rounded-xl flex items-center justify-center shadow-sm border border-border">
                    {reason.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
