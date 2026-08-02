import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import {
  getTuningDashboard,
  analyzeAgentFeedback,
  applyPromptVersion,
  completeABTest,
  startABTest,
} from "@/lib/ai/brain/agent-tuning";
import { findAgent } from "@/lib/ai/brain/registry/index";
import { callAI } from "@/lib/ai/router";

export async function GET() {
  try {
    const db = await getDB();
    const dashboard = await getTuningDashboard(db);
    return NextResponse.json(dashboard);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load tuning dashboard" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      agentId?: string;
      prompt?: string;
      source?: string;
      testId?: number;
      feedbackTriggered?: boolean;
    };

    const db = await getDB();

    switch (body.action) {
      case "analyze": {
        if (!body.agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });
        const result = await analyzeAgentFeedback(db, body.agentId);
        return NextResponse.json(result);
      }

      case "suggest": {
        if (!body.agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });
        const agent = findAgent(body.agentId);
        if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

        const analysis = await analyzeAgentFeedback(db, body.agentId);
        const currentPrompt = agent.agent.promptTemplate;

        const prompt = `Improve this agent prompt based on feedback analysis.

Current prompt: "${currentPrompt}"

Feedback analysis:
- Issues identified: ${analysis.issues.slice(0, 3).join("; ") || "none"}
- Praises: ${analysis.praise.slice(0, 3).join("; ") || "none"}
- AI suggestion: ${analysis.suggestion || "none"}

Agent name: ${agent.agent.name}
Agent expertise: ${agent.agent.expertise}

Return ONLY the improved prompt template. Keep the same {{variable}} placeholders. Make it more specific, clear, and address the feedback issues.`;

        let suggestedPrompt: string;
        try {
          const result = await callAI(
            {
              messages: [
                { role: "system", content: "You are a prompt engineering expert. Improve agent prompts based on user feedback." },
                { role: "user", content: prompt },
              ],
            },
            500,
            "meta-llama/llama-3.3-70b-instruct:free",
            "openrouter",
          );
          suggestedPrompt = result.text;
        } catch {
          suggestedPrompt = currentPrompt;
        }

        return NextResponse.json({
          agentId: body.agentId,
          originalPrompt: currentPrompt,
          suggestedPrompt,
          analysis,
        });
      }

      case "apply": {
        if (!body.agentId || !body.prompt) return NextResponse.json({ error: "agentId and prompt required" }, { status: 400 });
        const result = await applyPromptVersion(db, body.agentId, body.prompt, body.source || "manual", body.feedbackTriggered || false);
        return NextResponse.json({ success: true, ...result });
      }

      case "ab-test": {
        if (!body.agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });
        const currentVersion = 0;
        const result = await startABTest(db, body.agentId, currentVersion);
        return NextResponse.json({ success: true, ...result });
      }

      case "ab-complete": {
        if (!body.testId) return NextResponse.json({ error: "testId required" }, { status: 400 });
        const result = await completeABTest(db, body.testId);
        return NextResponse.json({ success: true, ...result });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process tuning action" }, { status: 500 });
  }
}
