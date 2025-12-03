import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

type ProcurementRequest = {
  originalText: string;
  budget: {
    amount: number;
    currency: string;
  } | null;
  deliveryDays: number | null;
  items: {
    itemType: "laptop" | "monitor" | "other";
    quantity: number;
    ramGb?: number;
    screenSizeInches?: number;
  }[];
  paymentTerms: string | null;
  warrantyMonths: number | null;
};


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    // assuming frontend sends { "userText": "..." }
    const userText: string = req.body.userText;

    if (typeof userText !== "string") {
      return res.status(400).json({ error: "userText must be a string" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userText,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            originalText: { type: "string" },

            budget: {
              type: ["object", "null"],
              properties: {
                amount: { type: "number" },
                currency: { type: "string" }
              },
              required: ["amount", "currency"]
            },

            deliveryDays: {
              type: ["integer", "null"]
            },

            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemType: {
                    type: "string",
                    enum: ["laptop", "monitor", "other"]
                  },
                  quantity: { type: "integer" },
                  ramGb: { type: ["integer", "null"] },
                  screenSizeInches: { type: ["number", "null"] }
                },
                required: ["itemType", "quantity"]
              }
            },

            paymentTerms: {
              type: ["string", "null"]
            },

            warrantyMonths: {
              type: ["integer", "null"]
            }
          },
          required: ["originalText", "items"]
        }
      }
    });

    const structured = JSON.parse(response.text!);

    // Here `structured` is perfect to store as JSONB
    // e.g. INSERT INTO requests(data) VALUES ($1::jsonb)

    return res.json({
      message: "Welcome",
      data: structured
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

