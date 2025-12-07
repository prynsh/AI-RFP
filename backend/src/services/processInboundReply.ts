import { prisma } from "../clients/PrismaClient.js";
import { parseVendorReplyGeminiToSummary } from "../helperFunctions/ReplyParser.js";
import type { MailgunInboundEmail } from "../types/types.js";

export async function processInboundVendorReply(emailData: MailgunInboundEmail) {
  const from = emailData.from || emailData.sender || "";
  const subject = emailData.subject || "";
  const bodyText = emailData["body-plain"] || "";
  const bodyHtml = emailData["body-html"] || "";
  const messageId = emailData["Message-Id"];
  const inReplyTo = emailData["In-Reply-To"];

  console.log("Processing inbound email from:", from);

  const parsedSummary = await parseVendorReplyGeminiToSummary({
    from,
    subject,
    bodyText,
    bodyHtml,
  });
  const rawEmailBody = bodyText && bodyText.trim().length > 0 ? bodyText : bodyHtml || "";

  const emailIdentifier = inReplyTo || messageId || "";
  
  const sentRfp = await prisma.sentRfp.findFirst({
    where: { mailgunMessageId: emailIdentifier },
  });

  if (!sentRfp) {
    throw new Error(`No matching SentRfp found for email ID: ${emailIdentifier}`);
  }

  const savedReply = await prisma.replies.create({
    data: {
      emailId: emailIdentifier,
      emailBody: rawEmailBody,
      parsed: parsedSummary,
      sentRfp: {
        connect: { id: sentRfp.id },
      },
    },
  });

  return savedReply;
}