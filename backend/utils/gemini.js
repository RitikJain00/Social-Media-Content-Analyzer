import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeContentAI(extractedText) {
  try {
    const prompt = `
    You are an AI content classifier and social media strategist.

    Step 1 — Detect the content type strictly as:
    "social_post", "resume", "quote", "document", "other"
    
    Step 2 — ALWAYS return an engagement_score (0–100) with reason. If unknown, return 0 with a note.
    
    Step 3 — ENSURE ALL FIELDS ARE ALWAYS PRESENT. Do not leave anything undefined or missing. Use empty strings or empty arrays if necessary.
    
    Step 4 — OUTPUT STRICT JSON ONLY with this exact structure:
    
    {
      "content_type": "",                 // "social_post", "resume", "quote", "document", "other"
      "analysis": "",                     // Detailed analysis or empty string
      "extracted_text_summary": "",       // Short summary or empty string
      "engagement_score": {
        "score": 0,                       // 0–100
        "reason": ""                       // Reason for score or empty string
      },
      "suggestions": {
        "message": "",                     // General strategy message or empty string
        "actions": [],                     // Array of actionable suggestions (can be empty)
        "hooks": [],                       // Array of viral hook suggestions (can be empty)
        "callToAction": [],                // Array of CTAs (can be empty)
        "hashtags": []                     // Array of recommended hashtags (can be empty)
      }
    }
    
    Content to analyze:
    ${extractedText}
  `;

    // Call Gemini
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    
let aiText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";


aiText = aiText.replace(/```json|```/g, "").trim();


let json = {};
try {
  json = JSON.parse(aiText);
} catch (err) {
  console.warn("AI returned invalid JSON, using defaults.", err);
}

// Normalize fields to avoid undefined
const normalized = {
  content_type: json.content_type || "other",
  analysis: json.analysis || "",
  extracted_text_summary: json.extracted_text_summary || "",
  engagement_score: {
    score: json.engagement_score?.score ?? 0,
    reason: json.engagement_score?.reason || "",
  },
  suggestions: {
    message: json.suggestions?.message || "",
    actions: json.suggestions?.actions || [],
    hooks: json.suggestions?.hooks || [],
    callToAction: json.suggestions?.callToAction || [],
    hashtags: json.suggestions?.hashtags || [],
  },
  extractedText, // original text
};

return normalized;

  } catch (err) {
    console.error("Gemini Error:", err);

    // Return default structure if AI fails
    return {
      content_type: "other",
      analysis: "",
      extracted_text_summary: "",
      engagement_score: { score: 0, reason: "" },
      suggestions: { message: "", actions: [], hooks: [], callToAction: [], hashtags: [] },
      extractedText,
    };
  }
}
