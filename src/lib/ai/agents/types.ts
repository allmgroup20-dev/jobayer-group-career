export interface Agent {
  id: number;
  agent_id: string;
  name_bn: string;
  name_en: string;
  level: number;
  sector: string | null;
  parent_agent_id: string | null;
  status: "idle" | "active" | "error" | "disabled";
  model_id: string | null;
  provider: string;
  cron_interval: number;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentTask {
  id: number;
  agent_id: string;
  task_type: "research" | "analyze" | "synthesize" | "report" | "submit";
  status: "pending" | "running" | "completed" | "failed";
  input_data: string | null;
  output_data: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AgentSubmission {
  id: number;
  from_agent_id: string;
  to_agent_id: string;
  submission_type: "research" | "analysis" | "synthesis" | "report" | "recommendation";
  title_bn: string | null;
  content: string | null;
  status: "pending" | "reviewed" | "approved" | "rejected";
  reviewed_at: string | null;
  created_at: string;
}

export interface AgentReport {
  id: number;
  agent_id: string;
  title_bn: string | null;
  summary_bn: string | null;
  findings: string | null;
  recommendations: string | null;
  metrics: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface AgentLog {
  id: number;
  agent_id: string;
  action: string;
  detail_bn: string | null;
  metadata: string | null;
  created_at: string;
}

export interface ResearchResult {
  summary: string;
  challenges: string[];
  whats_working: string[];
  recommendations: string[];
  urgent_action: string;
  metrics: Record<string, number>;
}

export interface AgentTreeNode {
  agent: Agent;
  children: AgentTreeNode[];
  latestReport?: AgentReport | null;
  pendingSubmissions?: number;
}

export interface AgentStats {
  total: number;
  active: number;
  idle: number;
  error: number;
  disabled: number;
  totalReports: number;
  totalSubmissions: number;
}

export interface GlobalAgentConfig {
  id: number;
  mode: "auto" | "provider" | "model";
  provider: string | null;
  modelId: string | null;
  updatedAt: string | null;
}

export interface RunResult {
  success: boolean;
  agent_id: string;
  task_id?: number;
  report_id?: number;
  error?: string;
}

export const AGENT_LEVEL_LABELS: Record<number, { bn: string; en: string }> = {
  1: { bn: "সেক্টর এজেন্ট", en: "Sector Agent" },
  2: { bn: "ডোমেইন এজেন্ট", en: "Domain Agent" },
  3: { bn: "প্রধান এজেন্ট", en: "Senior Agent" },
};

export const SECTOR_KEYWORDS: Record<string, string[]> = {
  student: ["ছাত্র", "ছাত্রী", "student", "কলেজ", "বিদ্যালয়", "বিশ্ববিদ্যালয়", "পড়াশোনা", "পাশ", "পরীক্ষা", "স্কুল"],
  homemaker: ["গৃহিণী", "housewife", "বাসায়", "বাসায়", "ঘরে", "সংসার", "বিয়ে", "বউ", "স্ত্রী"],
  job_holder: ["চাকরি", "job", "private", "govt", "ব্যাংক", "অফিস", "স্যার", "চাকরিজীবী", "প্রাইভেট"],
  business_owner: ["ব্যবসা", "business", "দোকান", "invest", "ROI", "investment", "বিনিয়োগ", "উদ্যোক্তা"],
  freelancer: ["freelance", "fiverr", "upwork", "freelancing", "আউটসোর্স", "outsource", "ফ্রিল্যান্স"],
  unemployed: ["বেকার", "কাজ নেই", "unemployed", "job lagbe", "চাকরি চাই", "job চাই", "income দরকার"],
  rural: ["গাঁও", "গাঁয়ে", "গ্রাম", "মফস্বল", "union", "rural", "গ্রামীণ", "গাঁয়ের"],
  urban_educated: ["ঢাকা", "dhaka", "urban", "engineer", "ডাক্তার", "ইংরেজি", "english", "graduate", "ডিগ্রি"],
};
