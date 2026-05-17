import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../../assets/hero-healthcare.png";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden pt-20 sm:pt-24">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 hero-mesh" />
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-400/[0.06] rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-teal-400/[0.06] rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-400/[0.03] rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Copy */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 mb-6 sm:mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[13px] font-semibold text-cyan-700 tracking-wide">Trusted by 500+ patients</span>
            </div>

            <h1 className="text-[36px] sm:text-[48px] lg:text-[58px] xl:text-[64px] font-extrabold leading-[1.06] tracking-[-0.03em] text-slate-900">
              Your Health,{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text-brand">Synced Perfect</span>
              <span className="text-cyan-500">.</span>
            </h1>

            <p className="mt-5 sm:mt-6 text-[16px] sm:text-[18px] leading-[1.7] text-slate-500 max-w-xl mx-auto lg:mx-0 font-medium">
              Connect with verified specialists instantly, receive AI-powered health insights, and manage your entire healthcare journey — all in one beautifully designed platform.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/register")}
                className="btn-premium group px-7 py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 bg-[length:200%_100%] hover:bg-[position:100%_0] rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
              >
                Start Free Consultation
                <svg className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-7 py-3.5 text-[15px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:border-cyan-200 hover:text-cyan-600 hover:bg-cyan-50/30 hover:scale-[1.02] active:scale-[0.98] shadow-sm transition-all duration-300"
              >
                See How It Works
              </button>
            </div>

          </div>

          {/* Right - Visual */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Main hero image */}
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-teal-400/10 to-sky-400/20 rounded-3xl blur-2xl" />
              <img
                src={heroImg}
                alt="HealthSync Platform"
                className="relative rounded-3xl shadow-premium-lg w-full object-cover"
              />
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-8 top-16 animate-float">
              <div className="glass-card rounded-2xl p-4 shadow-premium w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">Heart Rate</span>
                </div>
                <p className="text-[28px] font-bold text-slate-900 leading-none">72 <span className="text-[14px] font-normal text-slate-400">bpm</span></p>
                <div className="mt-2 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-24 animate-float-delayed">
              <div className="glass-card rounded-2xl p-4 shadow-premium w-[190px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">Next Appointment</span>
                </div>
                <p className="text-[14px] font-bold text-slate-900">Dr. Sarah Khan</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Today, 3:30 PM</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-600 font-medium">Available Now</span>
                </div>
              </div>
            </div>

            <div className="absolute right-12 top-4 animate-float-slow">
              <div className="glass-card rounded-xl p-3 shadow-premium">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700">HIPAA Secure</p>
                    <p className="text-[10px] text-slate-400">256-bit encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
