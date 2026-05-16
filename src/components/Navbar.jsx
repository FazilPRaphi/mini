import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Collapse into tube after 50px of scroll
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-medium transition-colors"
      : "px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-full transition-colors";

  return (
    <div className={`fixed z-50 transition-all duration-500 ease-in-out flex justify-center w-full ${scrolled ? 'top-4 px-4' : 'top-0 px-0'}`}>
      <nav 
        className={`transition-all duration-500 ease-in-out ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/50 rounded-full w-full max-w-4xl" 
            : "bg-white border-b border-gray-200 w-full rounded-none"
        }`}
      >
        <div className={`mx-auto transition-all duration-500 ${scrolled ? "px-6" : "max-w-7xl px-4"}`}>
          <div className={`flex justify-between items-center transition-all duration-500 ${scrolled ? "h-14" : "h-16"}`}>
            
            {/* Logo */}
            <div className="text-xl font-bold whitespace-nowrap">
              Health<span className="text-orange-500">Sync</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>

              <NavLink
                to="/register"
                className="ml-2 bg-orange-500 text-white px-5 py-2.5 text-sm font-medium rounded-full hover:bg-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                Sign Up
              </NavLink>
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"} ${scrolled ? "rounded-b-3xl" : ""}`}>
          <div className={`flex flex-col p-4 space-y-2 bg-white/95 backdrop-blur-md ${scrolled ? "border-t border-gray-100/50" : "border-t border-gray-200"}`}>
            <NavLink onClick={() => setOpen(false)} to="/" className={navLinkClass}>Home</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/about" className={navLinkClass}>About</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/login" className={navLinkClass}>Login</NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/register"
              className="bg-orange-500 text-white text-center py-2.5 font-medium rounded-full shadow-sm mt-2"
            >
              Sign Up
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
