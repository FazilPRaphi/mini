import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/healthsync-logo.png";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setMobileOpen(false);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-slate-100/80"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <img src={logo} className="w-8 h-8 mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-300" alt="HealthSync" />
            <span className="font-bold text-[22px] tracking-tight">
              <span className="text-slate-800">Health</span>
              <span className="text-cyan-600">Sync</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? "text-cyan-700 bg-cyan-50/80"
                    : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50/50"
                }`}
                aria-current={location.pathname === item.path ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-[14px] font-semibold text-slate-600 hover:text-cyan-600 transition-colors duration-200"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-premium px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100/80 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} className="text-slate-600" /> : <Menu size={22} className="text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-xl transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-5 py-4 space-y-1">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`block w-full text-left px-4 py-3 text-[15px] font-semibold rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? "text-cyan-700 bg-cyan-50/80"
                  : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50/50"
              }`}
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 space-y-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="w-full py-3 text-[15px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Log in
            </button>
            <button
              onClick={() => { navigate("/register"); setMobileOpen(false); }}
              className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/20"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
