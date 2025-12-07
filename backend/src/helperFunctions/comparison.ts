// helperFunctions/comparison.ts
import { ai } from "../clients/Gemini.js";
import { GEMINI_MODEL } from "../constants/constant.js";
import type { VendorReply } from "../types/types.js";
// import your AI client here

export async function compareVendorsForRfp({
  rfpOriginalText,
  rfpStructured,
  vendorReplies,
}: {
  rfpOriginalText: string | null;
  rfpStructured: any;
  vendorReplies: VendorReply[];
}): Promise<string> {
  const prompt = `
You are helping a procurement manager compare vendor proposals.

RFP (original):
${rfpOriginalText ?? "N/A"}

RFP (structured JSON):
${JSON.stringify(rfpStructured, null, 2)}

Vendor replies:
${JSON.stringify(vendorReplies, null, 2)}

Generate a clear comparison between vendors and a recommendation.

Return ONLY valid HTML, no backticks, no explanations outside HTML.
The HTML must follow this structure:

1. A short heading and paragraph (overall summary).
2. A comparison table with a header row and one row per vendor.
   Columns:
   - Vendor
   - Pricing
   - Terms
   - Completeness of Response
   - Overall Score (0–100)
   - Key Notes
3. A final section titled "Recommendation" that clearly answers:
   - Which vendor should we go with?
   - Why?

Use simple semantic HTML like:

<h2>...</h2>
<p>...</p>
<table>...</table>
<h3>Recommendation</h3>
<p>...</p>
<ul>...</ul>
  `;

  // Example with a generic client – replace with your actual call:
  
    const aiResponseText = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
     }) 
     const text = aiResponseText.text!;
  return text; 
}
