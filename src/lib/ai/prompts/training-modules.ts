export interface TrainingModule {
  id: string;
  module: string;
  title: string;
  content: string;
  en: string;
  bn: string;
}

const TRAINING_MODULES: TrainingModule[] = [
  // ── M3: Communication Skills ──
  {
    id: "m3_communication_basics",
    module: "communication",
    title: "Effective Communication Skills",
    content: "communication_basics",
    en: `## EFFECTIVE COMMUNICATION FOR MARKETERS

### 1. Active Listening
- Let the other person finish before you respond
- Recap what they said: "So what you're saying is..."
- Use silence strategically — pauses make people reveal more
- Listen for what's NOT said (hesitations, tone shifts)

### 2. Clear Speaking
- Use simple language, not jargon
- One idea per sentence
- Pause between key points to let them sink in
- Ask "Does that make sense?" to check understanding

### 3. Warm Tone
- Start conversations with genuine warmth
- Use their name naturally throughout
- Match their energy level (don't be hyper if they're calm)
- End with a positive, forward-looking note

### 4. Empathy in Practice
- Acknowledge their feelings before giving information
- "I understand why you'd feel that way"
- "Many people feel the same initially"
- "Your caution is completely reasonable"

Practice these daily. Record yourself and listen back. Improvement comes from awareness.`,
    bn: `## মার্কেটারদের জন্য কার্যকর যোগাযোগ

### ১. সক্রিয় শ্রবণ
- উত্তর দেওয়ার আগে অন্য ব্যক্তিকে শেষ করতে দিন
- তাদের কথা রিক্যাপ করুন: "আপনি যা বলছেন তা হলো..."
- নিরবতা কৌশলগতভাবে ব্যবহার করুন — বিরতি মানুষকে আরও প্রকাশ করে
- যা বলা হয় না তা শুনুন (ধোঁয়াশা, সুরের পরিবর্তন)

### ২. পরিষ্কার কথা বলা
- সহজ ভাষা ব্যবহার করুন, জার্গন নয়
- প্রতি বাক্যে একটি আইডিয়া
- মূল পয়েন্টগুলোর মধ্যে বিরতি দিন
- "বুঝতে পেরেছেন?" জিজ্ঞাসা করে বোঝাপড়া যাচাই করুন

### ৩. উষ্ণ সুর
- আন্তরিক উষ্ণতার সাথে কথোপকথন শুরু করুন
- স্বাভাবিকভাবে তাদের নাম ব্যবহার করুন
- তাদের এনার্জি লেভেল ম্যাচ করুন
- পজিটিভ, ভবিষ্যৎমুখী নোটে শেষ করুন

### ৪. এমপ্যাথি অনুশীলন
- তথ্য দেওয়ার আগে তাদের অনুভূতি স্বীকার করুন
- "আমি বুঝতে পারছি আপনি কেন এমন অনুভব করছেন"
- "অনেক মানুষই প্রথমে একই অনুভব করেন"
- "আপনার সতর্কতা সম্পূর্ণ যুক্তিসঙ্গত"

প্রতিদিন এগুলো অনুশীলন করুন। নিজেকে রেকর্ড করুন এবং শুনুন। উন্নতি আসে সচেতনতা থেকে।`,
  },
  {
    id: "m3_question_techniques",
    module: "communication",
    title: "Powerful Questioning Techniques",
    content: "question_techniques",
    en: `## ASKING BETTER QUESTIONS

### Open vs Closed Questions
- Closed: "Are you interested?" → Yes/No (dead end)
- Open: "What interests you about additional income?" → Conversation continues

### The 3 Most Powerful Questions
1. "What's the biggest challenge you're facing right now?" (uncovers pain)
2. "If money weren't an issue, what would you do differently?" (reveals desire)
3. "What would have to happen for you to feel ready to start?" (identifies barrier)

### Follow-up Questions (when they give a vague answer)
- "Can you tell me more about that?"
- "What specifically do you mean?"
- "How would that change things for you?"
- "What's stopping you from having that now?"

### The Golden Rule: Ask, don't tell.
People trust their own conclusions more than your arguments. Ask questions that lead them to your conclusion naturally.`,
    bn: `## আরও ভালো প্রশ্ন করা

### ওপেন বনাম ক্লোজড প্রশ্ন
- ক্লোজড: "আপনি কি আগ্রহী?" → হ্যাঁ/না (ডেড এন্ড)
- ওপেন: "অতিরিক্ত আয় সম্পর্কে কী আপনাকে আগ্রহী করে?" → কথোপকথন চলতে থাকে

### ৩টি সবচেয়ে শক্তিশালী প্রশ্ন
১. "আপনার বর্তমান সবচেয়ে বড় চ্যালেঞ্জ কী?" (পেইন উন্মোচন)
২. "টাকা যদি সমস্যা না হতো, তাহলে আপনি কী ভিন্নভাবে করতেন?" (ইচ্ছা প্রকাশ)
৩. "কী হলে আপনি শুরু করতে প্রস্তুত বোধ করবেন?" (বাধা চিহ্নিত)

### ফলো-আপ প্রশ্ন (যখন তারা অস্পষ্ট উত্তর দেয়)
- "আমাকে আরও বলবেন?"
- "ঠিক কী বোঝাতে চেয়েছেন?"
- "এটি আপনার জন্য কী পরিবর্তন আনবে?"
- "এখনই তা না থাকার কারণ কী?"

### সোনার নিয়ম: জিজ্ঞাসা করুন, বলবেন না।
মানুষ আপনার যুক্তির চেয়ে নিজেদের সিদ্ধান্তকে বেশি বিশ্বাস করে। এমন প্রশ্ন করুন যা তাদের স্বাভাবিকভাবে আপনার উপসংহারে নিয়ে যায়।`,
  },

  // ── M12: Leadership Development ──
  {
    id: "m12_leadership_fundamentals",
    module: "leadership",
    title: "Leadership Fundamentals",
    content: "leadership_fundamentals",
    en: `## BECOMING A LEADER

### Mindset Shift
- From "earning for myself" to "helping others earn"
- From "my results" to "my team's results"
- From "short-term" to "long-term thinking"

### The 5 Levels of Leadership
1. Position — people follow because they have to
2. Permission — people follow because they want to
3. Production — people follow because of what you've done
4. People Development — people follow because of what you've done for them
5. Personhood — people follow because of who you are

### Daily Leadership Habits
- Start your day with 15 minutes of planning
- Check in with 3 key team members daily
- Celebrate one team win publicly
- Learn one new thing about your business
- End your day with 5 minutes of reflection

### The Leader's Golden Rule
Treat your team members the way you'd want to be treated if YOU were the new person. Always be patient, always be encouraging, always be available.`,
    bn: `## নেতা হওয়া

### মানসিকতার পরিবর্তন
- "নিজের জন্য আয়" থেকে "অন্যদের আয় করতে সাহায্য করা"
- "আমার ফলাফল" থেকে "আমার টিমের ফলাফল"
- "স্বল্পমেয়াদী" থেকে "দীর্ঘমেয়াদী চিন্তা"

### নেতৃত্বের ৫ স্তর
১. পদ — মানুষ অনুসরণ করে কারণ তাদের বাধ্য হয়
২. অনুমতি — মানুষ অনুসরণ করে কারণ তারা চায়
৩. উৎপাদন — মানুষ অনুসরণ করে আপনি কী করেছেন তার জন্য
৪. মানব উন্নয়ন — মানুষ অনুসরণ করে আপনি তাদের জন্য কী করেছেন
৫. ব্যক্তিত্ব — মানুষ অনুসরণ করে আপনি কে

### দৈনিক নেতৃত্বের অভ্যাস
- ১৫ মিনিট পরিকল্পনা নিয়ে দিন শুরু করুন
- ৩ জন মূল টিম মেম্বারের সাথে দৈনিক চেক-ইন করুন
- একটি টিম সাফল্য পাবলিকলি সেলিব্রেট করুন
- আপনার ব্যবসা সম্পর্কে একটি নতুন জিনিস শিখুন
- ৫ মিনিট প্রতিফলন নিয়ে দিন শেষ করুন

### নেতার সোনার নিয়ম
টিম মেম্বারদের সাথে সেইভাবে আচরণ করুন যেভাবে আপনি চাইতেন যদি আপনিই নতুন ব্যক্তি হতেন। সবসময় ধৈর্যশীল, সবসময় উৎসাহদায়ক, সবসময় উপলব্ধ থাকুন।`,
  },
  {
    id: "m12_conflict_management",
    module: "leadership",
    title: "Conflict Management in Teams",
    content: "conflict_management",
    en: `## HANDLING TEAM CONFLICTS

### Root Causes of Team Conflict
1. Miscommunication — different understanding of the same thing
2. Unclear expectations — roles and responsibilities not defined
3. Competition instead of collaboration
4. Personal differences in working style
5. Resource allocation issues

### Resolution Process (5 Steps)
1. LISTEN to both sides separately first
2. IDENTIFY the real issue (not the surface argument)
3. FIND common ground — what do both want?
4. BRAINSTORM solutions together
5. AGREE on a plan and follow up

### Prevention Tips
- Set clear expectations from day one
- Communicate regularly (daily check-ins prevent misunderstandings)
- Celebrate team wins together (builds unity)
- Address small issues BEFORE they become big
- Lead by example — how YOU handle conflict teaches your team

### When to Involve Higher Support
- If conflict involves ethics violations
- If resolution attempts fail after 2 tries
- If conflict affects team performance
- If a team member wants to leave because of conflict`,
    bn: `## টিমে দ্বন্দ্ব ব্যবস্থাপনা

### টিমে দ্বন্দ্বের মূল কারণ
১. ভুল যোগাযোগ — একই জিনিসের ভিন্ন বোঝাপড়া
২. অস্পষ্ট প্রত্যাশা — ভূমিকা ও দায়িত্ব নির্ধারিত না থাকা
৩. সহযোগিতার পরিবর্তে প্রতিযোগিতা
৪. কাজের শৈলীতে ব্যক্তিগত পার্থক্য
৫. রিসোর্স বরাদ্দের সমস্যা

### সমাধান প্রক্রিয়া (৫ ধাপ)
১. প্রথমে আলাদাভাবে উভয় পক্ষকে শুনুন
২. আসল সমস্যা চিহ্নিত করুন (পৃষ্ঠের তর্ক নয়)
৩. সাধারণ ভিত্তি খুঁজুন — উভয় কী চায়?
৪. একসাথে সমাধান brainstorm করুন
৫. একটি পরিকল্পনায় সম্মত হন এবং ফলো-আপ করুন

### প্রতিরোধ টিপস
- প্রথম দিন থেকেই স্পষ্ট প্রত্যাশা সেট করুন
- নিয়মিত যোগাযোগ করুন (দৈনিক চেক-ইন ভুল বোঝাবুঝি প্রতিরোধ করে)
- একসাথে টিমের সাফল্য উদযাপন করুন
- ছোট সমস্যাগুলো বড় হওয়ার আগেই সমাধান করুন
- নিজে উদাহরণ হোন — আপনি যেভাবে দ্বন্দ্ব সামলান তা আপনার টিম শেখে`,
  },

  // ── M19: Goal Setting ──
  {
    id: "m19_smart_goals",
    module: "goal_setting",
    title: "SMART Goal Setting",
    content: "smart_goals",
    en: `## SETTING GOALS THAT WORK

### The SMART Framework
- S = Specific (exactly what do you want?)
- M = Measurable (how will you track progress?)
- A = Achievable (is it realistic with effort?)
- R = Relevant (does it align with your bigger vision?)
- T = Time-bound (by when will you achieve it?)

### Examples
Vague goal: "I want to earn more money"
SMART goal: "I will earn 10,000 TK in commission by December 31st by referring 15 new Premium members, contacting 5 people daily."

### The 3 Goal Types (all needed)
1. INCOME GOAL: "I will earn X TK per month by [date]"
2. ACTIVITY GOAL: "I will contact X new people daily, give Y presentations weekly"
3. GROWTH GOAL: "I will learn X new skill, read Y books, complete Z training"

### Goal Cascade
ANNUAL → MONTHLY → WEEKLY → DAILY
Break your big goal into small daily actions. Each day, ask: "What's ONE thing I can do today that moves me toward my goal?"

### Weekly Review
Every Sunday: Review progress, celebrate wins, adjust approach, set next week's targets.`,
    bn: `## কার্যকর লক্ষ্য নির্ধারণ

### SMART ফ্রেমওয়ার্ক
- S = স্পেসিফিক (ঠিক কী চান?)
- M = মেজারেবল (কিভাবে অগ্রগতি ট্র্যাক করবেন?)
- A = অর্জনযোগ্য (চেষ্টায় কি সম্ভব?)
- R = রিলেভেন্ট (আপনার বড় ভিশনের সাথে মেলে?)
- T = সময়-বাউন্ড (কখন অর্জন করবেন?)

### উদাহরণ
অস্পষ্ট লক্ষ্য: "আমি আরও টাকা আয় করতে চাই"
SMART লক্ষ্য: "আমি ৩১ ডিসেম্বরের মধ্যে ১৫ জন নতুন প্রিমিয়াম মেম্বার রেফার করে ১০,০০০ টাকা কমিশন আয় করব, প্রতিদিন ৫ জনের সাথে যোগাযোগ করব।"

### ৩ ধরনের লক্ষ্য (সব প্রয়োজন)
১. আয়ের লক্ষ্য: "আমি [তারিখ] এর মধ্যে মাসে X টাকা আয় করব"
২. কার্যকলাপ লক্ষ্য: "আমি প্রতিদিন X নতুন মানুষের সাথে যোগাযোগ করব, সাপ্তাহিক Y প্রেজেন্টেশন দেব"
৩. বৃদ্ধির লক্ষ্য: "আমি X নতুন স্কিল শিখব, Y বই পড়ব, Z ট্রেনিং সম্পূর্ণ করব"

### লক্ষ্য ক্যাসকেড
বার্ষিক → মাসিক → সাপ্তাহিক → দৈনিক
বড় লক্ষ্যকে ছোট দৈনিক কর্মে ভাগ করুন। প্রতিদিন জিজ্ঞাসা করুন: "আজকে একটি জিনিস কী যা আমাকে আমার লক্ষ্যের কাছাকাছি নিয়ে যাবে?"

### সাপ্তাহিক রিভিউ
প্রতি রবিবার: অগ্রগতি রিভিউ, সাফল্য উদযাপন, পদ্ধতি সামঞ্জস্য, পরের সপ্তাহের টার্গেট সেট করুন।`,
  },

  // ── M20: Financial Literacy ──
  {
    id: "m20_financial_basics",
    module: "financial_literacy",
    title: "Financial Basics for Earners",
    content: "financial_basics",
    en: `## MANAGING YOUR EARNINGS

### The 50-30-20 Rule
- 50% for needs (food, rent, bills, family)
- 30% for wants (entertainment, eating out, hobbies)
- 20% for savings & investment (build your future)

### Tracking Your Income
- Keep a simple log: date, source, amount, status
- Separate personal and business money
- Know your monthly minimum (what you must earn to cover basics)
- Track your commission rates per product

### Expense Management Tips
- Record every expense (use a notebook or app)
- Separate business expenses (internet, phone, travel)
- Review weekly: where did my money go?
- Cut unnecessary spending — save 10% before spending

### Building Savings
- Start with small, consistent savings (even 100 TK/day)
- Have an emergency fund (3 months of expenses)
- Reinvest some earnings into your skill development
- Think long-term: what will 1 year of consistent saving look like?

### Reinvestment Strategy
- 70% of your earnings → living expenses & savings
- 20% → skill development (courses, books, training)
- 10% → business tools (internet, phone, marketing)`,
    bn: `## আপনার উপার্জন ব্যবস্থাপনা

### ৫০-৩০-২০ নিয়ম
- ৫০% প্রয়োজনে (খাবার, ভাড়া, বিল, পরিবার)
- ৩০% চাহিদায় (বিনোদন, খাওয়া-দাওয়া, শখ)
- ২০% সঞ্চয় ও বিনিয়োগ (আপনার ভবিষ্যত গঠন)

### আয় ট্র্যাকিং
- সহজ লগ রাখুন: তারিখ, উৎস, পরিমাণ, স্ট্যাটাস
- ব্যক্তিগত ও ব্যবসায়িক টাকা আলাদা করুন
- আপনার মাসিক ন্যূনতম জানুন (বেসিক কভার করতে কী লাগে)
- প্রতি পণ্যে আপনার কমিশন রেট জানুন

### খরচ ব্যবস্থাপনা টিপস
- প্রতিটি খরচ রেকর্ড করুন (নোটবুক বা অ্যাপ ব্যবহার করুন)
- ব্যবসায়িক খরচ আলাদা করুন (ইন্টারনেট, ফোন, ভ্রমণ)
- সাপ্তাহিক রিভিউ: আমার টাকা কোথায় গেল?
- অপ্রয়োজনীয় খরচ কাটুন — খরচের আগে ১০% সেভ করুন

### সঞ্চয় গঠন
- ছোট, ধারাবাহিক সঞ্চয় দিয়ে শুরু করুন (এমনকি ১০০ টাকা/দিন)
- জরুরি তহবিল রাখুন (৩ মাসের খরচ)
- আপনার দক্ষতা উন্নয়নে কিছু উপার্জন পুনর্বিনিয়োগ করুন
- দীর্ঘমেয়াদী চিন্তা করুন: ১ বছর ধারাবাহিক সঞ্চয় কেমন দেখাবে?`,
  },

  // ── M21: Ethics & Compliance ──
  {
    id: "m21_ethical_selling",
    module: "ethics",
    title: "Ethical Selling Principles",
    content: "ethical_selling",
    en: `## SELLING WITH INTEGRITY

### The Golden Rules
1. Always tell the truth — even if it costs you a sale. Honesty builds lifelong customers.
2. Never promise guaranteed earnings — share what's POSSIBLE, not what's PROMISED.
3. Only share verified product claims — if you haven't seen proof, don't say it.
4. Respect every "no" — pushing after a clear "no" damages your reputation.
5. Never mislead about pricing, terms, or conditions.

### What NOT to Say
- "You'll definitely earn X amount" → "Many members earn between X and Y"
- "This is the best opportunity ever" → "This has worked well for many people"
- "Everyone is joining" → "We've seen growing interest"
- "It's impossible to lose" → "Like any business, results depend on effort"

### Compliance Checklist
- Do I have proof for every claim I'm making?
- Am I presenting the full picture (including costs)?
- Is this person genuinely a good fit, or am I just desperate for a sale?
- Would I feel comfortable if my statements were recorded and played back?
- Am I respecting this person's autonomy to decide freely?

### Building Trust That Lasts
Trust takes months to build and seconds to destroy. Prioritize long-term relationships over short-term commissions. A customer who trusts you will buy from you repeatedly and refer others.`,
    bn: `## সততার সাথে বিক্রয়

### সোনার নিয়ম
১. সর্বদা সত্য বলুন — এমনকি যদি এটি আপনার সেলের খরচে হয়। সততা আজীবন গ্রাহক তৈরি করে।
২. গ্যারান্টিড আয়ের প্রতিশ্রুতি কখনো দেবেন না — যা সম্ভব তা শেয়ার করুন, যা প্রতিশ্রুত তা নয়।
৩. শুধু যাচাইকৃত পণ্যের দাবি শেয়ার করুন — যদি প্রমাণ না দেখে থাকেন, বলবেন না।
৪. প্রতিটি "না" কে সম্মান করুন — স্পষ্ট "না" এর পর চাপ দেওয়া আপনার খ্যাতি নষ্ট করে।
৫. মূল্য, শর্ত বা নিয়ম সম্পর্কে কখনো বিভ্রান্ত করবেন না।

### কী বলবেন না
- "আপনি নিশ্চয়ই X টাকা আয় করবেন" → "অনেক সদস্য X থেকে Y এর মধ্যে আয় করেন"
- "এটি সেরা সুযোগ" → "এটি অনেক মানুষের জন্য ভালো কাজ করেছে"
- "সবাই জয়েন করছে" → "আমরা ক্রমবর্ধমান আগ্রহ দেখছি"
- "লস করা অসম্ভব" → "যেকোনো ব্যবসার মতো, ফলাফল প্রচেষ্টার উপর নির্ভর করে"

### কমপ্লায়েন্স চেকলিস্ট
- আমি প্রতিটি দাবির জন্য প্রমাণ রাখি কি?
- আমি কি সম্পূর্ণ চিত্র উপস্থাপন করছি (খরচসহ)?
- এই ব্যক্তি কি সত্যিই উপযুক্ত, নাকি আমি শুধু সেলের জন্য হতাশ?
- আমার বিবৃতি রেকর্ড করে প্লে করালে আমি কি স্বাচ্ছন্দ্য বোধ করব?
- আমি কি এই ব্যক্তির স্বায়ত্তশাসনকে সম্মান করছি?`,
  },

  // ── M24: Negotiation Skills ──
  {
    id: "m24_negotiation_basics",
    module: "negotiation",
    title: "Win-Win Negotiation",
    content: "negotiation_basics",
    en: `## NEGOTIATING WITHOUT CONFLICT

### Win-Win Mindset
Negotiation isn't about "winning" against the other person. It's about finding a solution where BOTH sides feel satisfied. If the other person feels they lost, they won't come back.

### The 4-Step Negotiation Process
1. SEPARATE person from problem — attack the issue, not the person
2. FOCUS on interests, not positions — ask WHY they want what they want
3. INVENT options for mutual gain — brainstorm creative solutions
4. INSIST on objective criteria — use market rates, industry standards as reference

### Common Negotiation Scenarios
PRICE objection: Instead of discounting, offer added value or a payment plan
TIME objection: Offer a trial period with no long-term commitment
TRUST objection: Offer a guarantee or a testimonial from a similar customer

### The Power of "How" Questions
Instead of defending your price, ask:
- "How would this investment compare to what you're currently spending?"
- "How would earning X TK/month change your situation?"
- "How can we make this work for you?"

### When to Walk Away
Not every negotiation should end in agreement. Walk away if:
- The other person is disrespectful
- The terms violate your ethics
- The relationship won't be sustainable
- You're being pressured into something uncomfortable`,
    bn: `## দ্বন্দ্ব ছাড়াই আলোচনা

### উইন-উইন মানসিকতা
আলোচনা মানে অন্যজনের বিরুদ্ধে "জেতা" নয়। এটি এমন একটি সমাধান খোঁজা যেখানে উভয় পক্ষই সন্তুষ্ট বোধ করে। যদি অন্য ব্যক্তি মনে করে তারা হেরেছে, তারা ফিরে আসবে না।

### ৪-ধাপ আলোচনা প্রক্রিয়া
১. ব্যক্তি থেকে সমস্যা আলাদা করুন — ইস্যু আক্রমণ করুন, ব্যক্তি নয়
২. অবস্থানের পরিবর্তে স্বার্থে ফোকাস করুন — জিজ্ঞাসা করুন কেন তারা যা চায় তা চায়
৩. পারস্পরিক লাভের বিকল্প উদ্ভাবন করুন — সৃজনশীল সমাধান brainstorm করুন
৪. বস্তুনিষ্ঠ মানদণ্ডে জোর দিন — বাজার হার, ইন্ডাস্ট্রি স্ট্যান্ডার্ড রেফারেন্স হিসাবে ব্যবহার করুন

### সাধারণ আলোচনার পরিস্থিতি
দাম আপত্তি: ডিসকাউন্ট না দিয়ে, অতিরিক্ত মূল্য বা পেমেন্ট প্ল্যান অফার করুন
সময় আপত্তি: দীর্ঘমেয়াদী কমিটমেন্ট ছাড়া ট্রায়াল পিরিয়ড অফার করুন
বিশ্বাস আপত্তি: গ্যারান্টি বা অনুরূপ গ্রাহকের টেস্টিমোনিয়াল অফার করুন`,
  },

  // ── M28: Problem Solving ──
  {
    id: "m28_problem_solving",
    module: "problem_solving",
    title: "Effective Problem Solving",
    content: "problem_solving",
    en: `## SOLVING PROBLEMS SYSTEMATICALLY

### The 5-Why Technique
When faced with a problem, ask "WHY?" 5 times to find the root cause:
Example — Sales dropped this week:
1. Why? → Fewer people responded to messages
2. Why? → Messages felt too salesy
3. Why? → Didn't personalize each message
4. Why? → Was rushing through contacts
5. Why? → Didn't plan the day properly
ROOT CAUSE: Poor daily planning → SOLUTION: Spend 10 minutes planning each morning

### Common Problems & Solutions
PROBLEM: Not enough prospects
SOLUTION: Increase daily contact count by 50%, ask every customer for 3 referrals, post valuable content on social media daily

PROBLEM: Low conversion rate
SOLUTION: Record and review your pitch, ask a mentor to critique, practice objection handling more

PROBLEM: Team members quitting
SOLUTION: Increase 1-on-1 time, understand their specific challenge, celebrate small wins more

PROBLEM: Income plateau
SOLUTION: Upgrade to higher tier, focus on high-ticket products, build team deeper

### The Problem-Solving Mindset
Every problem is a learning opportunity. Instead of "Why is this happening to me?" ask "What is this teaching me?" This shifts you from victim to learner.`,
    bn: `## পদ্ধতিগতভাবে সমস্যা সমাধান

### ৫-বার হোয়াই টেকনিক
সমস্যার মুখোমুখি হলে, মূল কারণ খুঁজতে ৫ বার "কেন?" জিজ্ঞাসা করুন:
উদাহরণ — এই সপ্তাহে বিক্রয় কমেছে:
১. কেন? → কম মানুষ মেসেজের উত্তর দিয়েছে
২. কেন? → মেসেজগুলো খুব সেলসি মনে হয়েছে
৩. কেন? → প্রতিটি মেসেজ পার্সোনালাইজ করিনি
৪. কেন? → তাড়াহুড়ো করে কন্টাক্ট করছিলাম
৫. কেন? → দিনটি সঠিকভাবে পরিকল্পনা করিনি
মূল কারণ: দুর্বল দৈনিক পরিকল্পনা → সমাধান: প্রতিদিন সকালে ১০ মিনিট পরিকল্পনা করুন

### সাধারণ সমস্যা ও সমাধান
সমস্যা: পর্যাপ্ত প্রসপেক্ট নেই
সমাধান: দৈনিক কন্টাক্ট সংখ্যা ৫০% বাড়ান, প্রতিটি গ্রাহককে ৩টি রেফারেল চান, প্রতিদিন সোশ্যাল মিডিয়ায় মূল্যবান কন্টেন্ট পোস্ট করুন

সমস্যা: কম কনভার্শন রেট
সমাধান: আপনার পিচ রেকর্ড ও রিভিউ করুন, একজন মেন্টরকে সমালোচনা করতে বলুন, অবজেকশন হ্যান্ডলিং বেশি প্র্যাকটিস করুন`,
  },

  // ── M29: Advanced Sales ──
  {
    id: "m29_upsell_cross_sell",
    module: "advanced_sales",
    title: "Upselling & Cross-selling",
    content: "upsell_cross_sell",
    en: `## ADVANCED SELLING TECHNIQUES

### Upselling (upgrade to higher value)
When a customer chooses Standard, suggest Premium:
"That's a great choice! Many of our members start with Standard, then upgrade within the first week once they see the potential. Just so you know, upgrading to Premium gives you 2.5x higher earnings and team bonuses. Would you like to see the difference?"

### Cross-selling (related products)
After a course purchase:
"Since you're interested in [topic], you might also benefit from [related course]. Our members who took both reported 40% faster results. Let me share the details."

### Repeat Sales (keep them coming back)
- Deliver exceptional value EVEN AFTER the sale
- Check in at 3 days, 7 days, 14 days, 30 days
- Share tips on getting more value from what they bought
- Ask for feedback and act on it
- Surprise them with a small bonus or resource

### High-Ticket Sales Strategy
High-ticket (VIP 5,000 TK) requires different approach:
- Needs more trust-building (multiple conversations)
- Focus on ROI ("This 5,000 TK unlocks 50,000+ TK in earning potential")
- Offer payment plans if needed
- Share VIP-specific success stories
- Offer a personal demo or mentor call

### The Golden Rule of Advanced Sales
Never try to upsell or cross-sell BEFORE delivering value on the current purchase. First help them succeed, then introduce the next offer.`,
    bn: `## অ্যাডভান্সড সেলিং টেকনিক

### আপসেলিং (উচ্চ মূল্যে আপগ্রেড)
যখন একজন গ্রাহক স্ট্যান্ডার্ড বেছে নেন, প্রিমিয়াম suggest করুন:
"দারুণ পছন্দ! আমাদের অনেক সদস্যই স্ট্যান্ডার্ড দিয়ে শুরু করেন, তারপর সম্ভাবনা দেখে প্রথম সপ্তাহের মধ্যে আপগ্রেড করেন। জেনে রাখুন, প্রিমিয়ামে আপগ্রেড করলে ২.৫ গুণ বেশি আয় এবং টিম বোনাস পান। পার্থক্যটা দেখতে চান?"

### ক্রস-সেলিং (সম্পর্কিত পণ্য)
কোর্স কেনার পর:
"যেহেতু আপনি [বিষয়] এ আগ্রহী, আপনি [সম্পর্কিত কোর্স] থেকেও উপকৃত হতে পারেন। আমাদের সদস্যরা যারা উভয় কোর্স নিয়েছেন তারা ৪০% দ্রুত ফলাফল পেয়েছেন। বিস্তারিত বলি।"

### রিপিট সেল (তাদের ফিরিয়ে আনা)
- সেলের পরেও অসাধারণ মূল্য দিন
- ৩ দিন, ৭ দিন, ১৪ দিন, ৩০ দিনে চেক-ইন করুন
- তারা যা কিনেছে তা থেকে আরও মূল্য পাওয়ার টিপস শেয়ার করুন
- ফিডব্যাক চান এবং তা অনুযায়ী কাজ করুন
- একটি ছোট বোনাস বা রিসোর্স দিয়ে চমকে দিন`,
  },

  // ── M30: Continuous Learning ──
  {
    id: "m30_learning_path",
    module: "continuous_learning",
    title: "Building Your Learning Habit",
    content: "continuous_learning",
    en: `## THE 1% BETTER EVERY DAY APPROACH

### Why Continuous Learning Matters
The people who succeed long-term are not the ones who started with the most talent. They're the ones who never stopped learning. If you improve just 1% every day, you'll be 37x better in one year.

### Your Weekly Learning Routine
- MONDAY: Read one industry article (10 min)
- TUESDAY: Watch one training video (15 min)
- WEDNESDAY: Practice one sales script (15 min)
- THURSDAY: Listen to a motivational or educational podcast (20 min)
- FRIDAY: Review your week's learning and take notes (15 min)
- SATURDAY: Apply one new technique you learned (real practice)
- SUNDAY: Rest, reflect, plan next week

### Recommended Resources
BOOKS: How to Win Friends and Influence People, Never Split the Difference, The Psychology of Selling
FREE CONTENT: YouTube sales channels, LinkedIn learning, industry blogs
PEER LEARNING: Join team discussions, ask mentors questions, share what you learn

### Skill Self-Assessment
Every month, rate yourself 1-10 on:
- Product knowledge
- Communication skills
- Prospecting ability
- Closing skills
- Objection handling
- Leadership & team building

Focus on your lowest score next month. Track your improvement over time.

### The Learning Mindset
- Be curious about everything
- Ask "how can I improve?" after every interaction
- Learn from rejections — what could I have done differently?
- Share what you learn with your team (teaching reinforces learning)
- Stay humble — there's always more to learn`,
    bn: `## প্রতিদিন ১% ভালো হওয়ার পদ্ধতি

### কেন ধারাবাহিক শিক্ষা গুরুত্বপূর্ণ
যারা দীর্ঘমেয়াদে সফল হন তারা সবচেয়ে বেশি প্রতিভা নিয়ে শুরু করা ব্যক্তি নন। তারা হলেন যারা কখনো শেখা বন্ধ করেননি। আপনি যদি প্রতিদিন মাত্র ১% উন্নতি করেন, এক বছরে আপনি ৩৭ গুণ ভালো হবেন।

### আপনার সাপ্তাহিক শেখার রুটিন
- সোমবার: একটি ইন্ডাস্ট্রি আর্টিকেল পড়ুন (১০ মিনিট)
- মঙ্গলবার: একটি ট্রেনিং ভিডিও দেখুন (১৫ মিনিট)
- বুধবার: একটি সেলস স্ক্রিপ্ট প্র্যাকটিস করুন (১৫ মিনিট)
- বৃহস্পতিবার: একটি মোটিভেশনাল বা শিক্ষামূলক পডকাস্ট শুনুন (২০ মিনিট)
- শুক্রবার: সপ্তাহের শেখা রিভিউ ও নোট নিন (১৫ মিনিট)
- শনিবার: একটি নতুন টেকনিক বাস্তবে প্রয়োগ করুন
- রবিবার: বিশ্রাম, প্রতিফলন, পরের সপ্তাহের পরিকল্পনা`,
  },
];

export function getTrainingModules(): TrainingModule[] {
  return TRAINING_MODULES;
}

export function getModulesByCategory(category: string): TrainingModule[] {
  return TRAINING_MODULES.filter(m => m.module === category);
}

export function buildTrainingContext(moduleIds: string[], language: string): string {
  const selected = TRAINING_MODULES.filter(m => moduleIds.includes(m.id));
  if (selected.length === 0) return "";

  const lines = ["## TRAINING MODULES (use these to coach the member)"];
  for (const mod of selected) {
    const text = language === "bn" ? mod.bn : mod.en;
    lines.push(`\n### ${mod.title}`);
    lines.push(text);
  }
  return lines.join("\n");
}
