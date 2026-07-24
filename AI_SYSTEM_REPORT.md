# WhatsApp AI সিস্টেম — সম্পূর্ণ কার্যক্রম বিশ্লেষণ রিপোর্ট

**প্রকল্প:** Jobayer Group Career  
**প্ল্যাটফর্ম:** Next.js 16.2.6 + Cloudflare Workers + D1 Database  
**ভাষা:** TypeScript (Backend), Bengali/English (AI Communication)  
**তারিখ:** ২৪ জুলাই, ২০২৬  

---

## ১. ভূমিকা — সিস্টেম আর্কিটেকচার ওভারভিউ

সম্পূর্ণ সিস্টেমটি একটি WhatsApp AI চ্যাটবট যেটি কাস্টমার, জেনারেল মেম্বার এবং প্রিমিয়াম মেম্বার — সবার সাথে স্বয়ংক্রিয়ভাবে কথা বলে, তাদের লিড ট্র্যাক করে, প্রোডাক্ট/কোর্স রেকমেন্ড করে, এবং সেলস ফানেল অনুযায়ী কনভার্সেশন পরিচালনা করে।

```
WhatsApp Message → Webhook → Parse → FastLane? → Brain/Orchestrator → AI Model → Reply
                                    ↓                    ↓
                              Instant Reply      Context Builder
                                                   (Scoring, Recs,
                                                    Segment, Training,
                                                    Team, Content, MI)
```

---

## ২. সম্পূর্ণরূপে তৈরি — যা যা কাজ করে

### ২.১ WhatsApp ওয়েবহুক (`src/app/api/whatsapp/webhook/route.ts`)

**মেসেজ রিসিভ:** Meta Cloud API থেকে WhatsApp মেসেজ, ভয়েস, ইমেজ গ্রহণ
**স্ট্যাটাস আপডেট:** sent/delivered/read স্ট্যাটাস ট্র্যাক করে, read দেখলে ২ মিনিট পর ফলোআপ শিডিউল করে
**ভয়েস/ইমেজ প্রসেসিং:** 
- ভয়েস → ডাউনলোড → STT (Speech-to-Text) ট্রান্সক্রিপশন
- ইমেজ → ডাউনলোড → AI ইমেজ অ্যানালাইসিস (বর্ণনা জেনারেশন)
**ডিডুপ্লিকেশন:** ৩০ সেকেন্ডের মধ্যে ডুপ্লিকেট ওয়েবহুক ডেলিভারি স্কিপ
**ডিটেকশন সিস্টেম:** 
- ল্যাঙ্গুয়েজ (EN/BN), মুড (enthusiastic/neutral/skeptical/bored/distracted)
- ডায়ালেক্ট (Dhaka/Chittagong/Sylhet/Rural/Standard), রিলিজিয়ন
- পেইন পয়েন্টস, ইন্টারেস্টস — টেক্সট অ্যানালাইসিস
- ফানেল স্টেজ: 1-4 (stranger), 5-6 (lead), 7-8 (free_member), 9-12 (premium), 13+ (vip)

**প্রসেসিং ফ্লো:**
```
Message → Dedup Check → Media Process → Profile Update → 
Score Calc → Funnel Stage → FastLane Check → Brain/Orchestrator →
Fallback (buy intent / complaint / general) → Reply Send (Cloud API / Relay)
```

### ২.২ AI ব্রেইন/অর্কেস্ট্রেটর (`src/lib/ai/brain/orchestrator.ts`)

**সিস্টেম প্রম্পট — ১৭০+ লাইনের বিশাল প্রম্পট:**
1. **মাইন্ডসেট:** Sandler Selling, SPIN Selling, Consultative Selling
2. **কাস্টমার প্রোফাইল:** নাম, ফোন, রোল, টিয়ার, ল্যাঙ্গুয়েজ, মুড, মোট চ্যাট, ইন্টারেস্ট, পেইন পয়েন্ট
3. **মেমরি & কন্টাক্ট ইন্টেলিজেন্স:** আগের কথোপকথন থেকে শেখা তথ্য
4. **প্রোডাক্ট ক্যাটালগ:** ডাটাবেস থেকে রিয়েল প্রোডাক্ট ও প্রাইসিং
5. **মেম্বারশিপ প্ল্যান & অর্ডার ফ্লো:** Standard (Free), Premium (1,500 TK), VIP (5,000 TK)
6. **লিড স্কোরিং কনটেক্সট:** interest/buying/priority/engagement/recency স্কোর
7. **রেকমেন্ডেশন কনটেক্সট:** ইউজারের ইন্টারেস্ট অনুযায়ী কোর্স/প্রোডাক্ট
8. **মার্কেটিং ইন্টেলিজেন্স:** সেগমেন্ট (VIP/Active Buyer/Engaged Learner/At Risk/New/Dormant)
9. **ক্যাম্পেইন সাজেশন:** সেগমেন্ট অনুযায়ী অটোমেটিক ক্যাম্পেইন
10. **টিম ট্র্যাকিং:** ডাইরেক্ট মেম্বার, টোটাল টিম, উইকলি অ্যাক্টিভিটি
11. **সেলস টেকনিকস:** ১০টি অ্যাডভান্সড সেলস টেকনিক (Mirror & Match, Future Pacing, Double Bind, Loss Aversion, ইত্যাদি)
12. **অবজেকশন হ্যান্ডলিং ম্যাট্রিক্স:** ১১টি সাধারণ অবজেকশনের জন্য স্পেসিফিক রেসপন্স
13. **সাকসেস স্টোরিজ:** রহিম (student → 8-12k/month), ফাতিমা (homemaker → 25k+/month)

**ইন্টেন্ট ক্লাসিফায়ার (১৫টি ইন্টেন্ট):**
- greeting, farewell, product_inquiry, price_inquiry, purchase, registration, support, complaint, feedback, referral, commission_inquiry, withdrawal, training, motivation, general

**হাইব্রিড ক্লাসিফিকেশন:** ফ্রি (rule-based) ক্লাসিফায়ার আগে চেষ্টা → ব্যর্থ হলে AI-ভিত্তিক ক্লাসিফায়ার (Gemma 4 26B) — জিরো-টোকেন অপ্টিমাইজেশন

**AI মডেল চেইন:**
1. Primary: LLaMA 3.3 70B (OpenRouter) — টাইমআউট ৮০০ms
2. Fallback: LLaMA 3.3 70B (same, shorter prompt)
3. Error Fallback: স্ট্যাটিক মেসেজ

### ২.৩ FastLane — জিরো-টোকেন ইন্সট্যান্ট রিপ্লাই (`src/lib/ai/fast-lane.ts`)

**৫টি লেন:** greeting, farewell, thanks, confirmation, identity  
**প্যাটার্ন ম্যাচিং:** EN/BN উভয় ভাষায় রেজেক্স-ভিত্তিক ম্যাচিং  
**বেনিফিট:** ব্রেইন কল না করেই ইন্সট্যান্ট রিপ্লাই — ০ টোকেন খরচ

### ২.৪ লিড স্কোরিং ইঞ্জিন (`src/lib/ai/scoring-engine.ts`)

**৫টি স্কোর কম্পোনেন্ট:**
- recencyScore: শেষ অ্যাক্টিভিটি কত দিন আগে (৩ দিন = ৯১, ৩০ দিন = ৫)
- engagementScore: মোট চ্যাট সংখ্যা (প্রতি চ্যাটে ৫ পয়েন্ট, ম্যাক্স ১০০)
- interestScore: ইন্টারেস্ট × ১৫ + পেইন পয়েন্ট × ১০ + ট্রাস্ট স্কোর × ০.৩
- buyingScore: অর্ডার × ১৫ + স্পেন্ট/২০০ + মেম্বারশিপ বোনাস (VIP=30, Premium=20)
- priorityScore: recency×25% + engagement×20% + interest×25% + buying×30%

**স্কোর লেবেল:** 80+ = hot, 60-79 = warm, 40-59 = lukewarm, 20-39 = cool, <20 = cold  
**বাংলা লেবেল:** হট, ওয়ার্ম, হালকা, কুল, কোল্ড

### ২.৫ রেকমেন্ডেশন ইঞ্জিন (`src/lib/ai/recommendation-engine.ts`)

- ইউজারের `user_interests` টেবিল থেকে ক্যাটাগরি স্কোর ও টপ ক্যাটাগরি পড়ে
- সে অনুযায়ী কোর্স ও প্রোডাক্ট ম্যাচ করে (আগে কেনা আইটেম বাদ দিয়ে)
- কোনো ইন্টারেস্ট না থাকলে নতুন আইটেম দেখায়
- বাংলা ও ইংরেজি উভয় ভাষায় রেকমেন্ডেশন রিজন সহ

### ২.৬ মার্কেটিং ইন্টেলিজেন্স (`src/lib/ai/marketing-intelligence.ts`)

**৬টি সেগমেন্ট:**
| সেগমেন্ট | শর্ত | প্রায়োরিটি |
|-----------|------|-------------|
| VIP | buying≥70 + engagement≥60 + recency≥50 | ১ |
| Active Buyer | buying≥40 + recency≥60 | ২ |
| Engaged Learner | interest≥60 + engagement≥50 + buying<40 | ৩ |
| At Risk | recency<30 + engagement≥40 | ৪ |
| New | score<30 + engagement<30 | ৫ |
| Dormant | বাকি সব | ৬ |

**প্রতি সেগমেন্টের জন্য ক্যাম্পেইন সাজেশন:**
- VIP → Loyalty Reward (এক্সক্লুসিভ অফার)
- Active Buyer → Cross-sell (কমপ্লিমেন্টারি প্রোডাক্ট)
- Engaged Learner → Course-to-Product Bridge
- At Risk → Re-engagement (ওয়েলকাম-ব্যাক কুপন)
- New → Welcome & Onboarding (ফ্রি রিসোর্স)
- Dormant → Re-activation (নতুন প্রোডাক্ট)

### ২.৭ প্রাইসিং ইঞ্জিন (`src/lib/ai/pricing-engine.ts`)

ডায়নামিক ডিসকাউন্ট:
- স্কোর ৮০+ → ২০-২৫% ছাড়
- স্কোর ৬০+ → ১৫-২০% ছাড়  
- স্কোর ৪০+ → ১০% ছাড়
- পুনঃক্রেতা বোনাস: ৫+ অর্ডার = +৫%, ৩+ অর্ডার = +৩%
- হাই স্পেন্ডার: ৫০,০০০+ খরচ = +৫%
- ম্যাক্সিমাম ৫০% ছাড়
- অটো কুপন কোড জেনারেশন

### ২.৮ পারমিশন সিস্টেম (`src/lib/permissions/index.ts` + `src/app/api/permissions/route.ts`)

**টেবিল:** `user_permissions` — worker_id, permission_type, scope, expires_at, granted_by  
**CRUD API:** GET (list/check), POST (grant), PUT (scope update), DELETE (revoke)

### ২.৯ টিম ট্র্যাকার (`src/lib/ai/prompts/team-tracker.ts`)

- ডাইরেক্ট চিলড্রেন কাউন্ট
- টোটাল টিম মেম্বার (affiliate_tree থেকে)
- উইকলি অ্যাক্টিভ মেম্বার
- লাস্ট মান্থের নতুন মেম্বার
- টপ পারফর্মার আইডেন্টিফিকেশন

### ২.১০ স্টেজ স্ক্রিপ্ট (`src/lib/ai/prompts/stage-scripts.ts`)

**৫টি স্টেজের জন্য স্পেসিফিক স্ক্রিপ্ট:**
1. **Stranger (0-4 chats):** Business intro, warm approach, cold response, social media lead gen
2. **Lead:** Need discovery, pain amplification, value proposition, initial objection handling
3. **Free Member:** Feature presentation, benefit stacking, social proof
4. **Premium:** Upsell techniques, VIP benefits, exclusivity framing
5. **VIP:** Referral training, leadership development, target planning

মোট ৩৭৩ লাইনের বিস্তারিত EN/BN স্ক্রিপ্ট

### ২.১১ ট্রেনিং মডিউল (`src/lib/ai/prompts/training-modules.ts`)

**২১টি AI-WhatsApp অ্যাপ্লিকেবল মডিউল (মোট ৬২৯ লাইন):**
communication_basics, question_techniques, active_listening, storytelling, goal_setting, planning_techniques, positive_mindset, time_management, priority_management, financial_basics, budget_planning, saving_money, ethical_selling, integrity_values, objection_handling, conflict_management, needs_assessment, analytical_skills, creative_problem, effective_sales, learning_path

### ২.১২ প্রকিউরেজ অটোমেশন (`src/lib/ai/purchase-automation.ts`)

**৩টি মেম্বারশিপ প্ল্যান:**
| প্ল্যান | মূল্য | ফিচার |
|--------|------|--------|
| Standard | ফ্রি | বেসিক ট্রেনিং, ১০% কমিশন, কমিউনিটি |
| Premium | ১,৫০০ TK | অ্যাডভান্সড ট্রেনিং, ২৫% কমিশন, প্রায়োরিটি সাপোর্ট, টিম টুলস |
| VIP | ৫,০০০ TK | ভিআইপি ট্রেনিং, ৪০% কমিশন, পার্সোনাল AI অ্যাসিস্ট্যান্ট, মেন্টরশিপ |

**অর্ডার ফ্লো গাইড:** "কিনতে চাই" বললেই পেমেন্ট অপশন (bKash/Nagad/SSLCommerz/COD)

### ২.১৩ কনটেন্ট ইঞ্জিন (`src/lib/ai/content-engine.ts` + `src/app/api/ai/content/route.ts`)

**৫ ধরনের কনটেন্ট:** blog, social, marketing, training, newsletter  
**৫টি টোন:** professional, friendly, motivational, formal, casual  
**ডুয়াল ল্যাঙ্গুয়েজ:** বাংলা ও ইংরেজি  
**REST API:** POST /api/ai/content — টপিক, টাইপ, ল্যাঙ্গুয়েজ, টোন দিলে AI কনটেন্ট জেনারেট করে  
**GET /api/ai/content?type=blog&language=bn** — কনটেন্ট আইডিয়া রিটার্ন

### ২.১৪ মাল্টি-চ্যানেল আউটরিচ (`src/lib/ai/outreach/multi-channel.ts`)

**৩টি চ্যানেল:** WhatsApp (পূর্ণাঙ্গ), Email (stub — dev mode এ লগ), SMS (stub — dev mode এ লগ)  
**চ্যানেল সিলেকশন অটোমেটিক:** WhatsApp > Email > SMS (প্রায়োরিটি অনুযায়ী)

### ২.১৫ আউটরিচ ক্যাম্পেইন সিস্টেম (`src/lib/ai/outreach/campaign.ts`)

- ক্যাম্পেইন তৈরি (draft/running/paused/completed)
- টার্গেট সিলেকশন (status, priority, days since contact)
- AI মেসেজ জেনারেশন (AI-generated বা টেমপ্লেট)
- WhatsApp মেসেজ কিউতে এনকিউ
- লগিং ও ট্র্যাকিং (sent, replied, errored)
- ব্যাচ এক্সিকিউশন

### ২.১৬ প্রোঅ্যাকটিভ ফলোআপ সিস্টেম (`src/app/api/cron/keepwarm/route.ts`)

**৩ ধরনের প্রোঅ্যাকটিভ আউটরিচ:**
1. **নতুন লিড:** ১ ঘন্টা পুরনো, কখনো কন্টাক্ট করেনি → ওয়েলকাম মেসেজ
2. **Seen-no-reply:** ৩০ মিনিটের মধ্যে মেসেজ দেখেছে কিন্তু রিপ্লাই দেয়নি → ফলোআপ
3. **স্টেল কন্টাক্ট:** ৪৮ ঘন্টা কোনো কার্যক্রম নেই → রি-এংগেজমেন্ট মেসেজ

**প্রোঅ্যাকটিভ মেসেজ:** ৫টি ভেরিয়েন্ট, র্যান্ডমলি সিলেক্ট

### ২.১৭ পেমেন্ট & অর্ডার সিস্টেম (`src/app/api/payment/*`)

**পূৰ্ণাঙ্গ পেমেন্ট ফ্লো:**
1. **init** — অর্ডার ক্রিয়েশন, SSLCommerz/COS গেটওয়ে URL জেনারেশন
2. **success** — পেমেন্ট কনফার্ম, অর্ডার স্ট্যাটাস আপডেট, কমিশন ডিস্ট্রিবিউশন, প্রিমিয়াম আপগ্রেড
3. **fail** — অর্ডার 'failed' মার্ক
4. **cancel** — অর্ডার 'cancelled' মার্ক
5. **ipn** — ইনস্ট্যান্ট পেমেন্ট নোটিফিকেশন হ্যান্ডলিং
6. **validate** — অর্ডার/ট্রানজেকশন ভ্যালিডেশন

### ২.১৮ ডাটাবেজ — AI/মেম্বার রিলেটেড টেবিল

মোট ৫০+ টেবিলের মধ্যে AI-সম্পর্কিত উল্লেখযোগ্য টেবিল:
- `ai_phone_profiles` — ইউজার প্রোফাইল (চ্যাট, স্পেন্ট, ইন্টারেস্ট, পেইন পয়েন্ট, ট্রাস্ট)
- `ai_leads` — লিড ট্র্যাকিং (স্ট্যাটাস, প্রায়োরিটি, সোর্স, ইত্যাদি)
- `ai_conversations` — কনভার্সেশন লগ
- `ai_skills` — অটো-লার্নড স্কিলস (Q&A পেয়ার)
- `agent_memory` — মেমরি স্টোরেজ (ইউজার প্রেফারেন্স, লাস্ট ইন্টেন্ট, ইত্যাদি)
- `user_interests` — ক্যাটাগরি স্কোর, টপ ক্যাটাগরি
- `user_behavior_scores` — RFM, সেগমেন্ট, লাইফটাইম ভ্যালু
- `user_permissions` — পারমিশন সিস্টেম
- `proactive_followups` — ফলোআপ ট্র্যাকিং
- `wa_outreach_campaigns` — ক্যাম্পেইন ম্যানেজমেন্ট
- `workers` — মেম্বার রেকর্ড (level, sponsor, commission, etc.)
- `orders` — অর্ডার ট্র্যাকিং
- `products` — প্রোডাক্ট ক্যাটালগ
- `courses` — কোর্স ক্যাটালগ

### ২.১৯ মেমরি সিস্টেম (`src/lib/ai/brain/memory.ts`)

ইউজার মেমরি স্টোরেজ — ইন্টেন্ট, মুড, লাস্ট রেসপন্স, নাম, ডায়ালেক্ট — ৩টি ক্যাটাগরিতে:
- session (২小时 মেয়াদ)
- preference (১ দিন)
- profile (৩০ দিন)

### ২.২০ কন্টাক্ট ইন্টেলিজেন্স (`src/lib/ai/contact-intelligence.ts`)

- টেক্সট থেকে ইনসাইট এক্সট্র্যাক্ট (গোল, অবজেকশন, স্পেন্ডিং প্যাটার্ন)
- ডাটাবেজে সঞ্চয়
- অর্কেস্ট্রেটরে কন্টেক্সট হিসেবে ইনজেক্ট

### ২.২১ নলেজ বেস (`src/lib/ai/knowledge-brain.ts` + `src/lib/ai/seed-data/all-entries.ts`)

৩০+ নলেজ এন্ট্রি — কোম্পানি, প্রোডাক্ট, সাকসেস স্টোরি, ট্রেনিং, মোটিভেশন  
পেজ ও ডিস্ট্রিবিউশন সিস্টেম সহ

### ২.২২ কোয়ালিটি গেট (`src/lib/ai/quality-gate.ts`)

ইন্টারঅ্যাকশন কোয়ালিটি স্কোরিং — ভালো Q&A অটো-সেভ হয় স্কিলস হিসেবে

---

## ৩. আংশিকভাবে তৈরি — যা কাজ করে কিন্তু অসম্পূর্ণ

### ৩.১ ইমেইল ও এসএমএস চ্যানেল

**স্ট্যাটাস:** `src/lib/ai/outreach/multi-channel.ts`-এ ফাংশন তৈরি আছে  
**কিন্তু:** 
- ইমেইল API (EMAIL_API_URL/EMAIL_API_KEY) এনভায়রনমেন্ট ভেরিয়েবল সেট না থাকলে শুধু কনসোল লগ করে
- এসএমএস API (SMS_API_URL/SMS_API_KEY) একই অবস্থা
- প্রকৃত ইমেইল/এসএমএস সার্ভিসের সাথে ইন্টিগ্রেশন হয়নি

### ৩.২ MLM ট্রি বিল্ডিং

**স্ট্যাটাস:** affiliate_tree টেবিল আছে, `getDirectChildren`, `getSponsorUpline` ফাংশন আছে  
**কিন্তু:** 
- রিয়েল কন্টাক্ট সিঙ্ক (W3C Contact Picker) নেই — সিমুলেটেড/ফেক
- রেফারার রেজোলিউশন ভাঙা (যেহেতু কন্টাক্ট সিঙ্ক ফেক)
- ট্রি সঠিকভাবে বিল্ড হচ্ছে না

### ৩.৩ পারমিশন সিস্টেম UI

**স্ট্যাটাস:** ব্যাকএন্ড (টেবিল, লিব, API) সম্পূর্ণ  
**কিন্তু:** 
- ড্যাশবোর্ড UI / Permission Center পেজ তৈরি হয়নি
- শুধুমাত্র API এর মাধ্যমে ম্যানেজ করা যায়

### ৩.৪ স্কোরিং পাইপলাইন ভেরিফিকেশন

**স্ট্যাটাস:** cron job + events trigger + manual endpoint সব যোগ করা হয়েছে  
**কিন্তু:** এন্ড-টু-এন্ড ভেরিফিকেশন করা হয়নি যে স্কোর সঠিকভাবে পপুলেট হচ্ছে কিনা

### ৩.৫ প্রশিক্ষণ মডিউল — কিছু ফাঁক

**স্ট্যাটাস:** ২১টি মডিউল তৈরি  
**বাকি আছে:** মডিউল m1_market_research, m2_product_knowledge, m4_testimonial_collection, m7_lead_generation, m8_direct_selling, m9_presentation_skills, m10_public_speaking, m11_event_management, m13_team_management — এগুলো এখনও ইমপ্লিমেন্ট হয়নি

---

## ৪. যা তৈরি হয়নি — সম্পূর্ণ অনুপস্থিত

### ৪.১ ইউনিট টেস্ট

পুরো প্রজেক্টে একটি টেস্ট ফাইল নেই। কোনো টেস্ট ফ্রেমওয়ার্ক (Jest/Vitest) সেটআপ করা হয়নি।

### ৪.২ ড্যাশবোর্ড/UI এনালিটিক্স

- সেগমেন্টেশন ভিজুয়ালাইজেশন নেই
- ফানেল এনালিটিক্স নেই
- রিয়েল-টাইম ড্যাশবোর্ড নেই
- ক্যাম্পেইন পারফরম্যান্স মনিটরিং UI নেই

### ৪.৩ ক্যাশ ইনভ্যালিডেশন

`semantic-cache.ts` ও `response-cache.ts` আছে কিন্তু ক্যাশ ইনভ্যালিডেশন সিস্টেম নেই — ক্যাশেড ডেটা পুরনো হতে পারে।

### ৪.৪ RLHF / ফিডব্যাক লুপ

`agent_feedback` টেবিল আছে কিন্তু অটোমেটিক ফিডব্যাক লার্নিং লুপ (Reinforcement Learning from Human Feedback) ইমপ্লিমেন্ট হয়নি।

### ৪.৫ A/B টেস্টিং সিস্টেম

কোনো A/B টেস্টিং ফ্রেমওয়ার্ক নেই — বিভিন্ন মেসেজিং স্ট্র্যাটেজি টেস্ট করার উপায় নেই।

### ৪.৬ ক্রস-ল্যাঙ্গুয়েজ লার্নিং

`cross-user-learning.ts` আছে কিন্তু সক্রিয়ভাবে ব্যবহার হচ্ছে না — একজন ইউজারের শিক্ষা অন্য ইউজারের জন্য ব্যবহার হচ্ছে না।

### ৪.৭ ওয়েব/অ্যাপ UI (ইউজার ফেসিং)

- কোনো লগইন পেজ নেই
- কোনো রেজিস্ট্রেশন ফর্ম নেই
- কোনো প্রোডাক্ট ব্রাউজিং UI নেই
- কোনো অর্ডার/পেমেন্ট UI নেই
- বর্তমানে শুধুমাত্র WhatsApp ইন্টারফেস দিয়েই সবকিছু হচ্ছে

### ৪.৮ মাল্টি-এজেন্ট কলাবোরেশন

`agents/` ডিরেক্টরি আছে কিন্তু একাধিক এজেন্টের মধ্যে কলাবোরেশন সিস্টেম তৈরি হয়নি। বর্তমানে সিঙ্গেল AI মডেলই সব উত্তর দেয়।

### ৪.৯ মনিটরিং & অ্যালার্টিং

- কোনো প্রমিথিউস মেট্রিক্স নেই
- কোনো সেন্টরি/ডেটাডগ ইন্টিগ্রেশন নেই
- কোনো অ্যালার্টিং সিস্টেম নেই
- শুধুমাত্র কনসোল লগিং

---

## ৫. ডাটা ফ্লো — একজন ইউজারের সম্পূর্ণ জার্নি

```
১. ইউজার WhatsApp এ মেসেজ পাঠায়
    ↓
২. ওয়েবহুক POST /api/whatsapp/webhook (Meta Cloud API থেকে কল)
    ↓
৩. parseIncomingMessage → phone, text, name, mediaId (if any)
    ↓
৪. ডিডুপ্লিকেশন চেক (৩০ সেকেন্ড)
    ↓
৫. মিডিয়া প্রসেসিং (ভয়েস/ইমেজ থাকলে)
    ↓
৬. wa_logs এ এন্ট্রি
    ↓
৭. কন্টাক্ট ক্রিয়েশন/আপডেট
    ↓
৮. isWorkerPhone চেক (worker না customer)
    ↓
৯. getOrCreateLead
    ↓
১০. প্রোফাইল গেট/ক্রিয়েট, ল্যাঙ্গুয়েজ, মুড, ডায়ালেক্ট, রিলিজিয়ন ডিটেক্ট
    ↓
১১. analyzePainPoints, analyzeInterests
    ↓
১২. updateProfileFromChat
    ↓
১৩. ক্যালকুলেট সিম্পল স্কোর, ফানেল স্টেজ
    ↓
১৪. getWorkerPremiumStatus (if worker)
    ↓
১৫. BrainCtx তৈরি
    ↓
১৬. FastLane চেক → হিট হলে ইন্সট্যান্ট রিপ্লাই (স্কিপ ব্রেইন)
    ↓
১৭. processMessage (Orchestrator):
    ├── AI সিস্টেম অ্যাক্টিভ চেক
    ├── Intent Detection (free → AI)
    ├── Greeting Shortcut (প্রথম মেসেজের জন্য)
    ├── Memory লোড
    ├── Contact Intelligence লোড
    ├── Conversation Summary/Key Points/Recent
    ├── Knowledge Context
    ├── Company Top Target
    ├── Product Catalog
    ├── Purchase Context (Membership Plans, Order Flow)
    ├── Upsell Context (premium members only)
    ├── Team Tracking (workers only)
    ├── Lead Scoring (interest/buying/priority/engagement/recency)
    ├── Recommendations (courses/products by interest)
    ├── Marketing Intelligence (segment + campaign suggestion)
    ├── Stage Scripts (based on funnel stage)
    ├── Training Modules (based on intent)
    └── System Prompt build → callAI → fallback → reply
    ↓
১৮. Agent Linking (if worker + agent used)
    ↓
১৯. Empty Reply Fallback
    ↓
২০. Contact Intelligence Store
    ↓
২১. Auto Skill Save (quality gate passed)
    ↓
২২. Platform Activity Record
    ↓
২৩. Message Save (user + assistant)
    ↓
২৪. Lead Status Update ("replied")
    ↓
২৫. WhatsApp Reply সেন্ড (Cloud API or Relay/Baileys)
    ↓
২৬. মেমরি সেভ (intent, mood, department, last response)
    ↓
২৭. Contact Intelligence Store (from interaction)
```

---

## ৬. স্পেসিফিক ক্যাটাগরি অনুযায়ী কভারেজ

### কাস্টমার (নতুন লিড, নন-মেম্বার)
| সিস্টেম | স্ট্যাটাস | বিস্তারিত |
|---------|-----------|-----------|
| ওয়েলকাম মেসেজ | ✅ | FastLane + Greeting Shortcut |
| ইন্টেন্ট ডিটেকশন | ✅ | ১৫টি ইন্টেন্ট |
| পেইন পয়েন্ট/ইন্টারেস্ট | ✅ | টেক্সট অ্যানালাইসিস |
| স্টেজ-ভিত্তিক স্ক্রিপ্ট | ✅ | Stranger → Lead |
| ফানেল ট্র্যাকিং | ✅ | 1-4 → 5-6 → 7-8 chats |
| প্রোঅ্যাকটিভ ফলোআপ | ✅ | Cron-based, seen-no-reply, stale |
| লিড স্কোরিং | ✅ | ৫টি স্কোর কম্পোনেন্ট |
| রেকমেন্ডেশন | ✅ | কোর্স/প্রোডাক্ট |
| সেগমেন্ট ডিটেকশন | ✅ | New/At Risk/Dormant |
| প্রাইসিং (ডায়নামিক) | ✅ | স্কোর-ভিত্তিক ডিসকাউন্ট |

### জেনারেল মেম্বার (রেজিস্টার্ড, নন-প্রিমিয়াম)
| সিস্টেম | স্ট্যাটাস | বিস্তারিত |
|---------|-----------|-----------|
| কনভার্সেশন মেমরি | ✅ | আগের কথা মনে রাখে |
| কন্টাক্ট ইন্টেলিজেন্স | ✅ | গোল, অবজেকশন, প্যাটার্ন ট্র্যাকিং |
| ট্রেনিং মডিউল | ✅ | ২১টি মডিউল (কিছু বাকি) |
| টিম ট্র্যাকিং | ✅ | ডাইরেক্ট/টোটাল মেম্বার, অ্যাক্টিভিটি |
| আপসেল কনটেক্সট | ✅ | "প্রিমিয়ামে আপগ্রেড করুন" |
| কমিশন ইনফো | ✅ | নলেজ বেস + প্রোডাক্ট ক্যাটালগ |
| স্টেজ স্ক্রিপ্ট | ✅ | Free Member → Premium ফানেল |
| পারমিশন ম্যানেজমেন্ট | ✅ | API-ভিত্তিক (UI বাকি) |

### প্রিমিয়াম মেম্বার (আইপি/ভিআইপি)
| সিস্টেম | স্ট্যাটাস | বিস্তারিত |
|---------|-----------|-----------|
| রিসোর্স ইউসেজ ট্র্যাকিং | ✅ | member_resources টেবিল |
| আপসেল/ক্রস-সেল | ✅ | Complimentary রিসোর্স সাজেশন |
| ভিআইপি স্ক্রিপ্ট | ✅ | Referral, Leadership, Target |
| টিম বিল্ডিং টুলস | ✅ | টিম ট্র্যাকার, টপ পারফর্মার |
| এক্সক্লুসিভ অফার | ✅ | VIP Loyalty ক্যাম্পেইন |
| পার্সোনাল AI এসিস্ট্যান্ট | ✅ | Named agent support |
| কন্টেন্ট জেনারেশন | ✅ | Blog/Social/Marketing/Training |
| টার্গেট ট্র্যাকিং | ✅ | Geometric Target Plans |

---

## ৭. টেকনিক্যাল ডেটা

| মেট্রিক | ভ্যালু |
|---------|--------|
| ওয়েবহুক টাইমআউট | ৪৫ সেকেন্ড |
| AI মডেল টাইমআউট | ৮০০ms (প্রাইমারি), ৮০০ms (ফলব্যাক) |
| AI মডেল | LLaMA 3.3 70B (OpenRouter) |
| ফাস্টলেন রেসপন্স টাইম | < ৫ms |
| টেম্পারেচার | ০.৭ (ক্রিয়েটিভ), ০.১ (ক্লাসিফায়ার) |
| ফন্টএন্ড টেকনোলজি | Next.js 16.2.6 App Router |
| ব্যাকএন্ড | Cloudflare Workers + D1 |
| WhatsApp API | Meta Cloud API v18.0 + Baileys (relay) |
| প্রোঅ্যাকটিভ ইন্টারভ্যাল | ৫ মিনিট (seen-no-reply), ১ ঘন্টা (নতুন) |
| ফলোআপ ম্যাক্স | ৫ বার |
| সিস্টেম প্রম্পট সাইজ | ~৫০০০+ টোকেন |

---

## ৮. রিপোর্ট সামারি

### যা পূর্ণাঙ্গ:
✅ WhatsApp থেকে মেসেজ রিসিভ, প্রসেস, রিপ্লাই — সম্পূর্ণ পাইপলাইন  
✅ AI ব্রেইন — ইন্টেলিজেন্ট কনভার্সেশন, সেলস কোচিং, মেন্টরিং  
✅ ফাস্টলেন — জিরো-টোকেন ইন্সট্যান্ট রিপ্লাই  
✅ লিড স্কোরিং, রেকমেন্ডেশন, মার্কেটিং ইন্টেলিজেন্স  
✅ প্রিমিয়াম/জেনারেল/কাস্টমার — সব ক্যাটাগরির জন্য আলাদা কন্টেক্সট  
✅ ১৫টি ইন্টেন্ট ক্লাসিফিকেশন  
✅ ৫টি ফানেল স্টেজ অনুযায়ী স্ক্রিপ্ট  
✅ ২১টি ট্রেনিং মডিউল  
✅ পেমেন্ট ও অর্ডার ফ্লো (SSLCommerz + COD)  
✅ পারমিশন সিস্টেম  
✅ প্রোঅ্যাকটিভ ফলোআপ (Cron-based)  
✅ কন্টেন্ট ইঞ্জিন  

### যা আংশিক:
⚠️ ইমেইল/এসএমএস চ্যানেল (API ইন্টিগ্রেশন বাকি)  
⚠️ MLM ট্রি বিল্ডিং (কন্টাক্ট সিঙ্ক ফেক)  
⚠️ পারমিশন সিস্টেম UI  
⚠️ কিছু ট্রেনিং মডিউল (মোট ৩০টি মডিউলের মধ্যে ২১টি তৈরি)  

### যা অনুপস্থিত:
❌ ইউনিট টেস্ট  
❌ ড্যাশবোর্ড এনালিটিক্স UI  
❌ মাল্টি-এজেন্ট কলাবোরেশন  
❌ A/B টেস্টিং  
❌ RLHF ফিডব্যাক লুপ  
❌ মনিটরিং/অ্যালার্টিং  
❌ ওয়েব/অ্যাপ UI (লগইন, রেজিস্ট্রেশন, ড্যাশবোর্ড)  

---

## ৯. কোডবেস স্ট্রাকচার রেফারেন্স

```
src/
├── app/api/
│   ├── whatsapp/webhook/route.ts    ← WhatsApp ওয়েবহুক (মেসেজ হ্যান্ডলিং)
│   ├── cron/keepwarm/route.ts        ← প্রোঅ্যাকটিভ ফলোআপ ক্রন
│   ├── whatsapp/proactive-followup/  ← ফলোআপ API
│   ├── whatsapp/outreach/route.ts    ← ক্যাম্পেইন API
│   ├── permissions/route.ts          ← পারমিশন API
│   ├── ai/content/route.ts           ← কনটেন্ট জেনারেশন API
│   ├── payment/*/route.ts            ← পেমেন্ট ফ্লো
│   └── orders/route.ts               ← অর্ডার API
├── lib/
│   ├── ai/
│   │   ├── brain/orchestrator.ts     ← AI ব্রেইন (কোর ইঞ্জিন)
│   │   ├── brain/memory.ts           ← মেমরি সিস্টেম
│   │   ├── scoring-engine.ts         ← স্কোরিং ইঞ্জিন
│   │   ├── recommendation-engine.ts  ← রেকমেন্ডেশন ইঞ্জিন
│   │   ├── marketing-intelligence.ts ← সেগমেন্টেশন
│   │   ├── pricing-engine.ts         ← প্রাইসিং
│   │   ├── purchase-automation.ts    ← পারচেজ ফ্লো
│   │   ├── content-engine.ts         ← কনটেন্ট
│   │   ├── fast-lane.ts              ← ফাস্টলেন
│   │   ├── intent-classifier.ts      ← ইন্টেন্ট ক্লাসিফায়ার
│   │   ├── prompts/
│   │   │   ├── stage-scripts.ts      ← স্টেজ স্ক্রিপ্ট
│   │   │   ├── training-modules.ts   ← ট্রেনিং মডিউল
│   │   │   └── team-tracker.ts       ← টিম ট্র্যাকার
│   │   ├── outreach/
│   │   │   ├── campaign.ts           ← ক্যাম্পেইন ইঞ্জিন
│   │   │   └── multi-channel.ts      ← মাল্টি-চ্যানেল
│   │   ├── contact-intelligence.ts   ← কন্টাক্ট ইন্টেলিজেন্স
│   │   └── seed-data/
│   │       └── all-entries.ts        ← নলেজ বেস
│   ├── permissions/index.ts          ← পারমিশন লিব
│   └── db/index.ts                   ← ডাটাবেজ স্কিমা (৫০+ টেবিল)
```

## ১০. উপসংহার

সিস্টেমটি একটি পূর্ণাঙ্গ WhatsApp AI কাস্টমার এনগেজমেন্ট প্ল্যাটফর্ম। কাস্টমার, জেনারেল মেম্বার এবং প্রিমিয়াম মেম্বার — তিন ক্যাটাগরির জন্যই আলাদা আলাদা কন্টেক্সট, স্ক্রিপ্ট, ট্রেনিং এবং আউটরিচ ফ্লো তৈরি আছে। মূল AI ব্রেইনটি LLaMA 3.3 70B মডেল ব্যবহার করে OpenRouter-এর মাধ্যমে চলে, যা ফাস্টলেন (জিরো-টোকেন) দ্বারা সাপোর্টেড।

যা বাকি আছে তা প্রধানত: (১) ইমেইল/এসএমএস API ইন্টিগ্রেশন, (২) MLM ট্রি ফিক্স, (৩) UI ফ্রন্টএন্ড, (৪) মনিটরিং, এবং (৫) টেস্টিং। কোর ফিচার সেট সম্পূর্ণ।
