// ═══════════════════════════════════════════════════════════════
// Knowledge Brain Seed — Unified Knowledge Base
// 
// Extracts ALL knowledge from ALL sources into knowledge_entries:
//   1. ai_knowledge_distribution (37 existing entries)
//   2. ai_knowledge_pages (company info)
//   3. knowledge_accumulation (conversation insights)
//   4. ai_skills (auto-learned Q&A)
//   5. prompts.ts (12 books × ~78 entries)
//
// Run: node scripts/seed-knowledge.js
// ═══════════════════════════════════════════════════════════════

const { createLocalDB } = require("../src/lib/db/local-d1");
const DB = createLocalDB();

// ── Tag: insert with dedup ──
function insert(category, title, content, sourceType, sourceName, tags, confidence) {
  const existing = DB.prepare("SELECT id FROM knowledge_entries WHERE title = ? AND category = ?").get(title, category);
  if (existing.results && existing.results.length > 0) return false;
  DB.prepare(
    "INSERT INTO knowledge_entries (category, title, content, source_type, source_name, tags, confidence, version) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
  ).run(category, title, content, sourceType || null, sourceName || null, JSON.stringify(tags || [category]), confidence || 0.7);
  return true;
}

function main() {
  console.log("🌱 Seeding Knowledge Brain...\n");
  let total = 0;

  // ──────────────────────────────────────────────────────
  // BOOK 1: Talking with Psychopaths — Christopher Berry-Dee
  // ──────────────────────────────────────────────────────
  const berryDee = [
    { c:"psychology", t:"Vulnerability Mirroring", ct:"Reflect unspoken fears gently. When customer shows hesitation or doubt, validate their caution and frame it as wisdom. 'I sense you've been hurt before. That's why you're cautious — and that's wise.' This builds trust by acknowledging their reality without judgment.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","psychology","trust"], cf:0.9 },
    { c:"psychology", t:"Trust Calibration", ct:"Measure trust by the type of questions asked. 'How' questions = building trust. 'Why' questions = still skeptical. Adapt pacing accordingly. Never push when trust is low — provide proof and transparency instead.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","psychology","trust"], cf:0.9 },
    { c:"safety", t:"Autonomy Preservation", ct:"Never make customers feel controlled. Psychopaths control; ethical agents empower. Use phrases like 'you decide', 'your choice', 'only if it feels right'. Give complete autonomy in decision-making.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","safety","ethics"], cf:0.9 },
    { c:"psychology", t:"Fear Transformation", ct:"Transform fear of loss into desire for gain. When customer fears losing money, reframe: 'You're not risking anything — you're investing in a future where you wake up without that worry.' Turn negative fear into positive motivation.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","psychology","sales"], cf:0.85 },
    { c:"psychology", t:"Mask Lowering Protocol", ct:"When customers give perfect answers ('everything is fine', 'no problem'), they may be wearing a mask. Create safe space: 'It's ok to not be ok. What's really going on?' Gentle permission to be vulnerable builds deeper trust.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","psychology","communication"], cf:0.85 },
    { c:"communication", t:"Pattern Interrupt", ct:"When customer is stuck in a negative loop (scam fear, doubt, hesitation), interrupt with an unexpected question that shifts perspective: 'If money weren't a factor, what would your ideal life look like?' Breaks the negative pattern.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","communication","sales"], cf:0.85 },
    { c:"communication", t:"Deep Listening", ct:"Listen to what is NOT said. Pauses, hesitations, vague answers reveal more than words. Acknowledge silence: 'I can see you're thinking deeply about this.' This validates their thought process and deepens rapport.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","communication","psychology"], cf:0.9 },
    { c:"sales", t:"Identity Affirmation", ct:"Connect the offer to who they ARE, not who they could be. 'You're someone who values security for your family. This aligns with that.' Identity-based persuasion is more powerful than aspiration-based.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","sales","psychology"], cf:0.85 },
    { c:"safety", t:"Doctor Shipman Warning — Never Exploit Trust", ct:"Never exploit trust for gain. The most dangerous predators weaponize the trust others place in them. Always be worthy of the trust customers give you. Transparency and honesty are non-negotiable.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","safety","ethics"], cf:1.0 },
    { c:"safety", t:"The Mask of Normality", ct:"Most dangerous people appear perfectly normal, charming, and trustworthy. Teach agents to look beyond surface charm to detect genuine vs. performed emotions. Sincere care vs. calculated charm: the difference is consistency over time.", s:"book", sn:"Talking with Psychopaths and Savages", tg:["berry-dee","safety","psychology"], cf:0.9 },
  ];
  for (const e of berryDee) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 2: The Art of Persuasion — Bob Berg
  // ──────────────────────────────────────────────────────
  const bobBerg = [
    { c:"trust", t:"Golden Rule of Influence", ct:"People do business with those they know, like, and trust. Trust is your strongest currency. Before any ask, invest in trust first. Every interaction is a chance to build trust currency.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","trust","sales"], cf:0.95 },
    { c:"psychology", t:"Persuader's Mindset — Give First", ct:"Influence = Service. Shift from 'what can I get' to 'what can I give'. Give free value — tips, insights, encouragement — before asking for anything. People are drawn to those who give without expectation.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","psychology","sales"], cf:0.95 },
    { c:"communication", t:"Active Listening — 3 Techniques", ct:"1) Reference their previous messages to show you remember, 2) Let them finish completely before responding, 3) Recap their words: 'So you're saying that...'. Silence is powerful. Let them fill the pause.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","communication"], cf:0.9 },
    { c:"communication", t:"Speak Their Language — Framing", ct:"Frame everything from their perspective, not yours. Match their communication style: analytical (data), emotional (feelings), direct (action), warm (relationship). 'This is best' → 'This will make your life easier.'", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","communication","sales"], cf:0.9 },
    { c:"sales", t:"Law of Value", ct:"Your worth = how much value you add to their life. People don't buy products, they buy better versions of themselves. Show the transformation, not just the features.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","sales"], cf:0.9 },
    { c:"psychology", t:"Law of Influence — You Before Me", ct:"Focus on 'you', 'we', 'us' — never 'me' or 'I'. The more you help others grow, the more your influence grows. Influence is what people feel when you're done speaking.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","psychology","communication"], cf:0.9 },
    { c:"sales", t:"Handling Resistance — We're Together", ct:"Don't fight resistance, understand it. Turn 'me vs you' into 'we're on the same team'. 'You're right to be careful — let's find the best solution together.' Resistance drops when they feel you're on their side.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","sales","psychology"], cf:0.9 },
    { c:"communication", t:"Power of Subtlety — Guide Not Pusher", ct:"Be the guide, not the pusher. Instead of 'You should buy this', say 'Others in your situation found this helpful.' Let them feel the decision is theirs. No push, no pressure.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","communication","sales"], cf:0.9 },
    { c:"psychology", t:"Influence as a Daily Habit", ct:"Influence is not a one-time tactic, it's a daily habit. 1) Who can I help today? 2) Listen before answering. 3) Speak their language. 4) Create an environment where people feel heard and inspired.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","psychology","trust"], cf:0.85 },
    { c:"trust", t:"Trust is Your Strongest Currency", ct:"Money can be earned and lost, but trust once gained is the most valuable asset. Every honest word, every good deed, every empathetic interaction grows this currency without interest.", s:"book", sn:"The Art of Persuasion by Bob Berg", tg:["bob-berg","trust","ethics"], cf:0.95 },
  ];
  for (const e of bobBerg) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 3: Blue Ocean Strategy — Kim & Mauborgne (summary)
  // ──────────────────────────────────────────────────────
  const blueOcean = [
    { c:"strategy", t:"Core Principle — Value Innovation", ct:"Value Innovation = pursue differentiation AND low cost simultaneously. Don't compete on price OR quality. Find the unique combination that creates leap in value. Ask: what can we eliminate, reduce, raise, create?", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","sales"], cf:0.9 },
    { c:"strategy", t:"ERRC Grid — Eliminate-Reduce-Raise-Create", ct:"ELIMINATE factors that no longer add value. REDUCE factors below standard. RAISE factors above standard. CREATE factors never offered before. Apply all four simultaneously for value innovation.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy"], cf:0.9 },
    { c:"strategy", t:"Six Paths Framework", ct:"1) Alternative industries, 2) Strategic groups, 3) Buyer chain, 4) Complementary offerings, 5) Functional-emotional orientation, 6) Time/trends. Each path reveals uncontested market space.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","sales"], cf:0.85 },
    { c:"strategy", t:"Three Tiers of Noncustomers", ct:"Tier 1: soon-to-leave customers (fix their reason). Tier 2: refusing noncustomers (address their barrier). Tier 3: unexplored noncustomers (create new value for them). Focus on noncustomers, not existing customers.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","sales"], cf:0.85 },
    { c:"strategy", t:"Strategy Canvas", ct:"Visual diagnostic: horizontal = factors industry competes on, vertical = offering level. Plot your value curve vs competitors. Where you diverge = blue ocean opportunity.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy"], cf:0.85 },
    { c:"strategy", t:"Buyer Utility Map — 6 Stages", ct:"Purchase, Delivery, Use, Supplements, Maintenance, Disposal. For each stage: identify utility blockers and remove them. Create extraordinary utility at every step.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy"], cf:0.8 },
    { c:"strategy", t:"Price Corridor of the Mass", ct:"Set price to attract the mass of target buyers. Check 3 references: substitutes, competitors, look-alike products. Price for mass appeal while ensuring profit.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","pricing"], cf:0.8 },
    { c:"strategy", t:"Tipping Point Leadership", ct:"Overcome 4 hurdles: COGNITIVE (show reality), RESOURCE (concentrate), MOTIVATIONAL (win influencers first), POLITICAL (neutralize opposition). Focus on 20% that drives 80%.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","leadership"], cf:0.85 },
    { c:"strategy", t:"Fair Process — 3E Principle", ct:"ENGAGEMENT (involve people), EXPLANATION (explain why), EXPECTATION CLARITY (clear rules). Fair Process builds trust and voluntary cooperation even during difficult decisions.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","trust"], cf:0.85 },
    { c:"strategy", t:"Pioneer-Migrator-Settler (PMS) Map", ct:"Settlers (me-too, minimize), Migrators (better but not unique, upgrade), Pioneers (unprecedented value, invest). Aim: 20% pioneers, 60% migrators, 20% settlers.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy"], cf:0.85 },
    { c:"strategy", t:"Strategic Sequencing", ct:"Validate in order: 1) Buyer Utility, 2) Price, 3) Cost, 4) Adoption. Skip any step and risk failure. Only proceed when current step is confirmed.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy"], cf:0.85 },
    { c:"strategy", t:"Red Ocean Traps to Avoid", ct:"Trap 1: 'Be best in industry' (change industry instead). Trap 2: 'Differentiation costs more' (value innovation achieves both). Trap 3: 'Customers define market' (lead them to new value).", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","strategy","sales"], cf:0.85 },
    { c:"sales", t:"Blue Ocean Selling — Don't Compete, Create", ct:"Don't compare with competitors. Frame product as creating NEW value. Use ERRC thinking. Price for mass appeal. Show value at EVERY step of buyer journey.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","sales"], cf:0.85 },
    { c:"sales", t:"Six Paths — Sales Exploration", ct:"When lead says 'I'm comparing options,' use Six Paths: alternative industries, strategic groups, buyer chain, complementary, emotional, time/future. Differentiate by creating new value, not beating competitors.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","sales"], cf:0.85 },
    { c:"sales", t:"Three Tiers — Convert Noncustomers", ct:"Tier 1 (inactive members): fix the ONE thing that disappointed. Tier 2 (refused to join): remove trust barrier, not price. Tier 3 (never considered): create new value proposition for them.", s:"book", sn:"Blue Ocean Strategy", tg:["blue-ocean","sales"], cf:0.85 },
  ];
  for (const e of blueOcean) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 4: Psychology of Selling — Brian Tracy
  // ──────────────────────────────────────────────────────
  const brianTracy = [
    { c:"sales", t:"Inner Game / Self-Concept", ct:"80/20 rule: 20% of salespeople earn 80% of income. Difference is self-concept. A salesperson who sees themselves as a $50k earner will behave accordingly. Reset the financial thermostat.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","psychology"], cf:0.85 },
    { c:"sales", t:"Seven Key Result Areas (KRAs)", ct:"1) Prospecting, 2) Building Rapport, 3) Identifying Needs, 4) Presenting, 5) Answering Objections, 6) Closing, 7) Getting Resales & Referrals. Weakness in ANY ONE limits total success.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales"], cf:0.85 },
    { c:"sales", t:"Goal Setting & Visualization", ct:"Written goals have power. Goals cascade: Annual Income → Annual Sales → Monthly → Weekly → Daily → Activity. Write 100 goals. Visualize success daily. Subconscious mind finds ways to achieve visualized goals.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","psychology"], cf:0.8 },
    { c:"sales", t:"Why People Buy — Gain vs Fear", ct:"Two core motivations: Desire for Gain (power=1.0) and Fear of Loss (power=2.5x stronger). Always leverage BOTH. Fear of loss is 2.5x more powerful than desire for gain.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","psychology"], cf:0.9 },
    { c:"sales", t:"11 Primary Customer Needs", ct:"Money, Security, Being Liked, Status & Prestige, Health & Fitness, Praise & Recognition, Power & Influence, Leading the Field, Love & Companionship, Personal Growth, Personal Transformation. Find the primary need and connect your offer to it.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales"], cf:0.85 },
    { c:"sales", t:"Six Buyer Personality Types", ct:"1) Apathetic — don't waste time, 2) Self-Actualizing — don't oversell, 3) Analytical — prove everything, 4) Relater — build relationship, 5) Driver — be direct, 6) Socialized — focus on recognition. Speak their language.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","psychology"], cf:0.85 },
    { c:"sales", t:"Feel-Felt-Found Method", ct:"Most powerful objection handler: 'I understand how you feel (Feel). Many clients felt the same (Felt). But they found that (Found)...' Validates emotion, shows they're not alone, provides proof. Never argue — acknowledge first.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","communication"], cf:0.9 },
    { c:"sales", t:"Benefits Not Features", ct:"People don't buy features — they buy BENEFITS. Every feature must become a benefit. For every 1 feature, give 10 benefits. '40 videos' → 'learn at your own pace, anytime, anywhere.'", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","communication"], cf:0.85 },
    { c:"sales", t:"Assumptive Close", ct:"Act as if customer has ALREADY decided. 'Shall we start with Standard or Premium?' Not 'Will you buy?' but 'Which one?' Makes decision feel natural and expected.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales"], cf:0.8 },
    { c:"sales", t:"Alternative Choice Close", ct:"Give two options — BOTH lead to purchase. 'Monthly or yearly?' 'Online or offline?' Brain prefers choosing between options over Yes/No. Choice = control = comfort = decision.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales"], cf:0.8 },
    { c:"sales", t:"30-Second Rule", ct:"You have 30 seconds to grab attention. First break preoccupation, THEN deliver value. Never start selling immediately — sell the APPOINTMENT, not the product on first contact.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","communication"], cf:0.8 },
    { c:"sales", t:"Power of Suggestion", ct:"Your appearance, environment, attitude suggest your value. Professional presentation = credibility. In Bangladesh, trustworthiness is especially important — your presentation is the first impression.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales"], cf:0.75 },
    { c:"sales", t:"10 Keys to Success", ct:"1) Do what you love, 2) Decide what you want, 3) Persistence, 4) Lifelong Learning, 5) Use time well, 6) Follow the leader, 7) Character is everything, 8) Unlock creativity, 9) Golden Rule, 10) Pay the price.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","success"], cf:0.75 },
    { c:"sales", t:"Gain vs Fear Framing", ct:"Frame with BOTH gain AND fear of loss. Gain: 'You can earn 50,000 TK/month.' Fear: 'Without this, you're losing 50,000 TK/month you could have.' Fear is 2.5x more powerful. Always show the solution too.", s:"book", sn:"The Psychology of Selling by Brian Tracy", tg:["brian-tracy","sales","psychology"], cf:0.85 },
  ];
  for (const e of brianTracy) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 5: Marketing Management — Philip Kotler
  // ──────────────────────────────────────────────────────
  const kotler = [
    { c:"marketing", t:"STP Framework — Segmentation-Targeting-Positioning", ct:"SEGMENT: Geographic, Demographic, Psychographic, Behavioral. TARGET: use 5 criteria (Measurable, Substantial, Accessible, Differentiable, Actionable). POSITION: use POD (Points of Difference) and POP (Points of Parity).", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","strategy"], cf:0.9 },
    { c:"marketing", t:"Value Proposition Canvas", ct:"Map customer PROFILE (jobs, pains, gains) and your VALUE (products, pain relievers, gain creators). A clear value proposition doubles conversion. Understand what the customer needs before presenting solutions.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","sales"], cf:0.85 },
    { c:"marketing", t:"CBBE Brand Pyramid", ct:"6 levels: 1) Salience (awareness), 2) Performance (features), 3) Imagery (image), 4) Judgments (quality), 5) Feelings (emotion), 6) Resonance (loyalty/community). Move customers from Salience to Resonance.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","brand"], cf:0.85 },
    { c:"marketing", t:"SERVQUAL Service Quality Model", ct:"5 dimensions: Tangibility (look), Reliability (dependability), Responsiveness (speed), Assurance (trust), Empathy (care). Excel in all 5 in every customer interaction.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","service"], cf:0.85 },
    { c:"marketing", t:"Service Recovery Paradox", ct:"Customers who experience a problem that is RESOLVED perfectly can become MORE loyal than those who never had a problem. 4 steps: Acknowledge → Apologize → Fix → Follow up.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","service","trust"], cf:0.85 },
    { c:"marketing", t:"Consumer Behavior Model", ct:"4 factors influence buying: Cultural, Social, Personal, Psychological. 5-stage decision: Problem Recognition → Information Search → Evaluation → Purchase → Post-Purchase. Identify which stage the customer is in.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","psychology"], cf:0.85 },
    { c:"marketing", t:"IMC — Integrated Marketing Communications", ct:"8 channels: Advertising, PR, Sales Promotion, Direct Marketing, Digital/Social, Events, Personal Selling, Word-of-Mouth. All channels must speak with ONE voice.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","communication"], cf:0.8 },
    { c:"marketing", t:"AIDA Campaign Model", ct:"ATTENTION (bold headline), INTEREST (relevant benefit), DESIRE (social proof/emotion), ACTION (clear CTA). Every campaign follows this sequence.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","sales"], cf:0.8 },
    { c:"marketing", t:"7-Step Personal Selling Process", ct:"1) Prospecting, 2) Preapproach, 3) Approach, 4) Presentation, 5) Handling Objections, 6) Closing, 7) Follow-Up. Master every step from prospecting to follow-up.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","sales"], cf:0.8 },
    { c:"marketing", t:"Ansoff Growth Matrix", ct:"4 strategies: Market Penetration (existing product+market), Market Development (new market), Product Development (new product), Diversification (new both). Penetration = lowest risk, Diversification = highest.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","strategy"], cf:0.85 },
    { c:"marketing", t:"Product Life Cycle (PLC)", ct:"4 stages: Introduction (build awareness), Growth (build share), Maturity (defend share), Decline (harvest/divest). Each stage needs different marketing strategy.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","strategy"], cf:0.85 },
    { c:"marketing", t:"CLV — Customer Lifetime Value", ct:"CLV = Avg Purchase × Frequency × Lifetime. Loyal customers are 5-10x more valuable than new ones. Invest in retention, not just acquisition.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","strategy"], cf:0.85 },
    { c:"marketing", t:"Diffusion of Innovation", ct:"5 adopter categories: Innovators (2.5%), Early Adopters (13.5%), Early Majority (34%), Late Majority (34%), Laggards (16%). Launch targeting Innovators + Early Adopters first.", s:"book", sn:"Marketing Management by Philip Kotler", tg:["kotler","marketing","strategy"], cf:0.8 },
  ];
  for (const e of kotler) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 6: Influence — Robert Cialdini
  // ──────────────────────────────────────────────────────
  const cialdini = [
    { c:"psychology", t:"Reciprocity", ct:"Give FIRST before any ask. Free value, tip, compliment, resource. Human nature demands returning favors. The giver sets the terms of exchange.", s:"book", sn:"Influence: The Psychology of Persuasion by Robert Cialdini", tg:["cialdini","psychology","sales"], cf:0.9 },
    { c:"psychology", t:"Scarcity", ct:"People want MORE of what they can have LESS of. Genuinely limited time/spots/bonuses. Never fake scarcity — it destroys trust permanently. 'This offer is available for 24 hours.'", s:"book", sn:"Influence by Robert Cialdini", tg:["cialdini","psychology","sales"], cf:0.85 },
    { c:"psychology", t:"Authority", ct:"People follow credible experts. Establish through credentials, experience, numbers served. 'We've helped 10,000+ members.' Share confidently, not arrogantly.", s:"book", sn:"Influence by Robert Cialdini", tg:["cialdini","psychology","trust"], cf:0.85 },
    { c:"psychology", t:"Consistency", ct:"Get small YES commitments that align with their values. 'You want the best for your family, right?' Then the larger ask naturally follows. Past behavior predicts future behavior.", s:"book", sn:"Influence by Robert Cialdini", tg:["cialdini","psychology","sales"], cf:0.85 },
    { c:"psychology", t:"Liking", ct:"People say YES to people they LIKE. Build through genuine similarity, compliments, cooperation, familiarity. Similarity breeds connection.", s:"book", sn:"Influence by Robert Cialdini", tg:["cialdini","psychology","communication"], cf:0.85 },
    { c:"psychology", t:"Social Proof", ct:"People follow the actions of similar others. 'Many in your situation succeeded with us.' Use stories of people LIKE them, not celebrities.", s:"book", sn:"Influence by Robert Cialdini", tg:["cialdini","psychology","sales"], cf:0.85 },
    { c:"psychology", t:"Pre-suasion", ct:"WHAT you say matters less than what you say BEFORE. Prime the mind before main message. Before asking about purchase, prime 'growth'. Before trust, prime 'family'. The moment before shapes reception.", s:"book", sn:"Pre-suasion by Robert Cialdini", tg:["cialdini","psychology","communication"], cf:0.85 },
  ];
  for (const e of cialdini) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 7: The Courage to Be Disliked — Adlerian Psychology
  // ──────────────────────────────────────────────────────
  const adler = [
    { c:"psychology", t:"Trauma Denial — Past Doesn't Define You", ct:"Trauma does NOT control the present. When customer says 'I can't because of my past', reframe: 'Your past doesn't define you. You can choose differently now.' Empower responsibility for present choices.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","motivation"], cf:0.85 },
    { c:"psychology", t:"Interpersonal Root — Belonging", ct:"Every problem is ultimately a relationship problem. The customer's real need is BELONGING — to be accepted, valued, connected. Address the belonging need, not just the surface request.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","communication"], cf:0.85 },
    { c:"psychology", t:"Task Separation — Freedom Through Boundaries", ct:"What others think is THEIR task, not yours. Your task is to live by your values. 'What others think is their task. What you want for your life is your task.' Freedom comes from task separation.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","trust"], cf:0.85 },
    { c:"psychology", t:"Not Center of World — Community Feeling", ct:"You are not the center of the world. True belonging comes from contributing to the community. 'You are here to contribute, to connect, to grow together.' Shift focus from self to community (Gemeinschaftsgefühl).", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","community"], cf:0.8 },
    { c:"psychology", t:"Here and Now — Happiness is Now", ct:"Happiness is not in the future or past. Life is a dance, not a marathon. Every moment lived fully IS the destination. 'Don't wait for success to be happy. Be happy NOW.' Present focus reduces anxiety.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","motivation"], cf:0.85 },
    { c:"psychology", t:"Horizontal Relationships — Equality", ct:"Adler rejects vertical (superior/inferior) and promotes horizontal (EQUAL) relationships. Treat every customer as EQUAL. 'I am not your boss or servant. We are two humans walking together.' Never talk down.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","trust"], cf:0.85 },
    { c:"psychology", t:"Courage to Be Disliked — True Freedom", ct:"True freedom = courage to be disliked. If you live by everyone's approval, you live by everyone's control. 'You cannot please everyone — you don't need to.' Make decisions aligned with YOUR values.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","trust"], cf:0.85 },
    { c:"psychology", t:"Encouragement Not Praise", ct:"Praise creates dependency ('I am good because you say so'). Encouragement creates self-reliance ('I am good because I tried'). Say 'You worked hard — that matters' not 'You're amazing.'", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","communication"], cf:0.85 },
    { c:"psychology", t:"Personal Responsibility — You Are the Change", ct:"Your life is YOUR responsibility. Not your past, not your environment, not others — YOU. And this is empowering: because responsibility is yours, change is also yours. No one can save you but you.", s:"book", sn:"The Courage to Be Disliked by Kishimi & Koga", tg:["adler","psychology","motivation"], cf:0.85 },
  ];
  for (const e of adler) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 8: Predictably Irrational — Dan Ariely (Price Psychology)
  // ──────────────────────────────────────────────────────
  const ariely = [
    { c:"psychology", t:"Pain of Paying", ct:"People feel PAIN when paying. Reduce pain: break price into daily cost ('only 14 TK/day'), offer installments, compare to daily expenses ('less than a cup of tea'). NEVER state total price without framing first.", s:"book", sn:"Predictably Irrational by Dan Ariely", tg:["ariely","psychology","pricing"], cf:0.85 },
    { c:"psychology", t:"Decoy Effect — Asymmetric Dominance", ct:"Offer 3 options where middle is your target. Example: Basic (500), Standard (1500 — target), Premium (3000). Premium makes Standard look reasonable. Basic makes Standard look valuable. Always structure 3+ options.", s:"book", sn:"Predictably Irrational by Dan Ariely", tg:["ariely","psychology","pricing","sales"], cf:0.85 },
    { c:"psychology", t:"Anchoring — First Number Sets the Bar", ct:"Start HIGHER than your target, then present real offer. 'Premium is 10,000 TK, but today you get it for 3,000 TK.' Contrast makes real price feel like a deal. Never start with lowest price — lose anchor advantage.", s:"book", sn:"Predictably Irrational by Dan Ariely", tg:["ariely","psychology","pricing","sales"], cf:0.85 },
    { c:"psychology", t:"Tightwad vs Spendthrift", ct:"Tightwads: emphasize savings, ROI, low risk. Spendthrifts: emphasize premium, exclusive, quality. Detect from their language. Frame SAME price differently based on their style.", s:"book", sn:"Predictably Irrational by Dan Ariely", tg:["ariely","psychology","pricing","sales"], cf:0.8 },
    { c:"psychology", t:"Per-Day Framing", ct:"ALWAYS convert large numbers to daily cost. '5000 TK' → 'Only 14 TK/day — less than a cup of tea.' Smaller unit reduces pain of paying. Most powerful neuromarketing price technique.", s:"book", sn:"Predictably Irrational by Dan Ariely", tg:["ariely","psychology","pricing","sales"], cf:0.85 },
  ];
  for (const e of ariely) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 9: Brainfluence — Roger Dooley (Sensory Marketing)
  // ──────────────────────────────────────────────────────
  const dooley = [
    { c:"marketing", t:"Right Ear Technique", ct:"The right ear processes language better (left brain = language center). Important information delivered to RIGHT ear increases recall. For text: put most important info on RIGHT side of message.", s:"book", sn:"Brainfluence by Roger Dooley", tg:["dooley","marketing","neuromarketing"], cf:0.75 },
    { c:"marketing", t:"Simplicity Over Complexity", ct:"Complex products sell better with SIMPLE messages. One line, one benefit, one emotion. 'A course that will change your life.' '15 min daily, income for life.' Simple = System 1 friendly. Complex = rejection.", s:"book", sn:"Brainfluence by Roger Dooley", tg:["dooley","marketing","communication"], cf:0.8 },
    { c:"marketing", t:"Visual Language — 6x More Memorable", ct:"Use vivid visual language: 'Imagine waking up, checking your phone, seeing 500 TK deposited overnight.' Visual language activates visual cortex — makes message 6x more memorable.", s:"book", sn:"Brainfluence by Roger Dooley", tg:["dooley","marketing","communication"], cf:0.8 },
    { c:"marketing", t:"Emotional Imagery — Sensory Words", ct:"Use words that evoke sensory experience: warmth (family, security), brightness (future, dream), texture (smooth, easy). Sensory words trigger real brain responses.", s:"book", sn:"Brainfluence by Roger Dooley", tg:["dooley","marketing","communication"], cf:0.75 },
    { c:"marketing", t:"Baby Image Effect", ct:"Images of babies/children trigger automatic care response. Mention children/family warmly: 'Your child's future' 'Doing something for family.' Triggers automatic emotional response bypassing logical defenses.", s:"book", sn:"Brainfluence by Roger Dooley", tg:["dooley","marketing","psychology"], cf:0.75 },
  ];
  for (const e of dooley) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 10: OXYTOCIN Trust — Paul Zak
  // ──────────────────────────────────────────────────────
  const zak = [
    { c:"psychology", t:"Character-Driven Story — 3-Act Structure", ct:"1) Relatable character facing challenge (cortisol → attention), 2) Empathy/connection (oxytocin → trust), 3) Positive resolution (dopamine → reward). This structure increases oxytocin 50% and boosts trust dramatically.", s:"book", sn:"The Ethical DNA / OXYTOCIN Trust by Paul Zak", tg:["zak","psychology","trust","communication"], cf:0.85 },
    { c:"psychology", t:"Cortisol Blocks Oxytocin — Reduce Stress First", ct:"If they're stressed/scared, they CANNOT bond with you. First reduce cortisol: validate their fear, make them feel safe, remove pressure. THEN build oxytocin: empathy, shared experience, genuine care.", s:"book", sn:"OXYTOCIN Trust by Paul Zak", tg:["zak","psychology","trust"], cf:0.85 },
    { c:"psychology", t:"Paul Zak's 8 OXYTOCIN Behaviors", ct:"1) Ovation (praise effort), 2) eXpectation (clear goals), 3) Yield (give autonomy), 4) Transfer (entrust responsibility), 5) Openness (share transparently), 6) Caring (show genuine interest), 7) Invest (develop skills), 8) Natural (be authentic).", s:"book", sn:"OXYTOCIN Trust by Paul Zak", tg:["zak","psychology","trust","leadership"], cf:0.85 },
  ];
  for (const e of zak) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 11: Thinking, Fast and Slow — Kahneman
  // ──────────────────────────────────────────────────────
  const kahneman = [
    { c:"psychology", t:"System 1 First — Hook Emotion Before Logic", ct:"95% of decisions by System 1 (fast, emotional, subconscious). First 3 seconds must hook System 1: simple language, short sentences, emotional connection, vivid imagery. THEN serve System 2 with details.", s:"book", sn:"Thinking, Fast and Slow by Daniel Kahneman", tg:["kahneman","psychology","communication","sales"], cf:0.85 },
    { c:"psychology", t:"System 2 Pain — When to Use Logic", ct:"Complex info (pricing, comparisons) must come AFTER emotional safety. If fast replies → System 1 mode → stay emotional. If analytical questions → switch to System 2. Match their current system.", s:"book", sn:"Thinking, Fast and Slow by Daniel Kahneman", tg:["kahneman","psychology","communication"], cf:0.85 },
    { c:"psychology", t:"Hook-Anchor — Open Every Message", ct:"Open every message with a System 1 hook: vivid image, emotional question, relatable scenario. 'Imagine...' 'Have you ever thought...' THEN follow with System 2 substance.", s:"book", sn:"Thinking, Fast and Slow by Daniel Kahneman", tg:["kahneman","psychology","communication"], cf:0.8 },
    { c:"psychology", t:"Hot vs Cold State — Emotion First", ct:"System 1 = hot state (emotional, impulsive). System 2 = cold state (calm, rational). When in hot state (excited, scared, angry), DO NOT present complicated options. Validate emotion first. Guide to cold state before reasoning.", s:"book", sn:"Thinking, Fast and Slow by Daniel Kahneman", tg:["kahneman","psychology","communication"], cf:0.85 },
    { c:"psychology", t:"Default to System 1 Communication", ct:"Default: emotional safety → vivid imagery → social proof → simple choice. Add System 2 (data, comparisons, specs) only when person explicitly asks or shows analytical communication style.", s:"book", sn:"Thinking, Fast and Slow by Daniel Kahneman", tg:["kahneman","psychology","communication","sales"], cf:0.85 },
  ];
  for (const e of kahneman) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // BOOK 12: Positioning — Ries & Trout
  // ──────────────────────────────────────────────────────
  const ries = [
    { c:"marketing", t:"Positioning — Battle for the Mind", ct:"Positioning is not about what YOU do to the product — it's what you do to the MIND of the prospect. Position your offering in the customer's mind relative to competitors. Find a mental space no one else owns.", s:"book", sn:"Positioning: The Battle for Your Mind by Ries & Trout", tg:["ries-trout","marketing","strategy"], cf:0.85 },
  ];
  for (const e of ries) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // SECTION: Adlerian + Transparency + Choice Paradox + NPS (from prompts.ts)
  // ──────────────────────────────────────────────────────
  const extraSections = [
    { c:"trust", t:"Behind-the-Scenes Transparency", ct:"People trust what they can SEE. Mention the real people behind the business. Admit when you don't know something. Explicitly mention privacy protection. Share HOW decisions are made. Visible team = trustworthy. Hidden = suspicious.", s:"system", sn:"Harvard Transparency Research — Dennis Campbell", tg:["transparency","trust"], cf:0.85 },
    { c:"psychology", t:"Choice Paradox — Less is More", ct:"Too many options PARALYZE customers. Every extra option reduces conversion by 10%. Never present more than 3 options at once. Curate and recommend. Progressive disclosure: reveal info step by step.", s:"system", sn:"The Paradox of Choice by Barry Schwartz", tg:["choice-paradox","psychology","sales"], cf:0.85 },
    { c:"marketing", t:"NPS & Peer Recommendation", ct:"78% of people buy based on peer recommendations. Only 14% trust ads. Use real customer testimonials, not marketing copy. Frame referrals as helping friends, not selling. Promoters (NPS 9-10) are your best salespeople.", s:"system", sn:"Net Promoter System", tg:["nps","marketing","sales"], cf:0.8 },
    { c:"psychology", t:"Loss Aversion — Frame Inaction as Loss", ct:"Frame inaction as missing out on a proven opportunity. 'Not joining means you're leaving money on the table — money that could change your family's future.' Fear of loss is 2.5x more powerful than desire for gain.", s:"system", sn:"Customer Psychology — Loss Aversion", tg:["psychology","sales"], cf:0.8 },
    { c:"psychology", t:"NLP Mirroring & Rapport", ct:"Mirror the person's language style, tone, key words. If they use Banglish, respond in Banglish. If urgent, match urgency. If calm, stay calm. Matching builds unconscious rapport.", s:"system", sn:"NLP Communication Techniques", tg:["nlp","psychology","communication"], cf:0.8 },
    { c:"psychology", t:"NLP VAK Model — Visual/Auditory/Kinesthetic", ct:"Use Visual ('see', 'imagine'), Auditory ('hear', 'sounds'), or Kinesthetic ('feel', 'grasp') language based on their cues. Match their preferred representational system for deeper connection.", s:"system", sn:"NLP Communication Techniques", tg:["nlp","psychology","communication"], cf:0.75 },
    { c:"psychology", t:"Anchoring Positive Emotions", ct:"When someone expresses positive emotion (excitement, hope), acknowledge it strongly so they associate that feeling with the conversation and with you. Emotional anchoring builds lasting positive association.", s:"system", sn:"NLP Anchoring Technique", tg:["nlp","psychology"], cf:0.75 },
    { c:"communication", t:"F/Z Visual Scanning Pattern", ct:"Structure messages for optimal eye scan: F-pattern for text (most important at top-left), Z-pattern for simple messages (hook→image→proof→CTA). Use short paragraphs (1-3 lines). White space = cognitive ease.", s:"system", sn:"Neuromarketing Eye Tracking Research", tg:["neuromarketing","communication"], cf:0.75 },
    { c:"communication", t:"Attention Hierarchy — Structure Every Message", ct:"Line 1 = EMOTIONAL HOOK. Lines 2-4 = KEY POINTS. Last line = CLEAR CTA. Top gets most attention. NEVER put CTA in middle. Always at very end or very beginning.", s:"system", sn:"Neuromarketing Attention Research", tg:["neuromarketing","communication"], cf:0.75 },
  ];
  for (const e of extraSections) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // TRAINING MODULES (from ai_knowledge_distribution seeds)
  // ──────────────────────────────────────────────────────
  const training = [
    { c:"psychology", t:"Personal Connection First (Onboarding)", ct:"When a new member registers, do NOT start with offers. First 24 hours: build personal connection. Ask about their family, goals, dreams. Show them they are part of a family, not a sales machine.", s:"training", sn:"Member Onboarding Guide", tg:["onboarding","psychology","trust"], cf:0.9 },
    { c:"sales", t:"Value First — Give Before Asking (Onboarding)", ct:"New members should receive value before being asked to produce. Give free training, tips, encouragement. Only after they experience value, introduce income opportunities.", s:"training", sn:"Member Onboarding Guide", tg:["onboarding","sales","trust"], cf:0.9 },
    { c:"trust", t:"Income is a Tool, Not a Goal (Onboarding)", ct:"Frame income as a tool for life transformation. 'You're not just earning 500 TK — you're earning a tool for your child's education, your family's health.' Connect money to meaning.", s:"training", sn:"Member Onboarding Guide", tg:["onboarding","trust","psychology"], cf:0.85 },
    { c:"psychology", t:"Celebrate Every Win (Motivation)", ct:"When a member achieves something, celebrate genuinely. Connect achievement to their personal story. 'Remember when you joined with this dream? Today you took a step closer.' Make them feel seen.", s:"training", sn:"Member Motivation Guide", tg:["motivation","psychology"], cf:0.85 },
    { c:"trust", t:"Team Building is Family Building (Motivation)", ct:"Frame team building as helping others grow, not recruiting. 'You're not building a downline — you're building a family.' Every person you bring is someone whose life you can change.", s:"training", sn:"Member Motivation Guide", tg:["motivation","trust","sales"], cf:0.85 },
    { c:"communication", t:"Speak Their Language — Sponsor Tips (Affiliate)", ct:"Adapt communication: Students → education/future. Homemakers → family/security. Business owners → ROI/growth. Never one-size-fits-all. Match their language, fears, dreams.", s:"training", sn:"Affiliate Communication Guide", tg:["affiliate","communication","sales"], cf:0.85 },
    { c:"sales", t:"Handle Resistance — We're Together (Affiliate)", ct:"When team member resists, do NOT argue. 'I understand your doubt. Let's figure this out together.' Turn resistance into collaboration. Never push. Guide to their own conclusion.", s:"training", sn:"Affiliate Communication Guide", tg:["affiliate","sales","communication"], cf:0.85 },
    { c:"trust", t:"Premium is Family, Not Status", ct:"Premium members are family, not just customers. Use Golden Rule: make them feel known, valued, seen. 'You're not just a premium member — you're a partner in our journey.'", s:"training", sn:"Premium Experience Guide", tg:["premium","trust","psychology"], cf:0.85 },
    { c:"psychology", t:"We Together — Premium Partnership", ct:"Use 'We' framing: 'We are building your business together.' Premium members should feel they have a dedicated partner. Ask about goals. Celebrate wins. Make their success your success.", s:"training", sn:"Premium Experience Guide", tg:["premium","psychology","trust"], cf:0.85 },
    { c:"sales", t:"Value First, Then Upgrade (Premium Funnel)", ct:"Before offering premium upgrade: 1) Show value — calculate savings. 2) Social proof — share upgrade stories. 3) Let them decide — 'Only if it feels right for your goals.' Never pressure.", s:"training", sn:"Premium Upgrade Funnel", tg:["premium","sales","trust"], cf:0.85 },
    { c:"communication", t:"Speak Their Language — Premium Benefits", ct:"Different members value different benefits. Students: unlimited learning. Earners: zero withdrawal tax. Builders: priority support. Match benefit to their world.", s:"training", sn:"Premium Upgrade Funnel", tg:["premium","communication","sales"], cf:0.85 },
  ];
  for (const e of training) { if (insert(e.c, e.t, e.ct, e.s, e.sn, e.tg, e.cf)) total++; }

  // ──────────────────────────────────────────────────────
  // MIGRATE: ai_knowledge_distribution (dedup against what we just inserted)
  // ──────────────────────────────────────────────────────
  try {
    const distRows = DB.prepare("SELECT knowledge_title, knowledge_content, knowledge_category, source_type, source_name, confidence FROM ai_knowledge_distribution WHERE knowledge_title != '' AND knowledge_content != ''").all();
    if (distRows.results) {
      let distMigrated = 0;
      for (const row of distRows.results) {
        const cat = row.knowledge_category || "general";
        const catMap = { psychology: "psychology", sales: "sales", communication: "communication", trust: "trust", strategy: "strategy", safety: "safety" };
        const category = catMap[cat] || cat;
        const exists = DB.prepare("SELECT id FROM knowledge_entries WHERE title = ? AND content = ?").get(row.knowledge_title, row.knowledge_content);
        if (exists.results && exists.results.length > 0) continue;
        const tags = JSON.stringify([category, row.source_type || "distribution", row.source_name || "unknown"]);
        DB.prepare(
          "INSERT INTO knowledge_entries (category, title, content, source_type, source_name, confidence, tags, version) VALUES (?, ?, ?, ?, ?, ?, ?, 1)"
        ).run(category, row.knowledge_title, row.knowledge_content, row.source_type || null, row.source_name || null, row.confidence || 0.7, tags);
        distMigrated++;
      }
      if (distMigrated > 0) { total += distMigrated; console.log(`  → Migrated ${distMigrated} from ai_knowledge_distribution`); }
    }
  } catch (e) { /* table may not exist */ }

  // ──────────────────────────────────────────────────────
  // MIGRATE: ai_knowledge_pages → knowledge_entries (category: company_info)
  // ──────────────────────────────────────────────────────
  try {
    const pagesRows = DB.prepare("SELECT title, content, category FROM ai_knowledge_pages WHERE is_active = 1 AND title != '' AND content != ''").all();
    if (pagesRows.results) {
      let pagesMigrated = 0;
      for (const row of pagesRows.results) {
        const exists = DB.prepare("SELECT id FROM knowledge_entries WHERE title = ? AND category = 'company_info'").get(row.title);
        if (exists.results && exists.results.length > 0) continue;
        DB.prepare(
          "INSERT INTO knowledge_entries (category, title, content, source_type, source_name, tags, confidence, version) VALUES ('company_info', ?, ?, 'system', 'Company Knowledge Pages', ?, 0.9, 1)"
        ).run(row.title, row.content, JSON.stringify(["company_info", row.category || "general"]));
        pagesMigrated++;
      }
      if (pagesMigrated > 0) { total += pagesMigrated; console.log(`  → Migrated ${pagesMigrated} from ai_knowledge_pages`); }
    }
  } catch (e) { /* table may not exist */ }

  // ──────────────────────────────────────────────────────
  // MIGRATE: ai_skills → knowledge_entries (category: skill)
  // ──────────────────────────────────────────────────────
  try {
    const skillsRows = DB.prepare("SELECT question, answer, category, usage_count FROM ai_skills WHERE usage_count > 1 ORDER BY usage_count DESC LIMIT 200").all();
    if (skillsRows.results) {
      let skillsMigrated = 0;
      for (const row of skillsRows.results) {
        if (!row.question || !row.answer) continue;
        const title = `Skill: ${row.question.slice(0, 100)}`;
        const exists = DB.prepare("SELECT id FROM knowledge_entries WHERE title = ? AND category = 'skill'").get(title);
        if (exists.results && exists.results.length > 0) continue;
        DB.prepare(
          "INSERT INTO knowledge_entries (category, title, content, source_type, source_name, tags, confidence, version) VALUES ('skill', ?, ?, 'system', 'Auto-learned Skills', ?, 0.6, 1)"
        ).run(title, `${row.question}\n\n${row.answer}`, JSON.stringify(["skill", row.category || "general"]));
        skillsMigrated++;
      }
      if (skillsMigrated > 0) { total += skillsMigrated; console.log(`  → Migrated ${skillsMigrated} from ai_skills`); }
    }
  } catch (e) { /* table may not exist */ }

  // ──────────────────────────────────────────────────────
  // RESULT
  // ──────────────────────────────────────────────────────
  console.log(`\n✅ Knowledge Brain seeded: ${total} total entries`);
  const totalEntries = DB.prepare("SELECT COUNT(*) as c FROM knowledge_entries").get()?.results?.[0]?.c || 0;
  console.log(`📊 Total in knowledge_entries: ${totalEntries}`);
  const byCat = DB.prepare("SELECT category, COUNT(*) as c FROM knowledge_entries GROUP BY category ORDER BY c DESC").all();
  if (byCat.results) {
    console.log("\n📂 By Category:");
    for (const r of byCat.results) {
      console.log(`  ${r.category}: ${r.c}`);
    }
  }
}

main();
