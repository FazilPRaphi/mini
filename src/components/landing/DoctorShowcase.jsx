import React from "react";
import { useNavigate } from "react-router-dom";
import docFemale from "../../assets/doctor-female.png";
import docMale from "../../assets/doctor-male.png";
import docSpecialist from "../../assets/doctor-specialist.png";
import docSenior from "../../assets/doctor-senior.png";

const doctors = [
  { name: "Dr. Sarah Khan", specialty: "Cardiologist", rating: "4.9", reviews: "320", available: true, img: docFemale },
  { name: "Dr. James Wilson", specialty: "Neurologist", rating: "4.8", reviews: "285", available: true, img: docMale },
  { name: "Dr. Priya Mehta", specialty: "Dermatologist", rating: "4.9", reviews: "410", available: false, img: docSpecialist },
  { name: "Dr. Robert Chen", specialty: "General Medicine", rating: "4.7", reviews: "195", available: true, img: docSenior },
];

export default function DoctorShowcase() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 mb-5">
            <span className="text-[12px] font-semibold text-violet-600 uppercase tracking-wider">Our Specialists</span>
          </div>
          <h2 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1]">
            Meet our{" "}
            <span className="gradient-text-brand">top-rated doctors</span>
          </h2>
          <p className="mt-4 text-[15px] sm:text-[17px] text-slate-400 leading-relaxed font-medium">
            Every specialist is board-certified and verified through our rigorous credentialing process.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {doctors.map((doc, i) => (
            <div key={i} className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 hover:border-cyan-100 shadow-sm hover:shadow-premium-lg transition-all duration-500">
              {/* Image */}
              <div className="relative h-[220px] sm:h-[240px] overflow-hidden">
                <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Availability badge */}
                <div className="absolute top-3 right-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${
                    doc.available
                      ? "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30"
                      : "bg-slate-500/20 text-slate-200 border border-slate-400/30"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${doc.available ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                    {doc.available ? "Available" : "Busy"}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 sm:p-6">
                <h3 className="text-[16px] font-bold text-slate-900">{doc.name}</h3>
                <p className="text-[13px] text-cyan-600 font-semibold mt-0.5">{doc.specialty}</p>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                    <span className="text-[13px] font-bold text-slate-800">{doc.rating}</span>
                  </div>
                  <span className="text-[12px] text-slate-300">•</span>
                  <span className="text-[12px] text-slate-400 font-medium">{doc.reviews} reviews</span>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full mt-4 py-2.5 text-[13px] font-semibold text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors duration-200"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
