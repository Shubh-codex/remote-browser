const puppeteer = require("puppeteer");

let browser = null;
let page = null;

async function startBrowser() {
  if (browser) return;

  browser = await puppeteer.launch({
    headless: true,
    protocolTimeout: 60000,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    defaultViewport: { width: 1280, height: 720 }
  });

  page = await browser.newPage();

  page.on("crash", async () => {
    console.error("❌ Page crashed, recreating...");
    try {
      page = await browser.newPage();
      await page.goto("about:blank");
      console.log("✅ Page recreated");
    } catch (err) {
      console.error("Failed to recreate page:", err.message);
      page = null;
    }
  });

  console.log("✅ Browser started");
}

async function stopBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    console.log("🛑 Browser stopped");
  }
}

async function getScreenshot() {
  if (!page || !browser) return null;
  try {
    return await page.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 40
    });
  } catch (err) {
    console.error("Screenshot error:", err.message);
    return null;
  }
}

async function click(x, y) {
  if (!page) return;
  console.log(`🖱️  Click at (${Math.round(x)}, ${Math.round(y)})`);
  await page.mouse.click(x, y);
}

async function moveMouse(x, y) {
  if (!page) return;
  await page.mouse.move(x, y);
}

async function scroll(deltaY) {
  if (!page) return;
  console.log(`🖱️  Scroll deltaY=${deltaY}`);
  await page.mouse.wheel({ deltaY });
}

async function type(text) {
  if (!page) return;
  console.log(`⌨️  Type: "${text}"`);
  await page.keyboard.type(text);
}

async function pressKey(key) {
  if (!page) return;
  console.log(`⌨️  Key: "${key}"`);
  try {
    await page.keyboard.press(key);
  } catch (err) {
    console.log(`❌ Key error for "${key}":`, err.message);
  }
}

async function navigate(url) {
  if (!page) return;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  console.log(`🌐 Navigating to: ${url}`);

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    console.log(`✅ Navigation done: ${url}`);
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.warn(`⚠️  Navigation timed out: ${url}`);
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