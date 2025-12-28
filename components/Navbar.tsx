import React, { useState } from 'react';
import { FileText, Info, X, Phone, Crown, Sparkles } from 'lucide-react';

interface NavbarProps {
  fileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ fileName }) => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 pt-safe-nav px-4 md:px-6 pb-4 pointer-events-none transition-all duration-300">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <div className="glass-panel rounded-2xl shadow-lg shadow-indigo-500/5 px-4 h-16 flex items-center justify-between transition-all duration-300">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                  <FileText size={20} className="transform group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-amber-300 to-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-0.5 border border-white">
                  <Crown size={8} fill="currentColor" />
                  <span>PRO</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-800 leading-none tracking-tight font-sans">
                  Muhawil <span className="text-indigo-600">Pro</span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles size={10} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    AI Powered
                  </span>
                </div>
              </div>
            </div>

            {/* File Name Display (Centered) */}
            {fileName && (
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2 px-4 py-1.5 bg-slate-50/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-inner animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600 max-w-[200px] truncate dir-ltr">
                  {fileName}
                </span>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-3">
               {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100/50">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] font-bold text-indigo-700 tracking-wide">TIER 1</span>
              </div>

              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              <button 
                onClick={() => setShowAbout(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                title="عن التطبيق"
              >
                <Info size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in pt-safe">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-white/40 ring-1 ring-black/5">
            <div className="relative p-6 text-center">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-transparent"></div>
               
               <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 left-4 p-2 bg-white/50 hover:bg-white text-slate-400 hover:text-red-500 rounded-full transition-all backdrop-blur-sm"
              >
                <X size={18} />
              </button>

              <div className="relative z-10 w-20 h-20 bg-white rounded-3xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 border border-slate-50">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 rounded-3xl"></div>
                <FileText size={36} className="text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Muhawil <span className="text-indigo-600">Pro</span></h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-8 px-2">
                الجيل الجديد من محولات المستندات. تقنية ذكية تحترم اللغة العربية وتحافظ على أدق التفاصيل.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                  تصميم وتطوير
                </p>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      MZ
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700">محمد الزعابي</div>
                      <div className="text-[10px] text-slate-400">Lead Developer</div>
                    </div>
                  </div>
                  <a href="tel:98344555" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all">
                    <Phone size={14} />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <button 
                onClick={() => setShowAbout(false)}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};