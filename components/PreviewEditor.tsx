import React from 'react';

interface PreviewEditorProps {
  htmlContent: string;
}

export const PreviewEditor: React.FC<PreviewEditorProps> = ({ htmlContent }) => {
  return (
    <div className="flex justify-center w-full py-8">
      <div 
        className="a4-paper word-content text-right"
        dir="rtl"
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};