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
    const models = ['gemini-2.0-flash-exp', 'gemini-3-pro-preview', 'gemini-3-flash-preview'];
    
    let pdfPart;
    try {
      pdfPart = await fileToGenerativePart(file);
    } catch (readError) {
      throw new Error("فشل في قراءة الملف من الجهاز.");
    }

    const prompt = `
    You are an expert Educational Document Digitizer.
    Target: Convert the provided PDF exam paper into a high-fidelity HTML document specifically optimized for **Microsoft Word Export**.

    **CRITICAL RULE: NO PAGE BORDERS**
    - **IGNORE** any outer frame, page border, or decorative line surrounding the *entire* page content in the PDF.
    - **DO NOT** wrap the whole document in a table or div with a border.
    - The output HTML <body> must be clean and borderless.
    - Let the user add a page border in MS Word later if they wish.

    **LAYOUT & CONTENT RULES:**
    - **Internal Boxes**: If a specific *question* or *section* has a box around it (like "Question 1"), you **MUST USE HTML TABLES** (<table border="1">) for that specific part only.
    - **Tables**: Use \`width="100%"\`, \`border-collapse: collapse\`, and \`border: 1px solid #000\`.
    - **Direction**: Default \`dir="rtl"\`.
    - **Text**: Preserve font weight, underlining, and layout logic accurately.
    - **Math**: Use clear text representation or simple HTML entities.

    **DIAGRAMS & MAPS (SVG RULES):**
    - Use **Inline SVG** for geometry, charts, and drawings.
    - **MANDATORY**: You must specify \`width="X" height="Y"\` attributes in pixels on the <svg> tag.
    - Style: High contrast (Black lines, White fill).

    **OUTPUT:**
    Return ONLY the raw HTML <body> content. No markdown code blocks.
    `;

    let lastError: any = null;

    for (const modelId of models) {
      try {
        console.log(`Attempting conversion using model: ${modelId}`);
        const maxRetries = 3; 
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelId,
              contents: { parts: [pdfPart, { text: prompt }] },
              config: { maxOutputTokens: 65536, temperature: 0.1 }
            });

            const text = response.text;
            if (!text) throw new Error("Empty response");

            const cleanHtml = text.replace(/```html/g, '').replace(/```/g, '').trim();
            return cleanHtml;

          } catch (innerError: any) {
            const status = innerError.status || 0;
            const message = innerError.message?.toLowerCase() || '';
            console.warn(`Attempt ${attempt} failed:`, message);

            if (status === 404) throw innerError; 

            // Smart Wait logic
            const isQuotaError = status === 429 || message.includes('429') || message.includes('quota');
            const isServerBusy = status === 503 || message.includes('503');
            
            if (attempt < maxRetries) {
              if (isQuotaError) {
                await wait(12000); 
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
      } catch (modelError: any) {
        lastError = modelError;
      }
    }

    if (lastError) {
        if (lastError.message?.includes('429')) {
            throw new Error("السيرفر مشغول (429). يرجى استخدام مفتاح API خاص.");
        }
        throw lastError;
    }
    throw new Error("حدث خطأ غير معروف.");

  } catch (error: any) {
    console.error("Final Conversion Error:", error);
    if (error.message?.includes('429')) {
       throw new Error("الخوادم مشغولة (429). جرب استخدام مفتاحك الخاص.");
    }
    throw error;
  }
};