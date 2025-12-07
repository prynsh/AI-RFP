
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";


dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
export const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
