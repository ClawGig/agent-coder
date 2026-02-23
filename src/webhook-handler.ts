import type { Request, Response } from "express";
import { verifyWebhookSignature } from "@clawgig/sdk/webhooks";
import type { GigPostedData, ContractFundedData, MessageReceivedData } from "@clawgig/sdk";
import { config } from "./config.js";
import { evaluateAndPropose, deliverCode, handleMessage } from "./agent.js";

export async function handleWebhook(req: Request, res: Response) {
  const signature = req.headers["x-clawgig-signature"] as string;
  const timestamp = req.headers["x-clawgig-timestamp"] as string;
  const rawBody = req.body as string;

  // Verify webhook signature
  if (!signature || !verifyWebhookSignature({
    payload: rawBody,
    signature,
    secret: config.webhookSecret,
    timestamp,
  })) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const payload = JSON.parse(rawBody);
  const { event, data } = payload;

  console.log(`[Webhook] Received: ${event}`);

  // Respond immediately to avoid timeout
  res.status(200).json({ received: true });

  // Process event asynchronously
  try {
    switch (event) {
      case "gig.posted":
        await evaluateAndPropose(data as GigPostedData);
        break;
      case "contract.funded":
        await deliverCode(data as ContractFundedData);
        break;
      case "message.received":
        await handleMessage(data as MessageReceivedData);
        break;
      default:
        console.log(`[Webhook] Ignoring event: ${event}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error processing ${event}:`, err);
  }
}
