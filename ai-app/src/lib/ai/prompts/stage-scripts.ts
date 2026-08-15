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
Layer 1 (Hook): "We help students, homemakers, and job holders learn real digital skills and earn referral commissions from ৳99 resources."
Layer 2 (How): "We provide 970+ organized premium resources, step-by-step training guides, and a transparent referral commission program. You learn skills, apply them, and earn a fixed ৳20 commission per successful referral."
Layer 3 (Proof): "We're transparent about pricing, refund policy, and commission rules — everything is on our website. Income depends on your own referral activity; we make no earnings guarantees."
NEVER use the words MLM, pyramid, downline, or recruitment.`,
    bn: `কেউ জিজ্ঞাসা করলে "Jobayer Group Career কী?" বা "আপনারা কী করেন?", ৩ স্তরে ব্যাখ্যা করুন:
স্তর ১ (হুক): "আমরা ছাত্র-ছাত্রী, গৃহিণী এবং চাকরিজীবীদের বাস্তব ডিজিটাল দক্ষতা শেখাতে এবং ৳৯৯ রিসোর্স থেকে রেফারেল কমিশন আয়ের সুযোগ দিতে সাহায্য করি।"
স্তর ২ (কিভাবে): "আমরা ৯৭০+ সাজানো প্রিমিয়াম রিসোর্স, ধাপে ধাপে ট্রেনিং গাইড এবং একটি স্বচ্ছ রেফারেল কমিশন প্রোগ্রাম প্রদান করি। আপনি দক্ষতা শিখেন, প্রয়োগ করেন, এবং প্রতি সফল রেফারেলে নির্দিষ্ট ৳২০ কমিশন পান।"
স্তর ৩ (প্রমাণ): "আমরা দাম, রিফান্ড নীতি ও কমিশন নিয়ম সম্পর্কে স্বচ্ছ — সবকিছু আমাদের ওয়েবসাইটে আছে। আয় আপনার নিজের রেফারেল কার্যক্রমের উপর নির্ভর করে; আমরা কোনো আয়ের গ্যারান্টি দিই না।"
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
"You're right to ask! I'm [Name], associated with Jobayer Group Career. I came across your profile and thought you might be interested in learning digital skills and earning referral commissions from ৳99 resources. If you're not interested, no problem at all — just let me know and I won't disturb you again. But if you're open to hearing more about our resource library and referral program, I'd love to share."`,
    bn: `কেউ জিজ্ঞাসা করলে "আপনি আমার নম্বর পেলেন কিভাবে?" বা "আপনি কে?":
"আপনার প্রশ্ন ঠিক! আমি [নাম], Jobayer Group Career-এর সাথে যুক্ত। আপনার প্রোফাইল দেখে মনে হয়েছে আপনি ডিজিটাল দক্ষতা শেখা এবং ৳৯৯ রিসোর্স থেকে রেফারেল কমিশন আয়ের বিষয়ে আগ্রহী হতে পারেন। আগ্রহী না হলে কিছু বলবেন না — আমি আর ডিস্টার্ব করব না। কিন্তু আপনি যদি আমাদের রিসোর্স লাইব্রেরি ও রেফারেল প্রোগ্রাম সম্পর্কে শুনতে আগ্রহী হন, তাহলে আরও বলতে চাই।"`,
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
1. "What skill are you most interested in learning right now?"
2. "Have you ever tried learning online or working freelance before?"
3. "What's the ONE thing holding you back from starting?"
4. "If you could learn a practical skill while also having a referral commission option, would that interest you?"
Listen carefully, then connect their answers to what we offer.`,
    bn: `প্রাথমিক কথোপকথনের পর, চাহিদা আবিষ্কার করুন:
১. "আপনি এখন সবচেয়ে কোন দক্ষতা শিখতে আগ্রহী?"
২. "আপনি কি আগে কখনো অনলাইনে শেখা বা ফ্রিল্যান্সিংয়ের চেষ্টা করেছেন?"
৩. "কোন জিনিসটি আপনাকে শুরু করা থেকে পিছিয়ে রাখছে?"
৪. "যদি আপনি একটি প্র্যাকটিক্যাল দক্ষতা শেখার পাশাপাশি রেফারেল কমিশনের সুযোগ পান, তাহলে কি আগ্রহী হবেন?"
তাদের উত্তর শুনুন, তারপর আমাদের অফারের সাথে সংযুক্ত করুন।`,
  },
  {
    id: "s2_trust_building",
    stage: "lead",
    scenario: "trust_building",
    en: `When trust is low:
"I completely understand your caution. Let me share 3 things that make us different:
1. We are fully transparent — pricing, refund policy, and commission rules are published on our website.
2. You can start free and unlock resources from ৳99 — there's no upfront membership fee.
3. Commissions are fixed and clear: ৳20 per successful referral (Level 1), ৳10 for Levels 2-4.
Would you like me to walk you through our refund policy or the commission rules in detail?"`,
    bn: `যখন বিশ্বাস কম:
"আপনার সতর্কতা আমি পুরোপুরি বুঝি। ৩টি জিনিস শেয়ার করি যা আমাদের আলাদা করে:
১. আমরা সম্পূর্ণ স্বচ্ছ — দাম, রিফান্ড নীতি ও কমিশন নিয়ম আমাদের ওয়েবসাইটে প্রকাশিত।
২. আপনি ফ্রিতে শুরু করতে পারেন এবং ৳৯৯ থেকে রিসোর্স আনলক করতে পারেন — কোনো অগ্রিম মেম্বারশিপ ফি নেই।
৩. কমিশন নির্দিষ্ট ও স্পষ্ট: প্রতি সফল রেফারেলে ৳২০ (লেভেল ১), লেভেল ২-৪ এ ৳১০।
আপনি কি আমাদের রিফান্ড নীতি বা কমিশন নিয়ম বিস্তারিত শুনতে চান?"`,
  },
  {
    id: "s2_product_demo",
    stage: "lead",
    scenario: "product_presentation",
    en: `Presenting our program:
"Let me explain simply what we offer:
We have 970+ premium resources:
• Resources start from ৳99 — one-time payment, lifetime access
• Bulk packs (3/5/10 resources) save you more
• The all-resources pack (৳5,200) also grants Premium status
Referral commissions:
• ৳20 fixed per successful referral (Level 1)
• ৳10 for each referral at Levels 2-4
• Withdraw from ৳500 (general) or ৳20 (premium)

Which resources interest you?"`,
    bn: `আমাদের প্রোগ্রাম উপস্থাপন:
"সহজভাবে বলি আমরা কী অফার করি:
আমাদের ৯৭০+ প্রিমিয়াম রিসোর্স আছে:
• রিসোর্স শুরু হয় ৳৯৯ থেকে — এককালীন পেমেন্ট, আজীবন অ্যাক্সেস
• বাল্ক প্যাক (৩/৫/১০ রিসোর্স) এ আরও সাশ্রয়
• সব রিসোর্স প্যাক (৳৫,২০০) দিলে প্রিমিয়াম স্ট্যাটাসও পাওয়া যায়
রেফারেল কমিশন:
• প্রতি সফল রেফারেলে নির্দিষ্ট ৳২০ (লেভেল ১)
• লেভেল ২-৪ এ প্রতি রেফারেলে ৳১০
• ৳৫০০ (জেনারেল) বা ৳২০ (প্রিমিয়াম) থেকে উত্তোলন

কোন রিসোর্সগুলোতে আপনার আগ্রহ?"`,
  },

  // ── STAGE 3: FREE → PREMIUM ──
  {
    id: "s3_upgrade_pitch",
    stage: "free_member",
    scenario: "premium_upgrade",
    en: `When a free member is ready to unlock more:
"You've seen the basics. Here's what you can unlock:
• 970+ premium resources at a low one-time price
• Bulk packs to save even more
• The all-resources pack (৳5,200) also grants Premium status: 0% withdrawal tax and withdrawal from ৳20

Remember: income depends on your own referral activity — we make no earnings guarantees.

Would you like to unlock a resource now? I can guide you through the payment process in 2 minutes."`,
    bn: `যখন একজন ফ্রি মেম্বার আরও রিসোর্স আনলক করতে প্রস্তুত:
"আপনি বেসিক দেখেছেন। আপনি যা আনলক করতে পারেন:
• ৯৭০+ প্রিমিয়াম রিসোর্স, এককালীন কম দামে
• বাল্ক প্যাক নিলে আরও সাশ্রয়
• সব রিসোর্স প্যাক (৳৫,২০০) দিলে প্রিমিয়াম স্ট্যাটাস: ০% উইথড্রয়াল ট্যাক্স ও ৳২০ থেকে উত্তোলন

মনে রাখবেন: আয় আপনার নিজের রেফারেল কার্যক্রমের উপর নির্ভর করে — আমরা কোনো আয়ের গ্যারান্টি দিই না।

আপনি কি এখন একটি রিসোর্স আনলক করতে চান? আমি ২ মিনিটের মধ্যে পেমেন্ট প্রক্রিয়ায় গাইড করব।"`,
  },
  {
    id: "s3_value_comparison",
    stage: "free_member",
    scenario: "standard_vs_premium",
    en: `Comparing free access vs Premium:
"Let me show you the real difference:

FREE (register for free):
• 970+ premium resources available at ৳99 each
• ৳20 commission per successful referral (Level 1), ৳10 for Levels 2-4
• Withdraw from ৳500 (5% withdrawal tax)

PREMIUM (via all-resources pack, ৳5,200):
• All 970+ resources unlocked
• 0% withdrawal tax
• Withdraw from ৳20

Premium mainly helps if you want the full library and to keep 100% of your withdrawals. Your earnings still depend on your own referral activity."`,
    bn: `ফ্রি অ্যাক্সেস vs প্রিমিয়াম তুলনা:
"আসল পার্থক্য দেখাই:

ফ্রি (ফ্রি রেজিস্ট্রেশন):
• ৯৭০+ প্রিমিয়াম রিসোর্স, ৳৯৯ করে
• প্রতি সফল রেফারেলে ৳২০ কমিশন (লেভেল ১), লেভেল ২-৪ এ ৳১০
• ৳৫০০ থেকে উত্তোলন (৫% উইথড্রয়াল ট্যাক্স)

প্রিমিয়াম (সব রিসোর্স প্যাকের মাধ্যমে, ৳৫,২০০):
• ৯৭০+ সব রিসোর্স আনলক
• ০% উইথড্রয়াল ট্যাক্স
• ৳২০ থেকে উত্তোলন

প্রিমিয়াম মূলত সাহায্য করে যদি আপনি পুরো লাইব্রেরি চান এবং উত্তোলনের ১০০% রাখতে চান। আপনার আয় এখনও আপনার নিজের রেফারেল কার্যক্রমের উপর নির্ভর করে।"`,
  },

  // ── STAGE 4: PREMIUM → TEAM BUILDER ──
  {
    id: "s4_vip_upsell",
    stage: "premium",
    scenario: "vip_upgrade",
    en: `When a Premium member is doing well:
"You're earning commissions with Premium — that's great! Here's what else our program offers:
• Referral commissions: ৳20 per successful referral (Level 1), ৳10 for Levels 2-4
• The more successful your referrals, the more levels you unlock
• 0% withdrawal tax and withdrawal from ৳20 as a Premium member
• 24/7 support whenever you need help

Remember: earnings depend on your own referral activity — we make no guarantees.

Would you like me to explain how the commission levels work in detail?"`,
    bn: `যখন একজন প্রিমিয়াম মেম্বার ভালো করছেন:
"আপনি প্রিমিয়ামে কমিশন আয় করছেন — দারুণ! আমাদের প্রোগ্রাম আরও যা দেয়:
• রেফারেল কমিশন: প্রতি সফল রেফারেলে ৳২০ (লেভেল ১), লেভেল ২-৪ এ ৳১০
• আপনার রেফারেল যত সফল হবে, তত লেভেল আনলক হবে
• প্রিমিয়াম হিসেবে ০% উইথড্রয়াল ট্যাক্স ও ৳২০ থেকে উত্তোলন
• যখনই সাহায্য চান ২৪/৭ সাপোর্ট

মনে রাখবেন: আয় আপনার নিজের রেফারেল কার্যক্রমের উপর নির্ভর করে — আমরা কোনো গ্যারান্টি দিই না।

আপনি কি কমিশন লেভেলগুলো কীভাবে কাজ করে বিস্তারিত জানতে চান?"`,
  },
  {
    id: "s4_team_building",
    stage: "premium",
    scenario: "team_building_opportunity",
    en: `Introducing team building to Premium member:
"You've seen how referral commissions work individually. Now imagine growing it through your team.
When you invite others who also succeed, you earn from their referrals too. Here's how it works:
• Share your referral link with 3-5 interested people
• Help them get started (I'll help you guide them)
• You earn ৳20 per successful referral (Level 1) and ৳10 for each referral at Levels 2-4
• Your team's network grows your reach

Many members start by inviting just 2-3 friends. Consistency matters more than numbers.

Would you like a simple script you can use to invite your first 3 people?"`,
    bn: `প্রিমিয়াম মেম্বারকে টিম বিল্ডিংয়ের ধারণা দেওয়া:
"আপনি এককভাবে রেফারেল কমিশন কীভাবে কাজ করে তা দেখেছেন। এখন কল্পনা করুন একটি টিমের মাধ্যমে তা বাড়ানো।
আপনি যখন অন্যদের আমন্ত্রণ জানান এবং তারাও সফল হন, আপনি তাদের রেফারেল থেকেও আয় করেন। এভাবেই কাজ করে:
• ৩-৫ জন আগ্রহী ব্যক্তিকে আপনার রেফারেল লিংক শেয়ার করুন
• তাদের শুরু করতে সাহায্য করুন (আমি আপনাকে গাইড করতে সাহায্য করব)
• প্রতি সফল রেফারেলে ৳২০ (লেভেল ১) এবং লেভেল ২-৪ এ প্রতি রেফারেলে ৳১০
• আপনার টিমের নেটওয়ার্ক আপনার পরিধি বাড়ায়

অনেক সদস্য মাত্র ২-৩ জন বন্ধুকে আমন্ত্রণ জানিয়ে শুরু করেন। সংখ্যার চেয়ে ধারাবাহিকতা বেশি গুরুত্বপূর্ণ।

আপনি কি একটি সহজ স্ক্রিপ্ট চান যা দিয়ে আপনি আপনার প্রথম ৩ জনকে আমন্ত্রণ জানাতে পারেন?"`,
  },
  {
    id: "s4_present_opportunity",
    stage: "premium",
    scenario: "opportunity_presentation",
    en: `Script for presenting the business to a potential team member:
"Hello [Name]! I've been working with Jobayer Group Career for [time] and it's been a great learning experience. I've learned about [skill] and earn referral commissions from my referrals.

I thought of you because you're [specific quality — hardworking, good with people, looking to learn]. We have a simple program that could work for you.

Here's what I propose: Let's meet for 15 minutes (in person or on WhatsApp call), and I'll show you exactly how it works. No pressure, no commitment. What do you say?"`,
    bn: `সম্ভাব্য টিম মেম্বারকে ব্যবসা উপস্থাপনের স্ক্রিপ্ট:
"হ্যালো [নাম]! আমি [সময়] ধরে Jobayer Group Career-এর সাথে কাজ করছি এবং এটি একটি দারুণ শেখার অভিজ্ঞতা। আমি [স্কিল] সম্পর্কে শিখেছি এবং আমার রেফারেল থেকে কমিশন আয় করছি।

আপনার কথা মনে হয়েছে কারণ আপনি [নির্দিষ্ট গুণ — পরিশ্রমী, মানুষের সাথে ভালো ব্যবহার, শিখতে আগ্রহী]। আমাদের একটি সহজ প্রোগ্রাম আছে যা আপনার জন্য উপযোগী হতে পারে।

আমি প্রস্তাব দিচ্ছি: ১৫ মিনিট দেখা করি (সাক্ষাতে বা হোয়াটসঅ্যাপ কল), এবং আমি আপনাকে দেখাই কিভাবে কাজ করে। কোন চাপ নেই, কোন কমিটমেন্ট নেই। কী বলেন?"`,
  },

  // ── STAGE 5: TEAM LEADER → MENTOR ──
  {
    id: "s5_leadership_coaching",
    stage: "member",
    scenario: "leadership_development",
    en: `Coaching an experienced team leader on leadership:
"You've been building your referrals. Now it's time to build your team.
Leadership isn't about a title — it's about how many people you help succeed. Here's the mindset shift:
1. From 'earning for myself' → 'helping others earn too'
2. From 'my team works for me' → 'I work for my team's success'
3. From 'one-time commission' → 'lasting relationships with your team'

Your job as a leader:
• Be the example — be consistent and honest
• Coach 3 key people deeply rather than 10 people shallowly
• Celebrate their wins publicly
• Solve their problems patiently
• Hold weekly 15-minute check-ins with your core team

Would you like a weekly coaching framework I can help you run with your team?"`,
    bn: `অভিজ্ঞ টিম লিডারকে নেতৃত্ব কোচিং:
"আপনি আপনার রেফারেল গড়ছেন। এখন আপনার টিম গড়ার সময়।
নেতৃত্ব কোন পদবী নয় — এটি নির্ভর করে আপনি কতজনকে সফল হতে সাহায্য করেন। এখানে মানসিকতার পরিবর্তন:
১. 'নিজের জন্য আয়' → 'অন্যদেরও আয় করতে সাহায্য করা'
২. 'আমার টিম আমার জন্য কাজ করে' → 'আমি আমার টিমের সাফল্যের জন্য কাজ করি'
৩. 'এককালীন কমিশন' → 'আপনার টিমের সাথে দীর্ঘস্থায়ী সম্পর্ক'

একজন নেতা হিসাবে আপনার কাজ:
• উদাহরণ হোন — ধারাবাহিক ও সৎ হোন
• ১০ জনকে উপরিভাগে কোচিং না করে ৩ জন মূল মানুষকে গভীরভাবে কোচিং করুন
• তাদের সাফল্য পাবলিকলি সেলিব্রেট করুন
• তাদের সমস্যা ধৈর্যের সাথে সমাধান করুন
• আপনার কোর টিমের সাথে সাপ্তাহিক ১৫ মিনিটের চেক-ইন করুন

আপনি কি একটি উইকলি কোচিং ফ্রেমওয়ার্ক চান যা আমি আপনার টিমের সাথে চালাতে সাহায্য করতে পারি?"`,
  },
  {
    id: "s5_mentoring_script",
    stage: "member",
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
    stage: "member",
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
