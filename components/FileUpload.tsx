import React from 'react';
import { UploadCloud, FileType, ShieldCheck, Zap, Sparkles, ArrowUp } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert('عذراً، حجم الملف يجب أن يكون أقل من 20 ميجابايت');
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-100px)] p-6 pt-24 animate-fade-in-up">
      
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-3xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-6 text-xs font-bold text-indigo-600 animate-fade-in-up">
           <Sparkles size={12} className="text-amber-500" />
           <span>الذكاء الاصطناعي من الجيل الثالث (Gemini 3)</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-6 leading-tight tracking-tight">
          تحويل <span className="text-gradient">احترافي</span> للمستندات.
        </h2>
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-light">
          نحول ملفات PDF المعقدة إلى Word مع الحفاظ الكامل على الهوية البصرية، الجداول، والنصوص العربية.
        </p>
      </div>

      {/* Upload Card */}
      <div className="w-full max-w-xl relative group">
        {/* Animated Glow Background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <label 
          className={`
            relative flex flex-col items-center justify-center w-full h-80 
            rounded-[30px] bg-white/80 backdrop-blur-xl border-2 border-dashed border-indigo-100
            transition-all duration-300 ease-out overflow-hidden
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10'}
          `}
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative flex flex-col items-center justify-center p-8 text-center z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform duration-300 ring-1 ring-indigo-50">
              <div className="relative">
                <UploadCloud size={40} className="text-indigo-600" />
                <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white shadow-sm">
                   <ArrowUp size={12} className="text-white" />
                </div>
              </div>
            </div>
            
            <p className="mb-3 text-2xl font-bold text-slate-800">
              اختر ملف PDF
            </p>
            <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
              اسحب الملف وأفلته هنا، أو اضغط للتصفح من جهازك
            </p>
            
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                 <Zap size={12} className="text-amber-500 fill-amber-500" />
                 <span>حتى 20MB</span>
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                 <ShieldCheck size={12} className="text-emerald-500" />
                 <span>آمن ومشفر</span>
               </div>
            </div>
          </div>
          
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      </div>

      {/* Feature Pills */}
      <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-8">
        {[
          { icon: FileType, text: "دقة عالية للجداول", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Sparkles, text: "تنسيق ذكي للنص", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: FileType, text: "تصدير Word مباشر", color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 border border-white/60 shadow-sm backdrop-blur-sm hover:bg-white transition-colors">
            <div className={`p-2 rounded-xl ${feature.bg} ${feature.color}`}>
              <feature.icon size={18} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};