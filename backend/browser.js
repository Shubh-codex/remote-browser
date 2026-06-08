const puppeteer = require("puppeteer");

let browser = null;
let page = null;

async function startBrowser() {
  if (browser) return;

  browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",   // prevents crashes in low-memory containers
    "--disable-gpu"
  ],
  defaultViewport: { width: 1280, height: 720 }
});

  page = await browser.newPage();

  page.on("crash", () => {
    console.error("Page crashed, resetting...");
    page = null;
  });

  await page.goto("https://www.wikipedia.org", {
    waitUntil: "domcontentloaded",
    timeout: 15000
  });

  console.log("Browser started");
}

async function stopBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

async function getScreenshot() {
  if (!page) return null;

  return await page.screenshot({
    encoding: "base64",
    type: "jpeg",
    quality: 40
  });
}

async function click(x, y) {
  if (!page) return;
  await page.mouse.click(x, y);
}

async function moveMouse(x, y) {
  if (!page) return;
  await page.mouse.move(x, y);
}

async function scroll(deltaY) {
  if (!page) return;
  await page.mouse.wheel({ deltaY });
}

async function type(text) {
  if (!page) return;
  await page.keyboard.type(text);
}

async function pressKey(key) {
  if (!page) return;
  try {
    await page.keyboard.press(key);
  } catch (err) {
    console.log("Key error:", err.message);
  }
}

async function navigate(url) {
  if (!page) return;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  console.log("Navigating to:", url);

  // KEY FIX: domcontentloaded fires as soon as HTML is parsed.
  // networkidle2 waits for ALL background XHR/fetch to settle — can be 5-15s extra.
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.warn("Navigation timed out");
    } else {
      throw err;
    }
  }
}

function isReady() {
  return browser !== null && page !== null;
}

module.exports = {
  startBrowser,
  stopBrowser,
  getScreenshot,
  click,
  moveMouse,
  scroll,
  type,
  pressKey,
  navigate,
  isReady
};