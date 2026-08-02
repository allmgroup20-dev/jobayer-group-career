// ── Graceful degradation templates when AI is overloaded ──
interface TemplateVars {
  name: string;
  language: string;
  dept?: string;
}

const TEMPLATES: Record<string, (v: TemplateVars) => string> = {
  greeting: (v) => v.language === "bn"
    ? `আসসালামু আলাইকুম ${v.name}! জবায়ের গ্রুপ ক্যারিয়ারে আপনাকে স্বাগতম। আমাদের একজন এজেন্ট শীঘ্রই আপনার সাথে কথা বলবে।`
    : `Assalamu Alaikum ${v.name}! Welcome to Jobayer Group Career. An agent will connect with you shortly.`,
  support: (v) => v.language === "bn"
    ? `প্রিয় ${v.name}, আপনার মেসেজটি পেয়েছি। আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে। ধৈর্য্যের জন্য ধন্যবাদ।`
    : `Dear ${v.name}, we received your message. Our support team will contact you shortly. Thank you for your patience.`,
  purchase: (v) => v.language === "bn"
    ? `${v.name} ভাই, আপনার আগ্রহের জন্য ধন্যবাদ। আমাদের সেলস টিম বিস্তারিত জানাতে শীঘ্রই কল দেবে।`
    : `Thank you for your interest ${v.name}. Our sales team will call you with details soon.`,
  complaint: (v) => v.language === "bn"
    ? `প্রিয় ${v.name}, আপনার অভিযোগটি গুরুত্ব সহকারে নেওয়া হয়েছে। আমাদের একজন সিনিয়র এজেন্ট খুব শীঘ্রই যোগাযোগ করবে।`
    : `Dear ${v.name}, your complaint is taken seriously. A senior agent will contact you very soon.`,
  general: (v) => v.language === "bn"
    ? `${v.name} ভাই, আপনার মেসেজটি পেয়েছি। আমাদের টিম শীঘ্রই উত্তর দেবে।`
    : `${v.name}, we received your message. Our team will respond shortly.`,
};

export function getGracefulResponse(intent: string, vars: TemplateVars): string {
  const template = TEMPLATES[intent] || TEMPLATES.general;
  return template(vars);
}

export function isOverloadedResponse(text: string): boolean {
  const overloaded = text.includes("[Service temporarily unavailable") || text.length < 10;
  return overloaded;
}
