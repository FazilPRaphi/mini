import React from "react";

const steps = [
  {
    num: "01",
    title: "Create Your Profile",
    desc: "Sign up in 30 seconds. Add your health history and preferences for personalized care.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
  },
  {
    num: "02",
    title: "Find Your Specialist",
    desc: "Browse verified doctors by specialty, ratings, and availability. Book instantly.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>),
  },
  {
    num: "03",
    title: "Start Consultation",
    desc: "Connect via secure video, chat, or in-person visits. Get prescriptions digitally.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
  },
  {
    num: "04",
    title: "Track & Manage",
    desc: "Access records, prescriptions, and follow-ups from your personalized dashboard.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28 bg-slate-50/50 overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-cyan-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-teal-100/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 mb-5">
            <span className="text-[12px] font-semibold text-teal-600 uppercase tracking-wider">How It Works</span>
          </div>
          <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
            Healthcare in{" "}
            <span className="gradient-text-brand">four simple steps</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-[60px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px] bg-gradient-to-r from-cyan-200 via-teal-200 to-cyan-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="group relative text-center">
                {/* Step circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-[48px] h-[48px] rounded-2xl bg-white border-2 border-slate-100 group-hover:border-cyan-200 shadow-sm group-hover:shadow-premium flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110">
                    <span className="text-cyan-600 group-hover:text-teal-500 transition-colors duration-300">{step.icon}</span>
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-[10px] font-bold text-white">{step.num}</span>
                  </div>
                </div>

                <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-slate-400 leading-relaxed font-medium max-w-[260px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
