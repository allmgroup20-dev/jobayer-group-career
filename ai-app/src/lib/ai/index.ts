export { callAI } from "./router";
export { buildSystemPrompt } from "./prompts";
export { getPersona, releasePersona } from "./persona";
export { analyzePainPoints, analyzeInterests, detectLanguage, detectMood, detectDialect, detectReligion, detectTrustLevel, detectControlResistance, detectManipulationVulnerability, detectFearProfile, detectMaskStatus, detectDecisionMode, detectSpendStyle, extractKeywords } from "./analyzer";
export { getOrCreateProfile, updateProfileScore, updateProfileFromChat, updateProfileTrust, updateProfileCommunication, updateProfileLife, buildLifeProfileContext } from "./profiler";
export { findSkill, saveSkill } from "./skills";
export { getHistory, saveMessage } from "./history";
export { isWorkerPhone, getWorkerByPhone, getWorkerPremiumStatus } from "./worker-detection";
export { getOrCreateLead, updateLeadStatus, getLeads, getLeadStats } from "./leads";
export { consolidateSkills } from "./skill-consolidation";
export { fastLane } from "./fast-lane";
export { getSimilarUserContext } from "./cross-user-learning";
export type { Mood, Dialect, Religion, TrustLevel, ControlResistance, ManipulationVulnerability, FearProfile, MaskStatus, CommStyle, TrustReadiness, DecisionMode, SpendStyle } from "./analyzer";

// Premium Employee Brain
export { processMessage } from "./brain/orchestrator";
export { DEPARTMENTS, getAllDepartments, getDepartment, findAgent } from "./brain/registry";
export type { MessageCtx, BrainResult, Intent, DepartmentId, AgentDef, DepartmentDef, TeamDef } from "./brain/types";
