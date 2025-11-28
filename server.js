import express from "express";
import scrapeMatches from "./scrape.js";
import scrapeIframeLink from "./streamScraper.js";

const app = express();
const PORT = 5000;

// Allow frontend to fetch
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Endpoint to get live matches
app.get("/scrape", async (req, res) => {
  try {
    const matches = await scrapeMatches();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the actual player link
app.get("/stream", async (req, res) => {
  const url = decodeURIComponent(req.query.url);
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const data = await scrapeIframeLink(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
