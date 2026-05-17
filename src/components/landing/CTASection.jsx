import React from "react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_50%)]" />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.015]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}} />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-[28px] sm:text-[40px] lg:text-[52px] font-extrabold tracking-[-0.03em] text-white leading-[1.1]">
          Ready to experience{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">the future of healthcare?</span>
        </h2>

        <p className="mt-5 sm:mt-6 text-[15px] sm:text-[18px] text-slate-400 leading-relaxed font-medium max-w-2xl mx-auto">
          Join 500+ patients and 100+ specialists already using HealthSync. Your first consultation is free.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-10">
          <button
            onClick={() => navigate("/register")}
            className="btn-premium group px-8 py-4 text-[15px] font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            Get Started — It's Free
            <svg className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 text-[15px] font-semibold text-white/80 border border-white/10 hover:border-white/20 hover:text-white rounded-2xl hover:bg-white/5 transition-all duration-300"
          >
            Sign In
          </button>
        </div>

        <p className="mt-5 text-[13px] text-slate-500 font-medium">No credit card required · Free forever for patients · Cancel anytime</p>
      </div>
    </section>
  );
}
