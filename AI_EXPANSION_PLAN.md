# AI Platform Expansion Plan — 20 Module Implementation Roadmap

**ভিত্তি:** Jobayer Group Career — WhatsApp AI Ecosystem  
**বর্তমান অবস্থা:** প্রায় ৮৫-৯০% বেসিক ফাউন্ডেশন তৈরি  
**লক্ষ্য:** পূর্ণাঙ্গ AI-Driven Autonomous Sales & Learning Platform  

---

## কিভাবে এই প্ল্যান পড়বেন

প্রতিটি মডিউলের জন্য ৪টি অংশ দেওয়া আছে:
1. **বর্তমান অবস্থা** — ইতিমধ্যে কী তৈরি আছে
2. **কী যোগ করতে হবে** — কী বানানো বাকি
3. **কোথায় কোথায় পরিবর্তন লাগবে** — ফাইল/টেবিল লিস্ট
4. **ইমপ্লিমেন্টেশন স্টেপস** — বিস্তারিত ধাপ

---

# PHASE 1: ফাউন্ডেশন আপগ্রেড (Foundation Layer)

এই ফেজে মূল ডাটা স্ট্রাকচার ও সিস্টেম আর্কিটেকচার আপগ্রেড করা হবে — যার উপর বাকি সব মডিউল নির্ভর করে।

---

## 1. AI Life Profile Engine ⭐⭐⭐⭐☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
`profiler.ts`-এ ইতিমধ্যে ২৫+টি ফিল্ড আছে:
- ✅ নাম, ফোন, ল্যাঙ্গুয়েজ, age_group (15-20, 21-29, 30-39, 40-49, 50+)
- ✅ sector (student, homemaker, job_holder, business_owner, freelancer, unemployed)
- ✅ pain_points, interests, trust_score, communication_style
- ✅ buyer_personality, buying_motivation, primary_need (Brian Tracy)
- ✅ market_segment, loyalty_stage, brand_position (Kotler)
- ✅ clv_estimate, nps_score
- ✅ gender_guess, priority_score, total_chats

### কী যোগ করতে হবে
- ❌ education_level ( SSC/HSC/Graduate/Masters/None )
- ❌ job_title / occupation (নির্দিষ্ট পেশা)
- ❌ monthly_income_range ( <10k / 10-25k / 25-50k / 50k+ / not_sharing )
- ❌ skills (JSON array — কমা সেপারেটেড স্কিল লিস্ট)
- ❌ short_term_goal (৬ মাসের লক্ষ্য)
- ❌ long_term_goal (২-৫ বছরের লক্ষ্য)
- ❌ family_status (single/married/parent/guardian)
- ❌ device_type (mobile/desktop/tablet)
- ❌ active_hours (JSON — কোন সময়ে অনলাইনে থাকে)
- ❌ content_preferences (video/text/audio/interactive)
- ❌ referral_source (যেভাবে এসেছে — friend/social_media/ad/other)
- ❌ last_updated_from (AI_analysis / manual / whatsapp_chat)

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | profiles টেবিলে নতুন কলাম যোগ করা (ALTER TABLE) |
| `src/lib/ai/profiler.ts` | নতুন ফিল্ডের জন্য interface আপডেট + analyze/extract ফাংশন |
| `src/lib/ai/analyzer.ts` | নতুন analayzer: detectEducation, detectIncome, detectGoal, detectSkill |
| `src/lib/ai/brain/orchestrator.ts` | লাইফ প্রোফাইল কনটেক্সট যোগ করা |
| `src/app/api/profile/route.ts` | API প্রসারিত করা |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪-৫ ঘন্টা)

```
Step 1: profiler.ts interface এ নতুন ফিল্ড যোগ
Step 2: db/index.ts এ ALTER TABLE statements
Step 3: analyzer.ts এ detectEducation(), detectIncome(), detectGoal(), detectSkill() ফাংশন
Step 4: profiler.ts এ updateProfileFromChat() কল করে নতুন ফিল্ড আপডেট
Step 5: orchestrator.ts এ {{lifeProfileCtx}} টেমপ্লেট ভ্যারিয়েবল যোগ
Step 6: buildContext() ফাংশন আপডেট
```

---

## 2. AI Memory Graph ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ SQLite `agent_memory` টেবিল — key-value store  
✅ TTL সাপোর্ট (memory expires)  
✅ Priority-based ordering  
✅ Per-user + per-agent isolation  

❌ Graph structure নেই — শুধু flat key-value  
❌ Relationship tracking নেই  
❌ Traversal queries নেই  

### কী যোগ করতে হবে
একটি Graph Memory Layer যা ইউজারের সাথে সম্পর্কিত সব কিছু নোড ও এজ হিসেবে স্টোর করবে:

**Nodes (উদাহরণ):**
- `user:017xxxx` — ইউজার
- `skill:english` — দক্ষতা
- `goal:job_abroad` — লক্ষ্য
- `course:spoken_english` — কোর্স
- `interest:canada` — আগ্রহ

**Edges (উদাহরণ):**
- `user → wants → goal:job_abroad`
- `goal:job_abroad → requires → skill:english`  
- `skill:english → improved_by → course:spoken_english`
- `user → purchased → course:spoken_english`

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | `knowledge_graph` টেবিল (node_id, node_type, node_value, metadata) + `knowledge_graph_edges` টেবিল (from_node, to_node, edge_type, weight, created_at) |
| `src/lib/ai/brain/memory.ts` | graph API: addNode, addEdge, traverseGraph, getRelatedNodes |
| `src/lib/ai/brain/orchestrator.ts` | গ্রাফ কনটেক্সট ইনজেকশন |
| NEW: `src/lib/ai/brain/graph-memory.ts` | গ্রাফ অপারেশনের জন্য আলাদা মডিউল |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৬-৮ ঘন্টা)

```
Step 1: ডাটাবেজে knowledge_graph + knowledge_graph_edges টেবিল তৈরি
Step 2: graph-memory.ts — addNode(), addEdge(), getNeighbors(), traverseBFS()
Step 3: graph-memory.ts — buildGraphContext(phone) → গ্রাফ থেকে টেক্সট কনটেক্সট তৈরি
Step 4: orchestrator.ts এ গ্রাফ কনটেক্সট ইন্টিগ্রেশন
Step 5: FastLane → analyze → graph update pipeline
Step 6: memory.ts → ওল্ড key-value এর পাশাপাশি গ্রাফেও লেখা
```

---

## 3. AI Learning Graph ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ courses টেবিল (৯৩২+ কোর্স)  
✅ course_categories টেবিল  
✅ course_category_map টেবিল  
✅ resource_purchases টেবিল  
❌ Skill Graph — কোর্সের মধ্যে সম্পর্ক নেই  
❌ Learning Path — কোন ক্রমে শিখতে হবে তা নেই  

### কী যোগ করতে হবে
প্রত্যেক কোর্সের সাথে প্রি-রিকুইজিট ও পোস্ট-রিকুইজিট সম্পর্ক যোগ করা:

```
English Basics → Spoken English → Interview Prep → CV Writing → Job Ready
                      ↓                                  ↓
               Business English                    Career Planning
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | নতুন টেবিল: `course_prerequisites` (course_id, prerequisite_course_id, is_required), `skill_paths` (path_id, path_name, path_name_bn, description) |
| `src/lib/db/index.ts` | নতুন টেবিল: `skill_path_courses` (path_id, course_id, sort_order, estimated_days) |
| NEW: `src/lib/ai/learning-graph.ts` | গ্রাফ বিল্ডিং ও ট্রাভার্সাল |
| NEW: `src/lib/ai/skill-scorer.ts` | স্কিল স্কোর ক্যালকুলেশন |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৫-৬ ঘন্টা)

```
Step 1: course_prerequisites + skill_paths + skill_path_courses টেবিল
Step 2: learning-graph.ts — buildLearningPath(goal, currentSkills)
Step 3: learning-graph.ts — getNextRecommendedCourses(phone)
Step 4: learning-graph.ts — estimateCompletionTime(path)
Step 5: orchestrator.ts এ লার্নিং পাথ কনটেক্সট
Step 6: API endpoint: GET /api/learning-path?goal=job&phone=017xxx
```

---

# PHASE 2: প্রেডিকশন ও ইন্টেলিজেন্স লেয়ার (Prediction Layer)

## 4. AI Opportunity Detector ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ Intent classification (১৫টি intent)  
✅ Pain point detection (no_income, scam_fear, pricing, no_skill, no_time)  
✅ Interest detection (freelancing, digital_marketing, web_design, video_editing, programming, spoken_english)  
✅ Customer need detection (Brian Tracy: money, security, status, growth, etc.)  
❌ Life situation detection নেই  

### কী যোগ করতে হবে
AI ইউজারের কথাবার্তা থেকে লাইফ সিচুয়েশন ডিটেক্ট করবে:
- "চাকরি খুঁজছি" → job_seeker
- "ইংরেজি শিখতে চাই" → language_learner
- "বিদেশ যেতে চাই" → abroad_aspirant
- "বিউটিপার্লার দিতে চাই" → entrepreneur
- "বাচ্চাকে পড়াচ্ছি" → parent_learner

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/ai/analyzer.ts` | detectLifeSituation(text) → LifeSituation টাইপ |
| `src/lib/ai/profiler.ts` | life_situation ফিল্ড |
| NEW: `src/lib/ai/opportunity-detector.ts` | সিচুয়েশন → প্রস্তাবিত কোর্স/প্ল্যান ম্যাপিং |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৩-৪ ঘন্টা)

```
Step 1: LifeSituation টাইপ + detectLifeSituation() analyzer
Step 2: opportunity-detector.ts — matchOpportunities(situation) 
Step 3: লাইফ সিচুয়েশন অনুযায়ী কোর্স/প্রোডাক্ট ম্যাপিং
Step 4: orchestrator.ts এ oppCtx যোগ
```

---

## 5. AI Skill Score ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ user_behavior_scores টেবিল (lead_score, churn_probability, purchase_intent, RFM, segment, LTV)  
✅ computeWorkerInterests() — ইন্টারেস্ট স্কোরিং  
✅ computeWorkerBehaviorScore() — RFM-ভিত্তিক স্কোরিং  
❌ Per-skill score নেই  

### কী যোগ করতে হবে
প্রত্যেক ইউজারের জন্য স্কিল-ভিত্তিক স্কোর:
- English: 42%
- Marketing: 18%
- Business: 71%
- Programming: 5%
- Design: 33%

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | `user_skill_scores` টেবিল (phone, skill_name, score, last_updated) |
| NEW: `src/lib/ai/skill-scorer.ts` | computeSkillScore(phone), updateSkillScore(phone, skill, delta) |
| `src/lib/ai/orchestrator.ts` | স্কিল স্কোর কনটেক্সট |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪ ঘন্টা)

```
Step 1: user_skill_scores টেবিল
Step 2: skill-scorer.ts — calculateSkillScoreFromActivity(phone)
Step 3: watched course → skill score update pipeline
Step 4: skill-scorer.ts — getWeakestSkills(phone), getStrongestSkills(phone)
Step 5: buildSkillScoreContext() — AI কনটেক্সট
```

---

## 6. AI Sales Prediction ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ purchase_intent স্কোর (0-100) user_behavior_scores টেবিলে  
✅ computeWorkerBehaviorScore() ফাংশন  
❌ Conversion probability নেই  
❌ Time-based prediction নেই  

### কী যোগ করতে হবে

```python
# Model features:
- total_chats
- avg_mood_last_7_days (positive/negative ratio)
- pain_points_count
- interests_count
- trust_score
- responded_to_proactive (yes/no)
- days_since_first_contact
- total_offers_viewed
- has_premium_friend (yes/no)

# Output:
- conversion_probability: 0-100%
- predicted_conversion_date: "2026-08-15"
- recommended_approach: "discount_offer" | "success_story" | "free_trial"
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/prediction-engine.ts` | calculateConversionProbability(phone), getHighPotentialLeads(limit, minProb) |
| `src/lib/db/index.ts` | `conversion_predictions` টেবিল |
| `src/app/api/cron/keepwarm/route.ts` | হাই-প্রোব্যাবিলিটি লিডদের প্রায়োরিটি দেওয়া |
| NEW: `src/app/api/ai/predict/conversion/route.ts` | API endpoint |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৫ ঘন্টা)

```
Step 1: conversion_predictions টেবিল
Step 2: prediction-engine.ts — extractFeatures(phone)
Step 3: prediction-engine.ts — scoreFeatures(features) → probability
Step 4: prediction-engine.ts — getHighPotentialLeads()
Step 5: cron scoring update
Step 6: API endpoint
```

---

## 7. AI Churn Prediction ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ churn_probability স্কোর (user_behavior_scores এ ইতিমধ্যেই আছে)  
✅ computeWorkerBehaviorScore() এ churn_probability গণনা করা হয়  
✅ automatedReEngagement() ফাংশন (marketing.ts) — at_risk/churned সেগমেন্টে মেসেজ  
✅ scheduleAutomatedCampaigns() — ক্রন কল করে  
✅ Dashboard: `/dashboard/ai-predictions` — Churn prediction UI (ইতিমধ্যে আছে)  
❌ Churn prediction ডিটেইলড নয় (শুধু 0-100 স্কোর)  
❌ Churn reason prediction নেই  

### কী যোগ করতে হবে
churn_probability কে আরও ডিটেইলড করা:
- churn_reason: "no_engagement" | "found_competitor" | "financial" | "dissatisfied" | "unknown"
- churn_risk_factors: ["low_chat_frequency", "negative_mood_trend", "payment_failed", "support_ticket"]
- recommended_retention_action: "personal_offer" | "free_upgrade" | "mentor_call" | "resource_unlock"

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/tracking/scoring.ts` | churn_reason + risk_factors + retention_action যোগ |
| `src/lib/db/index.ts` | user_behavior_scores টেবিলে নতুন কলাম |
| NEW: `src/lib/ai/churn-detector.ts` | analyzeChurnReasons(phone) |
| `src/app/api/dashboard/ai-predictions/` | UI আপডেট |
| `src/lib/ai/outreach/campaign.ts` | retention_action অনুযায়ী ক্যাম্পেইন |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৩-৪ ঘন্টা)

```
Step 1: churn analysis ফাংশন প্রসারিত করা
Step 2: churn_reason ডিটেকশন
Step 3: retention_action রেকমেন্ডেশন
Step 4: ড্যাশবোর্ড UI আপডেট
Step 5: retention_action → auto campaign trigger
```

---

# PHASE 3: অটোনমাস এজেন্ট লেয়ার (Autonomous Layer)

## 8. Multi-Agent AI ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ agents/index.ts — টাইপ ডেফিনিশন (Agent, AgentReport, AgentSubmission, AgentConfig)  
✅ brain/registry/ — ডিপার্টমেন্ট রেজিস্ট্রি (sales, support, psychology, member_success, operations, customer_experience)  
✅ brain/employee-link.ts — এজেন্ট-ওয়ার্কার লিংকিং  
✅ brain/agent-tuning.ts — A/B testing for agent prompts  
✅ brain/scheduler.ts — cron scheduling for agents  
✅ `callAI()` ফাংশন — সকল AI কলের জন্য ইউনিফাইড ইন্টারফেস  
❌ **Actual multi-agent runtime নেই** — বর্তমানে single AI সবকিছু করে  
❌ Agent-to-agent communication নেই  

### কী যোগ করতে হবে

**Specialized Agents (প্রত্যেকের আলাদা prompt + model + schedule):**

| Agent | ভূমিকা | Model Preference |
|-------|--------|-----------------|
| **Sales Agent** | প্রোডাক্ট সেলস, আপসেল, ক্রস-সেল | LLaMA 3.3 70B |
| **Marketing Agent** | ক্যাম্পেইন জেনারেশন, সেগমেন্ট বিশ্লেষণ | Gemma 4 26B |
| **Support Agent** | টেকনিক্যাল সাপোর্ট, কমপ্লেইন্ট হ্যান্ডলিং | LLaMA 3.3 70B |
| **Teacher Agent** | ট্রেনিং, মডিউল এক্সপ্লেইন, স্কিল এসেসমেন্ট | Gemma 4 26B |
| **Recommendation Agent** | পার্সোনালাইজড রেকমেন্ডেশন | LLaMA 3.3 70B |
| **Analytics Agent** | ডাটা অ্যানালাইসিস, রিপোর্ট জেনারেশন | Gemma 4 26B |
| **Content Agent** | ব্লগ/সোশ্যাল/মার্কেটিং কনটেন্ট | LLaMA 3.3 70B |
| **Outreach Agent** | প্রোঅ্যাকটিভ মেসেজিং, ফলোআপ | Gemma 4 26B |
| **Fraud Agent** | সন্দেহজনক অ্যাক্টিভিটি মনিটরিং | LLaMA 3.3 70B |
| **Commission Agent** | কমিশন ক্যালকুলেশন, পেমেন্ট ট্র্যাকিং | Gemma 4 26B |

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/agents/runtime.ts` | Agent runtime — load, execute, monitor agents |
| NEW: `src/lib/ai/agents/orchestrator.ts` | Supervisor agent — incoming message → which agent? |
| NEW: `src/lib/ai/agents/registry.ts` | Agent definitions + model assignments |
| `src/lib/ai/brain/orchestrator.ts` | সিঙ্গেল AI → মাল্টি-এজেন্ট রাউটারে রূপান্তর |
| `src/lib/ai/agents/scheduler.ts` | Cron-based agent execution |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ১০-১২ ঘন্টা)

```
Step 1: agent definitions with model, prompt, schedule
Step 2: agent runtime — loadAgent(agentId), executeAgent(agentId, context)
Step 3: agent orchestrator — routeContent(content) → selects best agent
Step 4: brain/orchestrator.ts → delegates to agent orchestrator
Step 5: inter-agent communication bus
Step 6: agent logging & monitoring
Step 7: fallback to single mode if agents fail
```

---

## 9. AI Supervisor ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
❌ কোনো Supervisor Agent নেই  

### কী যোগ করতে হবে
Supervisor Agent অন্যান্য Agent-দের মনিটর করবে, কনফ্লিক্ট রেজলভ করবে, এবং এসকেলেশন হ্যান্ডল করবে:

- **Routing Decision:** কোন Agent এই কাজের জন্য সবচেয়ে উপযুক্ত?
- **Quality Check:** Agent-এর আউটপুট কি কোয়ালিটি স্ট্যান্ডার্ড মেনে চলছে?
- **Conflict Resolution:** দুটি Agent ভিন্ন মত দিলে কোনটা সঠিক?
- **Escalation:** Agent ব্যর্থ হলে কি করতে হবে?
- **Load Balancing:** কোন Agent-এর উপর বেশি চাপ পড়ছে?

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/ai/agents/runtime.ts` | Supervisor logic |
| `src/lib/ai/brain/orchestrator.ts` | Supervisor integration |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪-৫ ঘন্টা)

```
Step 1: Supervisor agent prompt — routing rules
Step 2: Supervisor — quality check against standards
Step 3: Supervisor — conflict resolution (voting/priority)
Step 4: Supervisor — escalation chain
Step 5: Supervisor — load monitoring
```

---

# PHASE 4: রিটেনশন ও এমোশন লেয়ার (Retention Layer)

## 10. AI Emotion Timeline ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ প্রতি মেসেজে mood detection (enthusiastic/neutral/skeptical/bored/distracted)  
✅ detectTrustLevel, detectFearProfile, detectMaskStatus  
✅ detectDecisionMode (system1_fast / system2_analytical)  
❌ **কোনো ইমোশন হিস্ট্রি নেই** — প্রতিবার ডিটেকশন স্টেটলেস  

### কী যোগ করতে হবে
প্রত্যেক ইউজারের ইমোশন টাইমলাইন রাখা:

```json
{
  "phone": "017xxxx",
  "timeline": [
    { "date": "2026-07-01", "mood": "enthusiastic", "trust": "trusting", "trigger": "first_contact" },
    { "date": "2026-07-03", "mood": "skeptical", "trust": "suspicious", "trigger": "price_question" },
    { "date": "2026-07-05", "mood": "neutral", "trust": "neutral", "trigger": "info_session" },
    { "date": "2026-07-10", "mood": "enthusiastic", "trust": "trusting", "trigger": "success_story" }
  ],
  "trend": "improving",  // "improving" | "declining" | "stable" | "volatile"
  "current_state": "positive",
  "risk_level": "low"
}
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | `emotion_timeline` টেবিল (phone, date, mood, trust, fear, decision_mode, trigger_event) |
| NEW: `src/lib/ai/emotion-tracker.ts` | trackMood(), getEmotionTrend(), getRiskLevel() |
| `src/app/api/whatsapp/webhook/route.ts` | প্রতি মেসেজের পর emotion_timeline-এ এন্ট্রি |
| `src/lib/ai/brain/orchestrator.ts` | emotion trend কনটেক্সট |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৩-৪ ঘন্টা)

```
Step 1: emotion_timeline টেবিল
Step 2: emotion-tracker.ts — logEmotion(phone, mood, trust, trigger)
Step 3: emotion-tracker.ts — analyzeTrend(phone, days=30)
Step 4: webhook-এ প্রতি মেসেজের পর emotion log
Step 5: orchestrator-এ {{emotionTrend}} কনটেক্সট
Step 6: emotion-tracker.ts — getAtRiskUsers(declining_trend, days=7)
```

---

## 11. AI Retention Engine ⭐⭐⭐☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ proactive_followups টেবিল  
✅ cron/keepwarm — নতুন লিড, seen-no-reply, stale contacts  
✅ automatedReEngagement() — at_risk/churned সেগমেন্ট  
✅ scheduleAutomatedCampaigns()  
✅ churn_probability স্কোর  
❌ Retention অ্যাকশন পার্সোনালাইজড নয়  
❌ Churn reason → retention action mapping নেই  

### কী যোগ করতে হবে
Churn probability + churn reason + user profile → নির্দিষ্ট retention action:

```javascript
const RETENTION_MAP = {
  no_engagement: { 
    action: "personal_offer", 
    message: "We miss you! Here's a special gift..."
  },
  financial: { 
    action: "payment_plan", 
    message: "We can arrange an easy payment plan..."
  },
  dissatisfied: { 
    action: "support_call", 
    message: "Let us make it right..."
  },
};
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/retention-engine.ts` | getRetentionAction(phone), scheduleRetention(phone, action) |
| `src/app/api/cron/keepwarm/route.ts` | retention actions integration |
| `src/lib/ai/outreach/multi-channel.ts` | retention-specific messaging |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪ ঘন্টা)

```
Step 1: retention action mapping
Step 2: retention-engine.ts — analyzeRetentionNeed(phone)
Step 3: retention-engine.ts — executeRetentionAction(phone, action)
Step 4: cron integration
Step 5: orchestrator retention context
```

---

## 12. AI Goal Planner ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ ইতিমধ্যে ai_targets টেবিল (Geometric Target Plans)  
✅ Stage scripts এ goal setting ট্রেনিং মডিউল  
❌ ইউজার ফেসিং গোল প্ল্যানার নেই  

### কী যোগ করতে হবে
User বলবে: "আমি ৬ মাসে চাকরি চাই"  
AI তৈরি করবে:

```
মাস ১: English Basics → Spoken English (সপ্তাহে ৫ দিন)
মাস ২: Interview Preparation → CV Writing
মাস ৩: Job Application (২০টি কোম্পানিতে)
মাস ৪: Skill Upgrade (Excel/Programming)
মাস ৫: Mock Interview × ১০
মাস ৬: Final Preparation → Job Ready!
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/goal-planner.ts` | PlanGoalRequest interface, createGoalPlan(), checkGoalProgress() |
| `src/lib/db/index.ts` | `user_goals` টেবিল (phone, goal_title, goal_title_bn, target_date, weekly_plan JSON, progress 0-100, status) |
| `src/app/api/ai/goals/route.ts` | API: POST (create), GET (list), PUT (update progress) |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৫-৬ ঘন্টা)

```
Step 1: user_goals টেবিল
Step 2: goal-planner.ts — createGoalPlan(phone, goal, targetDate)
Step 3: goal-planner.ts — generateWeeklyPlan(goal, weeks)
Step 4: goal-planner.ts — checkGoalProgress(goalId)
Step 5: REST API
Step 6: orchestrator integration — {{goalPlanCtx}}
Step 7: cron — weekly progress reminder
```

---

## 13. AI Referral Intelligence ⭐⭐⭐☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ affiliate_tree টেবিল  
✅ getSponsorUpline(), getDirectChildren(), getTeamSize()  
✅ Team tracking in orchestrator  
✅ commission distribution  
❌ Network growth potential বিশ্লেষণ নেই  

### কী যোগ করতে হবে
AI প্রত্যেক ইউজারের নেটওয়ার্ক গ্রোথ পটেনশিয়াল বিশ্লেষণ করবে:

- **Network Growth Score:** 0-100 (কত দ্রুত টিম বাড়াচ্ছে)
- **Top Referrer Profile:** কার কাছ থেকে সবচেয়ে বেশি রেফারেল আসে
- **Suggested Targets:** "আপনার টিমে আরও ৫ জন যোগ করুন এই মাসে"
- **Weak Link Detection:** টিমের কোন লেভেলে সবচেয়ে বেশি ড্রপঅফ

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/referral-intelligence.ts` | calculateNetworkGrowthScore(), findTopReferrers(), getWeakLinks() |
| `src/lib/ai/brain/orchestrator.ts` | referral intelligence কনটেক্সট |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৩ ঘন্টা)

```
Step 1: referral-intelligence.ts — network growth metrics
Step 2: referral-intelligence.ts — weak link detection
Step 3: orchestrator — referral intelligence context
```

---

# PHASE 5: বিজনেস ইন্টেলিজেন্স লেয়ার (BI Layer)

## 14. AI Revenue Forecast ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ orders টেবিল (অর্ডার হিস্টোরি)  
✅ commissions টেবিল  
✅ user_behavior_scores.clv_estimate  
✅ perf_snapshots টেবিল  
❌ Revenue forecasting নেই  

### কী যোগ করতে হবে
30-দিনের রেভিনিউ ফোরকাস্ট:
- Expected new registrations: ৪৫
- Expected premium upgrades: ১২
- Expected revenue: ৳৬৮,০০০
- Confidence: ৭৮%
- Best case: ৳৮৫,০০০
- Worst case: ৳৪৫,০০০

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/ai/revenue-forecaster.ts` | forecastRevenue(days=30), getRevenueBreakdown() |
| NEW: `src/app/api/ai/forecast/revenue/route.ts` | API |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৩-৪ ঘন্টা)

```
Step 1: historical trend analysis
Step 2: revenue-forecaster.ts — simple moving average + growth factor
Step 3: revenue-forecaster.ts — breakdown by product/plan
Step 4: API endpoint
```

---

## 15. AI Fraud Detection ⭐☆☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ কিছু ফ্রড ডিটেকশন ছড়িয়ে ছিটিয়ে আছে বিভিন্ন জায়গায়:
  - analyzer.ts → scam_fear pain point, being_deceived fear profile
  - intent-classifier.ts → complaint/scam routing
  - psychology brain → trust/scam objection handler
  - seed data → "Withdrawals suspended if suspicious activity detected"
❌ **Dedicated fraud module নেই**
❌ Automated flagging নেই
❌ Multiple account detection নেই

### কী যোগ করতে হবে
**Fraud Detection Rules:**
1. **Multiple Account Detection:** একই IP/ডিভাইসে একাধিক account
2. **Self-Referral Detection:** নিজের রেফারেল নিজে হওয়া
3. **Bonus Abuse Detection:** অস্বাভাবিক কমিশন প্যাটার্ন
4. **Fake Profile Detection:** ভুয়া নাম/ফোন/তথ্য
5. **Suspicious Activity:** অল্প সময়ে অনেকগুলো অর্ডার

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/fraud/detector.ts` | checkMultipleAccounts(), checkSelfReferral(), checkBonusAbuse(), checkSuspiciousActivity() |
| NEW: `src/lib/fraud/rules.ts` | FraudRule interface, rule definitions |
| `src/lib/db/index.ts` | `fraud_alerts` টেবিল (phone, alert_type, severity, description, detected_at, resolved_at, resolved_by) |
| NEW: `src/app/api/admin/fraud/route.ts` | Fraud alerts API |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৫-৬ ঘন্টা)

```
Step 1: fraud_alerts টেবিল
Step 2: detector.ts — checkMultipleAccounts() - same device_id different phones
Step 3: detector.ts — checkSelfReferral() - sponsor_id == own id
Step 4: detector.ts — checkBonusAbuse() - unusual commission patterns
Step 5: detector.ts — runAllChecks(phone) — comprehensive check
Step 6: cron — периодический fraud scan
Step 7: admin API + notifications
```

---

## 16. AI Knowledge Evolution ⭐⭐⭐☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ knowledge-brain.ts — addKnowledge(), searchKnowledge(), getContextualKnowledge()  
✅ logConversationLearning() — conversation_learnings টেবিল  
✅ getUnappliedLearnings(), markLearningApplied() — human-in-the-loop  
✅ checkContradictions() — বেসিক কন্ট্রাডিকশন ডিটেকশন  
✅ submitFeedback() — agent_feedback টেবিল  
✅ ৩৩৫+ manually curated knowledge entries  
✅ Auto-seed from database (products, courses, trainers)  
✅ Version tracking (knowledge_versioning)  
❌ **Fully automated knowledge improvement নেই**  

### কী যোগ করতে হবে
Self-learning pipeline:
1. ১০০০ বার একই প্রশ্ন এলে → AI নতুন নলেজ এন্ট্রি প্রস্তাব করবে
2. হিউম্যান অ্যাপ্রুভাল (বা threshold-based auto-approve)
3. নলেজ বেস আপডেট

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/ai/knowledge-brain.ts` | autoSuggestKnowledge() — repeated questions → entry proposition |
| `src/lib/ai/knowledge-brain.ts` | applyKnowledgeSuggestion() — auto-approve with confidence threshold |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪ ঘন্টা)

```
Step 1: conversation_learnings → group by topic → count frequency
Step 2: autoSuggestKnowledge() — যদি ১০০০+ বার একই প্রশ্ন আসে
Step 3: auto-approve if confidence > 0.95, else queue for human review
Step 4: orchestrator integration — new knowledge auto-added to context
```

---

# PHASE 6: এক্সপেরিমেন্ট ও মার্কেটপ্লেস লেয়ার (Platform Layer)

## 17. AI Experiment Engine ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ agent-tuning.ts — A/B testing for agent prompts (startABTest, completeABTest)  
✅ agent_prompt_versions টেবিল  
✅ agent_ab_tests টেবিল  
✅ Mock A/B data in personalize/stats  
❌ **User-facing A/B experiments নেই** — যেমন মেসেজ ভেরিয়েন্ট, প্রাইস টেস্টিং  

### কী যোগ করতে হবে
Experiment types:
1. **Message A/B:** একই অফারের ১০টি ভিন্ন মেসেজ → কোনটির রেসপন্স রেট বেশি?
2. **Offer A/B:** ভিন্ন প্রাইস/ডিসকাউন্ট → কোনটি বেশি কনভার্ট করে?
3. **Timing A/B:** সকাল vs বিকাল → কখন পাঠালে বেশি রেসপন্স?
4. **Channel A/B:** WhatsApp vs Email vs SMS → কোন চ্যানেল বেশি কার্যকর?

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/lib/experiments/manager.ts` | ExperimentConfig, createExperiment(), assignVariant(), trackResult(), analyzeResult() |
| `src/lib/db/index.ts` | `experiments` টেবিল (id, name, type, variants JSON, status, start_date, end_date) |
| `src/lib/db/index.ts` | `experiment_results` টেবিল (experiment_id, phone, variant, action_taken, converted, timestamp) |
| `src/lib/ai/outreach/campaign.ts` | experiment variant assignment |
| NEW: `src/app/api/admin/experiments/route.ts` | API |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৬ ঘন্টা)

```
Step 1: experiments + experiment_results টেবিল
Step 2: experiments/manager.ts — create, assign, track
Step 3: experiments/manager.ts — statistical analysis (chi-square)
Step 4: campaign.ts — experiment integration (variant assignment)
Step 5: admin API
Step 6: auto-declare winner after statistical significance
```

---

## 18. AI Marketplace ⭐☆☆☆☆ → ⭐⭐⭐⭐☆

### বর্তমান অবস্থা
✅ products টেবিল (ফিজিক্যাল প্রোডাক্ট)  
✅ courses টেবিল (৯৩২+ কোর্স)  
✅ course_categories, course_category_map  
✅ course_files (ভিডিও/ডকুমেন্ট/লিংক)  
✅ resource_purchases  
✅ course_ratings, course_bookmarks, course_downloads, course_progress  
❌ **স্কেলেবল মার্কেটপ্লেস আর্কিটেকচার নেই**  

### কী যোগ করতে হবে
স্কেলেবল মার্কেটপ্লেস:
- **Resource Types:** course, ebook, template, tool, service, consultation
- **Pricing Models:** free, one-time, subscription, installment, bundle
- **Content Delivery:** streaming, download, external link, WhatsApp delivery
- **Provider System:** third-party content creators
- **Revenue Share:** 70/30, 80/20 splits
- **Rating & Review:** enhanced

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| `src/lib/db/index.ts` | `marketplace_listings` টেবিল (এক্সিস্টিং courses/products কে ইউনিফাই করা) |
| `src/lib/db/index.ts` | `content_providers` টেবিল (third-party creators) |
| `src/lib/db/index.ts` | `revenue_shares` টেবিল (provider_id, product_id, split_percentage) |
| NEW: `src/app/api/marketplace/` | স্কেলেবল API |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৬-৮ ঘন্টা)

```
Step 1: marketplace_listings — ইউনিফাইড রিসোর্স টেবিল
Step 2: content_providers — থার্ড-পার্টি সাপোর্ট
Step 3: revenue_shares — প্রোভাইডার পেমেন্ট
Step 4: marketplace API — search, filter, purchase, deliver
Step 5: orchestrator context — enhanced marketplace data
```

---

## 19. AI Executive Dashboard ⭐⭐☆☆☆ → ⭐⭐⭐⭐⭐

### বর্তমান অবস্থা
✅ /api/dashboard/summary — বেসিক ড্যাশবোর্ড  
✅ ইন্ডিভিজুয়াল ইউজার ড্যাশবোর্ড  
✅ IncomeProgress কম্পোনেন্ট  
✅ ai-predictions পেজ  
❌ **এক্সিকিউটিভ-লেভেল ড্যাশবোর্ড নেই**  

### কী যোগ করতে হবে
রিয়েল-টাইম এক্সিকিউটিভ ড্যাশবোর্ড:

| মেট্রিক | সোর্স |
|---------|-------|
| আজকের রেজিস্ট্রেশন | workers টেবিল |
| আজকের প্রিমিয়াম আপগ্রেড | workers.premium_status |
| কনভার্সন রেট | (premium / total) × 100 |
| অ্যাক্টিভ AI এজেন্ট | agent_schedule |
| রেভিনিউ (আজ/এই মাস) | orders |
| রিটেনশন রেট | churn_probability < 50 |
| চার্ন রেট | churn_probability > 70 |
| ফানেল ড্রপ | funnel tracking |
| টপ কোর্স | course_downloads |
| টপ ক্যাম্পেইন | wa_outreach_campaigns |
| টিম গ্রোথ | affiliate_tree |

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/app/api/executive/dashboard/route.ts` | সব মেট্রিক একসাথে ফেচ করা |
| NEW: `src/app/executive/` | এক্সিকিউটিভ ড্যাশবোর্ড পেজ |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৫-৬ ঘন্টা)

```
Step 1: executive API — all metrics in one endpoint
Step 2: executive UI — summary cards
Step 3: executive UI — charts (registrations, revenue, churn over time)
Step 4: executive UI — funnel visualization
Step 5: executive UI — top campaigns/courses table
Step 6: auto-refresh every 60 seconds
```

---

## 20. AI API Layer ⭐⭐☆☆☆ → ⭐⭐⭐⭐☆

### বর্তমান অবস্থা
✅ `callAI()` — লাইব্রেরি ফাংশন (এক্সপোর্টেড)  
✅ ২২টি AI API route  
✅ ai_api_keys টেবিল  
✅ ai_models টেবিল  
✅ ai_model_failover_state  
✅ OpenRouter + OpenCode support  
❌ **পাবলিক API গেটওয়ে নেই**  
❌ **API key authentication for external users নেই**  
❌ **Rate limiting per key নেই**  
❌ **API documentation নেই**  

### কী যোগ করতে হবে
External developers-এর জন্য REST API:

```http
POST /api/v1/chat
Authorization: Bearer <api_key>
{
  "phone": "017xxxx",
  "message": "Hello",
  "language": "bn"
}
```

```http
POST /api/v1/content/generate
Authorization: Bearer <api_key>
{
  "type": "blog",
  "topic": "AI in Bangladesh",
  "language": "bn"
}
```

### কোথায় পরিবর্তন লাগবে
| ফাইল | কী করতে হবে |
|------|------------|
| NEW: `src/app/api/v1/chat/route.ts` | পাবলিক চ্যাট API |
| NEW: `src/app/api/v1/content/route.ts` | পাবলিক কনটেন্ট API |
| NEW: `src/lib/api-gateway/auth.ts` | API key validation, rate limiting |
| NEW: `src/lib/api-gateway/rate-limiter.ts` | Per-key rate limiting |

### ইমপ্লিমেন্টেশন স্টেপস (Estim: ৪-৫ ঘন্টা)

```
Step 1: API Gateway — key validation middleware
Step 2: API Gateway — rate limiter  
Step 3: API v1 — chat endpoint
Step 4: API v1 — content endpoint
Step 5: API docs (OpenAPI/Swagger)
```

---

# ইমপ্লিমেন্টেশন রোডম্যাপ

## Priority Matrix

```
                    High Impact                  Low Impact
                   ┌─────────────────┬─────────────────────┐
   Easy to do      │ 1. Life Profile │ Emotion Timeline    │
                   │ 3. Learning Graph│ Retention Engine    │
                   │ 11. Goal Planner│ Referral Intel      │
                   ├─────────────────┼─────────────────────┤
   Hard to do      │ 8. Multi-Agent  │ Revenue Forecast    │
                   │ 9. AI Supervisor│ Fraud Detection     │
                   │ 17. Marketplace │ Knowledge Evolution │
                   │ 19. Dashboard   │ API Layer           │
                   │ 15. Experiments │                     │
                   └─────────────────┴─────────────────────┘
```

## Phase-by-Phase Execution Order

### ফেজ ১: Immediate (Next 1-2 সপ্তাহ)
| মডিউল | এস্টিমেটেড সময় |
|--------|----------------|
| ১. AI Life Profile Engine | ৪-৫ ঘন্টা |
| ১১. AI Emotion Timeline | ৩-৪ ঘন্টা |
| ১২. AI Retention Engine | ৪ ঘন্টা |
| **মোট** | **~১২ ঘন্টা** |

### ফেজ ২: Short-term (Next 2-3 সপ্তাহ)
| মডিউল | এস্টিমেটেড সময় |
|--------|----------------|
| ২. AI Memory Graph | ৬-৮ ঘন্টা |
| ৩. AI Learning Graph | ৫-৬ ঘন্টা |
| ৫. AI Skill Score | ৪ ঘন্টা |
| ১৩. AI Referral Intelligence | ৩ ঘন্টা |
| **মোট** | **~২০ ঘন্টা** |

### ফেজ ৩: Medium-term (Next 3-5 সপ্তাহ)
| মডিউল | এস্টিমেটেড সময় |
|--------|----------------|
| ৪. AI Opportunity Detector | ৩-৪ ঘন্টা |
| ৬. AI Sales Prediction | ৫ ঘন্টা |
| ৭. AI Churn Prediction | ৩-৪ ঘন্টা |
| ১৪. AI Goal Planner | ৫-৬ ঘন্টা |
| ১৯. AI Executive Dashboard | ৫-৬ ঘন্টা |
| **মোট** | **~২৪ ঘন্টা** |

### ফেজ ৪: Long-term (Next 5-8 সপ্তাহ)
| মডিউল | এস্টিমেটেড সময় |
|--------|----------------|
| ৮. Multi-Agent AI | ১০-১২ ঘন্টা |
| ৯. AI Supervisor | ৪-৫ ঘন্টা |
| ১৫. AI Revenue Forecast | ৩-৪ ঘন্টা |
| ১৬. AI Fraud Detection | ৫-৬ ঘন্টা |
| **মোট** | **~২৫ ঘন্টা** |

### ফেজ ৫: Platform Scale (Next 8-12 সপ্তাহ)
| মডিউল | এস্টিমেটেড সময় |
|--------|----------------|
| ১৭. AI Knowledge Evolution | ৪ ঘন্টা |
| ১৮. AI Experiment Engine | ৬ ঘন্টা |
| ২০. AI Marketplace | ৬-৮ ঘন্টা |
| ২১. AI API Layer | ৪-৫ ঘন্টা |
| **মোট** | **~২২ ঘন্টা** |

---

## ডিপেন্ডেন্সি গ্রাফ

```
Phase 1 (Foundation)
  ├── Life Profile ←── Emotion Timeline (uses profile)
  └── Retention Engine ←── Emotion Timeline (churn detection)

Phase 2 (Memory & Skills)
  ├── Memory Graph ←── Life Profile (adds nodes)
  ├── Learning Graph ←── Memory Graph (skill nodes)
  ├── Skill Score ←── Learning Graph (skill traversal)
  └── Referral Intel ←── Life Profile (network analysis)

Phase 3 (Prediction)
  ├── Opportunity Detector ←── Life Profile + Skill Score
  ├── Sales Prediction ←── Emotion Timeline + Skill Score
  ├── Churn Prediction ←── Emotion Timeline + Retention Engine
  ├── Goal Planner ←── Learning Graph + Skill Score
  └── Executive Dashboard ←── ALL previous modules

Phase 4 (Intelligence)
  ├── Multi-Agent ←── All previous (agents need all data)
  ├── Supervisor ←── Multi-Agent
  ├── Revenue Forecast ←── Executive Dashboard data
  └── Fraud Detection ←── Life Profile + Memory Graph

Phase 5 (Scale)
  ├── Knowledge Evolution ←── Multi-Agent + Learning Graph
  ├── Experiment Engine ←── Multi-Agent
  ├── Marketplace ←── Learning Graph + Executive Dashboard
  └── API Layer ←── ALL modules (exposes functionality)
```

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Multi-Agent AI টু কমপ্লেক্স | 🔴 High | Phase 4 এ রাখা হয়েছে, আগে ফাউন্ডেশন শক্ত করা |
| Memory Graph পারফরম্যান্স | 🟡 Medium | D1-তে গ্রাফ কোয়েরি expensive — caching layer যোগ করা |
| Fraud Detection false positive | 🟡 Medium | হিউম্যান রিভিউ ছাড়া auto-block না করা |
| Marketplace scale | 🟡 Medium | ডাটাবেজ শার্ডিং বা KV cache দরকার হতে পারে |
| API Layer security | 🟡 Medium | Rate limiting + key rotation |
| Emotion Timeline data volume | 🟢 Low | ৩০ দিন retention, তারপর aggregation |

---

## উপসংহার

**বর্তমান সিস্টেম একজন AI আর্কিটেক্টের জন্য ৮৫-৯০% প্রস্তুত।** বেসিক ফাউন্ডেশন (ওয়েবহুক, ব্রেইন, স্কোরিং, পেমেন্ট, আউটরিচ) সম্পূর্ণ কাজ করে। 

**যা যোগ করলে সিস্টেম ৯৮% হয়ে যাবে:**
1. Life Profile Expansion (ডাটা শুধু সংগ্রহ না, এনালাইসিস এবং অ্যাকশনেবল)
2. Multi-Agent Architecture (এক AI নয়, বরং ১০টি বিশেষায়িত AI)
3. Prediction + Retention Layer (আগে থেকে জানা + অ্যাকশন নেওয়া)
4. Knowledge Evolution (স্ট্যাটিক থেকে সেলফ-লার্নিং)
5. Executive Dashboard (সম্পূর্ণ বিজনেস ভিজিবিলিটি)

**সবচেয়ে গুরুত্বপূর্ণ Recommendation:**
> আপনার User-এর Value Proposition শুধু "MLM Income Opportunity" না — বরং "AI-Powered Personal Career Growth Platform"। MLM শব্দটি ব্যবহার না করে "AI-Driven Affiliate Learning Ecosystem" বললে ব্র্যান্ড ভ্যালু এবং গ্রহণযোগ্যতা অনেক বাড়বে।

---

*রিপোর্ট শেষ | ২৪ জুলাই, ২০২৬*
