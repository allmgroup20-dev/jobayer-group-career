import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

const GOAL_MESSAGES: Record<string, { title: string; message: string }> = {
  career: { title: "ক্যারিয়ার টিপস", message: "আপনার মতো পেশাদারদের জন্য ডিজাইন করা ক্যারিয়ার-বিল্ডিং কোর্স দেখুন।" },
  freelancing: { title: "ফ্রিল্যান্সিং গাইড", message: "ফ্রিল্যান্সিং শুরু করতে প্রস্তুত? আজই আমাদের ফ্রিল্যান্সিং কোর্স দেখুন।" },
  business: { title: "ব্যবসা বৃদ্ধি", message: "আমাদের বিশেষজ্ঞ-পরিচালিত ব্যবসায়িক কোর্সের মাধ্যমে আপনার ব্যবসা বাড়ান।" },
  skill: { title: "স্কিল ডেভেলপমেন্ট", message: "আপনার আগ্রহ অনুযায়ী নতুন স্কিল ডেভেলপমেন্ট কন্টেন্ট উপলব্ধ।" },
  job: { title: "চাকরির প্রস্তুতি", message: "আমাদের জব-ওরিয়েন্টেড ট্রেনিং প্রোগ্রামের মাধ্যমে আপনার স্বপ্নের চাকরির জন্য প্রস্তুত হন।" },
  content_creator: { title: "কনটেন্ট ক্রিয়েশন", message: "ইউটিউব/ফেসবুক মনিটাইজেশন টিপস — আপনার কনটেন্ট থেকে আয় বাড়ানোর নতুন কৌশল দেখুন।" },
  extra_income: { title: "অতিরিক্ত আয়", message: "সাইড ইনকামের নতুন সুযোগ! আজই আয়-বর্ধক কোর্সগুলো দেখুন।" },
};

const INTEREST_COURSE_MAP: Record<string, string> = {
  "Web Development": "ওয়েব ডেভেলপমেন্ট স্কিলের চাহিদা অনেক বেশি। আমাদের লেটেস্ট কোর্স দেখুন!",
  "Programming": "প্রোগ্রামিং কোর্স আপনার জন্য নতুন কন্টেন্ট দিয়ে আপডেট করা হয়েছে।",
  "Graphics Design": "নতুন গ্রাফিক ডিজাইন টেকনিক — শিখুন এবং আরও ভাল ডিজাইন তৈরি করুন।",
  "Digital Marketing": "ডিজিটাল মার্কেটিং দ্রুত পরিবর্তন হচ্ছে। আমাদের কোর্সের সাথে এগিয়ে থাকুন।",
  "Video Editing": "ভিডিও এডিটিং টিপস ও ট্রিকস — নতুন মডিউল যুক্ত হয়েছে!",
  "Freelancing": "ফ্রিল্যান্সিং মার্কেটপ্লেস টিপস যা আপনাকে আরও আয় করতে সাহায্য করবে।",
  "English Learning": "ইংরেজি কমিউনিকেশন স্কিল — আমাদের গাইডেড লেসনের সাথে অনুশীলন করুন।",
  "Cyber Security": "সাইবার সিকিউরিটি সচেতনতা কোর্স এখন উপলব্ধ।",
  "AI & ChatGPT": "এআই ও চ্যাটজিপিটি অ্যাডভান্সড টেকনিক — আজই ভবিষ্যৎ শিখুন।",
  "Business": "উদ্যোক্তাদের জন্য ব্যবসায়িক কৌশল ও ম্যানেজমেন্ট টিপস।",
  "YouTube Content Creation": "ইউটিউবে আয়ের নতুন টেকনিক — সাবস্ক্রাইবার ও ভিউ বাড়ানোর গোপন কৌশল শিখুন!",
  "Facebook Content Creation & Page Monetization": "ফেসবুক পেজ মনিটাইজেশন আপডেট — আপনার কনটেন্ট থেকে কীভাবে আয় করবেন তা দেখুন।",
  "Instagram & Reels": "ইনস্টাগ্রাম ও রিলস ট্রেন্ড — ভাইরাল কনটেন্ট তৈরির কৌশল এখন আমাদের কোর্সে।",
  "Photo Editing & Photography": "ফটো এডিটিং প্রো টিপস — আরও আকর্ষণীয় ছবি তৈরি করুন।",
  "Social Media Management": "সোশ্যাল মিডিয়া ম্যানেজমেন্ট — ক্লায়েন্ট ও আয়ের নতুন সুযোগ!",
  "Podcasting": "পডকাস্টিং গাইড — আপনার নিজের পডকাস্ট শুরু করার সময় এখনই।",
  "UI/UX Design": "ইউআই/ইউএক্স ডিজাইনের চাহিদা বাড়ছে — নতুন কোর্স দেখুন।",
  "Logo & Branding Design": "লোগো ও ব্র্যান্ডিং ডিজাইন — ক্লায়েন্ট কাজের জন্য প্রস্তুত হোন।",
  "Motion Graphics & Animation": "মোশন গ্রাফিক্স কোর্স — আপনার ভিডিওতে প্রাণ দিন!",
  "Programming / Coding": "কোডিং স্কিল আপগ্রেড করুন — নতুন প্রোগ্রামিং মডিউল যুক্ত হয়েছে।",
  "App Development": "অ্যাপ ডেভেলপমেন্ট কোর্স — নিজের অ্যাপ বানিয়ে আয় করুন।",
  "WordPress & Website": "ওয়ার্ডপ্রেস ওয়েবসাইট — দ্রুত ও সহজে সাইট বানাতে শিখুন।",
  "Game Development": "গেম ডেভেলপমেন্ট — আপনার গেম আইডিয়া বাস্তবায়ন করুন।",
  "Ethical Hacking / Cyber Security": "এথিক্যাল হ্যাকিং কোর্স — সাইবার সিকিউরিটি ক্যারিয়ার শুরু করুন।",
  "Facebook / Instagram Ads": "ফেসবুক/ইনস্টাগ্রাম অ্যাডস — অল্প বাজেটে বেশি রিটার্নের কৌশল শিখুন।",
  "SEO": "এসইও টিপস — সার্চে প্রথমে আসুন এবং বেশি ট্রাফিক পান।",
  "Affiliate Marketing": "অ্যাফিলিয়েট মার্কেটিং — লিংক শেয়ারে আয়ের নতুন সুযোগ।",
  "E-commerce & Dropshipping": "ই-কমার্স ও ড্রপশিপিং — অনলাইন দোকান শুরু করার গাইড।",
  "Amazon & Online Business": "অ্যামাজনে বিক্রি শুরু করুন — গ্লোবাল মার্কেটে আয়ের সুযোগ।",
  "Content Writing & Blogging": "কনটেন্ট রাইটিং ও ব্লগিং — লেখা থেকেও আয় করা যায়!",
  "Online Course & Digital Product Selling": "অনলাইন কোর্স সেলিং — নিজের জ্ঞানকে আয়ে রূপ দিন।",
  "English Learning / Spoken English": "স্পোকেন ইংলিশ — আত্মবিশ্বাসের সাথে ইংরেজিতে কথা বলুন।",
  "IELTS & Study Abroad": "আইইএলটিএস প্রস্তুতি — বিদেশে পড়াশোনার স্বপ্ন পূরণে সাহায্য করুন।",
  "Job Preparation (BCS / Bank)": "বিসিএস/ব্যাংক জব প্রস্তুতি — এক্সপার্ট গাইডলাইনসহ নতুন কোর্স।",
  "MS Office & Computer Basics": "এমএস অফিস স্কিল — চাকরির বাজারে এগিয়ে থাকুন।",
  "Personal Development & Leadership": "পার্সোনাল ডেভেলপমেন্ট — আত্মবিশ্বাস ও লিডারশিপ গড়ুন।",
};

export async function POST(request: NextRequest) {
  try {
    const { workerId } = await request.json() as { workerId?: string };
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();
    const worker = await db.prepare(
      "SELECT worker_id, name, goal, preferred_learning_time FROM workers WHERE worker_id = ?"
    ).bind(workerId).first() as { worker_id: string; name: string; goal?: string; preferred_learning_time?: string } | undefined;

    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    let sent = 0;

    // 1. Goal-based notification
    if (worker.goal && GOAL_MESSAGES[worker.goal]) {
      const msg = GOAL_MESSAGES[worker.goal];
      await db.prepare(
        "INSERT INTO notifications (worker_id, title, message, type) VALUES (?, ?, ?, 'personalized')"
      ).bind(worker.worker_id, msg.title, msg.message).run();
      sent++;
    }

    // 2. Interest-based notification (from user_behavior_scores or onboarding events)
    const interests = await db.prepare(
      "SELECT search_keyword FROM user_events WHERE worker_id = ? AND event_type = 'search' AND search_keyword IS NOT NULL GROUP BY search_keyword ORDER BY COUNT(*) DESC LIMIT 3"
    ).bind(workerId).all() as { results: { search_keyword: string }[] };

    for (const ev of interests.results) {
      const kw = ev.search_keyword;
      if (INTEREST_COURSE_MAP[kw]) {
        await db.prepare(
          "INSERT INTO notifications (worker_id, title, message, type) VALUES (?, ?, ?, 'personalized')"
        ).bind(worker.worker_id, `"${kw}"-এ আপনার আগ্রহের ভিত্তিতে`, INTEREST_COURSE_MAP[kw]).run();
        sent++;
      }
    }

    // 3. Daily study-time reminder
    if (worker.preferred_learning_time) {
      const hourLabels: Record<string, string> = { lt_1h: "১ ঘণ্টার কম", "1_2h": "১-২ ঘণ্টা", "2_3h": "২-৩ ঘণ্টা", gt_3h: "৩ ঘণ্টার বেশি" };
      const label = hourLabels[worker.preferred_learning_time] || worker.preferred_learning_time;
      await db.prepare(
        "INSERT INTO notifications (worker_id, title, message, type) VALUES (?, ?, ?, 'reminder')"
      ).bind(worker.worker_id, "শেখার সময়", `আপনার দৈনিক ${label} শেখার পরিকল্পনা অনুযায়ী — আজকের কোর্স দেখুন!`).run();
      sent++;
    }

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
