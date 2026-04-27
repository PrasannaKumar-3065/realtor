import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import FeaturedListings from "@/components/sections/FeaturedListings";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import HowItWorks from "@/components/sections/HowItWorks";
import Agents from "@/components/sections/Agents";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Stats />
        <FeaturedListings />
        <WhyChooseUs />
        <HowItWorks />
        <Agents />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
