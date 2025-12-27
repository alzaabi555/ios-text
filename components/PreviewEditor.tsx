import React from 'react';

interface PreviewEditorProps {
  htmlContent: string;
}

export const PreviewEditor: React.FC<PreviewEditorProps> = ({ htmlContent }) => {
  return (
    <div className="w-full py-8 px-2 md:px-0">
      {/* 
        This wrapper creates the visual context for the paper.
        On desktop, it adds a subtle backdrop effect if needed.
      */}
      <div className="relative mx-auto max-w-fit">
        
        {/* Decorative backdrop element purely for aesthetics */}
        <div className="absolute top-4 left-4 right-4 bottom-4 bg-slate-900/5 rounded-lg blur-xl -z-10 transform translate-y-4"></div>

        <div 
          className="a4-paper word-content text-right ring-1 ring-black/5"
          dir="rtl"
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ outline: 'none' }} // Remove blue outline when clicking to edit
        />
        
        {/* Footer/Page number simulation for visual flair */}
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-30">
           <span className="text-[10px] font-serif text-slate-400">Page 1</span>
        </div>
      </div>
    </div>
  );
};