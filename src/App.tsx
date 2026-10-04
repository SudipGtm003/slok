import React, { useState } from "react";
import { 
  Compass, 
  BookOpen
} from "lucide-react";
import InterpretationEngine from "./components/InterpretationEngine";
import AstrologyBasics from "./components/AstrologyBasics";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"interpret" | "learn">("interpret");

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col antialiased">
      
      {/* Upper Sanskrit Shantipath Ribbon */}
      <div className="bg-orange-600 text-white py-2 px-4 text-center text-xs md:text-sm font-serif font-medium border-b border-orange-700 tracking-wide">
        ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्मा अमृतं गमय ॥ 
        <span className="opacity-80 hidden md:inline ml-2">(हामीलाई अज्ञानताको अन्धकारबाट ज्ञानको प्रकाशतर्फ डोर्‍याउनुहोस्)</span>
      </div>

      {/* Main Header Card */}
      <header className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#7c1a2d] to-amber-700 p-2 rounded-2xl text-white shadow-md shadow-red-950/10 shrink-0">
              <Compass size={26} className="animate-[spin_120s_linear_infinite]" />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-base md:text-lg tracking-tight">
                वैदिक कुण्डली फलादेश
              </h1>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                शास्त्रीय श्लोक, भाव, राशि र ग्रह युति विश्लेषण
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-rose-50/50 p-1.5 rounded-2xl border border-rose-100 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setCurrentTab("interpret")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                currentTab === "interpret"
                  ? "bg-[#7c1a2d] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#7c1a2d]"
              }`}
            >
              <Compass size={16} />
              फलादेश खोज
            </button>
            <button
              onClick={() => setCurrentTab("learn")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                currentTab === "learn"
                  ? "bg-[#7c1a2d] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#7c1a2d]"
              }`}
            >
              <BookOpen size={16} />
              ज्योतिष आधारभूत ज्ञान
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-8">

        {/* Selected Tab View Content */}
        <div className="transition-all duration-300">
          {currentTab === "interpret" ? (
            <InterpretationEngine />
          ) : (
            <AstrologyBasics />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Professional Astrology Knowledge System</h4>
            <p className="text-gray-500 text-[11px] max-w-md">
              A high-precision, classical learning & interpretation engine for Vedic Astrology, designed with a modular future-ready architecture.
            </p>
          </div>
          <div className="text-gray-500 text-[11px] space-y-1 md:text-right">
            <p>© 2026 Professional Astrology Knowledge System. All rights reserved.</p>
            <p>Developed with Vedic Astrological principles and Dynamic AI Integrations.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
