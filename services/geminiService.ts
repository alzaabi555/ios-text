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
  // Client-side validation: 10MB limit to prevent XHR/Payload errors with inline base64
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("عذراً، حجم الملف كبير جداً. يرجى استخدام ملف أقل من 10 ميجابايت لضمان سرعة واستقرار المعالجة.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Priority list of models.
    // Updated to use Gemini 3 series as per latest API availability.
    // gemini-3-pro-preview: Best for complex reasoning and SVG generation.
    // gemini-3-flash-preview: Fast fallback.
    const models = ['gemini-3-pro-preview', 'gemini-3-flash-preview'];
    
    let pdfPart;
    try {
      pdfPart = await fileToGenerativePart(file);
    } catch (readError) {
      throw new Error("فشل في قراءة الملف من الجهاز.");
    }

    const prompt = `
    You are an expert Educational Document Digitizer specialized in Arabic Mathematics.
    
    Target: Convert the provided PDF exam paper into a high-fidelity HTML document compatible with MS Word.

    CRITICAL RULES FOR DRAWINGS (SVG GENERATION):
    The document contains mathematical geometry (Triangles, Circles, Parallel lines, Angles, Coordinate systems).
    1. **DO NOT** use image placeholders.
    2. **DO NOT** describe the image in text.
    3. **YOU MUST DRAW** these shapes using **Inline SVG Code**.
    
    SVG Guidelines:
    - Use <svg> tags with proper viewBox.
    - **Stroke**: Black (#000000), stroke-width="2".
    - **Fill**: transparent (none), unless the shape is shaded in the PDF (use light gray #eee).
    - **Labels**: You MUST include the labels (أ, ب, ج, س, 5cm, 30°) inside the SVG using <text> tags. Position them accurately relative to the lines.
    - **Complexity**: Simplify complex sketches into clean geometric vector lines.
    - **Dimensions**: Keep SVGs responsive (e.g., width="200px" or similar appropriate size).

    TEXT & LAYOUT RULES:
    1. **Structure**: Return ONLY the HTML <body> content.
    2. **Language**: Arabic (dir="rtl").
    3. **Formatting**: Preserve H1/H2 headings, Bold, and Font sizes.
    4. **Tables**: Use standard HTML tables with border="1" style="border-collapse: collapse; width: 100%;". Ensure numbers inside tables are correct.
    5. **Correction**: 
       - Fix Arabic OCR errors (e.g., "امل" -> "الم", broken Hamzas).
       - Ensure math numbers are consistent (either Hindi ١٢٣ or Arabic 123 as per document).

    Output raw HTML only. No markdown blocks.
    `;

    let lastError: any = null;

    // Loop through models as fallback mechanism
    for (const modelId of models) {
      try {
        console.log(`Attempting conversion using model: ${modelId}`);
        
        // Inner Retry Loop for transient network errors
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelId,
              contents: {
                parts: [
                  pdfPart,
                  { text: prompt }
                ]
              },
              config: {
                // Gemini 3 models handle thinking automatically. 
                // We set temperature low for deterministic formatting.
                temperature: 0.1
              }
            });

            const text = response.text;
            if (!text) {
              throw new Error("لم يتم استرجاع أي بيانات من الخادم.");
            }

            // Advanced Cleanup
            const cleanHtml = text
              .replace(/```html/g, '')
              .replace(/```/g, '')
              .trim();
            
            return cleanHtml; // Success! Return immediately.

          } catch (innerError: any) {
            console.warn(`Attempt ${attempt} with ${modelId} failed:`, innerError);
            
            // If it's a Quota error (429) or Not Found (404), break inner loop to try next model immediately
            const status = innerError.status || 0;
            const message = innerError.message?.toLowerCase() || '';
            
            if (status === 429 || status === 404 || message.includes('429') || message.includes('quota') || message.includes('not found')) {
               throw innerError; 
            }

            // If network error, wait and retry same model
            const isNetworkError = 
              message.includes('xhr') || 
              message.includes('fetch') || 
              message.includes('500') || 
              message.includes('503');

            if (attempt < maxRetries && isNetworkError) {
              await wait(attempt * 2000);
              continue;
            }
            
            throw innerError;
          }
        }
      } catch (modelError: any) {
        console.error(`Model ${modelId} failed completely.`, modelError);
        lastError = modelError;
        // Continue to the next model in the list...
      }
    }

    // If all models failed
    if (lastError) {
        if (lastError.message?.includes('429') || lastError.message?.includes('quota')) {
            throw new Error("تم تجاوز الحد المسموح به للاستخدام المجاني حالياً. يرجى الانتظار دقيقة والمحاولة مجدداً.");
        }
        throw lastError;
    }
    
    throw new Error("حدث خطأ غير معروف أثناء المعالجة.");

  } catch (error: any) {
    console.error("Final Conversion Error:", error);
    if (error.message?.includes('429') || error.message?.includes('quota')) {
       throw new Error("عفواً، الخوادم مشغولة جداً الآن (429). يرجى الانتظار قليلاً.");
    }
    throw error;
  }
};