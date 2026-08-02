export type TriggerType =
  | "message_received"
  | "lead_score_changed"
  | "lead_created"
  | "purchase_completed"
  | "registration_completed"
  | "inactivity"
  | "emotion_shift"
  | "campaign_completed"
  | "scheduled"
  | "retention_risk"
  | "referral_made"
  | "goal_achieved";

export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "and" | "or";

export type ActionType =
  | "send_whatsapp"
  | "send_email"
  | "send_sms"
  | "create_task"
  | "update_lead"
  | "assign_agent"
  | "wait"
  | "trigger_workflow"
  | "log_event"
  | "notify_admin";

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  conditions?: WorkflowCondition[];
}

export interface WorkflowAction {
  type: ActionType;
  config: Record<string, unknown>;
  continueOnError?: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  nextSteps?: string[];
  timeoutMs?: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  trigger: TriggerType;
  triggerConfig?: Record<string, unknown>;
  steps: WorkflowStep[];
  isActive: boolean;
  priority: number;
  cooldownMinutes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: number;
  workflowId: string;
  triggerEvent: string;
  contextJson: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  currentStep: string | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface EmailConfig {
  provider: "sendgrid" | "smtp";
  apiKey?: string;
  fromName: string;
  fromEmail: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  subjectBn: string;
  htmlBody: string;
  htmlBodyBn: string;
  category: string;
}

export interface FunnelEvent {
  id: number;
  phone: string;
  stage: string;
  event: string;
  metadata: string | null;
  created_at: string;
}

export interface FunnelAnalytics {
  stage: string;
  count: number;
  conversionRate: number;
  avgTimeInStage: number;
}
