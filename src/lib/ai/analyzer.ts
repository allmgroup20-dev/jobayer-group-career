const PAIN_POINT_PATTERNS: Record<string, RegExp[]> = {
  no_income: [
    /(?:income|money|earn|income|টাকা|আয়|রোজগার).{0,30}(?:no|not|none|নাই|না|নেই)/i,
    /(?:no|not|none|নাই|না).{0,30}(?:income|money|work|job|চাকরি|কাজ)/i,
    /(?:unemployed|বেকার|কাজ নেই)/i,
    /(?:struggling|স্ট্রাগল|কষ্ট).{0,20}(?:financially|money|টাকা)/i,
  ],
  scam_fear: [
    /(?:scam|fraud|fake|cheat|প্রতারণা|ভুয়া|ঠক)/i,
    /(?:trust|বিশ্বাস).{0,20}(?:not|no|নাই)/i,
    /(?:suspicious|সন্দেহজনক|সন্দেহ)/i,
    /(?:legit|real?.{0,10}(?:program|business|কাজ|বিজনেস))/i,
  ],
  pricing: [
    /(?:price|cost|fee|charge|মূল্য|দাম|খরচ|টাকা).{0,20}(?:high|more|বেশি|ঢের)/i,
    /(?:how much|কত টাকা)/i,
    /(?:expensive|দামী|ব্যয়বহুল)/i,
    /(?:money back| refund|টাকা ফেরত)/i,
  ],
  no_skill: [
    /(?:no|don't|can't|নাই|পারি না|না জানি).{0,30}(?:skill|expert|experience|experience|দক্ষতা|অভিজ্ঞতা)/i,
    /(?:teach?|training|প্রশিক্ষণ|শিখতে)/i,
    /(?:beginner|new|start|শুরু|নতুন)/i,
    /(?:computer|tech|টেক).{0,20}(?:no|not|নাই)/i,
  ],
  no_time: [
    /(?:no|not|busy|free|সময়|time|ব্যস্ত).{0,20}(?:time|সময়)/i,
    /(?:full time|full-time|whole day|সারাদিন)/i,
    /(?:job|চাকরি).{0,20}(?:time|সময়)/i,
    /(?:family|পরিবার|kids|ছেলে|মেয়ে).{0,20}(?:time|সময়)/i,
  ],
};

const INTEREST_PATTERNS: Record<string, RegExp[]> = {
  freelancing: [
    /(?:freelanc|ফ্রিল্যান্স)/i,
    /(?:online.{0,10}(?:work|job|earn|income|কাজ|আয়))/i,
    /(?:fiverr|upwork|freelancer)/i,
    /(?:remote.{0,10}(?:work|job))/i,
  ],
  digital_marketing: [
    /(?:marketing|মার্কেটিং)/i,
    /(?:social media|সোশ্যাল মিডিয়া|facebook|youtube)/i,
    /(?:ads?|advertise|প্রচার|বিজ্ঞাপন)/i,
    /(?:seo|digital)/i,
  ],
  web_design: [
    /(?:web|website|ওয়েবসাইট|ওয়েব)/i,
    /(?:design|ডিজাইন)/i,
    /(?:wordpress|shopify)/i,
    /(?:developer|ডেভেলপার)/i,
  ],
  video_editing: [
    /(?:video|ভিডিও)/i,
    /(?:edit|এডিট)/i,
    /(?:youtube|টিউব)/i,
    /(?:content.{0,10}(?:create|make))/i,
  ],
  programming: [
    /(?:program|code|coding|প্রোগ্রাম|কোড)/i,
    /(?:app|application|mobile.{0,10}(?:dev|app))/i,
    /(?:software|সফটওয়্যার)/i,
    /(?:python|javascript|php|react)/i,
  ],
  spoken_english: [
    /(?:english|ইংরেজি|ইংলিশ)/i,
    /(?:spoken|speaking|বলা)/i,
    /(?:language|ভাষা|ল্যাঙ্গুয়েজ)/i,
    /(?:communication|কমিউনিকেশন)/i,
  ],
};

export function detectLanguage(text: string): "bn" | "en" | "mixed" {
  const bengaliChars = text.match(/[\u0980-\u09FF]/g);
  if (!bengaliChars) return "en";
  const ratio = bengaliChars.length / text.length;
  if (ratio > 0.3) return "bn";
  if (ratio > 0.05) return "mixed";
  return "en";
}

export function analyzePainPoints(text: string): string[] {
  const found: string[] = [];
  for (const [pain, patterns] of Object.entries(PAIN_POINT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        found.push(pain);
        break;
      }
    }
  }
  return found;
}

export function analyzeInterests(text: string): string[] {
  const found: string[] = [];
  for (const [interest, patterns] of Object.entries(INTEREST_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        found.push(interest);
        break;
      }
    }
  }
  return found;
}
