import express from "express";
import { config } from "./config.js";
import { handleWebhook } from "./webhook-handler.js";

const app = express();

// Parse body as raw text for signature verification
app.post("/webhook", express.text({ type: "application/json" }), handleWebhook);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Agent server running on port ${config.port}`);
  console.log(`Webhook endpoint: http://localhost:${config.port}/webhook`);
});
