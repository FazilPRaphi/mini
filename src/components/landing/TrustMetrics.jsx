import React from "react";

const metrics = [
  { value: "50K+", label: "Patients Served", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
  { value: "2,500+", label: "Verified Specialists", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  )},
  { value: "99.9%", label: "Platform Uptime", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  )},
  { value: "180K+", label: "Consultations Done", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  )},
];

export default function TrustMetrics() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="group relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 hover:border-cyan-100 shadow-sm hover:shadow-premium transition-all duration-500 text-center">
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-50/0 to-teal-50/0 group-hover:from-cyan-50/50 group-hover:to-teal-50/30 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                  {m.icon}
                </div>
                <p className="text-[24px] sm:text-[32px] lg:text-[36px] font-extrabold tracking-tight text-slate-900 leading-none">{m.value}</p>
                <p className="text-[12px] sm:text-[13px] font-medium text-slate-400 mt-1.5 tracking-wide uppercase">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Logos */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-[12px] font-semibold text-slate-300 uppercase tracking-[0.2em] mb-6">Trusted & Compliant</p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap opacity-40">
            {["HIPAA", "SOC 2", "ISO 27001", "GDPR", "HL7 FHIR"].map((badge) => (
              <span key={badge} className="text-[13px] sm:text-[14px] font-bold text-slate-400 tracking-wide">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
