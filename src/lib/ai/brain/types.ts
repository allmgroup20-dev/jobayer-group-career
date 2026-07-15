export type Intent =
  | "greeting" | "farewell" | "product_inquiry" | "price_inquiry"
  | "purchase" | "registration" | "support" | "complaint"
  | "feedback" | "referral" | "commission_inquiry" | "withdrawal"
  | "training" | "motivation" | "general" | "unknown";

export type DepartmentId =
  | "sales" | "member_success" | "customer_experience"
  | "operations" | "business_intelligence" | "psychology"
  | "platform_admin";

export interface AgentDef {
  id: string;
  name: string;
  nameBn: string;
  department: DepartmentId;
  team: string;
  description: string;
  descriptionBn: string;
  expertise: string;
  promptTemplate: string;
  primaryModel: string;
  fallbackModels: string[];
  tier: 1 | 2 | 3 | 4;
  priority: number;
  when: string;
}

export interface TeamDef {
  id: string;
  name: string;
  nameBn: string;
  department: DepartmentId;
  description: string;
  agents: AgentDef[];
  primaryModel: string;
  fallbackModels: string[];
}

export interface DepartmentDef {
  id: DepartmentId;
  name: string;
  nameBn: string;
  icon: string;
  description: string;
  teams: TeamDef[];
  primaryModel: string;
  fallbackModels: string[];
}

export interface MessageCtx {
  phone: string;
  text: string;
  name?: string;
  role: "customer" | "worker" | "admin";
  language: string;
  mood: string;
  dialect?: string;
  religion?: string;
  funnelStage?: string;
  totalChats: number;
  painPoints: string[];
  interests: string[];
  isWorker: boolean;
}

export interface BrainResult {
  text: string;
  model: string;
  tokens: number;
  agentsUsed: string[];
  department: DepartmentId;
  intent: Intent;
  ms: number;
}

export interface AgentOutput {
  agentId: string;
  text: string;
  model: string;
  tokens: number;
}
