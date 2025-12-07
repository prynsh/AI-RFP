import { ai } from "../clients/Gemini.js";


export type VendorReplySummary = {
  vendorEmail: string;
  summary: string; 
};

export async function compareVendorsForRfp(options: {
  rfpOriginalText: string;
  rfpStructured?: any;
  vendorReplies: VendorReplySummary[];
}): Promise<string> {
  const { rfpOriginalText, rfpStructured, vendorReplies } = options;

  if (vendorReplies.length === 0) {
    return "No vendor replies have been received yet for this RFP.";
  }

  const vendorsBlock = vendorReplies
    .map(
      (v, idx) => `
Vendor ${idx + 1}:
Email: ${v.vendorEmail}
Summary:
${v.summary}
`
    )
    .join("\n\n");

  const structuredBlock = rfpStructured
    ? `STRUCTURED RFP (JSON-ish, for context only):\n${JSON.stringify(
        rfpStructured,
        null,
        2
      )}\n\n`
    : "";

  const prompt = `
You are assisting a procurement team comparing vendor responses to an RFP.

RFP (original text):
${rfpOriginalText}

${structuredBlock}
Vendor replies (already pre-parsed by another AI into concise summaries):

${vendorsBlock}

Task:
Compare the vendors along these dimensions:
- Pricing (who is cheaper / more expensive, and in what way)
- Payment terms (favorable vs strict)
- Delivery timeline (faster vs slower)
- Warranty / support
- Key terms & conditions (important differences or risks)
- Overall completeness of their response (1–5 score: 1 = very incomplete, 5 = very complete)

Return a clear, human-readable comparison with:
1) A short overview paragraph.
2) A table-like section per vendor (Vendor email, price, terms, delivery, warranty, completeness score, key pros, key cons).
3) A final recommendation: which vendor(s) seem best and why.

Important:
- Base your analysis ONLY on the summaries provided.
- If some detail is missing for a vendor, explicitly say "Not specified" for that part.
  `.trim();

  const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });

 

  return result.text!.trim();
}
