import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import TrustMetrics from "../components/landing/TrustMetrics";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans overflow-x-hidden landing-scroll">
      <LandingNavbar />

      <HeroSection />

      <div className="reveal-section">
        <TrustMetrics />
      </div>

      <div className="reveal-section">
        <FeaturesSection />
      </div>

      <div className="reveal-section">
        <HowItWorks />
      </div>

      <div className="reveal-section">
        <Testimonials />
      </div>

      <div className="reveal-section">
        <CTASection />
      </div>

      <Footer />
    </div>
  );
}
