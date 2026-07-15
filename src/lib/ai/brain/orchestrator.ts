import { callAI } from "../router";
import { executeAgent, buildAgentPrompt } from "./executor";
import { DEPARTMENTS, getAgentsByDepartment } from "./registry";
import type {
  Intent, DepartmentId, MessageCtx, BrainResult, AgentDef,
} from "./types";

const INTENT_AGENTS: { intent: Intent; department: DepartmentId; priority: number }[] = [
  { intent: "greeting", department: "customer_experience", priority: 10 },
  { intent: "farewell", department: "customer_experience", priority: 10 },
  { intent: "product_inquiry", department: "sales", priority: 90 },
  { intent: "price_inquiry", department: "sales", priority: 95 },
  { intent: "purchase", department: "sales", priority: 100 },
  { intent: "registration", department: "member_success", priority: 90 },
  { intent: "support", department: "customer_experience", priority: 85 },
  { intent: "complaint", department: "psychology", priority: 80 },
  { intent: "feedback", department: "customer_experience", priority: 50 },
  { intent: "referral", department: "sales", priority: 70 },
  { intent: "commission_inquiry", department: "member_success", priority: 75 },
  { intent: "withdrawal", department: "operations", priority: 70 },
  { intent: "training", department: "member_success", priority: 60 },
  { intent: "motivation", department: "psychology", priority: 65 },
  { intent: "general", department: "sales", priority: 30 },
];

const DEPT_INTENT_PROMPTS: Record<DepartmentId, string> = {
  sales: "Classify the intent of this message. Choose ONE: product_inquiry (asking about products/services), price_inquiry (asking about price/cost/value), purchase (ready to buy/pay), referral (asking about referral/team), general (other sales related), unknown.",
  member_success: "Classify the intent. Choose ONE: registration (wants to join/register), commission_inquiry (asking about commission/earnings), training (asking about training/learning), motivation (needs encouragement), referral (team building), general, unknown.",
  customer_experience: "Classify the intent. Choose ONE: greeting (hello/hi/assalamu alaikum), farewell (bye/okay/thanks), support (help/issue/problem), complaint (angry/upset/dissatisfied), feedback (suggestion/opinion/review), general, unknown.",
  operations: "Classify the intent. Choose ONE: withdrawal (want to withdraw money), order_status (asking about order), payment (payment issue), general, unknown.",
  business_intelligence: "Classify the intent. Choose ONE: research (market/competitor info), analytics (data/stats), report (wants report), general, unknown.",
  psychology: "Classify the intent. Choose ONE: complaint (angry/frustrated/scam fear), motivation (needs encouragement/demotivated), objection (hesitant/doubting), general, unknown.",
  platform_admin: "Classify the intent. Choose ONE: settings (configuration), translation (language/traslation), security (login/access), update (version/update), general, unknown.",
};

async function detectIntent(text: string, ctx: MessageCtx, fallbackDept: DepartmentId): Promise<{ intent: Intent; department: DepartmentId }> {
  const departmentsToCheck: DepartmentId[] = ["sales", "psychology", "customer_experience", "member_success", "operations"];

  for (const deptId of departmentsToCheck) {
    try {
      const result = await callAI(
        {
          messages: [
            { role: "system", content: DEPT_INTENT_PROMPTS[deptId] },
            { role: "user", content: `Message: "${text}"\nCustomer role: ${ctx.role}\nLanguage: ${ctx.language}\nMood: ${ctx.mood}\nReturn only the intent word, nothing else.` },
          ],
        },
        50, "gpt-4o-mini", "openrouter"
      );
      const intent = result.text.trim().toLowerCase() as Intent;
      const isValid = INTENT_AGENTS.some((ia) => ia.intent === intent);
      if (isValid) {
        const dept = INTENT_AGENTS.find((ia) => ia.intent === intent)?.department || fallbackDept;
        return { intent, department: dept };
      }
    } catch {}
  }

  return { intent: "general", department: fallbackDept };
}

function selectAgents(departmentId: DepartmentId, intent: Intent, ctx: MessageCtx): AgentDef[] {
  const agents = getAgentsByDepartment(departmentId);
  const candidates = agents.filter((a) => {
    try {
      const condition = a.when.replace("{{intent}}", `'${intent}'`).replace("{{role}}", `'${ctx.role}'`);
      return new Function("intent", "role", `return ${condition}`)(intent, ctx.role);
    } catch {
      return true;
    }
  });
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 3);
}

function buildContextString(ctx: MessageCtx, intent: Intent): Record<string, any> {
  return {
    language: ctx.language === "bn" ? "Bengali" : ctx.language === "en" ? "English" : "Bengali with English mix",
    customerName: ctx.name || "Valued Customer",
    customerPhone: ctx.phone,
    customerRole: ctx.role === "customer" ? "potential member" : ctx.role === "worker" ? "registered member" : "admin",
    mood: ctx.mood,
    dialect: ctx.dialect || "standard Bengali",
    religion: ctx.religion || "not specified",
    funnelStage: ctx.funnelStage || "general",
    totalChats: String(ctx.totalChats),
    painPoints: ctx.painPoints?.join(", ") || "not identified",
    interests: ctx.interests?.join(", ") || "not identified",
    isWorker: String(ctx.isWorker),
    context: `Previous conversation count: ${ctx.totalChats}. Customer mood: ${ctx.mood}. ` +
      (ctx.dialect ? `Dialect: ${ctx.dialect}. ` : "") +
      (ctx.religion ? `Religion: ${ctx.religion}. ` : "") +
      (ctx.funnelStage ? `Funnel stage: ${ctx.funnelStage}. ` : ""),
  };
}

export async function processMessage(ctx: MessageCtx): Promise<BrainResult> {
  const start = Date.now();
  const fallbackDept: DepartmentId = ctx.isWorker ? "member_success" : "sales";

  const { intent, department } = await detectIntent(ctx.text, ctx, fallbackDept);

  const selectedAgents = selectAgents(department, intent, ctx);
  const contextVars = buildContextString(ctx, intent);

  const dept = DEPARTMENTS[department];
  let mainModel = dept.primaryModel;

  let primarySystemPrompt = `You are a ${dept.name} specialist at Jobayer Group Career.\n`;
  primarySystemPrompt += `Department: ${dept.nameBn}\n`;
  primarySystemPrompt += `Your role: ${dept.description}\n\n`;
  primarySystemPrompt += `## Context\n`;
  for (const [key, val] of Object.entries(contextVars)) {
    primarySystemPrompt += `${key}: ${val}\n`;
  }
  primarySystemPrompt += `\n## Expert Inputs\n`;

  const agentOutputs: string[] = [];
  const agentsUsed: string[] = [];

  for (const agent of selectedAgents) {
    try {
      const agentPrompt = buildAgentPrompt(agent, contextVars);
      const output = await executeAgent(agent, agentPrompt, ctx.text);
      agentOutputs.push(`[${agent.name}]: ${output.text}`);
      agentsUsed.push(agent.id);
      if (agent.tier <= 2) {
        mainModel = agent.primaryModel;
      }
    } catch {
      agentOutputs.push(`[${agent.name}]: (not available)`);
    }
  }

  primarySystemPrompt += agentOutputs.join("\n");
  primarySystemPrompt += `\n\n## Your Task\nRespond to the customer's message professionally in ${contextVars.language === "Bengali" ? "Bengali" : "English"}. Use the expert inputs above. Be helpful, warm, and persuasive when appropriate. Keep response under 400 words. If this is a complaint, be empathetic first. If this is a purchase intent, guide toward the next step.`;

  try {
    const result = await callAI(
      { messages: [{ role: "system", content: primarySystemPrompt }, { role: "user", content: ctx.text }] },
      600, mainModel, "openrouter"
    );

    return {
      text: result.text,
      model: result.model,
      tokens: result.tokens,
      agentsUsed,
      department,
      intent,
      ms: Date.now() - start,
    };
  } catch (e) {
    const fallbackResult = await callAI(
      { messages: [{ role: "system", content: `You are a helpful Jobayer Group Career assistant. Reply in ${contextVars.language === "Bengali" ? "Bengali" : "English"}. Keep it warm and professional.` }, { role: "user", content: ctx.text }] },
      400, "gpt-4o-mini", "openrouter"
    );

    return {
      text: fallbackResult.text,
      model: fallbackResult.model,
      tokens: fallbackResult.tokens,
      agentsUsed: ["fallback"],
      department,
      intent,
      ms: Date.now() - start,
    };
  }
}
