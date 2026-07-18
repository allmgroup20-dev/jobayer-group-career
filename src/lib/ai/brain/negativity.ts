import { query, queryFirst, execute, batch } from "@/lib/db/queries";
import { findAgent } from "./registry/index";

interface NegativityPattern {
  id: number;
  triggerWord: string;
  category: string;
  severity: number;
  contextNotes: string;
  alternativeWording: string;
  detectedCount: number;
  lastDetectedAt: string | null;
  createdAt: string;
}

interface NegativityDetection {
  id: number;
  phone: string;
  conversationText: string;
  matchedPattern: string;
  category: string;
  severity: number;
  intent: string;
  department: string;
  agentAdvice: string;
  createdAt: string;
}

interface NegativityKnowledge {
  id: number;
  topic: string;
  triggerWords: string;
  sentimentAnalysis: string;
  safeApproach: string;
  unsafePhrases: string;
  recommendedWording: string;
  severity: number;
  detectionCount: number;
  lastUpdated: string;
}

interface DynamicEmployee {
  id: number;
  parentEmployeeId: string;
  employeeId: string;
  name: string;
  nameBn: string;
  description: string;
  expertise: string;
  promptTemplate: string;
  primaryModel: string;
  status: string;
  createdAt: string;
}

export async function getAllPatterns(env: { DB: D1Database }): Promise<NegativityPattern[]> {
  const rows = await query<Record<string, any>>(env, "SELECT id, trigger_word, category, severity, context_notes, alternative_wording, detected_count, last_detected_at, created_at FROM negativity_patterns ORDER BY severity DESC, detected_count DESC");
  return rows.map((r: any) => ({
    id: r.id, triggerWord: r.trigger_word, category: r.category,
    severity: r.severity, contextNotes: r.context_notes,
    alternativeWording: r.alternative_wording, detectedCount: r.detected_count,
    lastDetectedAt: r.last_detected_at, createdAt: r.created_at,
  }));
}

export async function addPattern(env: { DB: D1Database }, data: { triggerWord: string; category: string; severity: number; contextNotes?: string; alternativeWording?: string }) {
  return execute(
    env,
    `INSERT INTO negativity_patterns (trigger_word, category, severity, context_notes, alternative_wording) VALUES (?, ?, ?, ?, ?)`,
    [data.triggerWord, data.category, data.severity, data.contextNotes || "", data.alternativeWording || ""],
  );
}

export async function deletePattern(env: { DB: D1Database }, id: number) {
  return execute(env, "DELETE FROM negativity_patterns WHERE id = ?", [id]);
}

export async function getDetections(env: { DB: D1Database }, limit = 50): Promise<NegativityDetection[]> {
  const rows = await query<Record<string, any>>(env, "SELECT id, phone, conversation_text, matched_pattern, category, severity, intent, department, agent_advice, created_at FROM negativity_detections ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows.map((r: any) => ({
    id: r.id, phone: r.phone, conversationText: r.conversation_text,
    matchedPattern: r.matched_pattern, category: r.category,
    severity: r.severity, intent: r.intent, department: r.department,
    agentAdvice: r.agent_advice, createdAt: r.created_at,
  }));
}

export async function logDetection(env: { DB: D1Database }, data: { phone: string; conversationText?: string; matchedPattern?: string; category?: string; severity?: number; intent?: string; department?: string; agentAdvice?: string }) {
  return execute(
    env,
    `INSERT INTO negativity_detections (phone, conversation_text, matched_pattern, category, severity, intent, department, agent_advice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.phone, data.conversationText || "", data.matchedPattern || "", data.category || "", data.severity || 3, data.intent || "", data.department || "", data.agentAdvice || ""],
  );
}

export async function getKnowledgeBase(env: { DB: D1Database }): Promise<NegativityKnowledge[]> {
  const rows = await query<Record<string, any>>(env, "SELECT id, topic, trigger_words, sentiment_analysis, safe_approach, unsafe_phrases, recommended_wording, severity, detection_count, last_updated FROM negativity_knowledge ORDER BY detection_count DESC");
  return rows.map((r: any) => ({
    id: r.id, topic: r.topic, triggerWords: r.trigger_words,
    sentimentAnalysis: r.sentiment_analysis, safeApproach: r.safe_approach,
    unsafePhrases: r.unsafe_phrases, recommendedWording: r.recommended_wording,
    severity: r.severity, detectionCount: r.detection_count, lastUpdated: r.last_updated,
  }));
}

export async function getDynamicEmployees(env: { DB: D1Database }, status?: string): Promise<DynamicEmployee[]> {
  let rows: any[];
  if (status) {
    rows = await query<Record<string, any>>(env, "SELECT id, parent_employee_id, employee_id, name, name_bn, description, expertise, prompt_template, primary_model, status, created_at FROM dynamic_employees WHERE status = ? ORDER BY created_at DESC", [status]);
  } else {
    rows = await query<Record<string, any>>(env, "SELECT id, parent_employee_id, employee_id, name, name_bn, description, expertise, prompt_template, primary_model, status, created_at FROM dynamic_employees ORDER BY created_at DESC");
  }
  return rows.map((r: any) => ({
    id: r.id, parentEmployeeId: r.parent_employee_id, employeeId: r.employee_id,
    name: r.name, nameBn: r.name_bn, description: r.description,
    expertise: r.expertise, promptTemplate: r.prompt_template,
    primaryModel: r.primary_model, status: r.status, createdAt: r.created_at,
  }));
}

export async function createDynamicEmployee(env: { DB: D1Database }, data: { parentEmployeeId: string; employeeId: string; name: string; nameBn?: string; description?: string; expertise?: string; promptTemplate?: string; primaryModel?: string }) {
  return execute(
    env,
    `INSERT INTO dynamic_employees (parent_employee_id, employee_id, name, name_bn, description, expertise, prompt_template, primary_model) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.parentEmployeeId, data.employeeId, data.name, data.nameBn || "", data.description || "", data.expertise || "", data.promptTemplate || "", data.primaryModel || "llama-3.3-70b"],
  );
}

export async function deleteDynamicEmployee(env: { DB: D1Database }, employeeId: string) {
  return execute(env, "UPDATE dynamic_employees SET status = 'deleted', deleted_at = datetime('now') WHERE employee_id = ?", [employeeId]);
}

export async function getEmployeeChainInfo(env: { DB: D1Database }, employeeId: string): Promise<DynamicEmployee[]> {
  const children = await query<Record<string, any>>(
    env,
    "SELECT id, parent_employee_id, employee_id, name, name_bn, description, expertise, prompt_template, primary_model, status, created_at FROM dynamic_employees WHERE parent_employee_id = ? AND status = 'active' ORDER BY created_at DESC",
    [employeeId],
  );
  return children.map((r: any) => ({
    id: r.id, parentEmployeeId: r.parent_employee_id, employeeId: r.employee_id,
    name: r.name, nameBn: r.name_bn, description: r.description,
    expertise: r.expertise, promptTemplate: r.prompt_template,
    primaryModel: r.primary_model, status: r.status, createdAt: r.created_at,
  }));
}
