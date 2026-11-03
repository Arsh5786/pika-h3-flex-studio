const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const HF = "https://pika-labs-pika-h3-flex.hf.space";

app.use(express.json({ limit: "20mb" }));
app.use(express.static("public"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Pika H3 Flex proxy" }));

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ error: "No file received" });
    const form = new FormData();
    for (const file of req.files) {
      form.append("files", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    }
    const upstream = await fetch(`${HF}/gradio_api/upload`, { method: "POST", body: form });
    const body = await upstream.text();
    res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json").send(body);
  } catch (err) {
    res.status(502).json({ error: "Upload proxy failed", detail: err.message });
  }
});

app.post("/api/call/v2/generate", async (req, res) => {
  try {
    const payload = { ...req.body };

    if (Array.isArray(payload.data)) {
      for (const index of [2, 3]) {
        const image = payload.data[index];

        if (
          image &&
          typeof image === "object" &&
          image.path == null &&
          image.url == null
        ) {
          payload.data[index] = null;
        }
      }
    }

    const upstream = await fetch(`${HF}/gradio_api/call/v2/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const body = await upstream.text();

    res.status(upstream.status)
      .type(upstream.headers.get("content-type") || "application/json")
      .send(body);

  } catch (err) {
    res.status(502).json({
      error: "Generation request proxy failed",
      detail: err.message
    });
  }
});

app.get("/api/call/generate/:eventId", async (req, res) => {
  try {
    const upstream = await fetch(`${HF}/gradio_api/call/generate/${encodeURIComponent(req.params.eventId)}`);
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    if (!upstream.body) return res.end();
    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(502).json({ error: "Result stream proxy failed", detail: err.message });
    else res.end();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Pika H3 Flex Studio listening on ${port}`));
