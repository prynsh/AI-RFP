import { ai } from "../clients/Gemini.js";

function getRawText(bodyText?: string, bodyHtml?: string): string {
  if (bodyText && bodyText.trim().length > 0) return bodyText;
  if (!bodyHtml) return "";
  // naive HTML strip
  return bodyHtml.replace(/<[^>]*>/g, " ");
}

export async function parseVendorReplyGeminiToSummary(email: {
  from: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
}): Promise<string> {
  const rawBody = getRawText(email.bodyText, email.bodyHtml);

  const prompt = `
You are helping a procurement team understand vendor email responses to RFPs.

Given the raw email text below, extract the MOST IMPORTANT commercial details and write a concise summary in plain text.

Focus especially on:
- Price / pricing details
- Currency
- Payment terms
- Delivery timeline
- Warranty / support
- Key terms & conditions
- Important assumptions, exclusions, or limitations

Format your answer like:

Vendor: <email>
Subject: <subject>

Price: ...
Currency: ...
Payment terms: ...
Delivery timeline: ...
Warranty / support: ...
Key terms & conditions:
- ...
- ...
Assumptions / exclusions:
- ...
Other notes:
- ...

If some information is not mentioned, write "Not specified" for that field.

Return ONLY this summary text, no JSON, no markdown, no extra commentary.

Vendor email: ${email.from}
Subject: ${email.subject}

Email body:
${rawBody}
  `.trim();

  const result = await ai.models.generateContent({ model: "gemini-2.5-flash",contents:prompt });

 

  const summary = result.text!.trim();
  return summary;
}
