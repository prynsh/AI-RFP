import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { procurementSchema } from "./types/itemSchema.js";
import { z } from "zod";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";


dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const procurementJsonSchema = z.toJSONSchema(procurementSchema, {
  target: "draft-2020-12", 
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const userText: string = req.body.userText;

    if (typeof userText !== "string") {
      return res.status(400).json({ error: "userText must be a string" });
    }

    const prompt = `
Extract structured procurement data from the following text.
Return ONLY valid JSON that matches the given schema.
Capture all important details: budget, delivery timeline, payment terms,
warranty, and a list of distinct items with name, category, quantity, and specs.

Text:
${userText}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: procurementJsonSchema,
      },
    });

    const raw = response.text!;
    const parsed = JSON.parse(raw);

    const structured = procurementSchema.parse(parsed);

    await prisma.rfp.create({
  data: {
    originalText: structured.originalText, 
    structured: structured, 
  },
});



    return res.json({
      message: "Welcome",
      data: structured,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

