import React, { useEffect, useRef, useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Footer from "../components/landing/Footer";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  Check,
  Sparkles,
  Activity,
  HeartPulse,
} from "lucide-react";

const contactCards = [
  {
    icon: <Mail size={20} />,
    title: "Email Support",
    info: "healthsync7721@gmail.com",
    desc: "For general and product support",
    color: "text-sky-600",
    bg: "bg-sky-100",
    glow: "from-sky-200/60",
  },
  {
    icon: <Phone size={20} />,
    title: "Call Support",
    info: "+91 9544953762",
    desc: "Mon-Sat, 9:00 AM - 7:00 PM",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    glow: "from-emerald-200/60",
  },
  {
    icon: <MapPin size={20} />,
    title: "Office Location",
    info: "Perunna, Changanacherry",
    desc: "HealthSync operations office",
    color: "text-violet-600",
    bg: "bg-violet-100",
    glow: "from-violet-200/60",
  },
];

const faqs = [
  {
    q: "How quickly will I get a response?",
    a: "For general inquiries, our team responds within 2 hours during business hours. For technical support, premium users get prioritized 30-minute response times.",
  },
  {
    q: "Can doctors partner with HealthSync?",
    a: "Yes. We are constantly expanding our network. Healthcare professionals can join our platform by going through our verification and onboarding process.",
  },
  {
    q: "Is consultation data secure?",
    a: "Absolutely. All data on HealthSync is end-to-end encrypted and HIPAA-compliant. Your privacy and security are our foundational priorities.",
  },
  {
    q: "Do you offer enterprise plans for clinics?",
    a: "We provide tailored enterprise solutions for clinics and hospitals, including custom workflows, white-labeling, and dedicated account managers. Please select 'Clinic' in the contact form.",
  },
];

const contactTypeOptions = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "clinic", label: "Clinic / Hospital" },
  { value: "partner", label: "Partner" },
];
const MotionDiv = motion.div;
const MotionSpan = motion.span;

export default function Contact() {
  const [activeFaq, setActiveFaq] = useState(0);
  const [formState, setFormState] = useState("idle");
  const [selectedType, setSelectedType] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [highlightedTypeIndex, setHighlightedTypeIndex] = useState(-1);
  const [typeError, setTypeError] = useState("");
  const typeSelectRef = useRef(null);
  const typeTriggerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) {
      return;
    }
    if (!selectedType) {
      setTypeError("Please select an option");
      setIsTypeOpen(true);
      typeTriggerRef.current?.focus();
      return;
    }
    setTypeError("");
    setFormState("submitting");
    setTimeout(() => {
      setFormState("success");
      setTimeout(() => setFormState("idle"), 2800);
    }, 1400);
  };

  const inputClassName =
    "w-full px-5 py-3.5 bg-white/80 border border-cyan-100/70 rounded-xl text-[15px] text-slate-900 outline-none focus:bg-white focus:border-cyan-400 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] transition-all placeholder:text-slate-400";
  const selectedTypeLabel =
    contactTypeOptions.find((option) => option.value === selectedType)?.label ||
    "";

  const openTypeSelect = () => {
    setIsTypeOpen(true);
    const selectedIndex = contactTypeOptions.findIndex(
      (option) => option.value === selectedType
    );
    setHighlightedTypeIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const closeTypeSelect = () => {
    setIsTypeOpen(false);
    setHighlightedTypeIndex(-1);
  };

  const selectTypeOption = (value) => {
    setSelectedType(value);
    setTypeError("");
    closeTypeSelect();
  };

  const handleTypeTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isTypeOpen) {
        openTypeSelect();
      } else {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setHighlightedTypeIndex((prev) => {
          const current = prev < 0 ? 0 : prev;
          return (current + direction + contactTypeOptions.length) % contactTypeOptions.length;
        });
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isTypeOpen) {
        openTypeSelect();
      } else if (highlightedTypeIndex >= 0) {
        selectTypeOption(contactTypeOptions[highlightedTypeIndex].value);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeTypeSelect();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isTypeOpen &&
        typeSelectRef.current &&
        !typeSelectRef.current.contains(event.target)
      ) {
        closeTypeSelect();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTypeOpen]);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans overflow-x-hidden landing-scroll selection:bg-cyan-200 selection:text-cyan-900">
      <LandingNavbar />

      <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-28 overflow-hidden bg-white">
        <div className="absolute inset-0 mesh-gradient opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-100/40 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[120px] -z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 mb-6 animate-fadeUp">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-cyan-600 uppercase tracking-wider">24/7 Support Center</span>
              </div>
              <h1 className="text-[36px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-[-0.03em] text-slate-900 leading-[1.1] mb-6 animate-fadeUp delay-100">
                Let&apos;s Talk About <br />
                <span className="gradient-text-brand">Better Healthcare</span>
              </h1>
              <p className="text-[16px] sm:text-[19px] text-slate-500 leading-relaxed font-medium mb-8 max-w-lg animate-fadeUp delay-200">
                Our team is here to help patients, clinics, and healthcare professionals build a smarter healthcare experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fadeUp delay-300">
                <button className="btn-premium group px-8 py-3.5 text-[15px] font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300">
                  Book a Demo
                </button>
                <a
                  href="#contact-form"
                  className="px-8 py-3.5 text-[15px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 text-center"
                >
                  Send Message
                </a>
              </div>
            </div>

            <div className="relative hidden lg:block animate-fadeUp delay-200">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-teal-400/20 rounded-[3rem] blur-3xl opacity-60" />
              <div className="relative z-10 w-full max-w-lg mx-auto">
                <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 p-6 rounded-[2rem] shadow-premium-lg animate-float">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900">System Status</h4>
                        <p className="text-[12px] text-slate-500 font-medium">All services operational</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[12px] font-bold">Online</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900">Avg. Response Time</h4>
                        <p className="text-[13px] text-slate-500">1m 45s</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                        <HeartPulse size={24} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-slate-900">Active Consultations</h4>
                        <p className="text-[13px] text-slate-500">1,248 currently live</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute -bottom-6 -right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-float"
                    style={{ animationDelay: "1s" }}
                  >
                    <ShieldCheck className="text-teal-400" size={24} />
                    <div className="text-left">
                      <p className="text-[12px] text-slate-400 font-medium leading-none mb-1">Security</p>
                      <p className="text-[14px] font-bold leading-none">HIPAA Compliant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 bg-slate-50 reveal-section z-20 -mt-8">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactCards.map((card) => (
              <article
                key={card.title}
                className="group relative rounded-[1.4rem] p-6 sm:p-8 border border-slate-200/80 bg-white/85 backdrop-blur-md shadow-premium hover:shadow-premium-lg hover:border-cyan-200 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.015] overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute -left-24 top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent rotate-12 translate-x-0 group-hover:translate-x-[30rem] transition-transform duration-1000 ease-out" />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-all duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-[15px] font-semibold text-slate-700 mb-1">{card.info}</p>
                  <p className="text-[13px] text-slate-400 font-medium">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="relative py-16 sm:py-20 reveal-section bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] gap-10 lg:gap-24 xl:gap-32 items-start">
            <div>
              <div className="mb-8 sm:mb-10">
                <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.02em] text-slate-900 leading-tight mb-3">
                  Send us a message
                </h2>
                <p className="text-[15px] text-slate-500 font-medium">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="relative rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-sky-50/70 shadow-premium-lg overflow-hidden">
                <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-cyan-200/40 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-sky-200/35 blur-3xl" />
                <div className="absolute top-5 right-5 hidden sm:block h-16 w-16 rounded-2xl border border-white/70 bg-white/50 backdrop-blur-xl" />

                <form onSubmit={handleFormSubmit} className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-5">
                  {formState === "success" && (
                    <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center text-center animate-fadeUp">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <Sparkles size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent</h3>
                      <p className="text-slate-500 text-sm">We&apos;ll be in touch shortly.</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-[14px] font-bold text-slate-700 ml-1">
                        Full Name
                      </label>
                      <input type="text" id="name" required className={inputClassName} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-[14px] font-bold text-slate-700 ml-1">
                        Email Address
                      </label>
                      <input type="email" id="email" required className={inputClassName} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-[14px] font-bold text-slate-700 ml-1">
                        Phone Number
                      </label>
                      <input type="tel" id="phone" className={inputClassName} placeholder="+91 00000 00000" />
                    </div>
                    <div className="relative space-y-1.5">
                      <label htmlFor="type" className="text-[14px] font-bold text-slate-700 ml-1">
                        I am a...
                      </label>
                      <div className="relative" ref={typeSelectRef}>
                        <button
                          id="type"
                          type="button"
                          ref={typeTriggerRef}
                          aria-haspopup="listbox"
                          aria-expanded={isTypeOpen}
                          aria-controls="contact-type-listbox"
                          onClick={() => {
                            if (isTypeOpen) {
                              closeTypeSelect();
                            } else {
                              openTypeSelect();
                            }
                          }}
                          onKeyDown={handleTypeTriggerKeyDown}
                          className={`${inputClassName} appearance-none text-left pr-12 ${
                            typeError
                              ? "border-rose-300 focus:border-rose-400 focus:shadow-[0_0_0_4px_rgba(251,113,133,0.14)]"
                              : ""
                          }`}
                        >
                          <span
                            className={
                              selectedTypeLabel
                                ? "text-slate-900"
                                : "text-slate-400"
                            }
                          >
                            {selectedTypeLabel || "Select an option"}
                          </span>
                        </button>

                        <MotionDiv
                          className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isTypeOpen ? "text-cyan-600" : "text-slate-400"
                          }`}
                          animate={{ rotate: isTypeOpen ? 180 : 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <ChevronDown size={18} />
                        </MotionDiv>

                        <AnimatePresence>
                          {isTypeOpen && (
                            <MotionDiv
                              id="contact-type-listbox"
                              role="listbox"
                              aria-labelledby="type"
                              className="absolute z-30 mt-2 w-full rounded-2xl border border-cyan-100/70 bg-white/90 backdrop-blur-xl shadow-[0_16px_40px_rgba(15,23,42,0.14),0_2px_8px_rgba(15,23,42,0.06)] p-1.5"
                              initial={{ opacity: 0, y: -6, scale: 0.985 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.985 }}
                              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            >
                              {contactTypeOptions.map((option, index) => {
                                const isSelected = selectedType === option.value;
                                const isActive = highlightedTypeIndex === index;

                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setHighlightedTypeIndex(index)}
                                    onClick={() => selectTypeOption(option.value)}
                                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] font-semibold transition-all duration-150 ${
                                      isActive
                                        ? "bg-cyan-50 text-cyan-700"
                                        : isSelected
                                        ? "bg-teal-50/80 text-teal-700"
                                        : "text-slate-600 hover:bg-cyan-50/70 hover:text-cyan-700"
                                    }`}
                                  >
                                    <span>{option.label}</span>
                                    <MotionSpan
                                      animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.85 }}
                                      transition={{ duration: 0.16 }}
                                      className={`${
                                        isSelected ? "text-teal-600" : "text-transparent"
                                      }`}
                                    >
                                      <Check size={16} />
                                    </MotionSpan>
                                  </button>
                                );
                              })}
                            </MotionDiv>
                          )}
                        </AnimatePresence>

                        {typeError && (
                          <p className="mt-1.5 ml-1 text-[12px] font-semibold text-rose-500">
                            {typeError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-[14px] font-bold text-slate-700 ml-1">
                      Subject
                    </label>
                    <input type="text" id="subject" required className={inputClassName} placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-[14px] font-bold text-slate-700 ml-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows="5"
                      className={`${inputClassName} resize-none`}
                      placeholder="Provide as much detail as possible..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="w-full btn-premium group relative px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span
                      className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${formState === "submitting" ? "opacity-0" : "opacity-100"
                        }`}
                    >
                      Send Message
                      <MessageSquare size={18} />
                    </span>
                    {formState === "submitting" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div className="mb-8 sm:mb-10 lg:mb-12 lg:pt-2">
                <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-[-0.02em] text-slate-900 leading-tight mb-3">
                  Frequently Asked
                </h2>
                <p className="text-[15px] text-slate-500 font-medium">
                  Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {faqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <article
                      key={faq.q}
                      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                          ? "border-cyan-200 bg-white shadow-premium"
                          : "border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-100 hover:shadow-md"
                        }`}
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left focus:outline-none"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${index}`}
                      >
                        <span
                          className={`text-[15px] sm:text-[15.5px] font-bold leading-snug transition-colors duration-300 ${isOpen ? "text-cyan-700" : "text-slate-800 group-hover:text-cyan-700"
                            }`}
                        >
                          {faq.q}
                        </span>
                        <span
                          className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${isOpen
                              ? "border-cyan-200 bg-cyan-50 text-cyan-600"
                              : "border-slate-200 bg-white text-slate-400 group-hover:border-cyan-100 group-hover:text-cyan-500"
                            }`}
                        >
                          <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                        </span>
                      </button>

                      <div
                        id={`faq-panel-${index}`}
                        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-44 opacity-100" : "max-h-0 opacity-0"}`}
                      >
                        <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[14px] text-slate-500 font-medium leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
