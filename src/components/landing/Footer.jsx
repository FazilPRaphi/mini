import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/healthsync-logo.png";

const footerLinks = {
  "For Patients": [
    { name: "Find Doctors", path: "/login" },
    { name: "Specialties", path: "/login" },
    { name: "Health Feed", path: "/login" },
    { name: "Book Consultation", path: "/login" },
    { name: "Medical Records", path: "/login" },
  ],
  "For Doctors": [
    { name: "Join HealthSync", path: "/login" },
    { name: "Doctor Dashboard", path: "/login" },
    { name: "Resources", path: "/login" },
    { name: "Practitioner App", path: "/login" },
  ],
  Company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/contact" },
    { name: "Blog", path: "/contact" },
    { name: "Contact", path: "/contact" },
    { name: "Press", path: "/login" },
  ],
};

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 mb-4">
              <img src={logo} className="w-8 h-8 mix-blend-multiply opacity-90" alt="HealthSync" />
              <span className="font-bold text-[20px] tracking-tight">
                <span className="text-slate-800">Health</span>
                <span className="text-cyan-600">Sync</span>
              </span>
            </button>
            <p className="text-[14px] text-slate-400 leading-relaxed font-medium max-w-xs mb-5">
              Making healthcare accessible, efficient, and human for a growing patient community.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="www.linkedin.com/in/fazil-p-raphi"
                aria-label="HealthSync on LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-cyan-50 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-[13px] text-left text-slate-400 hover:text-cyan-600 font-medium transition-colors duration-200"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-400 font-medium">� 2026 HealthSync. All rights reserved.</p>
          <p className="text-[12px] text-slate-300 font-medium">healthsync7721@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
