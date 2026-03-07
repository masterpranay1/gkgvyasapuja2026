"use client";

import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (pathname.startsWith("/admin-dashboard")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#0a2540] text-gray-200 py-6 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} GkgVyasaPuja All Rights Reserved
        </p>
      </div>

      {/* Go to top button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-0 right-4 lg:right-8 bg-[#ff6b4a] hover:bg-[#ff8469] text-white p-3 md:p-4 transition-colors z-50 shadow-lg"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </footer>
  );
}
