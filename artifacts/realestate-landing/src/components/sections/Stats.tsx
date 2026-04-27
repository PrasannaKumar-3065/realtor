import React from 'react';
import { motion } from 'framer-motion';

export default function Stats() {
  const stats = [
    { number: '18+', label: 'Years Experience' },
    { number: '4,200+', label: 'Happy Families' },
    { number: '₹1200Cr+', label: 'Property Value Handled' },
    { number: '3', label: 'Major Cities Covered' }
  ];

  return (
    <section className="py-12 bg-secondary border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x border-border">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`text-center ${index % 2 !== 0 ? '' : 'border-l-0'} ${index === 0 ? 'border-l-0' : ''}`}
            >
              <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.number}
              </h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
