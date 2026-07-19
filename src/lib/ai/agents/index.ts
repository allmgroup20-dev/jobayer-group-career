export interface Agent {
  id: string;
  name: string;
  nameBn: string;
  level: number;
  type: "senior" | "domain" | "sector";
  status: "active" | "idle" | "error";
  sector: string;
  keywords: string[];
  prompt_template: string;
  model: string;
  interval_minutes: number;
  last_run: string | null;
  next_run: string | null;
  report_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentTreeNode {
  id: string;
  name: string;
  nameBn: string;
  level: number;
  type: "senior" | "domain" | "sector";
  status: "active" | "idle" | "error";
  children?: AgentTreeNode[];
  agents?: Agent[];
}

export interface AgentReport {
  id: number;
  agent_id: string;
  agent_name: string;
  type: "weekly" | "monthly" | "ad-hoc";
  summary: string;
  summary_bn: string;
  findings: string;
  recommendations: string;
  data_points: string;
  status: "draft" | "submitted" | "reviewed";
  submitted_at: string;
  created_at: string;
}

export interface AgentSubmission {
  id: number;
  agent_id: string;
  agent_name: string;
  sector: string;
  content: string;
  content_bn: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export interface AgentLog {
  id: number;
  agent_id: string;
  agent_name: string;
  action: string;
  status: "success" | "error" | "running";
  message: string;
  duration_ms: number;
  created_at: string;
}

export interface AgentStats {
  total: number;
  active: number;
  idle: number;
  error: number;
  totalReports: number;
  totalSubmissions: number;
}

export interface GlobalAgentConfig {
  max_concurrent: number;
  default_interval: number;
  senior_model: string;
  domain_model: string;
  sector_model: string;
  auto_run: boolean;
  enabled: boolean;
}
