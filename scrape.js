import puppeteer from "puppeteer";

export default async function scrapeMatches() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://m.livetv.sx/en/allupcoming", {
      waitUntil: "domcontentloaded",
    });

    const matches = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll("ul.broadcasts li"));

      const liveMatches = list.filter(
        (li) =>
          li.classList.contains("live") ||
          li.querySelector(".note")?.textContent?.toUpperCase().includes("LIVE")
      );

      return liveMatches.map((li) => {
        const logo = li.querySelector("img")?.src || "";
        const title = li.querySelector(".title a")?.textContent?.trim() || "";
        let href = li.querySelector(".title a")?.getAttribute("href") || "";

        if (href && !href.startsWith("http")) {
          if (href.startsWith("//")) {
            href = "https:" + href;
          } else {
            href = "https://m.livetv.sx" + href;
          }
        }

        const note = li.querySelector(".note")?.textContent?.trim() || "";
        return { logo, title, stream: href, note };
      });
    });

    await browser.close();
    return matches;
  } catch (err) {
    await browser.close();
    return { error: err.message };
  }
}
