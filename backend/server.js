const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const browser = require("./browser");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.post("/start", async (req, res) => {
  try {
    await browser.startBrowser();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.post("/stop", async (req, res) => {
  await browser.stopBrowser();
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("Remote Browser Backend Running");
});

io.on("connection", socket => {
  console.log("Client connected");

  let capturing = false;

  // FIX 1: reduced interval from 500ms → 100ms for snappier screen updates
  const frameInterval = setInterval(async () => {
    if (!browser.isReady()) return;
    if (capturing) return;
    capturing = true;

    try {
      const frame = await browser.getScreenshot();
      if (frame) socket.emit("frame", frame);
    } catch (error) {
      console.error("Frame error:", error.message);
    } finally {
      capturing = false;
    }
  }, 100);

  // FIX 2: after navigate completes, immediately send a fresh frame
  // instead of waiting up to 100ms for the next interval tick
  async function emitFrameNow() {
    try {
      const frame = await browser.getScreenshot();
      if (frame) socket.emit("frame", frame);
    } catch (err) {
      console.error("Immediate frame error:", err.message);
    }
  }

  socket.on("click", async (data) => {
    try {
      await browser.click(data.x, data.y);
      // Clicks can trigger navigation or DOM changes — send frame right away
      await emitFrameNow();
    } catch (err) {
      console.error("Click error:", err.message);
    }
  });

  socket.on("mousemove", async (data) => {
    try {
      await browser.moveMouse(data.x, data.y);
    } catch (err) {
      console.error("Mousemove error:", err.message);
    }
  });

  socket.on("scroll", async (data) => {
    try {
      await browser.scroll(data.deltaY);
      await emitFrameNow();
    } catch (err) {
      console.error("Scroll error:", err.message);
    }
  });

  socket.on("type", async (data) => {
    try {
      await browser.type(data.text);
      await emitFrameNow();
    } catch (err) {
      console.error("Type error:", err.message);
    }
  });

  socket.on("keypress", async (data) => {
    try {
      await browser.pressKey(data.key);
      await emitFrameNow();
    } catch (err) {
      console.error("Keypress error:", err.message);
    }
  });

  socket.on("navigate", async (data) => {
    try {
      console.log("Navigate request:", data);
      await browser.navigate(data.url);
      // FIX 3: push a frame the moment navigation finishes —
      // client sees the page instantly instead of waiting for next interval
      await emitFrameNow();
    } catch (err) {
      console.error("Navigate error:", err.message);
      socket.emit("navigate_error", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    clearInterval(frameInterval);
    console.log("Client disconnected");
  });
});

async function shutdown() {
  console.log("Shutting down...");
  await browser.stopBrowser();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});