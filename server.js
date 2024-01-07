const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeSearchResults(searchQuery) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const timeWaiting = 1000;
  await page.goto(
    `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
  );

  await page.click("#L2AGLb");

  let isBottom = false;
  let allSearchResults = [];
  let uniqueHostnames = new Set();

  while (!isBottom) {
    await page.waitForSelector("div#search");

    const searchResults = await page.$$eval("div.yuRUbf a", (links) =>
      links.map((link) => link.href)
    );

    const filteredResults = searchResults.filter(link => {
      const hostname = new URL(link).hostname;
      if (!uniqueHostnames.has(hostname) && !link.startsWith("https://translate.google.com")) {
        uniqueHostnames.add(hostname);
        return true;
      }
      return false;
    });

    allSearchResults.push(...filteredResults);

    await page.evaluate(() => {
      window.scrollBy(0, 1200);
    });

    await new Promise((resolve) => setTimeout(resolve, timeWaiting));

    const bodyExists = await page.$('body');
    if (!bodyExists) {
      console.log("Le corps du document n'est pas encore disponible.");
      continue;
    }

    isBottom = await page.evaluate(() => {
      const body = document.body;
      if (!body) {
        return true;
      }
      const currentHeight = window.innerHeight + window.scrollY;
      const pageHeight = body.offsetHeight;
      return pageHeight <= currentHeight;
    });

    await new Promise((resolve) => setTimeout(resolve, timeWaiting));
  }

  const fileName = searchQuery.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";
  fs.writeFileSync(fileName, JSON.stringify(allSearchResults));

  await browser.close();
}

scrapeSearchResults("inurl:admin.php?id=")
.then(() => console.log("Sites enregistrés"))
.catch((error) => console.log(error));
