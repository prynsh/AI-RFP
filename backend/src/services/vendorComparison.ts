import { prisma } from "../clients/PrismaClient.js";
import { compareVendorsForRfp } from "../helperFunctions/comparison.js";
import type { VendorReply } from "../types/types.js";

export async function generateVendorComparison(rfpId: number) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      sentRfps: {
        include: {
          replies: true,
        },
      },
    },
  });

  if (!rfp) {
    throw new Error("RFP not found");
  }

  const vendorReplies: VendorReply[] = [];

  for (const sentRfp of rfp.sentRfps) {
    if (!sentRfp.replies || sentRfp.replies.length === 0) {
      continue;
    }

    const latestReply = sentRfp.replies.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );

    if (latestReply.parsed) {
      vendorReplies.push({
        vendorEmail: sentRfp.vendorEmail,
        summary: latestReply.parsed,
      });
    }
  }

  if (vendorReplies.length === 0) {
    return {
      rfpId,
      vendorReplies: [],
      comparison: "No vendor replies have been received yet for this RFP.",
    };
  }

  const comparisonText = await compareVendorsForRfp({
    rfpOriginalText: rfp.originalText,
    rfpStructured: rfp.structured,
    vendorReplies,
  });

  return {
    rfpId,
    vendorReplies,
    comparison: comparisonText,
  };
}