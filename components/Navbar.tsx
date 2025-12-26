import React from 'react';
import { FileText, Github } from 'lucide-react';

interface NavbarProps {
  fileName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ fileName }) => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 pt-safe transition-all duration-200">
      <div className="h-16 flex items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 leading-tight tracking-tight">Muhawil Pro</h1>
            <span className="text-[10px] font-medium text-slate-500 tracking-wide">AI PDF CONVERTER</span>
          </div>
        </div>

        {/* File Name Display (Centered) */}
        {fileName && (
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600 max-w-[200px] truncate" dir="ltr">
              {fileName}
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="text-slate-400 hover:text-slate-800 transition-colors hidden sm:block"
            title="View Source"
          >
            <Github size={20} />
          </a>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform" title="User Profile"></div>
        </div>
      </div>
    </nav>
  );
};