import { GoogleGenAI } from "@google/genai";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const convertPdfToHtml = async (file: File): Promise<string> => {
  // Client-side validation: 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("عذراً، حجم الملف كبير جداً. يرجى استخدام ملف أقل من 10 ميجابايت لضمان سرعة واستقرار المعالجة.");
  }

  try {
    const userKey = localStorage.getItem('USER_GEMINI_API_KEY');
    const apiKey = userKey || process.env.API_KEY;

    if (!apiKey) {
      throw new Error("لم يتم العثور على مفتاح API. يرجى إضافة مفتاحك في الإعدادات.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // CHANGED: Prioritize stable 'flash' models. 
    // gemini-1.5-flash has higher Rate Limits (RPM) than Pro or Exp models.
    // Order: Stable Flash -> Newest Flash -> Pro (fallback)
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    
    let pdfPart;
    try {
      pdfPart = await fileToGenerativePart(file);
    } catch (readError) {
      throw new Error("فشل في قراءة الملف من الجهاز.");
    }

    const prompt = `
    You are an expert Educational Document Digitizer.
    Target: Convert the provided PDF exam paper into a high-fidelity HTML document optimized for MS Word.

    **CRITICAL INSTRUCTION: PROCESS THE FULL DOCUMENT**
    - You MUST convert **EVERY SINGLE PAGE** from the first page to the very last page.
    - **DO NOT STOP** after 2 or 3 pages.
    - If the PDF has 20 pages, output the HTML for all 20 pages.
    - Do not summarize. Do not skip questions.

    **LAYOUT & WORD COMPATIBILITY RULES:**
    - **NO Page Borders**: Do not add a border around the <body> or the main container.
    - **Question Boxes**: If a question has a box around it, use <table width="100%" border="1" cellspacing="0" cellpadding="5">.
    - **Images/Diagrams**: Draw them as inline SVGs. You MUST specify explicit width="X" and height="Y" (e.g., width="300" height="150") for every SVG.
    - **Direction**: dir="rtl" for Arabic.

    **OUTPUT FORMAT:**
    - Return ONLY the raw HTML code inside the <body> tag. 
    - Do not include \`\`\`html markdown blocks.
    - Just the content.
    `;

    let lastError: any = null;

    for (const modelId of models) {
      try {
        console.log(`Attempting conversion using model: ${modelId}`);
        const maxRetries = 2; 
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelId,
              contents: { parts: [pdfPart, { text: prompt }] },
              config: { temperature: 0.1 }
            });

            const text = response.text;
            if (!text) throw new Error("Empty response");

            const cleanHtml = text.replace(/```html/g, '').replace(/```/g, '').trim();
            return cleanHtml;

          } catch (innerError: any) {
            const status = innerError.status || 0;
            const message = innerError.message?.toLowerCase() || '';
            console.warn(`Attempt ${attempt} failed on ${modelId}:`, message);

            if (status === 404) throw innerError; 

            // Smart Wait logic
            const isQuotaError = status === 429 || message.includes('429') || message.includes('quota');
            const isServerBusy = status === 503 || message.includes('503') || message.includes('overloaded');
            
            if (attempt < maxRetries) {
              if (isQuotaError) {
                // If it's a quota error, wait longer
                await wait(4000); 
                continue;
              }
              if (isServerBusy) {
                 await wait(attempt * 2000);
                 continue;
              }
            }
            throw innerError;
          }
        }
        // If successful, break the model loop
        break;
      } catch (modelError: any) {
        lastError = modelError;
        // Continue to next model
      }
    }

    if (lastError) {
        if (lastError.message?.includes('429') || lastError.status === 429) {
            if (userKey) {
                 throw new Error("تجاوزت الحد المسموح للطلبات في الدقيقة لمفتاحك (Rate Limit). انتظر دقيقة ثم حاول مجدداً.");
            } else {
                 throw new Error("الخوادم العامة مشغولة (429). يرجى استخدام مفتاح API خاص لضمان الخدمة.");
            }
        }
        throw lastError;
    }
    throw new Error("حدث خطأ غير معروف.");

  } catch (error: any) {
    console.error("Final Conversion Error:", error);
    // Check user key existence for better error messaging in the outer catch as well
    const userKey = localStorage.getItem('USER_GEMINI_API_KEY');
    
    if (error.message?.includes('429') || error.status === 429) {
       if (userKey) {
           throw new Error("تجاوزت الحد المسموح (Rate Limit). يرجى الانتظار قليلاً.");
       } else {
           throw new Error("الخوادم مشغولة (429). جرب استخدام مفتاحك الخاص.");
       }
    }
    throw error;
  }
};