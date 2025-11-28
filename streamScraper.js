import puppeteer from "puppeteer";

export default async function scrapeIframeLink(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  } catch {
    await browser.close();
    return { error: "Page failed to load" };
  }

  // Wait for iframe (if possible)
  try {
    await page.waitForSelector("iframe", { timeout: 12000 });
  } catch {
    await browser.close();
    return { error: "No iframe found on page" };
  }

  const iframeElements = await page.$$("iframe");

  const SAFE_PROVIDERS = [
    "embed",
    "stream",
    "sport",
    "live",
    "player",
    "video",
    ".php",
    ".html",
  ];

  let bestIframe = null;

  for (const el of iframeElements) {
    const src = await el.evaluate((e) => e.src);

    if (!src) continue;

    const fullSrc = src.startsWith("//") ? "https:" + src : src;

    // Ignore ads
    if (
      fullSrc.includes("ads") ||
      fullSrc.includes("banner") ||
      fullSrc.includes("doubleclick") ||
      fullSrc.includes("facebook") ||
      fullSrc.includes("google")
    ) {
      continue;
    }

    // Check if it looks like a stream iframe
    if (SAFE_PROVIDERS.some((word) => fullSrc.toLowerCase().includes(word))) {
      bestIframe = fullSrc;
      break;
    }
  }

  await browser.close();

  if (!bestIframe) {
    return { error: "No playable iframe found" };
  }

  return { realLink: bestIframe };
}
