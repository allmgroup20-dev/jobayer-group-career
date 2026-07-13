export interface Testimonial {
  stars: string;
  rating: string;
  quote: string;
  author: string;
  label: string;
  platform?: string;
  image?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Trainer {
  name: string;
  nameBn: string;
  specialty: string;
  credential: string;
  courses: string[];
  image: string;
  bio: string;
}

export interface PlatformItem {
  name: string;
  nameBn: string;
  logo: string;
}

export interface CourseCategory {
  id: string;
  icon: string;
  title: string;
  platformLogos: string[];
  trainers: string[];
  courses: { name: string }[];
}

export interface GalleryImage {
  src: string;
  alt: string;
  label: string;
  amount?: string;
}

export interface StatItem {
  num?: string;
  label?: string;
  chip?: string;
  separator?: boolean;
}

export const siteName = "Jobayer Group Career";

export const heroData = {
  headlineBn: "ঘরে বসে ইনকাম শুরু করুন — কোনো অভিজ্ঞতা লাগবে না!",
  headlineEn: "Start Earning from Home — No Experience Needed!",
  subheadBn: "৮৬৬+ শিক্ষার্থী ইতিমধ্যেই আয় শুরু করেছেন। দেশের সেরা ১২ জন প্রশিক্ষকের ২৩০টির বেশি কোর্স — আজীবনের জন্য। পছন্দ না হলে ২৪ ঘণ্টায় টাকা ফেরত।",
  subheadEn: "866+ students already earning. 230+ courses from Bangladesh's top 12 trainers — lifetime access. 24h money-back guarantee.",
  badges: [
    { icon: "🎯", text: "রিয়েল মার্কেট প্রজেক্ট" },
    { icon: "📚", text: "২৩০+ কোর্স" },
    { icon: "👨‍🏫", text: "১২ জন বিশেষজ্ঞ" },
    { icon: "💼", text: "জব প্লেসমেন্ট" },
  ],
  problemBn: "অনলাইনে আয় করতে চান কিন্তু বুঝতে পারছেন না কোথা থেকে শুরু করবেন? বেশিরভাগ কোর্স শুধু থিওরি দেয় — রিয়েল মার্কেটের জন্য তৈরি করে না।",
  problemEn: "Want to earn online but don't know where to start? Most courses teach theory — not real market skills.",
  solutionBn: "জোবায়ের গ্রুপ ক্যারিয়ার আপনাকে দেয় রিয়েল মার্কেট প্রজেক্ট, সরাসরি ক্লায়েন্ট এক্সপোজার, এবং কাজ শেখার পর ইন্টার্নশিপের সুযোগ — সব একসাথে।",
  solutionEn: "Jobayer Group Career gives you real market projects, direct client exposure, and internship opportunities — all in one place.",
  ctaBn: "🚀 আপনার অ্যাকাউন্ট খুলুন এখনই →",
  ctaEn: "🚀 Create Your Account Now →",
  ctaHref: "/register",
};

export const stats: StatItem[] = [
  { num: "৮৬৬+", label: "সক্রিয় শিক্ষার্থী" },
  { separator: true },
  { num: "৪.৯★", label: "ফেসবুক মূল্যায়ন" },
  { separator: true },
  { num: "৮+ বছর", label: "পেশাদার অভিজ্ঞতা" },
  { separator: true },
  { num: "৫০,০০০+", label: "সর্বোচ্চ মাসিক আয়" },
  { separator: true },
  { chip: "⚡ সাথে সাথে অ্যাক্সেস" },
  { separator: true },
  { chip: "📚 লাইফটাইম আপডেট" },
  { separator: true },
  { chip: "✅ ২৪ ঘণ্টা ফেরত" },
];

export const platforms: PlatformItem[] = [
  { name: "10 Minute School", nameBn: "টেন মিনিট স্কুল", logo: "/images/platforms/10-minute-school.jpg" },
  { name: "Ghoori Learning", nameBn: "ঘুড়ি লার্নিং", logo: "/images/platforms/ghoori-learning.jpeg" },
  { name: "Skill Up", nameBn: "স্কিল আপ", logo: "/images/platforms/skill-up.png" },
  { name: "eShikhon", nameBn: "ইশিখন", logo: "/images/platforms/eshikhon.webp" },
  { name: "Mayajal", nameBn: "মায়াজাল", logo: "/images/platforms/mayajal.jpg" },
  { name: "MSB Academy", nameBn: "MSB Academy", logo: "/images/platforms/msb-academy.png" },
  { name: "Creative IT", nameBn: "ক্রিয়েটিভ আইটি", logo: "/images/platforms/creative-it.jpg" },
  { name: "Problem KI", nameBn: "প্রব্লেম কেআই", logo: "/images/platforms/problem-ki.png" },
  { name: "REPTO", nameBn: "রেপটো", logo: "/images/platforms/repto.jpg" },
];

export const platformLogos: string[] = platforms.map((p) => p.logo);

export const trainers: Trainer[] = [
  {
    name: "Ayman Sadiq", nameBn: "আয়মান সাদিক",
    specialty: "এডুকেশন & কন্টেন্ট ক্রিয়েশন",
    credential: "১০ মিনিট স্কুলের প্রতিষ্ঠাতা, ৫০০০০+ শিক্ষার্থী",
    courses: ["কন্টেন্ট ক্রিয়েশন মাস্টারক্লাস", "ডিজিটাল এডুকেশন স্ট্র্যাটেজি"],
    image: "/images/trainers/ayman-sadiq.jpg",
    bio: "দেশের সর্ববৃহৎ এডটেক প্ল্যাটফর্ম ১০ মিনিট স্কুলের প্রতিষ্ঠাতা।"
  },
  {
    name: "Munzereen Shahid", nameBn: "মুনজারিন শহীদ",
    specialty: "স্পোকেন ইংলিশ & কমিউনিকেশন",
    credential: "১০ মিনিট স্কুলের স্পোকেন ইংলিশ টিচার, ২০০০০+ শিক্ষার্থী",
    courses: ["স্পোকেন ইংলিশ মাস্টারি", "ইংলিশ কমিউনিকেশন কোর্স"],
    image: "/images/trainers/munzereen-shahid.jpg",
    bio: "স্পোকেন ইংলিশে দেশের শীর্ষ প্রশিক্ষকদের একজন।"
  },
  {
    name: "Jhankar Mahbub", nameBn: "ঝংকার মাহবুব",
    specialty: "ওয়েব ডেভেলপমেন্ট & প্রোগ্রামিং",
    credential: "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার, bestselling author",
    courses: ["ওয়েব ডেভেলপমেন্ট বুটক্যাম্প", "প্রোগ্রামিং বেসিক"],
    image: "/images/trainers/jhankar-mahbub.jpg",
    bio: "আমেরিকান টেক কোম্পানির সিনিয়র ইঞ্জিনিয়ার ও প্রোগ্রামিং বইয়ের লেখক।"
  },
  {
    name: "Khalid Farhan", nameBn: "খালিদ ফারহান",
    specialty: "ডিজিটাল মার্কেটিং",
    credential: "ডিজিটাল মার্কেটিং স্পেশালিস্ট, ৮+ বছর",
    courses: ["ফেসবুক & ইনস্টাগ্রাম মার্কেটিং", "গুগল অ্যাডস মাস্টারি"],
    image: "/images/trainers/khalid-farhan.jpg",
    bio: "ডিজিটাল মার্কেটিংয়ে ৮ বছরের অভিজ্ঞতা।"
  },
  {
    name: "Sadman Sadik", nameBn: "সাদমান সাদিক",
    specialty: "UI/UX ডিজাইন",
    credential: "প্রিমিয়ার UI/UX ডিজাইনার, ৬+ বছর",
    courses: ["UI/UX ডিজাইন ফান্ডামেন্টাল", "ফিগমা মাস্টারক্লাস"],
    image: "/images/trainers/sadman-sadik.jpg",
    bio: "UI/UX ডিজাইনে দেশের শীর্ষ ডিজাইনারদের একজন।"
  },
  {
    name: "Freelancer Nasim", nameBn: "ফ্রিল্যান্সার নাসিম",
    specialty: "ফ্রিল্যান্সিং & আউটসোর্সিং",
    credential: "ফাইভার টপ-রেটেড ফ্রিল্যান্সার, ৭+ বছর",
    courses: ["ফাইভার ফ্রিল্যান্সিং মাস্টারি", "আপওয়ার্ক প্রোফাইল অপটিমাইজেশন"],
    image: "/images/trainers/freelancer-nasim.jpg",
    bio: "ফ্রিল্যান্সিংয়ে হাজারো শিক্ষার্থী তৈরি করেছেন।"
  },
  {
    name: "Tahsan Khan", nameBn: "তাহসান খান",
    specialty: "ডিজিটাল মার্কেটিং & ব্র্যান্ডিং",
    credential: "ডিজিটাল মার্কেটিং এক্সপার্ট, ৬+ বছর",
    courses: ["SEO মাস্টারি কোর্স", "কন্টেন্ট মার্কেটিং স্ট্র্যাটেজি"],
    image: "/images/trainers/tahsan-khan.jpg",
    bio: "ব্র্যান্ডিং ও ডিজিটাল মার্কেটিং স্পেশালিস্ট।"
  },
  {
    name: "Jubayer Hossain", nameBn: "জুবায়ের হোসাইন",
    specialty: "গ্রাফিক্স ডিজাইন & ভিডিও এডিটিং",
    credential: "প্রিমিয়ার প্রো & ফটোশপ এক্সপার্ট, ৫+ বছর",
    courses: ["ফটোশপ মাস্টারক্লাস", "প্রিমিয়ার প্রো বেসিক টু অ্যাডভান্সড"],
    image: "/images/trainers/jubayer-hossain.jpg",
    bio: "গ্রাফিক্স ডিজাইন ও ভিডিও এডিটিং প্রশিক্ষক।"
  },
  {
    name: "Abtahi Iptesam", nameBn: "আবতাহি ইপ্তেসাম",
    specialty: "ডেটা সায়েন্স & এআই",
    credential: "ডেটা সায়েন্টিস্ট, ৫+ বছর",
    courses: ["ডেটা সায়েন্স ফান্ডামেন্টাল", "পাইথন ফর ডেটা সায়েন্স"],
    image: "/images/trainers/abtahi-iptesam.jpg",
    bio: "ডেটা সায়েন্স ও মেশিন লার্নিং বিশেষজ্ঞ।"
  },
  {
    name: "Mahade Hasan", nameBn: "মাহাদে হাসান",
    specialty: "ই-কমার্স & শপিফাই",
    credential: "শপিফাই এক্সপার্ট, ৫+ বছর",
    courses: ["শপিফাই স্টোর ডেভেলপমেন্ট", "ড্রপশিপিং মাস্টারি"],
    image: "/images/trainers/mahade-hasan.jpg",
    bio: "ই-কমার্স ও শপিফাই বিশেষজ্ঞ।"
  },
  {
    name: "Vaibhav Sisinity", nameBn: "ভৈভব সিসিনিটি",
    specialty: "ডিজিটাল মার্কেটিং & অ্যাফিলিয়েট",
    credential: "অ্যাফিলিয়েট মার্কেটিং এক্সপার্ট, ৬+ বছর",
    courses: ["অ্যাফিলিয়েট মার্কেটিং মাস্টারক্লাস", "ই-কমার্স অ্যাফিলিয়েট স্ট্র্যাটেজি"],
    image: "/images/trainers/vaibhav-sisinity.jpg",
    bio: "অ্যাফিলিয়েট মার্কেটিংয়ে আন্তর্জাতিক খ্যাতিসম্পন্ন প্রশিক্ষক।"
  },
  {
    name: "Soban Tariq", nameBn: "সোবান তারিক",
    specialty: "অ্যাফিলিয়েট মার্কেটিং & ফানেল",
    credential: "ফানেল বিল্ডিং এক্সপার্ট, ৫+ বছর",
    courses: ["ফানেল বিল্ডিং কোর্স", "ক্লিকফানেল মাস্টারি"],
    image: "/images/trainers/soban-tariq.jpg",
    bio: "ফানেল বিল্ডিং ও অ্যাফিলিয়েট মার্কেটিং বিশেষজ্ঞ।"
  },
];

export const courseCategories: CourseCategory[] = [
  {
    id: "affiliate-marketing",
    icon: "📢",
    title: "অ্যাফিলিয়েট মার্কেটিং",
    platformLogos: ["/images/platforms/10-minute-school.jpg", "/images/platforms/problem-ki.png"],
    trainers: ["Vaibhav Sisinity", "Soban Tariq"],
    courses: [
      { name: "অ্যাফিলিয়েট মার্কেটিং মাস্টারক্লাস" },
      { name: "ফেসবুক অ্যাফিলিয়েট কোর্স" },
      { name: "ই-কমার্স অ্যাফিলিয়েট স্ট্র্যাটেজি" },
      { name: "ক্লিকফানেল মাস্টারি" },
    ],
  },
  {
    id: "digital-marketing",
    icon: "📱",
    title: "ডিজিটাল মার্কেটিং",
    platformLogos: ["/images/platforms/creative-it.jpg", "/images/platforms/10-minute-school.jpg"],
    trainers: ["Khalid Farhan", "Tahsan Khan"],
    courses: [
      { name: "ফেসবুক & ইনস্টাগ্রাম মার্কেটিং" },
      { name: "গুগল অ্যাডস মাস্টারি" },
      { name: "SEO & কন্টেন্ট মার্কেটিং" },
      { name: "ইমেইল মার্কেটিং স্ট্র্যাটেজি" },
    ],
  },
  {
    id: "ecommerce",
    icon: "🛒",
    title: "ই-কমার্স",
    platformLogos: ["/images/platforms/ghoori-learning.jpeg", "/images/platforms/mayajal.jpg"],
    trainers: ["Mahade Hasan", "Freelancer Nasim"],
    courses: [
      { name: "শপিফাই স্টোর তৈরি ও মার্কেটিং" },
      { name: "ড্রপশিপিং মাস্টারি" },
      { name: "ওয়াকমার্স স্টোর ডেভেলপমেন্ট" },
      { name: "ফেসবুক শপ সেটআপ" },
    ],
  },
  {
    id: "graphics-design",
    icon: "🎨",
    title: "গ্রাফিক্স ডিজাইন",
    platformLogos: ["/images/platforms/msb-academy.png", "/images/platforms/repto.jpg"],
    trainers: ["Jubayer Hossain", "Sadman Sadik"],
    courses: [
      { name: "ফটোশপ মাস্টারক্লাস" },
      { name: "ইলাস্ট্রেটর প্রো কোর্স" },
      { name: "UI/UX ডিজাইন ফান্ডামেন্টাল" },
      { name: "ফিগমা মাস্টারক্লাস" },
    ],
  },
  {
    id: "web-development",
    icon: "💻",
    title: "ওয়েব ডেভেলপমেন্ট",
    platformLogos: ["/images/platforms/skill-up.png", "/images/platforms/eshikhon.webp"],
    trainers: ["Jhankar Mahbub", "Abtahi Iptesam"],
    courses: [
      { name: "ওয়েব ডিজাইন বেসিক" },
      { name: "ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট" },
      { name: "ওয়ার্ডপ্রেস থিম ডেভেলপমেন্ট" },
      { name: "পাইথন ফর ডেটা সায়েন্স" },
    ],
  },
  {
    id: "freelancing",
    icon: "🌍",
    title: "ফ্রিল্যান্সিং",
    platformLogos: ["/images/platforms/repto.jpg", "/images/platforms/ghoori-learning.jpeg"],
    trainers: ["Freelancer Nasim", "Tahsan Khan"],
    courses: [
      { name: "ফাইভার ফ্রিল্যান্সিং মাস্টারি" },
      { name: "আপওয়ার্ক প্রোফাইল অপটিমাইজেশন" },
      { name: "লিংকডইন ফ্রিল্যান্সিং গাইড" },
    ],
  },
  {
    id: "video-editing",
    icon: "🎬",
    title: "ভিডিও এডিটিং",
    platformLogos: ["/images/platforms/creative-it.jpg", "/images/platforms/msb-academy.png"],
    trainers: ["Jubayer Hossain", "Ayman Sadiq"],
    courses: [
      { name: "প্রিমিয়ার প্রো বেসিক টু অ্যাডভান্সড" },
      { name: "ক্যাপকাট মোবাইল এডিটিং" },
      { name: "ইউটিউব কন্টেন্ট ক্রিয়েশন" },
    ],
  },
  {
    id: "content-writing",
    icon: "✍️",
    title: "কন্টেন্ট রাইটিং",
    platformLogos: ["/images/platforms/10-minute-school.jpg", "/images/platforms/eshikhon.webp"],
    trainers: ["Ayman Sadiq", "Tahsan Khan"],
    courses: [
      { name: "প্রফেশনাল কন্টেন্ট রাইটিং" },
      { name: "কপিরাইটিং মাস্টারি" },
      { name: "ব্লগিং ও এসইও রাইটিং" },
    ],
  },
  {
    id: "spoken-english",
    icon: "🗣️",
    title: "স্পোকেন ইংলিশ",
    platformLogos: ["/images/platforms/10-minute-school.jpg", "/images/platforms/skill-up.png"],
    trainers: ["Munzereen Shahid", "Khalid Farhan"],
    courses: [
      { name: "স্পোকেন ইংলিশ ফর ফ্রিল্যান্সিং" },
      { name: "ইংলিশ কমিউনিকেশন মাস্টারি" },
      { name: "আইইএলটিএস প্রিপারেশন" },
    ],
  },
  {
    id: "data-science",
    icon: "🤖",
    title: "ডেটা সায়েন্স & এআই",
    platformLogos: ["/images/platforms/skill-up.png", "/images/platforms/mayajal.jpg"],
    trainers: ["Abtahi Iptesam", "Jhankar Mahbub"],
    courses: [
      { name: "ডেটা সায়েন্স ফান্ডামেন্টাল" },
      { name: "মেশিন লার্নিং বেসিক" },
      { name: "পাইথন ফর ডেটা সায়েন্স" },
    ],
  },
];

export const testimonials: Testimonial[] = [
  { stars: "★★★★★", rating: "5.0/5", quote: "জোবায়ের গ্রুপের নির্দেশিকা আর সহায়তার কারণে আজ আমি নিজের ল্যাপটপ থেকে মাসে ২৫,০০০+ টাকা ইনকাম করছি।", author: "মিতা ইসলাম", label: "ফ্রিল্যান্সার, সিলেট" },
  { stars: "★★★★★", rating: "4.9/5", quote: "এই কোর্সটা আমাকে রিয়েল মার্কেটের জন্য প্রস্তুত করেছে। এখন নিয়মিত ক্লায়েন্ট পাচ্ছি। সবার কাছে রেকমেন্ড করব!", author: "নীলা হোসেন", label: "ডিজিটাল মার্কেটার, ঢাকা" },
  { stars: "★★★★★", rating: "5.0/5", quote: "৭ মাসে এখন মাসিক আয় ৪০,০০০+। সবচেয়ে বড় কথা, একটা সহায়ক কমিউনিটি পেয়েছি।", author: "রাফসান জামান", label: "ই-কমার্স আর্নার, চট্টগ্রাম" },
  { stars: "★★★★★", rating: "4.9/5", quote: "শুধু কোর্স না — রিয়েল প্রজেক্ট ও জব সাপোর্ট পেয়েছি। যারা সিরিয়াস তাদের জন্য এটি পারফেক্ট!", author: "আতিকুর রহমান", label: "ওয়েব ডেভেলপার, রাজশাহী" },
  { stars: "★★★★★", rating: "5.0/5", quote: "ফাইভারে এখন মাসে ৩০,০০০+ টাকা আয় করছি। জোবায়ের গ্রুপের ফ্রিল্যান্সিং কোর্স আমার জীবন বদলে দিয়েছে।", author: "শারমিন জাহান", label: "ফাইভার ফ্রিল্যান্সার, খুলনা" },
  { stars: "★★★★★", rating: "4.8/5", quote: "একদম শূন্য থেকে শুরু করেছি। আজ ১৫,০০০+ মাসিক আয়। ধন্যবাদ জোবায়ের গ্রুপ টিমকে।", author: "রেজাউল করিম", label: "ডিজিটাল মার্কেটার, বগুড়া" },
  { stars: "★★★★★", rating: "5.0/5", quote: "যতগুলো কোর্স করেছি, জোবায়ের গ্রুপের কোর্স সবচেয়ে প্রাক্টিক্যাল। সরাসরি মার্কেটে কাজে লাগাতে পেরেছি।", author: "সানজিদা করিম", label: "গ্রাফিক্স ডিজাইনার, কুমিল্লা" },
];

export const faqs: FaqItem[] = [
  { q: "💵 বিনামূল্যে রেজিস্টার করে কি সত্যিই অনলাইনে আয় করা সম্ভব?", a: "হ্যাঁ, সম্ভব। আমাদের ৮৬৬+ শিক্ষার্থী প্রমাণ করে সঠিক গাইড পেলে যে কেউ আয় করতে পারেন। মাসে ৫০,০০০+ টাকা আয় করা সম্ভব।" },
  { q: "🛡️ এটি কি কোনো স্ক্যাম বা ফেক প্রোগ্রাম?", a: "একেবারেই না। জোবায়ের গ্রুপ ৮+ বছর ধরে কাজ করছে। আমরা ২৪ ঘণ্টায় টাকা ফেরত দিই — কোনো প্রতারক কোম্পানি টাকা ফেরত দেয় না।" },
  { q: "📱 আমার কোনো পূর্ব অভিজ্ঞতা নেই — তবু কি পারব?", a: "অবশ্যই। আপনার শুধু দরকার একটি স্মার্টফোন বা ল্যাপটপ আর শেখার ইচ্ছা। বাকি সব — আমরা দিচ্ছি।" },
  { q: "💰 কত তাড়াতাড়ি আমি প্রথম পেমেন্ট পাব?", a: "বেশিরভাগ শিক্ষার্থী প্রথম মাসেই ১,১০০ - ৫,০০০+ টাকা আয় শুরু করেন। মাসে ৫০,০০০+ টাকা আয় করতে ৩-৬ মাস লাগতে পারে।" },
  { q: "🔄 কি মাসিক ফি দিতে হবে? নাকি একবারই দিলেই হবে?", a: "একবার রেজিস্টার করলেই আজীবন অ্যাক্সেস! কোনো মাসিক ফি নেই, কোনো লুকানো চার্জ নেই।" },
  { q: "📥 রেজিস্টার করার পর কীভাবে কোর্স অ্যাক্সেস পাব?", a: "রেজিস্টার করার ১ মিনিটের মধ্যে আপনার ইমেইলে ও হোয়াটসঅ্যাপে গুগল ড্রাইভ লিংক চলে যাবে।" },
  { q: "🎓 আমি কি একসাথে সব কোর্স করতে পারব?", a: "হ্যাঁ, আপনি যেকোনো সময় যেকোনো কোর্স শুরু করতে পারেন। সব কোর্স আপনার জন্য উন্মুক্ত থাকবে আজীবনের জন্য।" },
  { q: "📞 রেজিস্টার করতে সমস্যা হলে কী করব?", a: "আমাদের ২৪/৭ সাপোর্ট টিম সবসময় আপনার জন্য প্রস্তুত। ফোন, ইমেইল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।" },
];

export const galleryImages: GalleryImage[] = [
  { src: "/images/payments/payment-1.jpg", alt: "bKash payment", label: "বিকাশ পেমেন্ট", amount: "১,২০০ টাকা" },
  { src: "/images/payments/payment-2.jpg", alt: "Nagad payment", label: "নগদ পেমেন্ট", amount: "২,৫০০ টাকা" },
  { src: "/images/payments/payment-3.jpg", alt: "Bank transfer", label: "ব্যাংক ট্রান্সফার", amount: "৫,০০০ টাকা" },
  { src: "/images/payments/payment-4.jpg", alt: "Rocket payment", label: "রকেট পেমেন্ট", amount: "৮০০ টাকা" },
  { src: "/images/payments/payment-5.jpg", alt: "Upwork payment", label: "আপওয়ার্ক পেমেন্ট", amount: "$১৫০" },
  { src: "/images/payments/payment-6.jpg", alt: "Fiverr payment", label: "ফাইভার পেমেন্ট", amount: "$২০০" },
  { src: "/images/payments/payment-7.jpg", alt: "Freelancer payment", label: "ফ্রিল্যান্সার পেমেন্ট", amount: "$১৮০" },
  { src: "/images/payments/payment-8.jpg", alt: "bKash large payment", label: "বিকাশ বড় পেমেন্ট", amount: "১৫,০০০ টাকা" },
  { src: "/images/payments/payment-9.jpg", alt: "Nagad large payment", label: "নগদ বড় পেমেন্ট", amount: "১২,০০০ টাকা" },
  { src: "/images/payments/payment-10.jpg", alt: "Bank salary", label: "ব্যাংক বেতন", amount: "২৫,০০০ টাকা" },
];

export const trustBadges = [
  { icon: "🔒", text: "SSL সুরক্ষিত" },
  { icon: "✅", text: "২৪ ঘণ্টা টাকা ফেরত" },
  { icon: "⚡", text: "সাথে সাথে এক্সেস" },
  { icon: "📞", text: "২৪/৭ সাপোর্ট" },
];

export const salaryNames = [
  "Ayan Rahman","সুমন দাস","Maria Gomes","Ratan Marma","উদয় বড়ুয়া",
  "Nusrat Jahan","অনিক পাল","Rakib Hasan","Bimal Tripura","তানিয়া সুলতানা",
  "Sabbir Hossain","Mithila Roy","Farhan Ahmed","Riya Chakma","Tanvir Islam",
  "Lima Das","Omar Faruk","Puja Rani","Hasan Mahmud","Nabila Noor",
];
