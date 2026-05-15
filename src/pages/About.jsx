import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Footer from "../components/landing/Footer";
import CTASection from "../components/landing/CTASection";
import { Target, Eye, Shield, Users, Zap, Clock } from "lucide-react";
import backgrounder from "../assets/backgounder.png";

const CheckCircle2 = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const values = [
  {
    icon: <Shield size={24} />,
    title: "Uncompromising Security",
    desc: "Your health data is sacred. We use end-to-end encryption and HIPAA-compliant protocols.",
    color: "text-blue-500",
    bg: "bg-blue-50",
    glow: "from-blue-100/55",
  },
  {
    icon: <Users size={24} />,
    title: "Human Centered",
    desc: "Technology should bridge the gap, not create one. We prioritize empathy and clarity in everything.",
    color: "text-violet-500",
    bg: "bg-violet-50",
    glow: "from-violet-100/55",
  },
  {
    icon: <Zap size={24} />,
    title: "Seamless Innovation",
    desc: "We constantly push the boundaries of what is possible in health-tech to save lives and time.",
    color: "text-amber-500",
    bg: "bg-amber-50",
    glow: "from-amber-100/55",
  },
  {
    icon: <Clock size={24} />,
    title: "Efficiency First",
    desc: "No more waiting rooms. We optimize every workflow to ensure you get care when you need it most.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    glow: "from-emerald-100/55",
  },
  {
    icon: <Target size={24} />,
    title: "Global Impact",
    desc: "Our platform is built to scale across borders, bringing world-class care to underserved communities.",
    color: "text-rose-500",
    bg: "bg-rose-50",
    glow: "from-rose-100/55",
  },
  {
    icon: <CheckCircle2 size={24} />,
    title: "Trust & Transparency",
    desc: "Verified doctors, clear pricing, and open communication are the foundations of our platform.",
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    glow: "from-cyan-100/55",
  },
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div className="relative bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden landing-scroll">
      {/* Immersive Medical Tech Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Base Ambient Darkening / Tone Setting */}
        <div className="absolute inset-0 bg-white/40 mix-blend-overlay" />

        {/* Main Immersive Asset */}
        <div
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[200vw] sm:w-[150vw] md:w-[120vw] h-[100vh] bg-no-repeat bg-top bg-cover opacity-[0.15] sm:opacity-[0.12]"
          style={{
            backgroundImage: `url(${backgrounder})`,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 80%)'
          }}
        />

        {/* Dynamic Overlays & Soft Lighting Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_60%)] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/10 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[20%] left-0 w-[600px] h-[600px] bg-cyan-400/5 blur-[150px] rounded-full mix-blend-multiply" />

        {/* Fade to page background at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/70 to-slate-50" />
      </div>

      <div className="relative z-10">
        <LandingNavbar />

        <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-60" />
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 mb-6 animate-fadeUp">
              <span className="text-[12px] font-semibold text-cyan-600 uppercase tracking-wider">Our Story</span>
            </div>
            <h1 className="text-[32px] sm:text-[48px] lg:text-[64px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1] mb-6 animate-fadeUp delay-100">
              Pioneering the future of <br className="hidden sm:block" />
              <span className="gradient-text-brand">digital healthcare</span>
            </h1>
            <p className="max-w-2xl mx-auto text-[16px] sm:text-[19px] text-slate-500 leading-relaxed font-medium animate-fadeUp delay-200">
              HealthSync is more than just a platform. We are a mission-driven team dedicated to making healthcare accessible, efficient, and human for everyone, everywhere.
            </p>
          </div>
        </section>

        <section className="relative py-20 sm:py-28 bg-slate-50/60 reveal-section">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="group relative bg-white/90 backdrop-blur-md p-8 sm:p-12 rounded-[2rem] border border-slate-200/80 shadow-premium hover:shadow-premium-lg hover:border-cyan-200 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.015] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -left-24 top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-12 translate-x-0 group-hover:translate-x-[30rem] transition-transform duration-1000 ease-out" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Target size={28} />
                  </div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 mb-4 tracking-tight">Our Mission</h2>
                  <p className="text-[15px] sm:text-[17px] text-slate-500 leading-relaxed font-medium">
                    To simplify healthcare access by providing a secure, intuitive platform where patients can connect with qualified doctors instantly, while empowering practitioners with smarter digital tools to manage care.
                  </p>
                </div>
              </div>

              <div className="group relative bg-white/90 backdrop-blur-md p-8 sm:p-12 rounded-[2rem] border border-slate-200/80 shadow-premium hover:shadow-premium-lg hover:border-teal-200 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.015] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -left-24 top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-12 translate-x-0 group-hover:translate-x-[30rem] transition-transform duration-1000 ease-out" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Eye size={28} />
                  </div>
                  <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 mb-4 tracking-tight">Our Vision</h2>
                  <p className="text-[15px] sm:text-[17px] text-slate-500 leading-relaxed font-medium">
                    We envision a world where high-quality healthcare is a seamless part of daily life - driven by technology, centered around the human experience, and accessible at the touch of a button.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-28 overflow-hidden reveal-section">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
              <h2 className="text-[28px] sm:text-[40px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
                Driven by <span className="text-cyan-600">core values</span>
              </h2>
              <p className="mt-4 text-[15px] sm:text-[17px] text-slate-400 font-medium">
                The principles that guide every decision we make and every line of code we write.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="group relative rounded-[1.35rem] p-6 border border-slate-200/80 bg-white/85 backdrop-blur-sm shadow-premium hover:shadow-premium-lg hover:border-cyan-200 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.015] overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute -left-24 top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-12 translate-x-0 group-hover:translate-x-[30rem] transition-transform duration-1000 ease-out" />
                  <div className="relative z-10 flex gap-4 items-start">
                    <div className={`shrink-0 w-12 h-12 rounded-2xl ${value.bg} ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-slate-900 mb-2">{value.title}</h3>
                      <p className="text-[14px] text-slate-400 leading-relaxed font-medium">{value.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="reveal-section">
          <CTASection />
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default About;
