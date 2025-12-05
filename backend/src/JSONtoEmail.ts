
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"

dotenv.config();
export type RfpStructured = any;


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function buildRfpEmailWithAI(structured: RfpStructured) {
  const prompt = `
You are an assistant that writes professional Request for Quote (RFQ) emails for vendors.

You are given a structured RFP JSON object. Using ONLY this data, write an RFQ email that a vendor can easily understand.

Requirements:
- Use a clear, professional tone.
- Explain briefly what is being requested (use items + originalText to infer).
- Mention budget (if present), delivery timeline, payment terms, and warranty in natural language.
- List requested items in a readable way (numbered list or bullets).
- End with a short call to action (ask them to send a quote) and a polite sign-off.
- Do NOT invent details not present in the JSON (no company names, no dates unless mentioned).
- The sender details are Priyansh Verma, compnay -  AerChain .

Return ONLY a JSON object with this exact shape:
{
  "subject": "string",
  "body": "string"
}

Here is the structured RFP JSON:
${JSON.stringify(structured, null, 2)}
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const raw = response.text!;
  const parsed = JSON.parse(raw) as { subject: string; body: string };

  return parsed;
}
