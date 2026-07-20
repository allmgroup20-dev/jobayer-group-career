"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface Model {
  model_id: string;
  name: string;
  tier: number;
  is_active: number;
  provider: string;
  exhausted: boolean;
}

interface ApiKey {
  id: number;
  key_value: string;
  provider: string;
  is_active: boolean;
  created_at: string;
}

interface FailoverState {
  exhausted_models: string;
  total_responses: number;
  today_responses: number;
}

const BRAIN_DEPARTMENTS = [
  { id: "sales", name: "Sales", nameBn: "সেলস" },
  { id: "psychology", name: "Psychology", nameBn: "মনোবিজ্ঞান" },
  { id: "platform_admin", name: "Platform Admin", nameBn: "প্ল্যাটফর্ম অ্যাডমিন" },
  { id: "operations", name: "Operations", nameBn: "অপারেশনস" },
  { id: "negativity_detection", name: "Negativity Detection", nameBn: "নেতিবাচকতা সনাক্তকরণ" },
  { id: "member_success", name: "Member Success", nameBn: "সদস্য সাফল্য" },
  { id: "customer_experience", name: "Customer Experience", nameBn: "গ্রাহক অভিজ্ঞতা" },
  { id: "business_intelligence", name: "Business Intelligence", nameBn: "বিজনেস ইন্টেলিজেন্স" },
] as const;

export default function AISettingsPage() {
  const { lang } = useLanguageStore();
  const [models, setModels] = useState<Model[]>([]);
  const [state, setState] = useState<FailoverState | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [newKeyProvider, setNewKeyProvider] = useState<"openrouter" | "opencode">("openrouter");
  const [msg, setMsg] = useState("");
  const [aiSystemActive, setAiSystemActive] = useState(true);
  const [disabledAgents, setDisabledAgents] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      const res = await fetch("/api/ai/settings");
      const data = await res.json() as {
        models?: Model[]; failoverState?: FailoverState;
        keys?: ApiKey[];
        aiSystemActive?: boolean;
        disabledAgents?: Record<string, boolean>;
      };
      if (data.models) setModels(data.models);
      if (data.failoverState) setState(data.failoverState);
      if (data.keys) setKeys(data.keys);
      if (data.aiSystemActive !== undefined) setAiSystemActive(data.aiSystemActive);
      if (data.disabledAgents) setDisabledAgents(data.disabledAgents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleModel = async (modelId: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_model", modelId }),
      });
      if (res.ok) loadData();
      else setMsg("Failed to toggle model");
    } catch { setMsg("Error toggling model"); }
  };

  const addKey = async () => {
    if (!newKeyValue.trim()) return;
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_key", keyValue: newKeyValue.trim(), provider: newKeyProvider }),
      });
      if (res.ok) {
        setNewKeyValue("");
        loadData();
        setMsg(lang === "bn" ? "এপিআই কী যোগ করা হয়েছে" : "API key added");
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg((err as any).error || "Failed to add key");
      }
    } catch { setMsg("Error adding key"); }
  };

  const deleteKey = async (keyId: number) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_key", keyId }),
      });
      if (res.ok) {
        loadData();
        setMsg(lang === "bn" ? "কী মুছে ফেলা হয়েছে" : "Key deleted");
      } else setMsg("Failed to delete key");
    } catch { setMsg("Error deleting key"); }
  };

  const toggleKey = async (keyId: number) => {
    setMsg("");
    try {
      await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_key", keyId }),
      });
      loadData();
    } catch { setMsg("Error toggling key"); }
  };

  const syncFreeModels = async () => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_free_models" }),
      });
      const data = await res.json() as { success?: boolean; totalFreeModels?: number; newModelsAdded?: number; error?: string };
      if (data.success) {
        loadData();
        setMsg(lang === "bn"
          ? `${data.totalFreeModels}টি ফ্রি মডেল পাওয়া গেছে, ${data.newModelsAdded}টি নতুন যোগ করা হয়েছে`
          : `${data.totalFreeModels} free models found, ${data.newModelsAdded} new ones added`
        );
      } else {
        setMsg((data as any).error || "Sync failed");
      }
    } catch { setMsg("Error syncing models"); }
  };

  const resetFailover = async () => {
    setMsg("");
    try {
      await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_failover" }),
      });
      loadData();
      setMsg(lang === "bn" ? "ফেইলওভার রিসেট করা হয়েছে" : "Failover reset");
    } catch { setMsg("Error resetting"); }
  };

  const globalToggle = async (active: boolean) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "global_toggle", is_active: active }),
      });
      if (res.ok) {
        setAiSystemActive(active);
        setMsg(active
          ? (lang === "bn" ? "এআই সিস্টেম সক্রিয় করা হয়েছে" : "AI system enabled")
          : (lang === "bn" ? "এআই সিস্টেম নিষ্ক্রিয় করা হয়েছে" : "AI system disabled")
        );
      } else setMsg("Failed to toggle AI system");
    } catch { setMsg("Error toggling AI system"); }
  };

  const toggleProvider = async (provider: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_provider", provider }),
      });
      if (res.ok) loadData();
      else setMsg("Failed to toggle provider");
    } catch { setMsg("Error toggling provider"); }
  };

  const toggleBrainAgent = async (agentId: string) => {
    setMsg("");
    try {
      const res = await fetch("/api/ai/brain/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", agentId }),
      });
      if (res.ok) loadData();
      else setMsg("Failed to toggle agent");
    } catch { setMsg("Error toggling agent"); }
  };

  const getDeptAgents = (deptId: string): string[] => {
    const deptAgents: Record<string, string[]> = {
      sales: ["lead_scanner", "lead_scorer", "lead_classifier", "product_matcher", "price_explainer", "benefit_highlighter", "comparison_builder", "social_proof_injector", "urgency_creator", "price_objection_handler", "trust_objection_handler", "trial_closer", "discount_closer", "installment_closer", "referral_closer", "payment_link_sender", "confirmation_sender", "followup_scheduler", "cross_sell_offer", "re_engagement_trigger"],
      psychology: ["mood_detector", "personality_classifier", "comm_style_identifier", "religion_detector", "dialect_identifier", "rapport_builder", "empathy_expresser", "frustration_calmer", "confidence_booster", "trust_builder", "reframing_agent", "future_pacing_agent", "reciprocity_trigger", "authority_builder", "social_proof_amplifier", "goal_achievement_coach", "mindset_shifter", "community_builder"],
      platform_admin: ["commission_config_validator", "settings_backup", "test_mode_manager", "translation_manager", "content_localizer", "suspicious_activity_detector", "login_monitor", "permission_checker", "db_health_monitor", "api_availability_checker", "performance_monitor", "error_log_analyzer", "update_manager"],
      operations: ["order_creator", "order_verifier", "invoice_generator", "order_notifier", "sslcommerz_initiator", "ipn_validator", "payment_status_checker", "refund_initiator", "fraud_detector", "withdrawal_validator", "withdrawal_approver", "payment_sender", "withdrawal_notifier"],
      negativity_detection: ["mlm_trigger_detector", "recruitment_trigger_detector", "money_trigger_detector", "sentiment_negativity_scanner", "trust_barrier_identifier", "safe_wording_advisor", "cultural_sensitivity_checker", "negativity_insight_miner"],
      member_success: ["registration_guide", "referral_explainer", "welcome_pack_sender", "first_goal_setter", "profile_completer", "skill_gap_analyzer", "personalized_training_plan", "course_recommender", "quiz_generator", "progress_tracker", "certification_issuer", "commission_calculator", "earning_reporter", "payout_optimizer", "daily_motivation_sender", "achievement_celebrator", "competition_creator", "sales_tracker", "kpi_reporter", "top_performer_identifier", "underperformer_detector", "query_resolver", "policy_explainer", "escalation_handler", "satisfaction_restorer"],
      customer_experience: ["faq_responder", "order_status_checker", "payment_issue_resolver", "delivery_tracker", "return_exchange_handler", "refund_processor", "feedback_collector", "sentiment_analyzer", "improvement_suggester", "nps_calculator", "greeting_personalizer", "tone_adjuster", "complaint_listener", "root_cause_finder", "solution_crafter"],
      business_intelligence: ["pain_point_miner", "opportunity_detector", "competitor_tracker", "industry_researcher", "sales_analyst", "member_growth_analyst", "conversion_funnel_analyst", "predictive_modeler", "report_compiler", "swot_analyzer", "knowledge_base_updater", "conversation_miner", "skill_auto_learner"],
    };
    return deptAgents[deptId] || [];
  };

  const isDeptDisabled = (deptId: string): boolean => {
    const agents = getDeptAgents(deptId);
    return agents.every((a) => disabledAgents[a]);
  };

  const areAllDeptDisabled = BRAIN_DEPARTMENTS.every((d) => isDeptDisabled(d.id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  const tierLabels = ["", "Best", "Great", "Good", "Basic", "Free"];
  const openrouterModels = models.filter((m) => m.provider === "openrouter");
  const opencodeModels = models.filter((m) => m.provider === "opencode");
  const orKeys = keys.filter((k) => k.provider === "openrouter");
  const ocKeys = keys.filter((k) => k.provider === "opencode");

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "এআই সেটিংস" : "AI Settings"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "ওপেনরাউটার → ওপেনকোড (ব্যাকআপ)" : "OpenRouter → OpenCode (fallback)"}
        </p>
      </div>

      {msg && (
        <div className="mb-6 p-4 rounded-xl bg-action/10 text-action text-sm font-medium">
          {msg}
        </div>
      )}

      {/* ── Master AI Toggle ── */}
      <div className={`card p-6 mb-6 ${aiSystemActive ? "border-2 border-action/20" : "border-2 border-red-200 bg-red-50/50"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-primary">
              {lang === "bn" ? "মাস্টার এআই টগল" : "Master AI Toggle"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {aiSystemActive
                ? (lang === "bn" ? "এআই সিস্টেম চালু আছে — সব এজেন্ট কাজ করছে" : "AI system is active — all agents are running")
                : (lang === "bn" ? "এআই সিস্টেম বন্ধ — সব এআই অপারেশন স্থগিত" : "AI system is off — all AI operations are suspended")}
            </p>
          </div>
          <button
            onClick={() => globalToggle(!aiSystemActive)}
            className={`w-16 h-8 rounded-full relative transition-colors ${aiSystemActive ? "bg-action" : "bg-red-400"}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${aiSystemActive ? "translate-x-9" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-2xl font-bold text-primary">{state?.total_responses || 0}</div>
          <div className="text-sm text-text-secondary">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-action">{state?.today_responses || 0}</div>
          <div className="text-sm text-text-secondary">{lang === "bn" ? "আজকের রেসপন্স" : "Today's Responses"}</div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-accent">{orKeys.filter(k=>k.is_active).length}</div>
            <div className="text-sm text-text-secondary">
              <div>{lang === "bn" ? "OpenRouter কী" : "OpenRouter Keys"}</div>
              <div className="text-xs">{lang === "bn" ? "সর্বমোট" : "Total"}: {orKeys.length}</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-2xl font-bold text-purple-600">{ocKeys.filter(k=>k.is_active).length}</div>
            <div className="text-sm text-text-secondary">
              <div>{lang === "bn" ? "ওপেনকোড কী" : "OpenCode Keys"}</div>
              <div className="text-xs">{lang === "bn" ? "সর্বমোট" : "Total"}: {ocKeys.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-primary">
            {lang === "bn" ? "API কী যোগ করুন" : "Add API Key"}
          </h2>
          <div className="flex gap-2">
            <button onClick={syncFreeModels} className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              {lang === "bn" ? "ফ্রি মডেল সিঙ্ক" : "Sync Free Models"}
            </button>
            <button onClick={resetFailover} className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
              {lang === "bn" ? "ফেইলওভার রিসেট" : "Reset Failover"}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={newKeyProvider}
            onChange={(e) => setNewKeyProvider(e.target.value as "openrouter" | "opencode")}
            className="px-3 py-2 rounded-xl border border-border bg-white text-sm text-primary"
          >
            <option value="openrouter">OpenRouter</option>
            <option value="opencode">OpenCode</option>
          </select>
          <input
            type="text"
            placeholder={lang === "bn" ? "API কী পেস্ট করুন" : "Paste API key"}
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-sm font-mono text-primary"
          />
          <button onClick={addKey} className="px-6 py-2 gradient-premium text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            {lang === "bn" ? "যোগ করুন" : "Add Key"}
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {lang === "bn" ? "যত ইচ্ছা তত এপিআই কী যোগ করতে পারেন। ওপেনরাউটার প্রথমে চেষ্টা করবে, সব শেষ হয়ে গেলে ওপেনকোড চেষ্টা করবে।" : "Add unlimited API keys. OpenRouter is tried first; OpenCode acts as fallback when all OpenRouter models are exhausted."}
        </p>
      </div>

      {keys.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="font-bold text-lg text-primary mb-4">
            {lang === "bn" ? "সংরক্ষিত এপিআই কী" : "Saved API Keys"} ({keys.length})
          </h2>
          <div className="space-y-2">
            {orKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-base">&#x1F511;</span>
                  <code className="text-sm font-mono text-primary truncate">{key.key_value}</code>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 shrink-0">OpenRouter</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => toggleKey(key.id)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${key.is_active ? "bg-action" : "bg-gray-300"}`}
                    title={key.is_active ? (lang === "bn" ? "সক্রিয়" : "Active") : (lang === "bn" ? "নিষ্ক্রিয়" : "Inactive")}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${key.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {lang === "bn" ? "মুছুন" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {ocKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-base">&#x1F511;</span>
                  <code className="text-sm font-mono text-primary truncate">{key.key_value}</code>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 shrink-0">OpenCode</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => toggleKey(key.id)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${key.is_active ? "bg-purple-500" : "bg-gray-300"}`}
                    title={key.is_active ? (lang === "bn" ? "সক্রিয়" : "Active") : (lang === "bn" ? "নিষ্ক্রিয়" : "Inactive")}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${key.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {lang === "bn" ? "মুছুন" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Model Cards with Provider Quick Toggle ── */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-primary">
            {lang === "bn" ? "ওপেনরাউটার মডেল" : "OpenRouter Models"} ({openrouterModels.length})
          </h2>
          <button
            onClick={() => toggleProvider("openrouter")}
            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {openrouterModels.some((m) => m.is_active)
              ? (lang === "bn" ? "সব বন্ধ করুন" : "Disable All")
              : (lang === "bn" ? "সব চালু করুন" : "Enable All")}
          </button>
        </div>
        <div className="space-y-2">
          {openrouterModels.map((model) => (
            <div key={model.model_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleModel(model.model_id)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${model.is_active ? "bg-action" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${model.is_active ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <div>
                  <div className="text-sm font-medium text-primary">{model.name}</div>
                  <div className="text-xs text-text-secondary">{model.model_id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  model.tier <= 1 ? "bg-green-50 text-green-700" :
                  model.tier <= 3 ? "bg-blue-50 text-blue-700" :
                  "bg-gray-50 text-gray-600"
                }`}>
                  Tier {model.tier} - {tierLabels[model.tier] || "Free"}
                </span>
                {model.exhausted && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">
                    {lang === "bn" ? "নিঃশেষ" : "Exhausted"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-6 border-2 border-action/20 bg-action/5">
        <h2 className="font-bold text-lg text-action mb-4">
          {lang === "bn" ? "ফেইলওভার চেইন (মডেল অর্ডার)" : "Failover Chain (Model Order)"}
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          {lang === "bn"
            ? "প্রতিটি API কী-এর জন্য মডেলগুলো এই ক্রমে Try করা হয়। প্রথমে OpenRouter কী-এর সব মডেল, তারপর OpenCode কী-এর সব মডেল। প্রতিটি মডেল নিঃশেষ হলে পরের মডেলে চলে যায়। প্রতিদিন UTC মধ্যরাতে রিসেট হয়।"
            : "Models are tried in this order per API key. OpenRouter keys first, then OpenCode. Each model when exhausted moves to the next. Resets daily at midnight UTC."}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">
              {lang === "bn" ? "ওপেনরাউটার চেইন" : "OpenRouter Chain"}
              <span className="ml-2 text-xs font-normal text-text-secondary">({openrouterModels.length})</span>
            </h3>
            {openrouterModels.length > 0 ? (
              <ol className="space-y-1 text-xs text-text-secondary">
                {openrouterModels.map((m, i) => (
                  <li key={m.model_id} className="flex gap-2 items-center">
                    <span className="text-action font-bold min-w-[20px] shrink-0">{i + 1}</span>
                    <code className={`flex-1 truncate ${m.exhausted ? "text-red-500 line-through" : ""}`}>{m.model_id}</code>
                    {m.exhausted && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-50 text-red-600 shrink-0">
                        {lang === "bn" ? "নিঃশেষ" : "EX"}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-text-secondary italic">
                {lang === "bn" ? "কোনো মডেল নেই" : "No models"}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2">
              {lang === "bn" ? "ওপেনকোড চেইন (ব্যাকআপ)" : "OpenCode Chain (Fallback)"}
              <span className="ml-2 text-xs font-normal text-text-secondary">({opencodeModels.length})</span>
            </h3>
            {opencodeModels.length > 0 ? (
              <ol className="space-y-1 text-xs text-text-secondary">
                {opencodeModels.map((m, i) => (
                  <li key={m.model_id} className="flex gap-2 items-center">
                    <span className="text-purple-500 font-bold min-w-[20px] shrink-0">{i + 1}</span>
                    <code className={`flex-1 truncate ${m.exhausted ? "text-red-500 line-through" : ""}`}>{m.model_id}</code>
                    {m.exhausted && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-50 text-red-600 shrink-0">
                        {lang === "bn" ? "নিঃশেষ" : "EX"}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-text-secondary italic">
                {lang === "bn" ? "কোনো মডেল নেই" : "No models"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-purple-700">
            {lang === "bn" ? "ওপেনকোড মডেল" : "OpenCode Models"} ({opencodeModels.length})
          </h2>
          <button
            onClick={() => toggleProvider("opencode")}
            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            {opencodeModels.some((m) => m.is_active)
              ? (lang === "bn" ? "সব বন্ধ করুন" : "Disable All")
              : (lang === "bn" ? "সব চালু করুন" : "Enable All")}
          </button>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          {lang === "bn" ? "এই মডেলগুলো OpenCode Zen API-এর মাধ্যমে চলে। OpenRouter সব মডেল নিঃশেষ হলেই এগুলো ব্যবহার হবে।" : "These models run via OpenCode Zen API. Used as fallback when all OpenRouter models are exhausted."}
        </p>
        <div className="space-y-2">
          {opencodeModels.map((model) => (
            <div key={model.model_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleModel(model.model_id)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${model.is_active ? "bg-purple-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${model.is_active ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <div>
                  <div className="text-sm font-medium text-primary">{model.name}</div>
                  <div className="text-xs text-text-secondary">{model.model_id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
                  OpenCode
                </span>
                {model.exhausted && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-600">
                    {lang === "bn" ? "নিঃশেষ" : "Exhausted"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Brain Agent Toggles ── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-lg text-primary">
              {lang === "bn" ? "ব্রেইন এজেন্ট টগল" : "Brain Agent Toggles"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn"
                ? "প্রতিটি বিভাগের এজেন্ট আলাদাভাবে চালু/বন্ধ করুন"
                : "Enable or disable agents per department"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const depts = BRAIN_DEPARTMENTS;
                for (const d of depts) {
                  const agents = getDeptAgents(d.id);
                  for (const a of agents) {
                    if (disabledAgents[a]) await toggleBrainAgent(a);
                  }
                }
                loadData();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${areAllDeptDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
            >
              {lang === "bn" ? "সব চালু" : "Enable All"}
            </button>
            <button
              onClick={async () => {
                const depts = BRAIN_DEPARTMENTS;
                for (const d of depts) {
                  const agents = getDeptAgents(d.id);
                  for (const a of agents) {
                    if (!disabledAgents[a]) await toggleBrainAgent(a);
                  }
                }
                loadData();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${areAllDeptDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
            >
              {lang === "bn" ? "সব বন্ধ" : "Disable All"}
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRAIN_DEPARTMENTS.map((dept) => {
            const deptAgentIds = getDeptAgents(dept.id);
            const disabled = isDeptDisabled(dept.id);
            const partial = !disabled && deptAgentIds.some((a) => disabledAgents[a]);
            return (
              <div key={dept.id} className={`p-4 rounded-xl border transition-colors ${
                disabled ? "border-red-200 bg-red-50/50" :
                partial ? "border-orange-200 bg-orange-50/30" :
                "border-border bg-white"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-primary">
                    {lang === "bn" ? dept.nameBn : dept.name}
                  </h3>
                  {partial && (
                    <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      {lang === "bn" ? "আংশিক" : "Partial"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {deptAgentIds.map((agentId) => (
                    <button
                      key={agentId}
                      onClick={() => toggleBrainAgent(agentId)}
                      className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                        disabledAgents[agentId]
                          ? "bg-gray-100 text-gray-400 border border-gray-200"
                          : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      }`}
                    >
                      {agentId.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
