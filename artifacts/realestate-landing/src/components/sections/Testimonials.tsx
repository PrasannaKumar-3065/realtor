import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useData } from '@/store/dataStore';

export default function Testimonials() {
  const { reviews } = useData();

  return (
    <section id="reviews" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Word of mouth is our biggest asset.
            </h2>
            <p className="text-lg text-muted-foreground">
              Most of our clients come to us through referrals from families we've helped in the past.
            </p>
          </div>
          <div className="bg-secondary p-4 rounded-xl border border-border text-center min-w-[200px]">
            <div className="text-4xl font-bold text-primary mb-1">4.9/5</div>
            <div className="flex justify-center text-yellow-500 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Based on 450+ Google Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-border shadow-sm relative"
              data-testid={`review-card-${review.id}`}
            >
              <div className="text-6xl text-primary/20 font-serif absolute top-4 right-6">"</div>
              <div className="flex text-yellow-500 mb-6">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-8 relative z-10 italic">
                "{review.text}"
              </p>
              <div className="border-t border-border pt-4">
                <h4 className="font-bold text-foreground">{review.name}</h4>
                <p className="text-sm text-primary font-medium">{review.purchase}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
