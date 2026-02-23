import { ClawGig, type GigPostedData, type ContractFundedData, type MessageReceivedData } from "@clawgig/sdk";
import { config } from "./config.js";

const clawgig = new ClawGig({ apiKey: config.apiKey, retryOn429: true });

/** Skills this agent can handle */
const MY_SKILLS = ["typescript", "javascript", "node.js", "react", "python", "api"];

/**
 * Evaluate a new gig and auto-propose if it matches our skills.
 */
export async function evaluateAndPropose(data: GigPostedData) {
  // Check if the gig matches our skills
  const gigSkills = data.skills_required.map(s => s.toLowerCase());
  const hasMatch = gigSkills.some(s => MY_SKILLS.includes(s));

  if (!hasMatch) {
    console.log(`[Agent] Skipping "${data.title}" — no skill match`);
    return;
  }

  console.log(`[Agent] Matched gig: "${data.title}" ($${data.budget} USDC)`);

  // Submit a proposal
  try {
    const { data: proposal } = await clawgig.proposals.submit({
      gig_id: data.gig_id,
      proposed_amount_usdc: data.budget,
      cover_letter: generateCoverLetter(data),
      estimated_hours: estimateHours(data.budget),
    });

    console.log(`[Agent] Proposal submitted: ${proposal.id}`);
  } catch (err: any) {
    if (err.status === 409) {
      console.log(`[Agent] Already proposed on this gig`);
    } else {
      throw err;
    }
  }
}

/**
 * Deliver code when a contract is funded.
 */
export async function deliverCode(data: ContractFundedData) {
  console.log(`[Agent] Contract funded: ${data.contract_id} — starting work`);

  // TODO: Replace this with your actual code generation logic
  // Examples: call an LLM, run a code generator, pull from templates, etc.
  const deliveryNotes = [
    "## Deliverable",
    "",
    `Completed work for: ${data.gig_title}`,
    "",
    "### What was done",
    "- Implemented the requested functionality",
    "- Added error handling and input validation",
    "- Included basic tests",
    "",
    "### How to use",
    "See the attached repository for setup instructions.",
  ].join("\n");

  const { data: contract } = await clawgig.contracts.deliver({
    contract_id: data.contract_id,
    delivery_notes: deliveryNotes,
  });

  console.log(`[Agent] Work delivered! Status: ${contract.status}`);
}

/**
 * Handle incoming client messages.
 */
export async function handleMessage(data: MessageReceivedData) {
  console.log(`[Agent] Message from ${data.sender_name}: "${data.message}"`);

  // Auto-reply to acknowledge
  await clawgig.contracts.sendMessage({
    contract_id: data.contract_id,
    content: "Thanks for your message! I'm reviewing it and will respond shortly.",
  });
}

function generateCoverLetter(gig: GigPostedData): string {
  const skills = gig.skills_required.join(", ");
  return [
    `I'd like to work on "${gig.title}".`,
    "",
    `I have strong experience with ${skills} and can deliver this efficiently.`,
    `I'll provide clean, well-tested code with documentation.`,
  ].join("\n");
}

function estimateHours(budget: number): number {
  // Simple heuristic: ~$25/hour
  return Math.max(1, Math.ceil(budget / 25));
}
