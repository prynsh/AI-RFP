import express from "express"
import cors from "cors"
import { createRfpFromUserText } from "./services/createRfpfromUserText.js";
import { prisma } from "./clients/PrismaClient.js";
import type { MailgunInboundEmail, SendRfpRequest } from "./types/types.js";
import { processInboundVendorReply } from "./services/processInboundReply.js";
import { generateVendorComparison } from "./services/vendorComparison.js";
import { sendRfpToVendors } from "./services/sendRfpToVendors.js";
import { PORT } from "./constants/constant.js";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//route to structure raw text
app.post("/structured-response", async (req, res) => {
  try {
    const { userText } = req.body;

    if (typeof userText !== "string" || !userText.trim()) {
      return res.status(400).json({
        error: "userText is required and must be a non-empty string",
      });
    }

    const result = await createRfpFromUserText(userText);

    return res.json({
      message: "RFP created successfully",
      rfpId: result.rfpId,
      data: result.structured,
    });
  } catch (error) {
    console.error("Error in /structured-response:", error);
    return res.status(500).json({
      error: "Failed to create RFP",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

//route to get all the vendors, currently supporting only two as Mailgun has limitations
app.get("/vendors", async (req, res) => {
  try {
    const vendors = await prisma.vendors.findMany({});

    return res.json({
      vendors,
    });
  } catch (error) {
    console.error("Error in /vendors:", error);
    return res.status(500).json({
      error: "Failed to fetch vendors",
    });
  }
});

//route to send RFPs to vendors
app.post("/send-rfp", async (req, res) => {
  try {
    const { rfpId, email } = req.body as SendRfpRequest;

    if (!rfpId) {
      return res.status(400).json({ error: "rfpId is required" });
    }

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const vendorEmails = Array.isArray(email) ? email : [email];

    const sendResults = await sendRfpToVendors(rfpId, vendorEmails);

    const successCount = sendResults.filter((r) => r.success).length;

    return res.json({
      message: `RFP sent to ${successCount}/${sendResults.length} vendors`,
      rfpId,
      results: sendResults,
    });
  } catch (error) {
    console.error("Error in /send-rfp:", error);
    return res.status(500).json({
      error: "Failed to send RFP",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

//route to handle the inbound emailsss
app.post("/mailgun/inbound", async (req, res) => {
  try {
    const emailData = req.body as MailgunInboundEmail;

    const savedReply = await processInboundVendorReply(emailData);

    console.log("Successfully saved reply with ID:", savedReply.id);

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Error in /mailgun/inbound:", error);

    return res.status(200).send("Error processed");
  }
});

//route to compare the replies
app.get("/rfp/:id/comparison", async (req, res) => {
  try {
    const rfpId = Number(req.params.id);

    if (Number.isNaN(rfpId)) {
      return res.status(400).json({ error: "Invalid rfpId" });
    }

    const comparisonResult = await generateVendorComparison(rfpId);

    return res.json(comparisonResult);
  } catch (error) {
    console.error("Error in /rfp/:id/comparison:", error);

    if (error instanceof Error && error.message === "RFP not found") {
      return res.status(404).json({ error: "RFP not found" });
    }

    return res.status(500).json({
      error: "Failed to generate comparison",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});