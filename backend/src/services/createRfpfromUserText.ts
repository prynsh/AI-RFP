import type { Prisma } from "../../prisma/generated/prisma/client.js";
import { ai } from "../clients/Gemini.js";
import { prisma } from "../clients/PrismaClient.js";
import { GEMINI_MODEL, SENDER_COMPANY, SENDER_NAME } from "../constants/constant.js";
import type { RfpStructuredData } from "../types/types.js";

export async function createRfpFromUserText(userText: string) {
  const prompt = `
  You are an assistant that writes professional Request for Quote (RFQ) emails for vendors.

You are given a natural language text. Using ONLY this data, write an RFQ email that a vendor can easily understand.

Requirements:
- Use a clear, professional tone.
- Explain briefly what is being requested (use items + originalText to infer).
- Mention budget (if present), delivery timeline, payment terms, and warranty in natural language.
- List requested items in a readable way (numbered list or bullets).
- End with a short call to action (ask them to send a quote) and a polite sign-off.
- Do NOT invent details not present in the text (no company names, no dates unless mentioned).
- The sender details are ${SENDER_NAME}, company - ${SENDER_COMPANY}.

Return ONLY a JSON object with this exact shape:
{
  "subject": "string",
  "body": "string"
}
Do not highlight the subject or body. Just mention the subject on top and then the body.

Here is the raw text:
${userText}
  `.trim();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawResponse = response.text!;
  if (!rawResponse) {
    throw new Error("Empty response from AI model");
  }

  const structured = JSON.parse(rawResponse) as RfpStructuredData ;

  const createdRfp = await prisma.rfp.create({
    data: {
      originalText: userText,
       structured: structured as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    rfpId: createdRfp.id,
    structured,
  };
}