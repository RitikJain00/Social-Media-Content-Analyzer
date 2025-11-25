
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import { analyzeContentAI } from "../utils/gemini.js"; // relative path

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function formatText(text) {
  return (text || "")
    .replace(/ {2,}/g, " ")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let extractedText = "";

    if (req.file.mimetype === "application/pdf") {
      const data = await pdfParse(req.file.buffer);
      extractedText = formatText(data.text);
    } else if (req.file.mimetype.startsWith("image/")) {
      const ocr = await Tesseract.recognize(req.file.buffer, "eng");
      extractedText = formatText(ocr.data.text);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Run the AI analysis (Gemini)
    const aiResult = await analyzeContentAI(extractedText);

    // Build response exactly matching AnalysisResult interface
    const responsePayload = {
      filename: req.file.originalname,
      content_type: aiResult.content_type || "other",
      analysis: aiResult.analysis || "",
      extracted_text_summary: aiResult.extracted_text_summary || extractedText.slice(0, 200),
      extractedText,
      engagement_score: {
        score: aiResult.engagement_score?.score ?? 0,
        reason: aiResult.engagement_score?.reason || "",
      },
      suggestions: {
        message: aiResult.suggestions?.message || "",
        actions: aiResult.suggestions?.actions || [],
        hooks: aiResult.suggestions?.hooks || [],
        callToAction: aiResult.suggestions?.callToAction || [],
        hashtags: aiResult.suggestions?.hashtags || [],
      },
    };

    return res.json(responsePayload);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Failed to process file." });
  }
});

export default router;
