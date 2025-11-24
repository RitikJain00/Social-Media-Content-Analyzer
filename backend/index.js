import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import uploadRoute from "./routes/upload.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/upload", uploadRoute);


// Default route
app.get("/", (req, res) => {
  res.send("Backend server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
