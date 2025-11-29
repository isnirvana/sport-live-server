// server.js — EC2-ready Express server

import express from "express";
import scrapeMatches from "./scrape.js";
import scrapeIframeLink from "./streamScraper.js";
import cors from "cors";

const app = express();

// Use environment port if provided (useful for other platforms too)
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  })
);

// Optional: parse JSON if needed
app.use(express.json());

// Simple health check
app.get("/", (req, res) => res.send("Server is running"));

// Endpoint to get live matches
app.get("/scrape", async (req, res) => {
  try {
    const matches = await scrapeMatches();
    res.json(matches);
  } catch (err) {
    console.error("Scrape error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get actual player link
app.get("/stream", async (req, res) => {
  const url = req.query.url ? decodeURIComponent(req.query.url) : null;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const data = await scrapeIframeLink(url);
    res.json(data);
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server — bind to all interfaces for EC2
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
