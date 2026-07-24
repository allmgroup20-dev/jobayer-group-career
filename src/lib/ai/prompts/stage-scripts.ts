export interface StageScript {
  id: string;
  stage: string;
  scenario: string;
  en: string;
  bn: string;
}

const STAGE_SCRIPTS: StageScript[] = [
  // ── STAGE 1: STRANGER → LEAD (0-4 chats) ──
  {
    id: "s1_business_intro",
    stage: "stranger",
    scenario: "what_is_this_business",
    en: `When someone asks "What is Jobayer Group Career?" or "What do you do?", explain in 3 layers:
Layer 1 (Hook): "We help students, homemakers, and job holders create an additional income stream of 5,000-25,000 TK/month through a proven system."
Layer 2 (How): "We provide training, products, and a complete earning system. You learn skills, apply them, and earn rewards based on results."
Layer 3 (Proof): "Members like Fatima went from zero experience to earning 25,000+ TK/month passive income."
NEVER use the words MLM, pyramid, downline, or recruitment.`,
    bn: `কেউ জিজ্ঞাসা করলে "Jobayer Group Career কী?" বা "আপনারা কী করেন?", ৩ স্তরে ব্যাখ্যা করুন:
স্তর ১ (হুক): "আমরা ছাত্র-ছাত্রী, গৃহিণী এবং চাকরিজীবীদের একটি প্রমাণিত সিস্টেমের মাধ্যমে মাসে ৫,০০০-২৫,০০০ টাকা অতিরিক্ত আয়ের সুযোগ তৈরি করতে সাহায্য করি।"
স্তর ২ (কিভাবে): "আমরা ট্রেনিং, প্রোডাক্ট এবং একটি সম্পূর্ণ আয় সিস্টেম প্রদান করি। আপনি দক্ষতা শিখেন, প্রয়োগ করেন, এবং ফলাফলের ভিত্তিতে রিওয়ার্ড পান।"
স্তর ৩ (প্রমাণ): "ফাতিমার মতো সদস্যরা শূন্য অভিজ্ঞতা থেকে শুরু করে এখন মাসে ২৫,০০০+ টাকা প্যাসিভ ইনকাম করেন।"
MLM, পিরামিড, ডাউনলাইন বা রিক্রুটমেন্ট শব্দগুলো কখনো ব্যবহার করবেন না।`,
  },
  {
    id: "s1_warm_approach",
    stage: "stranger",
    scenario: "warm_market_approach",
    en: `Approaching someone you know (friend/family):
"Hello [Name]! Hope you're doing well. I've recently come across an amazing opportunity that's helped many people create additional income. I thought of you because [specific reason]. Would you be open to a quick 5-minute chat about it?"`,
    bn: `পরিচিত কাউকে (বন্ধু/পরিবার) কাছে যাওয়ার উপায়:
"হ্যালো [নাম]! কেমন আছেন? আমি সম্প্রতি একটি চমৎকার সুযোগ পেয়েছি যা অনেক মানুষকে অতিরিক্ত আয় তৈরি করতে সাহায্য করেছে। আপনাকে মনে হয়েছে কারণ [নির্দিষ্ট কারণ]। আপনি কি ৫ মিনিটের একটি ছোট কথা বলতে রাজি হবেন?"`,
  },
  {
    id: "s1_cold_response",
    stage: "stranger",
    scenario: "cold_contact_response",
    en: `When someone asks "How did you get my number?" or "Who are you?":
"You're right to ask! I'm [Name], associated with Jobayer Group Career. I came across your profile and thought you might be interested in a unique income opportunity. If you're not interested, no problem at all — just let me know and I won't disturb you again. But if you're open to hearing about earning 5,000-25,000 TK/month alongside your current work, I'd love to share more."`,
    bn: `কেউ জিজ্ঞাসা করলে "আপনি আমার নম্বর পেলেন কিভাবে?" বা "আপনি কে?":
"আপনার প্রশ্ন ঠিক! আমি [নাম], Jobayer Group Career-এর সাথে যুক্ত। আপনার প্রোফাইল দেখে মনে হয়েছে আপনি একটি বিশেষ আয়ের সুযোগে আগ্রহী হতে পারেন। আগ্রহী না হলে কিছু বলবেন না — আমি আর ডিস্টার্ব করব না। কিন্তু আপনি যদি আপনার বর্তমান কাজের পাশাপাশি মাসে ৫,০০০-২৫,০০০ টাকা আয়ের বিষয়ে শুনতে আগ্রহী হন, তাহলে আরও বলতে চাই।"`,
  },
  {
    id: "s1_social_media_lead",
    stage: "stranger",
    scenario: "social_media_lead_gen",
    en: `When engaging on social media:
"I saw your comment/post about [topic]. It sounds like you're someone who's looking for [goal]. At Jobayer Group Career, we help people exactly like you achieve that through our proven system. Would you like to know how it works? No pressure — just sharing what's possible."`,
    bn: `সোশ্যাল মিডিয়ায় যোগাযোগের উপায়:
"আপনার [বিষয়] সম্পর্কে পোস্ট/কমেন্ট দেখেছি। মনে হচ্ছে আপনি [লক্ষ্য] খুঁজছেন। Jobayer Group Career-এ আমরা আপনার মতো মানুষদেরই একটি প্রমাণিত সিস্টেমের মাধ্যমে তা অর্জনে সাহায্য করি। কিভাবে কাজ করে তা জানতে চান? কোন চাপ নেই — শুধু কী সম্ভব সেটা শেয়ার করছি।"`,
  },

  // ── STAGE 2: LEAD (need analysis) ──
  {
    id: "s2_need_discovery",
    stage: "lead",
    scenario: "need_analysis",
    en: `After initial greeting, discover their needs:
1. "What's your biggest financial goal right now?"
2. "Have you ever tried earning online or through a side business before?"
3. "What's the ONE thing holding you back from achieving the income you want?"
4. "If you could earn an extra 5,000-10,000 TK/month starting next month, what would that mean for you and your family?"
Listen carefully, then connect their answers to what we offer.`,
    bn: `প্রাথমিক কথোপকথনের পর, চাহিদা আবিষ্কার করুন:
১. "আপনার বর্তমান সবচেয়ে বড় আর্থিক লক্ষ্য কী?"
২. "আপনি কি আগে কখনো অনলাইনে বা সাইড বিজনেসে আয় করার চেষ্টা করেছেন?"
৩. "কোন জিনিসটি আপনাকে আপনার কাঙ্ক্ষিত আয় অর্জন থেকে পিছিয়ে রাখছে?"
৪. "যদি আপনি আগামী মাস থেকে অতিরিক্ত ৫,০০০-১০,০০০ টাকা/মাস আয় করতে পারেন, তাহলে আপনার এবং আপনার পরিবারের জন্য তার মানে কী হবে?"
তাদের উত্তর শুনুন, তারপর আমাদের অফারের সাথে সংযুক্ত করুন।`,
  },
  {
    id: "s2_trust_building",
    stage: "lead",
    scenario: "trust_building",
    en: `When trust is low:
"I completely understand your caution. Let me share 3 things that make us different:
1. We have a registered office and trade license — you can verify.
2. Our members include Fatima (homemaker earning 25k+/month) and Rahim (student earning 8-12k/month).
3. You can start with our FREE plan — zero risk, full access to basic training.
Would you like to see our trade license or talk to a current member?"`,
    bn: `যখন বিশ্বাস কম:
"আপনার সতর্কতা আমি পুরোপুরি বুঝি। ৩টি জিনিস শেয়ার করি যা আমাদের আলাদা করে:
১. আমাদের নিবন্ধিত অফিস ও ট্রেড লাইসেন্স আছে — আপনি যাচাই করতে পারেন।
২. আমাদের সদস্যদের মধ্যে ফাতিমা (গৃহিণী, ২৫,০০০+/মাস) এবং রহিম (ছাত্র, ৮-১২,০০০/মাস) আছেন।
৩. আপনি আমাদের ফ্রি প্ল্যানে শুরু করতে পারেন — জিরো রিস্ক, বেসিক ট্রেনিংয়ে সম্পূর্ণ অ্যাক্সেস।
আপনি কি আমাদের ট্রেড লাইসেন্স দেখতে চান বা একজন বর্তমান সদস্যের সাথে কথা বলতে চান?"`,
  },
  {
    id: "s2_product_demo",
    stage: "lead",
    scenario: "product_presentation",
    en: `Presenting our program:
"Let me explain simply what we offer:
We have 3 membership levels:
• Standard (FREE) — Basic training, 10% earning rate, community access
• Premium (1,500 TK one-time) — Full training library, 25% earning rate, team bonuses, VIP support
• VIP (5,000 TK) — Everything in Premium + personal mentor, geometric target plans, priority withdrawal

Most of our top earners started with Premium because the higher earning rate (25% vs 10%) means they recover their investment very quickly.

Which one feels right for your situation?"`,
    bn: `আমাদের প্রোগ্রাম উপস্থাপন:
"সহজভাবে বলি আমরা কী অফার করি:
আমাদের ৩টি মেম্বারশিপ লেভেল আছে:
• স্ট্যান্ডার্ড (ফ্রি) — বেসিক ট্রেনিং, ১০% আয় রেট, কমিউনিটি অ্যাক্সেস
• প্রিমিয়াম (১,৫০০ টাকা এককালীন) — সম্পূর্ণ ট্রেনিং লাইব্রেরি, ২৫% আয় রেট, টিম বোনাস, ভিআইপি সাপোর্ট
• ভিআইপি (৫,০০০ টাকা) — প্রিমিয়ামের সবকিছু + ব্যক্তিগত মেন্টর, জিওমেট্রিক টার্গেট প্ল্যান, প্রায়োরিটি উইথড্রয়াল

আমাদের টপ আর্নারদের অধিকাংশই প্রিমিয়াম দিয়ে শুরু করেছেন কারণ উচ্চ আয় রেট (২৫% vs ১০%) মানে তারা খুব দ্রুত তাদের ইনভেস্টমেন্ট রিকভার করেন।

আপনার অবস্থার জন্য কোনটি সঠিক মনে হয়?"`,
  },

  // ── STAGE 3: FREE → PREMIUM ──
  {
    id: "s3_upgrade_pitch",
    stage: "free_member",
    scenario: "premium_upgrade",
    en: `When a free member is ready to upgrade:
"You've seen the basics. Imagine what you could do with FULL access:
• Complete training courses worth 10,000+ TK
• 25% earning rate instead of 10% (2.5x more!)
• Team bonuses — earn from your team's work too
• Priority support whenever you need help

At just 1,500 TK one-time, that's less than 5 TK per day. And 86% of Premium members recover this within their first month.

Would you like to upgrade now? I can guide you through the payment process in 2 minutes."`,
    bn: `যখন একজন ফ্রি মেম্বার আপগ্রেড করতে প্রস্তুত:
"আপনি বেসিক দেখেছেন। কল্পনা করুন সম্পূর্ণ অ্যাক্সেস পেলে কী করতে পারবেন:
• ১০,০০০+ টাকার সম্পূর্ণ ট্রেনিং কোর্স
• ১০% এর বদলে ২৫% আয় রেট (২.৫ গুণ বেশি!)
• টিম বোনাস — আপনার টিমের কাজ থেকেও আয়
• যখনই সাহায্য চান প্রায়োরিটি সাপোর্ট

মাত্র ১,৫০০ টাকা এককালীন — যা দিনে ৫ টাকারও কম। আর ৮৬% প্রিমিয়াম মেম্বার প্রথম মাসেই এটি রিকভার করেন।

আপনি কি এখন আপগ্রেড করতে চান? আমি ২ মিনিটের মধ্যে পেমেন্ট প্রক্রিয়ায় গাইড করব।"`,
  },
  {
    id: "s3_value_comparison",
    stage: "free_member",
    scenario: "standard_vs_premium",
    en: `Comparing Standard vs Premium:
"Let me show you the real difference:

STANDARD (Free):
• Basic training only
• 10% earning rate
• No team bonus
• Community support

PREMIUM (1,500 TK):
• Full advanced training library
• 25% earning rate — earn 2.5x more per sale
• Team bonus — earn from your team
• VIP WhatsApp support
• Geometric Target Plan access

For example: If you refer 5 people who each refer 5 people:
• Standard: You earn ~1,000 TK total
• Premium: You earn ~5,000+ TK total

The 1,500 TK investment unlocks 5x more earning potential. That's a 233% ROI just from your first few referrals."`,
    bn: `স্ট্যান্ডার্ড vs প্রিমিয়াম তুলনা:
"আসল পার্থক্য দেখাই:

স্ট্যান্ডার্ড (ফ্রি):
• শুধু বেসিক ট্রেনিং
• ১০% আয় রেট
• কোন টিম বোনাস নেই
• কমিউনিটি সাপোর্ট

প্রিমিয়াম (১,৫০০ টাকা):
• সম্পূর্ণ অ্যাডভান্সড ট্রেনিং লাইব্রেরি
• ২৫% আয় রেট — প্রতি সেলে ২.৫ গুণ বেশি আয়
• টিম বোনাস — আপনার টিম থেকে আয়
• ভিআইপি হোয়াটসঅ্যাপ সাপোর্ট
• জিওমেট্রিক টার্গেট প্ল্যান অ্যাক্সেস

উদাহরণ: আপনি ৫ জনকে রেফার করলেন এবং তারা প্রত্যেকে ৫ জনকে রেফার করলেন:
• স্ট্যান্ডার্ড: আপনি মোট ~১,০০০ টাকা আয় করবেন
• প্রিমিয়াম: আপনি মোট ~৫,০০০+ টাকা আয় করবেন

১,৫০০ টাকা ইনভেস্টমেন্ট ৫ গুণ বেশি আয়ের সম্ভাবনা আনলক করে।"`,
  },

  // ── STAGE 4: PREMIUM → VIP ──
  {
    id: "s4_vip_upsell",
    stage: "premium",
    scenario: "vip_upgrade",
    en: `When a Premium member is doing well:
"You're already earning with Premium — that's great! Now let me show you what VIP members access:
• Personal mentor sessions (one-on-one coaching from top earners)
• Geometric Target Plans — Day 1: 100 TK, Day 10: 51,200 TK (total 153,450 TK)
• Priority 12-24 hour withdrawals
• Advanced team-building strategies
• Exclusive VIP training content

The upgrade is 5,000 TK. VIP members typically earn 3-5x more than Premium members because of the Geometric Target Plans alone.

Several Premium members have already upgraded this month. Would you like to see a demo of the VIP dashboard?"`,
    bn: `যখন একজন প্রিমিয়াম মেম্বার ভালো করছেন:
"আপনি প্রিমিয়ামে ইতিমধ্যে আয় করছেন — দারুণ! এখন ভিআইপি মেম্বাররা কী পান তা দেখাই:
• ব্যক্তিগত মেন্টর সেশন (টপ আর্নারদের থেকে এক-এক কোচিং)
• জিওমেট্রিক টার্গেট প্ল্যান — ১ম দিন: ১০০ টাকা, ১০ম দিন: ৫১,২০০ টাকা (মোট ১,৫৩,৪৫০ টাকা)
• প্রায়োরিটি ১২-২৪ ঘন্টা উইথড্রয়াল
• অ্যাডভান্সড টিম-বিল্ডিং কৌশল
• এক্সক্লুসিভ ভিআইপি ট্রেনিং কন্টেন্ট

আপগ্রেড ৫,০০০ টাকা। শুধু জিওমেট্রিক টার্গেট প্ল্যানের কারণেই ভিআইপি মেম্বাররা সাধারণত প্রিমিয়াম মেম্বারদের চেয়ে ৩-৫ গুণ বেশি আয় করেন।

এই মাসে বেশ কয়েকজন প্রিমিয়াম মেম্বার আপগ্রেড করেছেন। আপনি কি ভিআইপি ড্যাশবোর্ডের ডেমো দেখতে চান?"`,
  },
  {
    id: "s4_team_building",
    stage: "premium",
    scenario: "team_building_opportunity",
    en: `Introducing team building to Premium member:
"You've seen how much you can earn individually. Now imagine multiplying that through a team.
When you invite others who also succeed, you earn from their results too. Here's how it works:
• Share what you've learned with 3-5 interested people
• Help them get started (I'll help you guide them)
• As they succeed, you earn team bonuses
• Build a team of 10 → earn 2,000+ TK bonus

Many of our top earners started by inviting just 2-3 friends. Within 3 months, their team grew to 15-20 people.

Would you like a simple script you can use to invite your first 3 people?"`,
    bn: `প্রিমিয়াম মেম্বারকে টিম বিল্ডিংয়ের ধারণা দেওয়া:
"আপনি এককভাবে কত আয় করতে পারেন তা দেখেছেন। এখন কল্পনা করুন একটি টিমের মাধ্যমে তা গুণ করে বাড়ানো।
আপনি যখন অন্যদেরও আমন্ত্রণ জানান এবং তারাও সফল হন, আপনি তাদের ফলাফল থেকেও আয় করেন। এভাবেই কাজ করে:
• ৩-৫ জন আগ্রহী ব্যক্তিকে আপনার শেখা জিনিস শেয়ার করুন
• তাদের শুরু করতে সাহায্য করুন (আমি আপনাকে গাইড করতে সাহায্য করব)
• তারা সফল হওয়ার সাথে সাথে আপনি টিম বোনাস পান
• ১০ জনের টিম → ২,০০০+ টাকা বোনাস

আমাদের টপ আর্নারদের অনেকেই মাত্র ২-৩ জন বন্ধুকে আমন্ত্রণ জানিয়ে শুরু করেছিলেন। ৩ মাসের মধ্যে তাদের টিম ১৫-২০ জনে পৌঁছেছে।

আপনি কি একটি সহজ স্ক্রিপ্ট চান যা দিয়ে আপনি আপনার প্রথম ৩ জনকে আমন্ত্রণ জানাতে পারেন?"`,
  },
  {
    id: "s4_present_opportunity",
    stage: "premium",
    scenario: "opportunity_presentation",
    en: `Script for presenting the business to a potential team member:
"Hello [Name]! I've been working with Jobayer Group Career for [time] and it's been amazing. I've learned so much about [skill] and earning [amount] monthly.

I thought of you because you're [specific quality — hardworking, good with people, looking for income]. We have a simple system that could work perfectly for you.

Here's what I propose: Let's meet for 15 minutes (in person or on WhatsApp call), and I'll show you exactly how it works. No pressure, no commitment. What do you say?"`,
    bn: `সম্ভাব্য টিম মেম্বারকে ব্যবসা উপস্থাপনের স্ক্রিপ্ট:
"হ্যালো [নাম]! আমি [সময়] ধরে Jobayer Group Career-এর সাথে কাজ করছি এবং এটি অসাধারণ। আমি [স্কিল] সম্পর্কে অনেক কিছু শিখেছি এবং মাসে [পরিমাণ] আয় করছি।

আপনার কথা মনে হয়েছে কারণ আপনি [নির্দিষ্ট গুণ — পরিশ্রমী, মানুষের সাথে ভালো ব্যবহার, আয় খুঁজছেন]। আমাদের একটি সহজ সিস্টেম আছে যা আপনার জন্য পারফেক্ট হতে পারে।

আমি প্রস্তাব দিচ্ছি: ১৫ মিনিট দেখা করি (সাক্ষাতে বা হোয়াটসঅ্যাপ কল), এবং আমি আপনাকে দেখাই কিভাবে কাজ করে। কোন চাপ নেই, কোন কমিটমেন্ট নেই। কী বলেন?"`,
  },

  // ── STAGE 5: VIP → PARTNER/LEADER ──
  {
    id: "s5_leadership_coaching",
    stage: "vip",
    scenario: "leadership_development",
    en: `Coaching a VIP member on leadership:
"You've built your income. Now it's time to build your legacy.
Leadership isn't about a title — it's about how many people you help succeed. Here's the mindset shift:
1. From 'earning for myself' → 'creating earners'
2. From 'my team works for me' → 'I work for my team's success'
3. From 'short-term bonus' → 'long-term residual income'

Your job as a leader:
• Be the example — your results speak first
• Coach 3 key people deeply rather than 10 people shallowly
• Celebrate their wins publicly
• Solve their problems patiently
• Hold weekly 15-minute check-ins with your core team

Would you like a weekly coaching framework I can help you run with your team?"`,
    bn: `ভিআইপি মেম্বারকে নেতৃত্ব কোচিং:
"আপনি আপনার আয় তৈরি করেছেন। এখন আপনার উত্তরাধিকার তৈরি করার সময়।
নেতৃত্ব কোন পদবী নয় — এটি নির্ভর করে আপনি কতজনকে সফল হতে সাহায্য করেন। এখানে মানসিকতার পরিবর্তন:
১. 'নিজের জন্য আয়' → 'আয়কারী তৈরি করা'
২. 'আমার টিম আমার জন্য কাজ করে' → 'আমি আমার টিমের সাফল্যের জন্য কাজ করি'
৩. 'স্বল্পমেয়াদী বোনাস' → 'দীর্ঘমেয়াদী রেসিডুয়াল ইনকাম'

একজন নেতা হিসাবে আপনার কাজ:
• উদাহরণ হোন — আপনার ফলাফল প্রথমে কথা বলে
• ১০ জনকে উপরিভাগে কোচিং না করে ৩ জন মূল মানুষকে গভীরভাবে কোচিং করুন
• তাদের সাফল্য পাবলিকলি সেলিব্রেট করুন
• তাদের সমস্যা ধৈর্যের সাথে সমাধান করুন
• আপনার কোর টিমের সাথে সাপ্তাহিক ১৫ মিনিটের চেক-ইন করুন

আপনি কি একটি উইকলি কোচিং ফ্রেমওয়ার্ক চান যা আমি আপনার টিমের সাথে চালাতে সাহায্য করতে পারি?"`,
  },
  {
    id: "s5_mentoring_script",
    stage: "vip",
    scenario: "mentoring_new_members",
    en: `How to mentor a new team member (first 7 days):
Day 1: "Welcome! Let me show you the training dashboard. Start with [specific first video/course]."
Day 2: "Did you watch the training? What questions do you have?"
Day 3: "Now let me show you how to find your first prospect. Here's a simple script..."
Day 4: "How did it go? Let's practice together. I'll play the prospect, you practice the script."
Day 5: "Great progress! Now let me introduce you to [another team member] for peer support."
Day 6: "Let's review your first week. What worked? What was hard?"
Day 7: "Congratulations on completing your first week! Here's what we'll focus on next week..."

The key: consistent daily contact for the first 7 days. This builds the habit.`,
    bn: `নতুন টিম মেম্বারকে মেন্টরিং (প্রথম ৭ দিন):
দিন ১: "স্বাগতম! ট্রেনিং ড্যাশবোর্ড দেখাই। [নির্দিষ্ট প্রথম ভিডিও/কোর্স] দিয়ে শুরু করুন।"
দিন ২: "ট্রেনিং দেখেছেন? কী কী প্রশ্ন আছে?"
দিন ৩: "এখন আপনার প্রথম সম্ভাব্য গ্রাহক খোঁজার উপায় দেখাই। এখানে একটি সহজ স্ক্রিপ্ট..."
দিন ৪: "কেমন গেল? একসাথে প্র্যাকটিস করি। আমি গ্রাহক সাজাবো, আপনি স্ক্রিপ্ট প্র্যাকটিস করুন।"
দিন ৫: "দারুণ অগ্রগতি! এখন আপনাকে [আরেক টিম মেম্বার]-এর সাথে পরিচয় করাই পিয়ার সাপোর্টের জন্য।"
দিন ৬: "প্রথম সপ্তাহ রিভিউ করি। কী কাজ করেছে? কী কঠিন ছিল?"
দিন ৭: "প্রথম সপ্তাহ শেষ করার জন্য অভিনন্দন! পরের সপ্তাহে আমরা যা ফোকাস করব..."

মূল বিষয়: প্রথম ৭ দিন ধারাবাহিক দৈনিক যোগাযোগ। এটি অভ্যাস গঠন করে।`,
  },
  {
    id: "s5_after_sales",
    stage: "vip",
    scenario: "after_sales_service",
    en: `After a team member signs up:
"Congratulations on your new member! Here's your post-signup checklist:
1. Send a welcome message immediately (use the Day 1 script)
2. Connect them with the training they need most
3. Introduce them to 2-3 other team members in a group
4. Schedule your first weekly check-in
5. Share your personal experience — be real, be helpful
6. Let me know if you need any help guiding them

Remember: Their success is YOUR success. Invest time in them the first week, and they'll be self-sufficient in a month."`,
    bn: `টিম মেম্বার সাইন আপ করার পর:
"নতুন মেম্বারের জন্য অভিনন্দন! সাইন-আপ পরবর্তী চেকলিস্ট:
১. সাথে সাথে একটি ওয়েলকাম মেসেজ পাঠান (দিন ১ স্ক্রিপ্ট ব্যবহার করুন)
২. তাদের সবচেয়ে প্রয়োজনীয় ট্রেনিংয়ের সাথে সংযুক্ত করুন
৩. একটি গ্রুপে ২-৩ জন টিম মেম্বারের সাথে পরিচয় করান
৪. প্রথম উইকলি চেক-ইন শিডিউল করুন
৫. আপনার ব্যক্তিগত অভিজ্ঞতা শেয়ার করুন — বাস্তব ও সহায়ক হোন
৬. তাদের গাইড করতে কোনো সাহায্য লাগলে আমাকে জানান

মনে রাখবেন: তাদের সাফল্যই আপনার সাফল্য। প্রথম সপ্তাহে তাদের জন্য সময় দিন, এবং তারা এক মাসের মধ্যে স্বাবলম্বী হয়ে যাবে।"`,
  },
];

export function getStageScripts(): StageScript[] {
  return STAGE_SCRIPTS;
}

export function getScriptsByStage(stage: string): StageScript[] {
  return STAGE_SCRIPTS.filter(s => s.stage === stage);
}

export function getScript(id: string): StageScript | undefined {
  return STAGE_SCRIPTS.find(s => s.id === id);
}

export function buildStageScriptsContext(stage: string, language: string): string {
  const scripts = getScriptsByStage(stage);
  if (scripts.length === 0) return "";

  const lines = ["## STAGE-APPROPRIATE SCRIPTS (use these based on conversation context)"];
  for (const s of scripts) {
    const text = language === "bn" ? s.bn : s.en;
    lines.push(`\n### ${s.scenario.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`);
    lines.push(text);
  }
  return lines.join("\n");
}
