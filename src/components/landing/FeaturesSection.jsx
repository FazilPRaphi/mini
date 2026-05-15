import React from "react";

const features = [
  {
    title: "AI Symptom Analysis",
    desc: "Get instant, reliable health guidance powered by intelligent symptom assessment.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>),
    span: "lg:col-span-2 lg:row-span-1",
    iconColor: "text-cyan-500",
    accentBg: "from-cyan-50 to-blue-50",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    title: "Instant Booking",
    desc: "Find specialists and book consultations within seconds. No waiting rooms.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
    span: "lg:col-span-1 lg:row-span-2",
    iconColor: "text-teal-500",
    accentBg: "from-teal-50 to-emerald-50",
    accent: "from-teal-500 to-emerald-500",
  },
  {
    title: "Verified Doctors",
    desc: "Every specialist is certified and verified. Consult with confidence.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
    span: "lg:col-span-1 lg:row-span-1",
    iconColor: "text-violet-500",
    accentBg: "from-violet-50 to-purple-50",
    accent: "from-violet-500 to-purple-500",
  },
  {
    title: "40+ Specialisations",
    desc: "From cardiology to dermatology, neurology to pediatrics — every specialty covered.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>),
    span: "lg:col-span-1 lg:row-span-1",
    iconColor: "text-amber-500",
    accentBg: "from-amber-50 to-orange-50",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Secure Records",
    desc: "Your medical data is encrypted end-to-end. HIPAA-compliant infrastructure you can trust.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>),
    span: "lg:col-span-1 lg:row-span-1",
    iconColor: "text-rose-500",
    accentBg: "from-rose-50 to-pink-50",
    accent: "from-rose-500 to-pink-500",
  },
  {
    title: "24/7 Access",
    desc: "Healthcare doesn't sleep. Access your records, chat with doctors, anytime.",
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    span: "lg:col-span-2 lg:row-span-1",
    iconColor: "text-sky-500",
    accentBg: "from-sky-50 to-cyan-50",
    accent: "from-sky-500 to-cyan-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 mb-5">
            <span className="text-[12px] font-semibold text-cyan-600 uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
            Everything you need for{" "}
            <span className="gradient-text-brand">modern healthcare</span>
          </h2>
          <p className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] text-slate-400 leading-relaxed font-medium">
            A comprehensive platform designed to transform how you access and manage healthcare.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className={`bento-card group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 hover:border-cyan-100/80 overflow-hidden ${f.span}`}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.accentBg} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.accentBg} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <span className={f.iconColor}>{f.icon}</span>
                </div>
                <h3 className="text-[17px] sm:text-[19px] font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">{f.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-500 transition-colors">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
