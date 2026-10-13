import React from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Footer from '../../components/layout/Footer';
import Hero from './landing/Hero';
import About from './landing/About';
import Features from './landing/Features';
import HowItWorks from './landing/HowItWorks';
import RolesSection from './landing/RolesSection';
import SoloCallout from './landing/SoloCallout';
import Faq from './landing/Faq';
import FinalCta from './landing/FinalCta';
import './Landing.css';

/**
 * Anushasan Public Landing Page
 * Contains all 10 sections in exact spec sequence.
 */
export function Landing() {
  return (
    <div className="landing-page">
      {/* 1. Navbar */}
      <PublicNavbar />

      <main id="main-content">
        {/* 2. Hero */}
        <Hero />

        {/* 3. About / The Problem */}
        <About />

        {/* 4. Features (8 cards) */}
        <Features />

        {/* 5. How It Works (3 steps) */}
        <HowItWorks />

        {/* 6. Roles (3 cards) */}
        <RolesSection />

        {/* 7. Solo Mode Callout */}
        <SoloCallout />

        {/* 8. FAQ (5 native details) */}
        <Faq />

        {/* 9. Final Call to Action */}
        <FinalCta />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
