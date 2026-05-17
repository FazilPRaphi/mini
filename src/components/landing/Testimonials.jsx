import React from "react";

const testimonials = [
  {
    quote: "Booking appointments became much easier for me, and I can quickly find the right specialist.",
    name: "Anita Sharma",
    role: "Mother of two",
    avatar: "https://i.pravatar.cc/100?img=32",
    rating: 5,
  },
  {
    quote: "I like having my reports and follow-ups in one place. It saves me time every month.",
    name: "Marcus Thompson",
    role: "Software Engineer",
    avatar: "https://i.pravatar.cc/100?img=11",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-20 sm:py-28 bg-slate-50/50 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-50/40 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 mb-5">
            <span className="text-[12px] font-semibold text-amber-600 uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
            Trusted by a{" "}
            <span className="gradient-text-brand">growing community</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/60 shadow-sm hover:shadow-premium-lg transition-all duration-500">
              {/* Quote mark */}
              <svg className="w-8 h-8 text-cyan-100 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-[14px] sm:text-[15px] text-slate-600 leading-[1.75] font-medium mb-6">
                "{t.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <p className="text-[14px] font-bold text-slate-900">{t.name}</p>
                  <p className="text-[12px] text-slate-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
