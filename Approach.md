## 🧠 Approach

The objective of the **Social Media Content Analyzer** is to extract text from uploaded documents (PDFs or images), analyze its relevance for social media, and generate actionable insights using AI.  
The architecture is built to be **modular, scalable, and efficient**, ensuring every stage operates independently yet integrates smoothly.

---

### **1️⃣ File Intake & Validation**
- Users upload PDFs or images through a drag-and-drop interface.
- The backend receives the file and detects its type using MIME-based validation.
- Files are stored temporarily for processing, then removed after extraction.

---

### **2️⃣ Intelligent Text Extraction**
- **PDF Parsing (pdf-parse):**  
  Extracts text from digital or scanned PDFs while retaining logical formatting.
- **Image OCR (Tesseract.js):**  
  Converts images (JPG, PNG, scanned docs) into text using OCR.
- A unified extraction utility ensures consistent output regardless of file type.

---

### **3️⃣ AI-Powered Content Understanding**
- The cleaned text is sent to the **Google Gemini API** with a carefully crafted prompt.
- Gemini performs:
  - Content classification (`social_post`, `resume`, `quote`, `document`, `other`)
  - Engagement score generation (0–100)
  - Extraction summary
  - Actionable suggestions:
    - Hooks  
    - Calls-to-action  
    - High-reach hashtags  
    - Improvements for better engagement
- The response is structured into clean JSON to maintain consistency.

---

### **4️⃣ Response Structuring**
The backend normalizes Gemini’s output into a predictable format so the frontend never breaks:

```ts
interface AnalysisResult {
  filename: string;
  content_type: string;
  analysis: string;
  extracted_text_summary: string;
  extractedText: string;
  engagement_score: {
    score: number;
    reason: string;
  };
  suggestions: {
    message: string;
    actions: string[];
    hooks: string[];
    callToAction: string[];
    hashtags: string[];
  };
}
