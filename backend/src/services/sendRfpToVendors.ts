import Mailgun from "mailgun.js";
import  { prisma } from "../clients/PrismaClient.js";
import { buildRfpEmailWithAI } from "../helperFunctions/JSONtoEmail.js";
import type { RfpStructuredData } from "../types/types.js";

export async function sendRfpToVendors(rfpId: number, vendorEmails: string[]) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
  });

  if (!rfp) {
    throw new Error("RFP not found");
  }

  const structured = rfp.structured as unknown as RfpStructuredData;
  const { subject, body } = await buildRfpEmailWithAI(structured);

  const mailgun = new Mailgun(FormData);
  const mailgunClient = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "",
  });

  const domain = process.env.MAILGUN || "";
  const fromEmail = process.env.FROM_EMAIL || "";

  const sendResults = [];

  for (const vendorEmail of vendorEmails) {
    try {
      const response = await mailgunClient.messages.create(domain, {
        from: fromEmail,
        to: vendorEmail,
        subject,
        text: body,
      });

      const mailgunMessageId = response.id as string;

      await prisma.sentRfp.create({
        data: {
          rfpId,
          vendorEmail,
          mailgunMessageId,
        },
      });

      sendResults.push({
        vendorEmail,
        mailgunMessageId,
        success: true,
      });
    } catch (error) {
      console.error(`Failed to send RFP to ${vendorEmail}:`, error);
      sendResults.push({
        vendorEmail,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return sendResults;
}
