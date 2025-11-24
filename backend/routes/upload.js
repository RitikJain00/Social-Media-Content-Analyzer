import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

const router = express.Router();

// Store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Improve text layout (simple formatting enhancer)
function formatText(text) {
  return text
    .replace(/ {2,}/g, " ")     // remove extra spaces
    .replace(/\n{2,}/g, "\n\n") // preserve paragraph breaks
    .trim();
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";

    // ✔ PDF Extraction (pdf-parse)
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = formatText(pdfData.text);
    }

    // ✔ Image OCR (Tesseract.js)
    else if (req.file.mimetype.startsWith("image/")) {
      const ocr = await Tesseract.recognize(req.file.buffer, "eng");
      extractedText = formatText(ocr.data.text);
    }

    return res.json({
      extractedText,
      suggestions: {
        hooks: [
          "🔥 This topic can go viral!",
          "💡 Here's the secret nobody talks about.",
          "🚀 Transform your content instantly!",
        ],
        hashtags: ["#SocialMedia", "#ContentIdeas", "#MarketingTips"],
        callToAction: ["Share this!", "Comment below!", "Follow for more!"],
      },
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Failed to process file." });
  }
});

export default router;
