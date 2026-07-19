import { callAI } from "../router";
import { executeAgent, buildAgentPrompt } from "./executor";
import { DEPARTMENTS, getAgentsByDepartment, findAgent } from "./registry";
import type { Intent, DepartmentId, MessageCtx, BrainResult, AgentDef, CrossDeptStep, AgentSeniorReview } from "./types";
import { getConversationRules } from "../conversation-rules";
import { getMemory, setMemory, buildMemoryContext } from "./memory";
import { getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";
import { getActivePromptOverride } from "./agent-tuning";

// ── Intent → Department routing ──
const INTENT_ROUTES: { intent: Intent; department: DepartmentId }[] = [
  { intent: "greeting", department: "customer_experience" },
  { intent: "farewell", department: "customer_experience" },
  { intent: "product_inquiry", department: "sales" },
  { intent: "price_inquiry", department: "sales" },
  { intent: "purchase", department: "sales" },
  { intent: "registration", department: "member_success" },
  { intent: "support", department: "customer_experience" },
  { intent: "complaint", department: "psychology" },
  { intent: "feedback", department: "customer_experience" },
  { intent: "referral", department: "sales" },
  { intent: "commission_inquiry", department: "member_success" },
  { intent: "withdrawal", department: "operations" },
  { intent: "training", department: "member_success" },
  { intent: "motivation", department: "psychology" },
  { intent: "general", department: "sales" },
  // Negativity detection runs alongside every intent via the negativity_scan chain
];

// ── Negativity detection chains (run alongside every intent) ──
export const NEGATIVITY_CHAINS: Record<string, string[]> = {
  negativity_scan: ["mlm_trigger_detector", "recruitment_trigger_detector", "money_trigger_detector", "sentiment_negativity_scanner", "trust_barrier_identifier"],
  negativity_advisory: ["safe_wording_advisor", "cultural_sensitivity_checker"],
  negativity_knowledge: ["negativity_insight_miner"],
};

// ── Single-department sequential chains ──
export const CHAINS: Record<string, string[]> = {
  "sales_purchase": ["lead_scanner", "lead_scorer", "product_matcher", "price_explainer", "trust_objection_handler", "trial_closer", "payment_link_sender", "confirmation_sender"],
  "sales_price_inquiry": ["lead_scanner", "lead_classifier", "price_explainer", "price_objection_handler", "discount_closer", "installment_closer"],
  "sales_product_inquiry": ["lead_scanner", "lead_classifier", "product_matcher", "benefit_highlighter", "comparison_builder", "social_proof_injector", "urgency_creator"],
  "sales_referral": ["referral_explainer", "social_proof_injector", "referral_closer"],
  "sales_general": ["lead_scanner", "followup_scheduler", "re_engagement_trigger"],
  "member_success_registration": ["registration_guide", "welcome_pack_sender", "first_goal_setter", "profile_completer", "tree_placer"],
  "member_success_training": ["skill_gap_analyzer", "personalized_training_plan", "course_recommender", "quiz_generator", "progress_tracker", "certification_issuer"],
  "member_success_commission_inquiry": ["commission_calculator", "earning_reporter", "payout_optimizer"],
  "member_success_motivation": ["daily_motivation_sender", "achievement_celebrator", "competition_creator"],
  "member_success_general": ["query_resolver", "policy_explainer", "escalation_handler"],
  "customer_experience_greeting": ["greeting_personalizer", "rapport_builder"],
  "customer_experience_farewell": ["greeting_personalizer"],
  "customer_experience_support": ["faq_responder", "order_status_checker", "payment_issue_resolver", "delivery_tracker", "return_exchange_handler", "refund_processor"],
  "customer_experience_complaint": ["complaint_listener", "root_cause_finder", "solution_crafter", "satisfaction_restorer"],
  "customer_experience_feedback": ["feedback_collector", "sentiment_analyzer", "improvement_suggester", "nps_calculator"],
  "operations_withdrawal": ["withdrawal_validator", "withdrawal_approver", "payment_sender", "withdrawal_notifier"],
  "operations_order_status": ["order_creator", "order_verifier", "invoice_generator", "order_notifier"],
  "operations_payment": ["sslcommerz_initiator", "ipn_validator", "payment_status_checker", "refund_initiator", "fraud_detector"],
  "operations_general": ["order_status_checker", "payment_status_checker"],
  "psychology_complaint": ["mood_detector", "empathy_expresser", "frustration_calmer", "trust_builder", "complaint_listener", "root_cause_finder"],
  "psychology_motivation": ["mood_detector", "confidence_booster", "excitement_amplifier", "future_pacing_agent", "goal_achievement_coach"],
  "psychology_objection": ["personality_classifier", "comm_style_identifier", "rapport_builder", "reframing_agent", "reciprocity_trigger", "authority_builder", "social_proof_amplifier"],
  "psychology_general": ["mood_detector", "rapport_builder", "empathy_expresser"],
};

// ══════════════════════════════════════════════════════════════
// CROSS-DEPARTMENT CHAINS — agents from multiple depts collaborate
// ══════════════════════════════════════════════════════════════
export const CROSS_DEPT_CHAINS: Record<string, CrossDeptStep[]> = {
  // Full customer journey: from greeting → profiling → sales → ops → member success
  new_customer_full: [
    { department: "customer_experience", agentId: "greeting_personalizer" },
    { department: "psychology", agentId: "mood_detector" },
    { department: "psychology", agentId: "personality_classifier" },
    { department: "psychology", agentId: "comm_style_identifier" },
    { department: "psychology", agentId: "religion_detector" },
    { department: "psychology", agentId: "dialect_identifier" },
    { department: "customer_experience", agentId: "tone_adjuster" },
    { department: "psychology", agentId: "rapport_builder" },
    { department: "sales", agentId: "lead_scanner" },
    { department: "psychology", agentId: "trust_builder" },
    { department: "psychology", agentId: "reciprocity_trigger" },
    { department: "sales", agentId: "product_matcher" },
    { department: "sales", agentId: "price_explainer" },
    { department: "psychology", agentId: "reframing_agent" },
    { department: "psychology", agentId: "future_pacing_agent" },
    { department: "sales", agentId: "trust_objection_handler" },
    { department: "psychology", agentId: "social_proof_amplifier" },
    { department: "sales", agentId: "trial_closer" },
    { department: "sales", agentId: "payment_link_sender" },
    { department: "operations", agentId: "order_creator" },
    { department: "operations", agentId: "order_verifier" },
    { department: "member_success", agentId: "welcome_pack_sender" },
    { department: "member_success", agentId: "first_goal_setter" },
    { department: "member_success", agentId: "achievement_celebrator" },
    { department: "customer_experience", agentId: "feedback_collector" },
  ],

  // Complaint resolution: psychology → CX → operations → member success
  complaint_full: [
    { department: "psychology", agentId: "mood_detector" },
    { department: "psychology", agentId: "empathy_expresser" },
    { department: "psychology", agentId: "frustration_calmer" },
    { department: "negativity_detection", agentId: "complaint_listener" },
    { department: "negativity_detection", agentId: "root_cause_finder" },
    { department: "operations", agentId: "order_status_checker" },
    { department: "operations", agentId: "payment_issue_resolver" },
    { department: "negativity_detection", agentId: "solution_crafter" },
    { department: "psychology", agentId: "trust_builder" },
    { department: "customer_experience", agentId: "satisfaction_restorer" },
    { department: "member_success", agentId: "satisfaction_restorer" },
  ],

  // New member onboarding: member success → psychology → BI
  new_member_onboarding: [
    { department: "member_success", agentId: "registration_guide" },
    { department: "member_success", agentId: "welcome_pack_sender" },
    { department: "member_success", agentId: "first_goal_setter" },
    { department: "psychology", agentId: "confidence_booster" },
    { department: "psychology", agentId: "goal_achievement_coach" },
    { department: "psychology", agentId: "community_builder" },
    { department: "member_success", agentId: "skill_gap_analyzer" },
    { department: "member_success", agentId: "personalized_training_plan" },
  ],

  // Performance review: member success → psychology
  performance_review: [
    { department: "member_success", agentId: "sales_tracker" },
    { department: "member_success", agentId: "kpi_reporter" },
    { department: "member_success", agentId: "top_performer_identifier" },
    { department: "member_success", agentId: "underperformer_detector" },
    { department: "psychology", agentId: "confidence_booster" },
    { department: "psychology", agentId: "mindset_shifter" },
    { department: "psychology", agentId: "goal_achievement_coach" },
  ],
};

// ── Intent triggers for cross-dept chains ──
const CROSS_DEPT_TRIGGERS: Record<string, (intent: Intent, ctx: MessageCtx) => boolean> = {
  new_customer_full: (intent) => ["product_inquiry", "price_inquiry", "purchase", "greeting", "general"].includes(intent),
  complaint_full: (intent) => intent === "complaint",
  new_member_onboarding: (intent) => intent === "registration",
  performance_review: (intent) => ["commission_inquiry", "training", "general"].includes(intent),
};

const DEPT_INTENT_PROMPTS: Record<DepartmentId, string> = {
  sales: "Classify the intent. Choose ONE: product_inquiry (asking about products/services), price_inquiry (asking about price/cost/value), purchase (ready to buy/pay), referral (asking about referral/team), general (other sales related), unknown.",
  member_success: "Classify the intent. Choose ONE: registration (wants to join/register), commission_inquiry (asking about commission/earnings), training (asking about training/learning), motivation (needs encouragement), general, unknown.",
  customer_experience: "Classify the intent. Choose ONE: greeting (hello/hi/assalamu alaikum), farewell (bye/okay/thanks), support (help/issue/problem), complaint (angry/upset/dissatisfied), feedback (suggestion/opinion/review), general, unknown.",
  operations: "Classify the intent. Choose ONE: withdrawal (want to withdraw money), order_status (asking about order), payment (payment issue), general, unknown.",
  psychology: "Classify the intent. Choose ONE: complaint (angry/frustrated/scam fear), motivation (needs encouragement/demotivated), objection (hesitant/doubting), general, unknown.",
  negativity_detection: "Classify the intent. Choose ONE: negativity_scan (always run alongside other intents), general, unknown.",
};

async function detectIntent(text: string, ctx: MessageCtx, fallbackDept: DepartmentId): Promise<{ intent: Intent; department: DepartmentId }> {
  const depts: DepartmentId[] = ["sales", "psychology", "customer_experience", "member_success", "operations", "negativity_detection"];

  for (const deptId of depts) {
    try {
      const result = await callAI(
        {
          messages: [
            { role: "system", content: DEPT_INTENT_PROMPTS[deptId] },
            { role: "user", content: `Message: "${text}"\nRole: ${ctx.role}\nLanguage: ${ctx.language}\nMood: ${ctx.mood}\nReturn only the intent word.` },
          ],
          temperature: 0.3,
        },
        50, "gemma-4-26b", "openrouter"
      );
      const intent = result.text.trim().toLowerCase() as Intent;
      const route = INTENT_ROUTES.find((r) => r.intent === intent);
      if (route) return { intent, department: route.department };
    } catch {}
  }
  return { intent: "general", department: fallbackDept };
}

function cleanJsonResponse(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
}

function buildContext(ctx: MessageCtx, intent: Intent, chainOutput?: string, userMemories?: any[]): Record<string, any> {
  const memoryStr = userMemories ? buildMemoryContext(userMemories) : "";
  return {
    language: ctx.language === "bn" ? "Bengali" : ctx.language === "en" ? "English" : "Bengali with English mix",
    customerName: ctx.name || "Valued Customer",
    customerPhone: ctx.phone,
    customerRole: ctx.role === "customer" ? "potential member" : ctx.role === "worker" ? "premium member" : "admin",
    memberTier: ctx.role === "customer" ? "not registered" : ctx.isPremium ? "premium" : "general",
    mood: ctx.mood,
    dialect: ctx.dialect || "standard Bengali",
    religion: ctx.religion || "not specified",
    totalChats: String(ctx.totalChats),
    painPoints: ctx.painPoints?.join(", ") || "not identified",
    interests: ctx.interests?.join(", ") || "not identified",
    userMemory: memoryStr,
    context: `Chats: ${ctx.totalChats}. Mood: ${ctx.mood}.` + (ctx.dialect ? ` Dialect: ${ctx.dialect}.` : "") + (ctx.religion ? ` Religion: ${ctx.religion}.` : "") + memoryStr,
    previousOutput: chainOutput || "",
  };
}

function getSingleChainKey(department: DepartmentId, intent: Intent): string {
  const key = `${department}_${intent}`;
  if (CHAINS[key]) return key;
  const fallback = `${department}_general`;
  if (CHAINS[fallback]) return fallback;
  return key;
}

function selectCrossDeptChain(intent: Intent, ctx: MessageCtx): CrossDeptStep[] | null {
  // Check if user volume is high enough (totalChats > 0 means returning user → skip full chain)
  if (ctx.totalChats > 2) return null;

  // Check complaint
  if (intent === "complaint") return CROSS_DEPT_CHAINS.complaint_full;
  if (intent === "registration") return CROSS_DEPT_CHAINS.new_member_onboarding;
  if (["product_inquiry", "price_inquiry", "purchase", "greeting"].includes(intent)) {
    if (ctx.isWorker) {
      if (ctx.isPremium) return CROSS_DEPT_CHAINS.performance_review;
      return CROSS_DEPT_CHAINS.new_member_onboarding;
    }
    return CROSS_DEPT_CHAINS.new_customer_full;
  }
  return null;
}

function selectSingleDeptAgents(department: DepartmentId, intent: Intent, ctx: MessageCtx): AgentDef[] {
  const chainKey = getSingleChainKey(department, intent);
  const agentIds = CHAINS[chainKey];
  if (agentIds && agentIds.length > 0) {
    return agentIds.map((id) => findAgent(id)?.agent).filter(Boolean) as AgentDef[];
  }
  const allAgents = getAgentsByDepartment(department);
  const candidates = allAgents.filter((a) => {
    try {
      const condition = a.when.replace("{{intent}}", `'${intent}'`).replace("{{role}}", `'${ctx.role}'`);
      return new Function("intent", "role", `return ${condition}`)(intent, ctx.role);
    } catch { return true; }
  });
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 3);
}

export async function processMessage(ctx: MessageCtx): Promise<BrainResult> {
  const start = Date.now();
  const fallbackDept: DepartmentId = ctx.isWorker ? "member_success" : "sales";

  // ── Global AI toggle check ──
  let db: any;
  let disabledAgents: Record<string, boolean> = {};
  try {
    db = await getDB();
    const gToggle = await query<{ setting_value: string }>(
      { DB: db },
      "SELECT setting_value FROM company_settings WHERE setting_key = 'ai_system_active'"
    );
    if (gToggle.length > 0 && gToggle[0].setting_value === "0") {
      return {
        text: ctx.language === "bn"
          ? "ক্ষমা করবেন, বর্তমানে AI সিস্টেমটি নিষ্ক্রিয় রয়েছে। দয়া করে পরে আবার চেষ্টা করুন।"
          : "Sorry, the AI system is currently disabled. Please try again later.",
        model: "system", tokens: 0, agentsUsed: [], departmentsUsed: [], department: "customer_experience",
        intent: "general", ms: Date.now() - start,         chainType: undefined,
      };
    }
    const disabledRows = await query<{ agent_id: string }>(
      { DB: db },
      "SELECT agent_id FROM brain_agent_config WHERE enabled = 0"
    );
    for (const r of disabledRows) disabledAgents[r.agent_id] = true;
  } catch {}

  const { intent, department } = await detectIntent(ctx.text, ctx, fallbackDept);

  // ── Greeting shortcut: skip 27-agent chain for simple greetings ──
  if (intent === "greeting" && ctx.totalChats <= 1) {
    const greetingResponse = ctx.language === "bn"
      ? `ওয়ালাইকুম আসসালাম! 👋 আমি Jobayer Group Career-এর সহকারী। কীভাবে সাহায্য করতে পারি?`
      : `Hi there! 👋 I'm your Jobayer Group Career assistant. How can I help you today?`;
    return {
      text: greetingResponse, model: "shortcut", tokens: 0,
      agentsUsed: [], departmentsUsed: [department], department,
      intent, ms: Date.now() - start, chainType: "single",
    };
  }

  // ── Load persistent memory for this user ──
  let userMemories: any[] = [];
  try {
    userMemories = await getMemory(db, ctx.phone);
  } catch {}

  // ── Try cross-department chain first ──
  const crossDeptSteps = selectCrossDeptChain(intent, ctx);
  const isCrossDept = crossDeptSteps !== null && crossDeptSteps.length > 0;

  const agentsUsed: string[] = [];
  const departmentsUsed: DepartmentId[] = [];
  let chainContext = "";

  if (isCrossDept && crossDeptSteps) {
    // Execute cross-department chain
    for (const step of crossDeptSteps) {
      if (disabledAgents[step.agentId]) {
        chainContext += `\n[${step.agentId}]: (disabled)`;
        continue;
      }
      const agentData = findAgent(step.agentId);
      if (!agentData) {
        chainContext += `\n[${step.agentId}]: (not found)`;
        continue;
      }
      const agent = agentData.agent;
      try {
        const contextVars = buildContext(ctx, intent, chainContext, userMemories);
        const promptOverride = db ? await getActivePromptOverride(db, agent.id).catch(() => null) : null;
        const agentPrompt = buildAgentPrompt(agent, contextVars, promptOverride || undefined);
        const output = await executeAgent(agent, agentPrompt, ctx.text, ctx.phone);
        chainContext += `\n[${agent.name} (${agentData.department})]\n${output.text}`;
        agentsUsed.push(agent.id);
        if (!departmentsUsed.includes(agentData.department)) {
          departmentsUsed.push(agentData.department);
        }
        // Write agent output to memory
        if (db) {
          setMemory(db, ctx.phone, agent.id, `last_${agent.id}`, output.text.slice(0, 500), "agent_output", 1, 1440).catch(() => {});
        }
      } catch {
        chainContext += `\n[${agent.name}]: (unavailable)`;
      }
    }
  } else {
    // Single-department chain
    const selectedAgents = selectSingleDeptAgents(department, intent, ctx);

    if (selectedAgents.length === 0) {
      const fb = await callAI(
        { messages: [{ role: "system", content: `You are a helpful Jobayer Group assistant. Reply in ${ctx.language === "bn" ? "Bengali" : "English"}.` }, { role: "user", content: ctx.text }], temperature: 0.3 },
        100, "gemma-4-26b", "openrouter"
      );
      return {
        text: fb.text, model: fb.model, tokens: fb.tokens,
        agentsUsed: ["fallback"], departmentsUsed: [department], department, intent, ms: Date.now() - start,
      };
    }

    for (const agent of selectedAgents) {
      if (disabledAgents[agent.id]) {
        chainContext += `\n[${agent.name}]: (disabled)`;
        continue;
      }
      try {
        const contextVars = buildContext(ctx, intent, chainContext, userMemories);
        const promptOverride = db ? await getActivePromptOverride(db, agent.id).catch(() => null) : null;
        const agentPrompt = buildAgentPrompt(agent, contextVars, promptOverride || undefined);
        const output = await executeAgent(agent, agentPrompt, ctx.text, ctx.phone);
        chainContext += `\n[${agent.name}]\n${output.text}`;
        agentsUsed.push(agent.id);
        // Write agent output to memory
        if (db) {
          setMemory(db, ctx.phone, agent.id, `last_${agent.id}`, output.text.slice(0, 500), "agent_output", 1, 1440).catch(() => {});
        }
      } catch {
        chainContext += `\n[${agent.name}]: (unavailable)`;
      }
    }
    departmentsUsed.push(department);
  }

  // ── Negativity Detection Scan (runs alongside every conversation) ──
  let negativityFindings = "";
  try {
    const negAgentIds = NEGATIVITY_CHAINS.negativity_scan;
    for (const agentId of negAgentIds) {
      if (disabledAgents[agentId]) continue;
      const agentData = findAgent(agentId);
      if (!agentData || agentData.department !== "negativity_detection") continue;
      const agent = agentData.agent;
      try {
        const contextVars = buildContext(ctx, intent, chainContext, userMemories);
        const promptOverride = db ? await getActivePromptOverride(db, agent.id).catch(() => null) : null;
        const agentPrompt = buildAgentPrompt(agent, contextVars, promptOverride || undefined);
        const output = await executeAgent(agent, agentPrompt, ctx.text, ctx.phone);
        if (output.text && !output.text.includes("[Service temporarily unavailable")) {
          negativityFindings += `\n[${agent.name}]: ${output.text}`;
          agentsUsed.push(agent.id);
          if (!departmentsUsed.includes("negativity_detection")) departmentsUsed.push("negativity_detection");
          if (db) {
            setMemory(db, ctx.phone, agent.id, `last_${agent.id}`, output.text.slice(0, 500), "agent_output", 1, 1440).catch(() => {});
          }
        }
      } catch {}
    }
  } catch {}

  // ── If negativity triggers found, run advisory agents ──
  let advisoryNotes = "";
  if (negativityFindings.length > 0) {
    try {
      const advisoryIds = NEGATIVITY_CHAINS.negativity_advisory;
      for (const agentId of advisoryIds) {
        const agentData = findAgent(agentId);
        if (!agentData) continue;
        const agent = agentData.agent;
        try {
          const ctxWithFindings = { ...buildContext(ctx, intent, chainContext, userMemories), previousOutput: chainContext, negativityFindings };
          const promptOverride = db ? await getActivePromptOverride(db, agent.id).catch(() => null) : null;
          const agentPrompt = buildAgentPrompt(agent, ctxWithFindings, promptOverride || undefined);
          const output = await executeAgent(agent, agentPrompt, ctx.text, ctx.phone);
          if (output.text && !output.text.includes("[Service temporarily unavailable")) {
            advisoryNotes += `\n[${agent.name}]: ${output.text}`;
            agentsUsed.push(agent.id);
            if (!departmentsUsed.includes("negativity_detection")) departmentsUsed.push("negativity_detection");
          }
        } catch {}
      }
    } catch {}
  }

  // ── Accumulate knowledge ──
  if (negativityFindings.length > 0 && db) {
    try {
      const kbAgentId = "negativity_insight_miner";
      const kbData = findAgent(kbAgentId);
      if (kbData) {
        const agent = kbData.agent;
        const ctxWithFindings = { ...buildContext(ctx, intent, chainContext, userMemories), previousOutput: chainContext, negativityFindings };
        const promptOverride = await getActivePromptOverride(db, agent.id).catch(() => null);
        const agentPrompt = buildAgentPrompt(agent, ctxWithFindings, promptOverride || undefined);
        const output = await executeAgent(agent, agentPrompt, ctx.text, ctx.phone);
        if (output.text && !output.text.includes("[Service temporarily unavailable")) {
          // Store insight in memory
          setMemory(db, ctx.phone, kbAgentId, `insight_${Date.now()}`, output.text.slice(0, 1000), "negativity_insight", 1, 43200).catch(() => {});
        }
      }
    } catch {}
  }

  const primaryDept = department;
  const finalDept = DEPARTMENTS[primaryDept];

  // ── Final composition ──
  const deptList = [...new Set(departmentsUsed)];
  const deptNames = deptList.map((d) => DEPARTMENTS[d]?.name).filter(Boolean).join(", ");

  const AGENT_SENIOR_PROMPT = `You are Agent Senior, the CEO-level quality reviewer at Jobayer Group Career.
Your job: review the drafted response for quality, Islamic values, Bengali culture, brand voice, and clarity.

Review criteria:
1. QUALITY (0-10): Is the response well-structured, clear, and helpful?
2. APPROPRIATENESS (pass/needs_rewrite/blocked): 
   - "pass" — good to send
   - "needs_rewrite" — fix tone, clarity, or missing info
   - "blocked" — contains haram, offensive, or dangerous content
3. ISSUES: List specific problems (empty array if none)
4. FEEDBACK: Brief improvement note
5. REWRITTEN: Only if needs_rewrite — provide the corrected version

Return valid JSON: { "quality": number, "appropriateness": "pass"|"needs_rewrite"|"blocked", "issues": string[], "feedback": string, "rewritten": string | null }`;

  const compositionPrompt = `You are a lead orchestrator at Jobayer Group Career.
Departments involved: ${deptNames}
Primary department: ${finalDept?.name} (${finalDept?.nameBn})
Chain type: ${isCrossDept ? "cross-department collaboration" : "single-department"}

## Context
${Object.entries(buildContext(ctx, intent)).map(([k, v]) => `${k}: ${v}`).join("\n")}

## Agent Chain Output
${chainContext}

## Your Task
Compose a final natural response to the customer in ${ctx.language === "bn" ? "Bengali" : "English"}.
Weave the agent outputs into one coherent, warm, helpful message.

${getConversationRules(ctx.language)}

If complaint → empathetic first. If purchase → guide to next step.`;

  let finalText: string;
  let finalModel: string;
  let finalTokens: number;
  let seniorReview: AgentSeniorReview | undefined;

  try {
    const result = await callAI(
      { messages: [{ role: "system", content: compositionPrompt }, { role: "user", content: ctx.text }], temperature: 0.3 },
       100, "llama-3.3-70b", "openrouter"
    );
    finalText = result.text;
    finalModel = result.model;
    finalTokens = result.tokens;
  } catch (e) {
    const fb = await callAI(
      { messages: [{ role: "system", content: `You are a helpful Jobayer Group assistant. Reply in ${ctx.language === "bn" ? "Bengali" : "English"}.` }, { role: "user", content: ctx.text }], temperature: 0.3 },
      100, "gemma-4-26b", "openrouter"
    );
    finalText = fb.text;
    finalModel = fb.model;
    finalTokens = fb.tokens;
  }

  // ── Agent Senior: CEO quality review (skip for new users to save time/tokens) ──
  if (ctx.totalChats > 2) {
  try {
    const reviewResponse = await callAI(
      {
          messages: [
            { role: "system", content: AGENT_SENIOR_PROMPT },
            { role: "user", content: `Draft response to review:\n\n${finalText}\n\nCustomer message: ${ctx.text}\nCustomer mood: ${ctx.mood}` },
          ],
          temperature: 0.3,
        },
        150, "llama-3.3-70b", "openrouter"
    );

    const parsed = JSON.parse(cleanJsonResponse(reviewResponse.text)) as {
      quality: number;
      appropriateness: "pass" | "needs_rewrite" | "blocked";
      issues: string[];
      feedback: string;
      rewritten: string | null;
    };

    seniorReview = {
      quality: parsed.appropriateness,
      score: parsed.quality,
      feedback: parsed.feedback,
      issues: parsed.issues || [],
      rewritten: parsed.rewritten || undefined,
    };

    if (parsed.appropriateness === "blocked") {
      finalText = `${ctx.language === "bn" ? "ক্ষমা করবেন, আমি এই বিষয়ে উত্তর দিতে পারছি না। একজন সিনিয়র এজেন্ট শীঘ্রই আপনার সাথে যোগাযোগ করবে।" : "I apologize, I cannot answer this. A senior agent will contact you shortly."}`;
    } else if (parsed.appropriateness === "needs_rewrite" && parsed.rewritten) {
      finalText = parsed.rewritten;
    }
  } catch {
    // Agent Senior unavailable — proceed with composed response
  }
  }

  // ── Persist memory for future sessions ──
  if (db) {
    setMemory(db, ctx.phone, "_meta", "last_intent", intent, "session", 2, 1440).catch(() => {});
    setMemory(db, ctx.phone, "_meta", "last_department", department, "session", 2, 1440).catch(() => {});
    setMemory(db, ctx.phone, "_meta", "last_mood", ctx.mood, "session", 1, 1440).catch(() => {});
    setMemory(db, ctx.phone, "_meta", "last_response", finalText.slice(0, 500), "session", 1, 1440).catch(() => {});
    if (ctx.name) {
      setMemory(db, ctx.phone, "_meta", "customer_name", ctx.name, "profile", 5, 43200).catch(() => {});
    }
    if (ctx.dialect) {
      setMemory(db, ctx.phone, "_meta", "dialect", ctx.dialect, "profile", 3, 43200).catch(() => {});
    }
  }

  return {
    text: finalText, model: finalModel, tokens: finalTokens,
    agentsUsed, departmentsUsed, department,
    intent, ms: Date.now() - start, chainType: isCrossDept ? "cross" : "single",
    seniorReview: seniorReview as AgentSeniorReview | undefined,
  };
}
