export { callAI } from "./router";
export { buildSystemPrompt } from "./prompts";
export { getPersona, releasePersona } from "./persona";
export { analyzePainPoints, analyzeInterests, detectLanguage, detectMood, detectDialect, detectReligion, extractKeywords } from "./analyzer";
export { getOrCreateProfile, updateProfileScore, updateProfileFromChat } from "./profiler";
export { findSkill, saveSkill } from "./skills";
export { getHistory, saveMessage } from "./history";
export { getKnowledgeContext } from "./knowledge";
export { isWorkerPhone, getWorkerByPhone, getWorkerPremiumStatus } from "./worker-detection";
export { getOrCreateLead, updateLeadStatus, getLeads, getLeadStats } from "./leads";
export { consolidateSkills } from "./skill-consolidation";
export { getSimilarUserContext } from "./cross-user-learning";
export type { Mood, Dialect, Religion } from "./analyzer";

// Premium Employee Brain
export { processMessage } from "./brain/orchestrator";
export { DEPARTMENTS, getAllDepartments, getDepartment, findAgent } from "./brain/registry";
export type { MessageCtx, BrainResult, Intent, DepartmentId, AgentDef, DepartmentDef, TeamDef } from "./brain/types";
