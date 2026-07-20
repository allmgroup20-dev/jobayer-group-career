-- Migration 018: Kotler Marketing Management — 4 new tables + 3 profile fields

-- Table 1: Market Segments (Kotler Ch.6)
CREATE TABLE IF NOT EXISTS market_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  segment_base TEXT NOT NULL CHECK(segment_base IN ('geographic','demographic','psychographic','behavioral')),
  segment_name TEXT NOT NULL,
  segment_size INTEGER DEFAULT 0,
  growth_rate REAL DEFAULT 0,
  profitability REAL DEFAULT 0,
  accessibility_score INTEGER DEFAULT 5 CHECK(accessibility_score >= 1 AND accessibility_score <= 10),
  criteria_score INTEGER DEFAULT 5 CHECK(criteria_score >= 1 AND criteria_score <= 10),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table 2: Brand Metrics (Kotler Ch.10 — CBBE Model)
CREATE TABLE IF NOT EXISTS brand_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand_name TEXT NOT NULL DEFAULT 'Jobayer Group',
  salience_score INTEGER DEFAULT 5 CHECK(salience_score >= 1 AND salience_score <= 10),
  performance_score INTEGER DEFAULT 5 CHECK(performance_score >= 1 AND performance_score <= 10),
  imagery_score INTEGER DEFAULT 5 CHECK(imagery_score >= 1 AND imagery_score <= 10),
  judgments_score INTEGER DEFAULT 5 CHECK(judgments_score >= 1 AND judgments_score <= 10),
  feelings_score INTEGER DEFAULT 5 CHECK(feelings_score >= 1 AND feelings_score <= 10),
  resonance_score INTEGER DEFAULT 5 CHECK(resonance_score >= 1 AND resonance_score <= 10),
  measured_at TEXT DEFAULT (date('now'))
);

-- Table 3: Campaigns (Kotler Ch.12-13 — IMC + AIDA)
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  aida_stage TEXT CHECK(aida_stage IN ('attention','interest','desire','action')),
  channel TEXT CHECK(channel IN ('advertising','public_relations','sales_promotion','direct_marketing','digital','events','personal_selling','word_of_mouth')),
  target_segment_id INTEGER REFERENCES market_segments(id),
  budget REAL DEFAULT 0,
  reach INTEGER DEFAULT 0,
  frequency INTEGER DEFAULT 1,
  impact INTEGER DEFAULT 5 CHECK(impact >= 1 AND impact <= 10),
  start_date TEXT,
  end_date TEXT,
  roi REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table 4: NPS Tracking (Kotler Ch.19 — Customer Loyalty)
CREATE TABLE IF NOT EXISTS nps_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  score INTEGER NOT NULL CHECK(score >= 0 AND score <= 10),
  category TEXT GENERATED ALWAYS AS (
    CASE WHEN score >= 9 THEN 'promoter'
         WHEN score >= 7 THEN 'passive'
         ELSE 'detractor'
    END
  ) STORED,
  reason TEXT,
  measured_at TEXT DEFAULT (datetime('now'))
);

-- Add 3 new fields to ai_phone_profiles (Kotler Ch.6, 19)
ALTER TABLE ai_phone_profiles ADD COLUMN market_segment TEXT;
ALTER TABLE ai_phone_profiles ADD COLUMN loyalty_stage TEXT CHECK(loyalty_stage IN ('suspect','prospect','first_time','repeat','loyal','advocate'));
ALTER TABLE ai_phone_profiles ADD COLUMN nps_score INTEGER;

-- Seed initial brand metrics row
INSERT OR IGNORE INTO brand_metrics (brand_name) VALUES ('Jobayer Group');

-- Knowledge Pack 1: Marketing Management Core (for Sales + Psychology + Customer Experience agents)
INSERT OR IGNORE INTO knowledge_accumulation (source, category, title, content, status) VALUES
('system', 'kotler_core', 'Marketing Management Core Framework',
'Kotler Marketing Management 21 Chapters Summary:\n\nSTP (Ch.6-7): Segment → Target → Position. Use 4 bases: Geographic/Demographic/Psychographic/Behavioral. POD vs POP. Value Proposition Canvas.\n\n4Ps (Ch.8-15): Product (Core/Actual/Augmented), Price (3Cs: Cost/Customer/Competition, 6 strategies), Place (Channel Levels 0-3, VMS, Push vs Pull), Promotion (IMC, 8 channels, AIDA).\n\nCBBE (Ch.10): Brand Resonance Pyramid — Salience → Performance+Imagery → Judgments+Feelings → Resonance.\n\nSERVQUAL (Ch.9): 5 Service Dimensions — Tangibility, Reliability, Responsiveness, Assurance, Empathy.\n\nAnsoff Matrix (Ch.17): Market Penetration/Development, Product Development, Diversification.\n\nPLC (Ch.17): Introduction → Growth → Maturity → Decline.\n\nCLV + NPS + Loyalty Ladder (Ch.19): Customer Lifetime Value, Net Promoter Score, Suspect→Advocate.\n\nIMC (Ch.12-13): 8 Communication Channels, AIDA Model, Reach/Frequency/Impact.\n\nBangladesh Context: Digital-first (Facebook/WhatsApp), community-driven (family/referral), price-sensitive but value-seeking, trust as primary currency.',
'approved'),

('system', 'kotler_core', 'Consumer Behavior Bible (Ch.3-4)',
'4 Factors Influencing Consumer Behavior:\n\n1) Cultural: Culture (national identity), Subculture (religious/regional), Social Class (education/income/occupation). Bangladesh: Islamic values, joint family system, respect for hierarchy, "shomman" (izzat) culture.\n\n2) Social: Reference groups (family/friends/colleagues), Family (parents influence strongly in BD), Roles & Status (age/position matter).\n\n3) Personal: Age & Life Stage, Occupation, Economic Circumstances, Lifestyle, Personality & Self-Concept.\n\n4) Psychological: Motivation (Maslow Hierarchy — Bangladesh: Safety + Belonging are top), Perception (Selective Attention/Distortion/Retention), Learning (Experience → Behavior Change), Beliefs & Attitudes (core values).\n\n5-Stage Decision Process:\n1) Problem Recognition: "I need a skill for better income"\n2) Information Search: Personal (friend), Commercial (Facebook ad), Public (reviews), Experiential (demo)\n3) Evaluation of Alternatives: Compare features/price/trust\n4) Purchase Decision: influenced by attitudes of others, unexpected situational factors, perceived risk\n5) Post-Purchase Behavior: satisfaction/dissonance → repeat or return\n\nB2B (Ch.4): Buying Center has 5 roles (Initiator/Influencer/Decider/Buyer/User). 3 buying situations: Straight Rebuy, Modified Rebuy, New Task.',
'approved'),

('system', 'kotler_core', 'STP + Positioning Framework (Ch.6-7)',
'Segmentation (Ch.6):\n4 Bases:\n- Geographic: Dhaka (urban) vs Village (rural), Division-based differences\n- Demographic: Age (18-35 target), Occupation (student/job holder/homemaker), Income (low/mid/high), Education\n- Psychographic: Lifestyle (ambitious/traditional), Values (family/career/faith), Personality (risk-taker/cautious)\n- Behavioral: Purchase occasion, Benefits sought, User status (non-user/potential/first-time/regular/loyal), Usage rate (light/medium/heavy), Loyalty status\n\n5 Criteria for Target Segments: Measurable, Substantial, Accessible, Differentiable, Actionable.\n\nTargeting Strategies: Undifferentiated (mass), Differentiated (multiple segments), Concentrated (niche), Micromarketing (individual).\n\nPositioning (Ch.7):\nValue Proposition Canvas: Customer Profile (Jobs/Pains/Gains) + Value Map (Products/Pain Relievers/Gain Creators)\n\nPOD = Points of Difference (what makes us unique: mentorship, income guarantee, Bangladeshi focus)\nPOP = Points of Parity (what customers expect: quality content, certificates, support)\n\nPositioning Statement: "To [target segment], our [brand] is the [category] that [POD]"\n\nPerceptual Map: Plot brands on 2 dimensions (Quality vs Price) to find competitive position.',
'approved'),

('system', 'kotler_core', 'Brand Building Playbook (Ch.10)',
'CBBE Model — 4 Levels, 6 Building Blocks:\n\nLevel 1: Salience — "Who are you?" Brand awareness. Depth (recall/recognition) + Breadth (when/where). Bangladesh: Brand recall is low — we must repeat our name and values consistently.\n\nLevel 2a: Performance — Product features, quality, design, price. Does our product deliver?\nLevel 2b: Imagery — User profile, usage imagery, brand personality, history. What image do we project?\n\nLevel 3a: Judgments — Quality, credibility, consideration, superiority. Do customers trust us?\nLevel 3b: Feelings — Warmth, fun, excitement, security, social approval, self-respect. How do we make them feel?\n\nLevel 4: Resonance — The deepest level:\n- Behavioral Loyalty: Repeat purchases\n- Attitudinal Attachment: "I love this brand"\n- Sense of Community: "We are a family"\n- Active Engagement: Willing to invest time/energy\n\nBrand Elements: Name (Jobayer Group), Logo (consistent across all platforms), Slogan ("Learn → Earn → Lead"), Design (colors/fonts).\n\nBrand Extension: Extend brand to new categories (courses→services→products), markets (BD→global), or channels.',
'approved'),

('system', 'kotler_core', 'Pricing & Promotion Toolkit (Ch.11-13)',
'3Cs Pricing Framework:\n1) Cost — Minimum viable price. Content creation, platform, support costs.\n2) Customer — Perceived value. What are they willing to pay? Bangladesh: price-sensitive but value-seeking.\n3) Competition — Market price. What do others charge?\n\n6 Pricing Strategies:\n- Skimming: High start → lower later. For innovative products.\n- Penetration: Low price to capture market share fast.\n- Competitive: Match market price.\n- Value-Based: Based on perceived worth to customer.\n- Cost-Plus: Cost + fixed margin.\n- Psychological: Charm pricing (499), per-day framing (14 TK/day), installment effect.\n\nPrice-Quality Inference: In Bangladesh, higher price often implies higher quality. But must be backed by real value.\n\nPrice Elasticity: BD market is price elastic — small changes affect demand significantly.\n\nIMC (Ch.12): 8 Communication Channels\n1) Advertising (Facebook/Google/TV)\n2) Public Relations (news/articles)\n3) Sales Promotion (discounts/coupons)\n4) Direct Marketing (WhatsApp/email/SMS)\n5) Digital (social media/SEO/content)\n6) Events (workshops/seminars)\n7) Personal Selling (1-on-1 conversations)\n8) Word-of-Mouth (referrals/testimonials)\n\nAIDA Model (Ch.13): Attention → Interest → Desire → Action. Each stage needs different content strategy.',
'approved'),

('system', 'kotler_core', 'Loyalty & Retention System (Ch.19)',
'Loyalty Ladder:\n- Suspect (knows about us, not engaged)\n- Prospect (interested, considering)\n- First-Time Customer (just purchased)\n- Repeat Customer (purchased multiple times)\n- Loyal Customer (prefers us over alternatives)\n- Advocate (actively promotes us to others)\n\nCLV (Customer Lifetime Value):\nCLV = Average Purchase Value × Purchase Frequency × Customer Lifetime\nExample: 5000 TK × 4/year × 3 years = 60,000 TK per customer\n\nNPS (Net Promoter Score):\nPromoters (9-10): loyal enthusiasts who buy more and refer\nPassives (7-8): satisfied but unenthusiastic — vulnerable to competitors\nDetractors (0-6): unhappy — can damage brand through negative WOM\nNPS = %Promoters − %Detractors\n\n5 Types of Loyalty Programs:\n1) Points-based (earn points → redeem)\n2) Tiered (Silver/Gold/Platinum)\n3) Value-Add (exclusive content/access)\n4) Coalition (partner discounts)\n5) Paid (subscription-based like Prime)\n\nRetention Strategies:\n- Personalization, surprise rewards, membership benefits\n- Service Recovery Paradox: Well-handled complaints increase loyalty\n- Customer Engagement: Regular meaningful interaction\n- Brand Community: Shared identity, rituals, responsibility\n\nChurn Analysis: Track WHY customers leave — Price, Service, Competition, Needs Changed.',
'approved');

-- Link knowledge packs to relevant agent departments (stored in context_data for routing)
UPDATE knowledge_accumulation SET context_data = '{"departments":["sales","psychology","customer_experience"]}' WHERE title = 'Marketing Management Core Framework';
UPDATE knowledge_accumulation SET context_data = '{"departments":["psychology","sales"]}' WHERE title = 'Consumer Behavior Bible (Ch.3-4)';
UPDATE knowledge_accumulation SET context_data = '{"departments":["sales"]}' WHERE title = 'STP + Positioning Framework (Ch.6-7)';
UPDATE knowledge_accumulation SET context_data = '{"departments":["sales","psychology","customer_experience","member_success"]}' WHERE title = 'Brand Building Playbook (Ch.10)';
UPDATE knowledge_accumulation SET context_data = '{"departments":["sales","operations"]}' WHERE title = 'Pricing & Promotion Toolkit (Ch.11-13)';
UPDATE knowledge_accumulation SET context_data = '{"departments":["member_success","customer_experience"]}' WHERE title = 'Loyalty & Retention System (Ch.19)';
