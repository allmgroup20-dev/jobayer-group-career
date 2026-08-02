import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import type { WorkflowDefinition, WorkflowExecution, WorkflowCondition, WorkflowAction, TriggerType } from "./types";

export async function ensureWorkflowTables(): Promise<void> {
  try {
    const db = await ensureDB();
    await db.prepare(`CREATE TABLE IF NOT EXISTS workflow_definitions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, name_bn TEXT, description TEXT,
      trigger_type TEXT NOT NULL, trigger_config TEXT, steps TEXT NOT NULL,
      is_active INTEGER DEFAULT 1, priority INTEGER DEFAULT 0,
      cooldown_minutes INTEGER DEFAULT 60, tags TEXT,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS workflow_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, workflow_id TEXT NOT NULL,
      trigger_event TEXT NOT NULL, context_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending', current_step TEXT,
      started_at TEXT DEFAULT (datetime('now')), completed_at TEXT, error TEXT
    )`).run();
    await db.prepare(`CREATE TABLE IF NOT EXISTS funnel_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL,
      stage TEXT NOT NULL, event TEXT NOT NULL, metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`).run();
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_funnel_phone ON funnel_events(phone)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_funnel_stage ON funnel_events(stage)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_workflow_exec_status ON workflow_executions(status)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_workflow_def_active ON workflow_definitions(is_active)").run().catch(() => {});
  } catch {}
}

export async function registerWorkflow(def: WorkflowDefinition): Promise<void> {
  const db = await ensureDB();
  await db.prepare(
    `INSERT OR REPLACE INTO workflow_definitions
     (id, name, name_bn, description, trigger_type, trigger_config, steps, is_active, priority, cooldown_minutes, tags, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(def.id, def.name, def.nameBn, def.description, def.trigger,
    def.triggerConfig ? JSON.stringify(def.triggerConfig) : null,
    JSON.stringify(def.steps), def.isActive ? 1 : 0, def.priority || 0,
    def.cooldownMinutes || 60, def.tags ? JSON.stringify(def.tags) : null
  ).run();
}

export async function getActiveWorkflows(trigger?: TriggerType): Promise<WorkflowDefinition[]> {
  const db = await ensureDB();
  let sql = "SELECT * FROM workflow_definitions WHERE is_active = 1";
  const params: unknown[] = [];
  if (trigger) { sql += " AND trigger_type = ?"; params.push(trigger); }
  sql += " ORDER BY priority DESC, created_at ASC";

  const rows = await query<any>({ DB: db }, sql, params);
  return rows.map((r: any) => ({
    id: r.id, name: r.name, nameBn: r.name_bn || r.name,
    description: r.description || "", trigger: r.trigger_type as TriggerType,
    triggerConfig: r.trigger_config ? JSON.parse(r.trigger_config) : undefined,
    steps: JSON.parse(r.steps || "[]"),
    isActive: r.is_active === 1, priority: r.priority || 0,
    cooldownMinutes: r.cooldown_minutes || 60,
    tags: r.tags ? JSON.parse(r.tags) : [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

export async function createExecution(
  workflowId: string, triggerEvent: string, context: Record<string, unknown>
): Promise<number> {
  const db = await ensureDB();
  const result = await db.prepare(
    "INSERT INTO workflow_executions (workflow_id, trigger_event, context_json, status) VALUES (?, ?, ?, 'pending')"
  ).bind(workflowId, triggerEvent, JSON.stringify(context)).run() as any;
  return result.meta?.last_row_id || 0;
}

export async function updateExecutionStatus(
  executionId: number, status: string, currentStep?: string, error?: string
): Promise<void> {
  const db = await ensureDB();
  const completedAt = (status === "completed" || status === "failed") ? ", completed_at = datetime('now')" : "";
  await db.prepare(
    `UPDATE workflow_executions SET status = ?, current_step = ?, error = ?${completedAt} WHERE id = ?`
  ).bind(status, currentStep || null, error || null, executionId).run();
}

export async function checkCooldown(workflowId: string, context: Record<string, unknown>): Promise<boolean> {
  const defs = await getActiveWorkflows();
  const def = defs.find((d) => d.id === workflowId);
  if (!def || def.cooldownMinutes <= 0) return true;

  const phone = (context as any)?.phone;
  if (!phone) return true;

  const db = await ensureDB();
  const recent = await db.prepare(
    `SELECT COUNT(*) as cnt FROM workflow_executions
     WHERE workflow_id = ? AND status = 'completed'
     AND context_json LIKE ?
     AND started_at >= datetime('now', ?)`
  ).bind(workflowId, `%"phone":"${phone}"%`, `-${def.cooldownMinutes} minutes`).first() as any;
  return !recent || recent.cnt === 0;
}

function evaluateCondition(condition: WorkflowCondition, context: Record<string, unknown>): boolean {
  if (condition.operator === "and" && condition.conditions) {
    return condition.conditions.every((c) => evaluateCondition(c, context));
  }
  if (condition.operator === "or" && condition.conditions) {
    return condition.conditions.some((c) => evaluateCondition(c, context));
  }
  const actual = context[condition.field];
  switch (condition.operator) {
    case "eq": return actual === condition.value;
    case "neq": return actual !== condition.value;
    case "gt": return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
    case "gte": return typeof actual === "number" && typeof condition.value === "number" && actual >= condition.value;
    case "lt": return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
    case "lte": return typeof actual === "number" && typeof condition.value === "number" && actual <= condition.value;
    case "contains": return typeof actual === "string" && typeof condition.value === "string" && actual.includes(condition.value as string);
    case "in": return Array.isArray(condition.value) && condition.value.includes(actual);
    default: return true;
  }
}

async function executeAction(action: WorkflowAction, context: Record<string, unknown>, executionId: number): Promise<boolean> {
  try {
    switch (action.type) {
      case "send_whatsapp": {
        const { sendMessage } = await import("@/lib/whatsapp/sender");
        const phone = context.phone as string;
        const text = (action.config.text || action.config.template) as string;
        if (phone && text) await sendMessage(phone, text);
        break;
      }
      case "send_email": {
        const { sendEmail } = await import("../email");
        const to = (action.config.to || context.email) as string;
        const subject = action.config.subject as string;
        const html = action.config.html as string;
        if (to && subject && html) await sendEmail({ to, subject, html });
        break;
      }
      case "send_sms": {
        const { sendSMS } = await import("../sms");
        const to = (action.config.to || context.phone) as string;
        const text = (action.config.text || action.config.template) as string;
        if (to && text) await sendSMS({ to, text });
        break;
      }
      case "create_task": {
        const db = await ensureDB();
        await db.prepare(
          "INSERT INTO workflow_executions (workflow_id, trigger_event, context_json, status) VALUES (?, ?, ?, 'pending')"
        ).bind("manual_task", action.config.title as string || "Manual task", JSON.stringify(context)).run();
        break;
      }
      case "wait": {
        const delayMs = (action.config.durationMs as number) || 60000;
        await new Promise((r) => setTimeout(r, delayMs));
        break;
      }
      case "log_event": {
        const phone = context.phone as string;
        const stage = (action.config.stage || "workflow") as string;
        const event = (action.config.event || action.type) as string;
        if (phone) await trackFunnelEvent(phone, stage, event, JSON.stringify(context));
        break;
      }
      default:
        console.warn(`[Workflow] Unknown action type: ${action.type}`);
    }
    return true;
  } catch (e) {
    console.error(`[Workflow] Action ${action.type} failed:`, (e as Error)?.message);
    return action.continueOnError || false;
  }
}

export async function executeWorkflow(workflow: WorkflowDefinition, context: Record<string, unknown>): Promise<void> {
  if (!await checkCooldown(workflow.id, context)) return;

  const executionId = await createExecution(workflow.id, workflow.trigger, context);
  await updateExecutionStatus(executionId, "running", workflow.steps[0]?.id);

  try {
    for (const step of workflow.steps) {
      await updateExecutionStatus(executionId, "running", step.id);

      if (step.conditions && !step.conditions.every((c) => evaluateCondition(c, context))) {
        continue;
      }

      for (const action of step.actions) {
        const ok = await executeAction(action, context, executionId);
        if (!ok && !action.continueOnError) {
          throw new Error(`Action ${action.type} failed at step ${step.id}`);
        }
      }
    }
    await updateExecutionStatus(executionId, "completed");
  } catch (e) {
    await updateExecutionStatus(executionId, "failed", undefined, (e as Error)?.message);
  }
}

export async function triggerWorkflows(trigger: TriggerType, context: Record<string, unknown>): Promise<void> {
  const workflows = await getActiveWorkflows(trigger);
  for (const wf of workflows) {
    executeWorkflow(wf, context).catch((e) =>
      console.error(`[Workflow] Error executing ${wf.id}:`, (e as Error)?.message)
    );
  }
}

export async function trackFunnelEvent(phone: string, stage: string, event: string, metadata?: string): Promise<void> {
  const db = await ensureDB();
  try {
    await db.prepare(
      "INSERT INTO funnel_events (phone, stage, event, metadata) VALUES (?, ?, ?, ?)"
    ).bind(phone, stage, event, metadata || null).run();
  } catch {}
}

export async function getFunnelEvents(phone: string, days: number = 30): Promise<{ stage: string; event: string; createdAt: string }[]> {
  const db = await ensureDB();
  const rows = await db.prepare(
    "SELECT stage, event, created_at FROM funnel_events WHERE phone = ? AND created_at >= datetime('now', ?) ORDER BY created_at ASC"
  ).bind(phone, `-${days} days`).all() as any;
  return (rows?.results || []).map((r: any) => ({ stage: r.stage, event: r.event, createdAt: r.created_at }));
}

export async function getDefaultWorkflows(): Promise<WorkflowDefinition[]> {
  return [
    {
      id: "wf_lead_scored_high", name: "High-score lead → warm handoff", nameBn: "উচ্চ স্কোর লিড → দ্রুত ফলোআপ",
      description: "When a lead scores > 70, send a personalized WhatsApp",
      trigger: "lead_score_changed", triggerConfig: { minScore: 70 },
      steps: [{
        id: "s1", name: "Send welcome WhatsApp",
        conditions: [{ field: "score", operator: "gte", value: 70 }],
        actions: [
          { type: "send_whatsapp", config: { template: "Hi {{name}}, I noticed you're interested in our programs. Would you like to know more?" } },
          { type: "log_event", config: { stage: "lead_scored", event: "high_score_outreach" } },
        ],
      }],
      isActive: true, priority: 10, cooldownMinutes: 1440, tags: ["lead", "automation"], createdAt: "", updatedAt: "",
    },
    {
      id: "wf_new_registration", name: "New member onboarding", nameBn: "নতুন সদস্য অনবোর্ডিং",
      description: "Send onboarding sequence to new members",
      trigger: "registration_completed",
      steps: [
        { id: "s1", name: "Welcome message", actions: [{ type: "send_whatsapp", config: { template: "Welcome to Jobayer Group Career! 🎉 Let's get you started." } }] },
        { id: "s2", name: "Send training invite", actions: [{ type: "send_email", config: { subject: "Your training portal is ready", html: "<h1>Welcome!</h1><p>Access your training at career.jobayergroup.com</p>" } }] },
      ],
      isActive: true, priority: 8, cooldownMinutes: 43200, tags: ["onboarding", "member"], createdAt: "", updatedAt: "",
    },
    {
      id: "wf_inactivity_3d", name: "Inactive member re-engagement", nameBn: "নিষ্ক্রিয় সদস্য পুনরায় যুক্তকরণ",
      description: "Re-engage members inactive for 3+ days",
      trigger: "inactivity", triggerConfig: { days: 3 },
      steps: [{ id: "s1", name: "Gentle reminder", actions: [{ type: "send_whatsapp", config: { template: "Hi {{name}}, we miss you! Check out our latest courses." } }] }],
      isActive: true, priority: 5, cooldownMinutes: 2880, tags: ["retention", "inactivity"], createdAt: "", updatedAt: "",
    },
  ];
}
