import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import logo from "../../assets/healthsync-logo.png";

const MotionHeader = motion.header;
const MotionNav = motion.nav;
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionSpan = motion.span;

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  // 0px => expanded hero navbar, 120px => fully collapsed floating navbar.
  const progress = useTransform(scrollY, [0, 120], [0, 1], { clamp: true });

  // First spring stage filters aggressive wheel/trackpad spikes.
  const smoothInput = useSpring(progress, {
    stiffness: 220,
    damping: 32,
    mass: 0.72,
  });

  // Layered timing: position is fastest, size is medium, visual fx trail slightly.
  const positionProgress = useSpring(smoothInput, {
    stiffness: 220,
    damping: 30,
    mass: 0.7,
  });
  const sizeProgress = useSpring(smoothInput, {
    stiffness: 202,
    damping: 30,
    mass: 0.8,
  });
  const fxProgress = useSpring(smoothInput, {
    stiffness: 184,
    damping: 28,
    mass: 0.9,
  });

  // Tiny dynamic stabilization suppresses jitter during fast direction changes.
  const navVelocity = useVelocity(smoothInput);
  const velocityAbs = useTransform(navVelocity, (v) => Math.abs(v));
  const scaleStabilizer = useTransform(velocityAbs, [0, 1.6], [1, 0.997], {
    clamp: true,
  });

  // Continuous morphing values (no class switching / no threshold snaps).
  const topOffset = useTransform(positionProgress, [0, 1], [20, 10]);
  const navY = useTransform(positionProgress, [0, 1], [0, -1.2]);
  const navHeight = useTransform(sizeProgress, [0, 1], [88, 68]);
  const navPaddingX = useTransform(sizeProgress, [0, 1], [28, 18]);
  const navWidth = useTransform(sizeProgress, [0, 1], ["94vw", "92vw"]);
  const navMaxWidth = useTransform(sizeProgress, [0, 1], ["1220px", "960px"]);
  const navRadius = useTransform(sizeProgress, [0, 1], [24, 32]);
  const baseScale = useTransform(sizeProgress, [0, 1], [1, 0.976]);
  const containerScale = useTransform(
    () => baseScale.get() * scaleStabilizer.get()
  );
  const navBgAlpha = useTransform(fxProgress, [0, 1], [0.66, 0.92]);
  const blurAmount = useTransform(fxProgress, [0, 1], [8, 18]);
  const saturateAmount = useTransform(fxProgress, [0, 1], [132, 176]);
  const borderAlpha = useTransform(fxProgress, [0, 1], [0.1, 0.3]);
  const navShadow = useTransform(
    fxProgress,
    [0, 1],
    [
      "0 4px 12px rgba(15,23,42,0.04), 0 0 0 1px rgba(255,255,255,0.2)",
      "0 18px 44px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.34)",
    ]
  );
  const navOpacity = useTransform(fxProgress, [0, 1], [0.955, 1]);
  const navBgColor = useTransform(navBgAlpha, (v) => `rgba(255, 255, 255, ${v})`);
  const navChromeBorder = useTransform(borderAlpha, (v) => `rgba(148, 163, 184, ${v})`);
  const navOutlineBorder = useTransform(borderAlpha, (v) => `rgba(56, 189, 248, ${v})`);
  const navBackdrop = useTransform(
    () => `blur(${blurAmount.get()}px) saturate(${saturateAmount.get()}%)`
  );
  const glowOpacity = useTransform(fxProgress, [0, 1], [0.3, 0.72]);

  useEffect(() => {
    const onResize = () => setMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <MotionHeader
      className="fixed inset-x-0 z-50 flex justify-center pointer-events-none"
      style={{ top: topOffset }}
    >
      <MotionNav
        className="pointer-events-auto relative"
        style={{
          width: navWidth,
          maxWidth: navMaxWidth,
          height: navHeight,
          paddingLeft: navPaddingX,
          paddingRight: navPaddingX,
          borderRadius: navRadius,
          scale: containerScale,
          y: navY,
          boxShadow: navShadow,
          opacity: navOpacity,
          backgroundColor: navBgColor,
          borderColor: navChromeBorder,
          backdropFilter: navBackdrop,
          WebkitBackdropFilter: navBackdrop,
          transformOrigin: "50% 0%",
          willChange: "transform, width, height, padding, border-radius, opacity, backdrop-filter, box-shadow",
        }}
      >
        <MotionDiv
          className="absolute inset-0 rounded-[inherit] border"
          style={{
            borderColor: navOutlineBorder,
          }}
        />

        <div className="h-full flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 group"
          >
            <img
              src={logo}
              className="w-8 h-8 mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-300"
              alt="HealthSync"
            />
            <span className="font-bold text-[22px] tracking-tight">
              <span className="text-slate-800">Health</span>
              <span className="text-cyan-600">Sync</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <MotionButton
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 py-2 text-[14px] font-semibold rounded-full transition-colors ${
                    isActive
                      ? "text-cyan-700 bg-cyan-50/80"
                      : "text-slate-600 hover:text-cyan-600"
                  }`}
                  whileHover={{ y: -1.5, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {!isActive && (
                    <MotionSpan
                      className="absolute inset-0 rounded-full bg-cyan-50/70"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </MotionButton>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-[14px] font-semibold text-slate-600 hover:text-cyan-700 transition-colors duration-200"
            >
              Log in
            </button>
            <MotionButton
              onClick={() => navigate("/register")}
              className="btn-premium px-5 py-2.5 text-[14px] font-semibold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/25"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              Get Started Free
            </MotionButton>
          </div>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100/80 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={22} className="text-slate-600" />
            ) : (
              <Menu size={22} className="text-slate-600" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <MotionDiv
              className="md:hidden absolute left-0 right-0 top-[calc(100%+10px)] rounded-3xl overflow-hidden bg-white/90 border border-cyan-100/50 shadow-2xl shadow-slate-900/10"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backdropFilter: "blur(16px) saturate(160%)",
                WebkitBackdropFilter: "blur(16px) saturate(160%)",
              }}
            >
              <div className="p-3.5 space-y-1">
                {navLinks.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all ${
                        isActive
                          ? "text-cyan-700 bg-cyan-50/90"
                          : "text-slate-600 hover:text-cyan-600 hover:bg-cyan-50/70"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </button>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                    className="w-full py-3 text-[15px] font-semibold text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMobileOpen(false);
                    }}
                    className="w-full py-3 text-[15px] font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl shadow-lg shadow-cyan-500/20"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </MotionNav>

      <MotionDiv
        className="absolute -z-10 top-full mt-1 h-8 w-[32rem] rounded-full bg-cyan-300/20 blur-3xl"
        style={{ opacity: glowOpacity }}
      />
    </MotionHeader>
  );
}
