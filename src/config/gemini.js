import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = (model = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model });
};

export { genAI };