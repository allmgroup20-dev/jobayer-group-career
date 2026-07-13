export interface Testimonial {
  stars: string;
  rating: string;
  quoteBn: string;
  quoteEn: string;
  authorBn: string;
  authorEn: string;
  labelBn: string;
  labelEn: string;
}

export interface FaqItem {
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
}

export interface Trainer {
  name: string;
  nameBn: string;
  specialtyBn: string;
  specialtyEn: string;
  credentialBn: string;
  credentialEn: string;
  coursesBn: string[];
  coursesEn: string[];
  image: string;
  bioBn: string;
  bioEn: string;
}

export interface PlatformItem {
  name: string;
  nameBn: string;
  logo: string;
}

export interface CourseItem {
  nameBn: string;
  nameEn: string;
}

export interface CourseCategory {
  id: string;
  icon: string;
  titleBn: string;
  titleEn: string;
  platformLogos: string[];
  trainers: string[];
  courses: CourseItem[];
  descriptionBn?: string;
  descriptionEn?: string;
}

export interface TabOverviewItem {
  icon: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface StatItem {
  num?: string;
  labelBn?: string;
  labelEn?: string;
  chipBn?: string;
  chipEn?: string;
  separator?: boolean;
}

export const siteName = "Jobayer Group Career";

export const heroData = {
  headlineBn: "ঘরে বসে ইনকাম শুরু করুন — কোনো অভিজ্ঞতা লাগবে না!",
  headlineEn: "Start Earning from Home — No Experience Needed!",
  subheadBn: "৮৬৬+ শিক্ষার্থী ইতিমধ্যেই আয় শুরু করেছেন। দেশের সেরা ১২ জন প্রশিক্ষকের ২৩০টির বেশি কোর্স — আজীবনের জন্য। পছন্দ না হলে ২৪ ঘণ্টায় টাকা ফেরত।",
  subheadEn: "866+ students already earning. 230+ courses from Bangladesh's top 12 trainers — lifetime access. 24h money-back guarantee.",
  badges: [
    { icon: "🎯", textBn: "রিয়েল মার্কেট প্রজেক্ট", textEn: "Real Market Projects" },
    { icon: "📚", textBn: "২৩০+ কোর্স", textEn: "230+ Courses" },
    { icon: "👨‍🏫", textBn: "১২ জন বিশেষজ্ঞ", textEn: "12 Expert Trainers" },
    { icon: "💼", textBn: "জব প্লেসমেন্ট", textEn: "Job Placement" },
  ],
  problemBn: "অনলাইনে আয় করতে চান কিন্তু বুঝতে পারছেন না কোথা থেকে শুরু করবেন? বেশিরভাগ কোর্স শুধু থিওরি দেয় — রিয়েল মার্কেটের জন্য তৈরি করে না।",
  problemEn: "Want to earn online but don't know where to start? Most courses teach theory — not real market skills.",
  solutionBn: "জোবায়ের গ্রুপ ক্যারিয়ার আপনাকে দেয় রিয়েল মার্কেট প্রজেক্ট, সরাসরি ক্লায়েন্ট এক্সপোজার, এবং কাজ শেখার পর ইন্টার্নশিপের সুযোগ — সব একসাথে।",
  solutionEn: "Jobayer Group Career gives you real market projects, direct client exposure, and internship opportunities — all in one place.",
  ctaBn: "🚀 আপনার অ্যাকাউন্ট খুলুন এখনই →",
  ctaEn: "🚀 Create Your Account Now →",
  ctaHref: "/register",
  liveCountLabelBn: "সক্রিয় শিক্ষার্থী",
  liveCountLabelEn: "Active Students",
};

export const stats: StatItem[] = [
  { num: "৮৬৬+", labelBn: "সক্রিয় শিক্ষার্থী", labelEn: "Active Students" },
  { separator: true },
  { num: "২৩০+", labelBn: "প্রিমিয়াম কোর্স", labelEn: "Premium Courses" },
  { separator: true },
  { num: "১২", labelBn: "এক্সপার্ট ট্রেইনার", labelEn: "Expert Trainers" },
  { separator: true },
  { num: "৳৯৯", labelBn: "শুধু আজ", labelEn: "Only Today" },
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

export const trainers: Trainer[] = [
  {
    name: "Ayman Sadiq", nameBn: "আয়মান সাদিক",
    specialtyBn: "ইংরেজি ও দক্ষতা উন্নয়ন", specialtyEn: "English & Skill Development",
    credentialBn: "প্রতিষ্ঠাতা, টেন মিনিট স্কুল", credentialEn: "Founder, 10 Minute School",
    coursesBn: ["ইংরেজি ভাষা কোর্স", "ক্যারিয়ার ডেভেলপমেন্ট"],
    coursesEn: ["English Language Course", "Career Development"],
    image: "/images/trainers/default.jpg",
    bioBn: "দেশের শীর্ষ ইংরেজি শিক্ষক ও উদ্যোক্তা। টেন মিনিট স্কুলের প্রতিষ্ঠাতা।",
    bioEn: "Bangladesh's top English teacher and entrepreneur. Founder of 10 Minute School."
  },
  {
    name: "Munzarin Shahid", nameBn: "মুনজারিন শহীদ",
    specialtyBn: "ইংরেজি ভাষা শিক্ষা", specialtyEn: "English Language Teaching",
    credentialBn: "সিনিয়র ট্রেইনার, টেন মিনিট স্কুল", credentialEn: "Senior Trainer, 10 Minute School",
    coursesBn: ["স্পোকেন ইংলিশ কোর্স", "ইংরেজি গ্রামার কোর্স"],
    coursesEn: ["Spoken English Course", "English Grammar Course"],
    image: "/images/trainers/default.jpg",
    bioBn: "ইংরেজি ভাষা শিক্ষায় দেশের জনপ্রিয় প্রশিক্ষক।",
    bioEn: "Popular English language trainer in Bangladesh."
  },
  {
    name: "Jhankar Mahbub", nameBn: "ঝংকার মাহবুব",
    specialtyBn: "প্রোগ্রামিং ও ওয়েব ডেভেলপমেন্ট", specialtyEn: "Programming & Web Development",
    credentialBn: "লেখক ও প্রোগ্রামার", credentialEn: "Author & Programmer",
    coursesBn: ["ওয়েব ডেভেলপমেন্ট কোর্স", "পাইথন প্রোগ্রামিং"],
    coursesEn: ["Web Development Course", "Python Programming"],
    image: "/images/trainers/default.jpg",
    bioBn: "প্রোগ্রামিং ভাষায় বাংলায় বইয়ের জন্য বিখ্যাত।",
    bioEn: "Famous for Bangla programming books."
  },
  {
    name: "Khalid Farhan", nameBn: "খালিদ ফারহান",
    specialtyBn: "ফ্রিল্যান্সিং ও আউটসোর্সিং", specialtyEn: "Freelancing & Outsourcing",
    credentialBn: "সিনিয়র ফ্রিল্যান্সার", credentialEn: "Senior Freelancer",
    coursesBn: ["ফ্রিল্যান্সিং মাস্টারি", "আউটসোর্সিং গাইড"],
    coursesEn: ["Freelancing Mastery", "Outsourcing Guide"],
    image: "/images/trainers/default.jpg",
    bioBn: "ফ্রিল্যান্সিং ও আউটসোর্সিং এ দেশের শীর্ষ প্রশিক্ষক।",
    bioEn: "Top freelancing and outsourcing trainer."
  },
  {
    name: "Sadman Sadik", nameBn: "সাদমান সাদিক",
    specialtyBn: "গ্রাফিক্স ডিজাইন ও মাল্টিমিডিয়া", specialtyEn: "Graphics Design & Multimedia",
    credentialBn: "ক্রিয়েটিভ ডিরেক্টর", credentialEn: "Creative Director",
    coursesBn: ["গ্রাফিক্স ডিজাইন কোর্স", "মাল্টিমিডিয়া কোর্স"],
    coursesEn: ["Graphics Design Course", "Multimedia Course"],
    image: "/images/trainers/default.jpg",
    bioBn: "গ্রাফিক্স ডিজাইন ও মাল্টিমিডিয়ায় বিশেষজ্ঞ প্রশিক্ষক।",
    bioEn: "Graphics design and multimedia expert trainer."
  },
  {
    name: "Freelancer Nasim", nameBn: "ফ্রিল্যান্সার নাসিম",
    specialtyBn: "ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং", specialtyEn: "Freelancing & Digital Marketing",
    credentialBn: "এক্সপার্ট ফ্রিল্যান্সার", credentialEn: "Expert Freelancer",
    coursesBn: ["ফ্রিল্যান্সিং বিগিনার টু অ্যাডভান্সড", "ডিজিটাল মার্কেটিং কোর্স"],
    coursesEn: ["Freelancing Beginner to Advanced", "Digital Marketing Course"],
    image: "/images/trainers/default.jpg",
    bioBn: "ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং এ হাজারো শিক্ষার্থী তৈরি করেছেন।",
    bioEn: "Has trained thousands in freelancing and digital marketing."
  },
  {
    name: "Tahsan Khan", nameBn: "তাহসান খান",
    specialtyBn: "কন্টেন্ট ক্রিয়েশন ও ইউটিউব", specialtyEn: "Content Creation & YouTube",
    credentialBn: "টপ ক্রিয়েটর", credentialEn: "Top Creator",
    coursesBn: ["ইউটিউব কন্টেন্ট ক্রিয়েশন", "সোশ্যাল মিডিয়া মার্কেটিং"],
    coursesEn: ["YouTube Content Creation", "Social Media Marketing"],
    image: "/images/trainers/default.jpg",
    bioBn: "ইউটিউব ও কন্টেন্ট ক্রিয়েশনে দেশের শীর্ষ ক্রিয়েটর।",
    bioEn: "Top YouTube and content creator in Bangladesh."
  },
  {
    name: "Jubayer Hossain", nameBn: "জুবায়ের হোসাইন",
    specialtyBn: "ডিজিটাল মার্কেটিং ও এসইও", specialtyEn: "Digital Marketing & SEO",
    credentialBn: "ডিজিটাল মার্কেটিং এক্সপার্ট", credentialEn: "Digital Marketing Expert",
    coursesBn: ["ডিজিটাল মার্কেটিং কোর্স", "SEO মাস্টারি"],
    coursesEn: ["Digital Marketing Course", "SEO Mastery"],
    image: "/images/trainers/default.jpg",
    bioBn: "ডিজিটাল মার্কেটিং ও এসইও বিশেষজ্ঞ।",
    bioEn: "Digital marketing and SEO expert."
  },
  {
    name: "Abtahi Iptesam", nameBn: "আবতাহি ইপ্তেসাম",
    specialtyBn: "ওয়েব ডেভেলপমেন্ট ও টেকনোলজি", specialtyEn: "Web Development & Technology",
    credentialBn: "ওয়েব ডেভেলপার", credentialEn: "Web Developer",
    coursesBn: ["ওয়েব ডেভেলপমেন্ট কোর্স", "টেকনোলজি গাইড"],
    coursesEn: ["Web Development Course", "Technology Guide"],
    image: "/images/trainers/default.jpg",
    bioBn: "ওয়েব ডেভেলপমেন্ট ও টেকনোলজি বিষয়ে জনপ্রিয় প্রশিক্ষক।",
    bioEn: "Popular trainer in web development and technology."
  },
  {
    name: "Mahade Hasan", nameBn: "মাহাদে হাসান",
    specialtyBn: "ই-কমার্স ও অনলাইন ব্যবসা", specialtyEn: "E-Commerce & Online Business",
    credentialBn: "ই-কমার্স এক্সপার্ট", credentialEn: "E-Commerce Expert",
    coursesBn: ["ই-কমার্স বিগিনার টু প্রো", "শপিফাই স্টোর সেটআপ"],
    coursesEn: ["E-Commerce Beginner to Pro", "Shopify Store Setup"],
    image: "/images/trainers/default.jpg",
    bioBn: "ই-কমার্স ও অনলাইন ব্যবসায় বিশেষজ্ঞ প্রশিক্ষক।",
    bioEn: "E-commerce and online business expert trainer."
  },
  {
    name: "Vaibhav Sisinity", nameBn: "ভৈভব সিসিনিটি",
    specialtyBn: "ইংরেজি ও পেশাগত উন্নয়ন", specialtyEn: "English & Professional Development",
    credentialBn: "কমিউনিকেশন এক্সপার্ট", credentialEn: "Communication Expert",
    coursesBn: ["ইংলিশ ফর প্রফেশনালস", "কমিউনিকেশন মাস্টারক্লাস"],
    coursesEn: ["English for Professionals", "Communication Masterclass"],
    image: "/images/trainers/default.jpg",
    bioBn: "ইংরেজি যোগাযোগ ও পেশাগত উন্নয়নে আন্তর্জাতিক প্রশিক্ষক।",
    bioEn: "International trainer in English communication and professional development."
  },
  {
    name: "Soban Tariq", nameBn: "সোবান তারিক",
    specialtyBn: "ডিজিটাল মার্কেটিং ও ব্র্যান্ডিং", specialtyEn: "Digital Marketing & Branding",
    credentialBn: "ডিজিটাল মার্কেটিং বিশেষজ্ঞ", credentialEn: "Digital Marketing Specialist",
    coursesBn: ["ডিজিটাল মার্কেটিং স্ট্র্যাটেজি", "ব্র্যান্ডিং মাস্টারি"],
    coursesEn: ["Digital Marketing Strategy", "Branding Mastery"],
    image: "/images/trainers/default.jpg",
    bioBn: "ডিজিটাল মার্কেটিং ও ব্র্যান্ডিং বিশেষজ্ঞ।",
    bioEn: "Digital marketing and branding specialist."
  },
];
export const tab0OverviewItems: TabOverviewItem[] = [
  { icon: "💼", titleBn: "ফ্রিল্যান্সিং ও অনলাইন আর্নিং", titleEn: "Freelancing & Online Earning", descBn: "ঘরে বসেই বিশ্বের যেকোনো প্রান্ত থেকে ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং করে আয় করার পূর্ণাঙ্গ গাইড", descEn: "Complete guide to earn from freelancing & digital marketing from anywhere in the world" },
  { icon: "💻", titleBn: "প্রোগ্রামিং ও আইটি ডেভেলপমেন্ট", titleEn: "Programming & IT Development", descBn: "ওয়েবসাইট, মোবাইল অ্যাপ ও সফটওয়্যার তৈরির কোর্স — কোডিং শিখে পেশা গড়ুন", descEn: "Courses on websites, mobile apps & software — build a career with coding" },
  { icon: "📢", titleBn: "ডিজিটাল মার্কেটিং ও এসইও", titleEn: "Digital Marketing & SEO", descBn: "ফেসবুক, গুগল, ইউটিউব ও লিংকডইনে বিজ্ঞাপন ও মার্কেটিংয়ের আধুনিক কৌশল", descEn: "Modern advertising & marketing strategies on Facebook, Google, YouTube & LinkedIn" },
  { icon: "🌍", titleBn: "ই-কমার্স ও অনলাইন ব্যবসা", titleEn: "E-Commerce & Online Business", descBn: "শপিফাই, ড্রপশিপিং, অ্যামাজন ও সোশ্যাল কমার্স — অনলাইনে পণ্য বিক্রির A-Z", descEn: "Shopify, dropshipping, Amazon & social commerce — A-Z of selling products online" },
  { icon: "🎨", titleBn: "UI/UX, মোশন গ্রাফিক্স ও থ্রিডি", titleEn: "UI/UX, Motion Graphics & 3D", descBn: "ফিগমা, আফটার ইফেক্টস ও ব্লেন্ডার দিয়ে ডিজাইন ও অ্যানিমেশনের পেশাদার কোর্স", descEn: "Professional courses in design & animation with Figma, After Effects & Blender" },
  { icon: "🏛️", titleBn: "প্রতিষ্ঠানসমূহ", titleEn: "Institutions", descBn: "টেন মিনিট স্কুল, ঘুড়ি লার্নিং, ক্রিয়েটিভ আইটি সহ ৯টি শীর্ষ প্রতিষ্ঠানের কোর্স", descEn: "Courses from top 9 institutions including 10 Minute School, Ghoori Learning & Creative IT" },
  { icon: "📚", titleBn: "ভাষা শিক্ষা ও চাকরি প্রস্তুতি", titleEn: "Language Learning & Job Preparation", descBn: "IELTS, স্পোকেন ইংলিশ, বিসিএস, ব্যাংক জবস ও সরকারি চাকরির সম্পূর্ণ প্রস্তুতি", descEn: "Complete preparation for IELTS, spoken English, BCS, bank jobs & government jobs" },
  { icon: "👑", titleBn: "শীর্ষ প্রশিক্ষকবৃন্দ", titleEn: "Top Trainers", descBn: "আয়মান সাদিক, ঝংকার মাহবুব, মুনজারিন শহীদ সহ ১২ জন তারকা প্রশিক্ষকবৃন্দের কোর্স", descEn: "Courses from 12 star trainers including Ayman Sadiq, Jhankar Mahbub & Munzarin Shahid" },
  { icon: "🛠️", titleBn: "সফটওয়্যার টুলস", titleEn: "Software Tools", descBn: "এমএস অফিস, ফাইভার, আপওয়ার্ক, ওয়ার্ডপ্রেস, ইউটিউব — প্রিমিয়াম ভার্সন ফ্রিতে", descEn: "MS Office, Fiverr, Upwork, WordPress, YouTube — premium versions for free" },
  { icon: "🔐", titleBn: "নোটস ও ডিজিটাল সুরক্ষা", titleEn: "Notes & Digital Security", descBn: "আরিফ নোটস, কপিরাইট কোর্স ও ডিজিটাল নিরাপত্তা — শেখার পাশাপাশি সুরক্ষিত থাকুন", descEn: "Arif Notes, copyright course & digital security — stay protected while learning" },
];

export const courseCategories: CourseCategory[] = [
  // Tab 0 — জ্ঞান (Overview tab with descriptions)
  {
    id: "knowledge-skills", icon: "🎓",
    titleBn: "জ্ঞান", titleEn: "Knowledge",
    descriptionBn: "এই প্যাকেজে যা যা থাকছে — এক নজরে সম্পূর্ণ সূচিপত্র। নিচের প্রতিটি বিষয়ের ওপর ক্লিক করলেই বিস্তারিত দেখতে পাবেন।",
    descriptionEn: "What's included in this package — complete index at a glance. Click on each topic below to see details.",
    platformLogos: [], trainers: [], courses: [],
  },
  // Tab 1 — প্রতিষ্ঠানসমূহ
  {
    id: "institutions", icon: "🏛️",
    titleBn: "প্রতিষ্ঠানসমূহ", titleEn: "Institutions",
    descriptionBn: "প্রধান প্রতিষ্ঠানসমূহের তালিকা।",
    descriptionEn: "List of major institutions.",
    platformLogos: [], trainers: [],
    courses: [
      { nameBn: "টেন মিনিট স্কুল (10MS)", nameEn: "10 Minute School (10MS)" },
      { nameBn: "ঘুড়ি লার্নিং (Ghoori Learning)", nameEn: "Ghoori Learning" },
      { nameBn: "স্কিল আপ (Skill Up)", nameEn: "Skill Up" },
      { nameBn: "ইশিখন (eShikhon.com)", nameEn: "eShikhon.com" },
      { nameBn: "মায়াজাল (Mayajal)", nameEn: "Mayajal" },
      { nameBn: "MSB Academy (মাসুক সরকারের MSB)", nameEn: "MSB Academy" },
      { nameBn: "ক্রিয়েটিভ আইটি (Creative IT)", nameEn: "Creative IT" },
      { nameBn: "প্রব্লেম কেআই (Problem KI)", nameEn: "Problem KI" },
      { nameBn: "রেপটো (REPTO)", nameEn: "REPTO" },
    ],
  },
  // Tab 2 — প্রশিক্ষকবৃন্দ
  {
    id: "trainers", icon: "👨‍🏫",
    titleBn: "প্রশিক্ষকবৃন্দ", titleEn: "Trainers",
    descriptionBn: "যে সকল প্রশিক্ষকবৃন্দের কোর্স আপনি ফ্রিতে পাবেন। তালিকায় থাকা সকল জনপ্রিয় প্রশিক্ষকবৃন্দের কোর্স একেবারে ফ্রিতেই পাবেন।",
    descriptionEn: "Courses you get for free from these trainers. All popular trainers' courses are completely free.",
    platformLogos: [], trainers: ["Ayman Sadiq", "Munzarin Shahid", "Jhankar Mahbub", "Khalid Farhan", "Sadman Sadik", "Freelancer Nasim", "Tahsan Khan", "Jubayer Hossain", "Abtahi Iptesam", "Mahade Hasan", "Vaibhav Sisinity", "Soban Tariq"],
    courses: [
      { nameBn: "আয়মান সাদিক (Ayman Sadiq)", nameEn: "Ayman Sadiq" },
      { nameBn: "মুনজারিন শহীদ (Munzarin Shahid)", nameEn: "Munzarin Shahid" },
      { nameBn: "ঝংকার মাহবুব — Jhankar Mahbub", nameEn: "Jhankar Mahbub" },
      { nameBn: "খালিদ ফারহান (Khalid Farhan)", nameEn: "Khalid Farhan" },
      { nameBn: "সাদমান সাদিক — Sadman Sadik", nameEn: "Sadman Sadik" },
      { nameBn: "ফ্রিল্যান্সার নাসিম — Freelancer Nasim", nameEn: "Freelancer Nasim" },
      { nameBn: "তাহসান খান — Tahsan Khan", nameEn: "Tahsan Khan" },
      { nameBn: "জুবায়ের হোসাইন — Jubayer Hossain", nameEn: "Jubayer Hossain" },
      { nameBn: "আবতাহি ইপ্তেসাম — Abtahi Iptesam", nameEn: "Abtahi Iptesam" },
      { nameBn: "মাহাদে হাসান — Mahade Hasan", nameEn: "Mahade Hasan" },
      { nameBn: "ভৈভব সিসিনিটি — Vaibhav Sisinity", nameEn: "Vaibhav Sisinity" },
      { nameBn: "সোবান তারিক — Soban Tariq", nameEn: "Soban Tariq" },
    ],
  },
  // Tab 3 — ফ্রিল্যান্সিং
  {
    id: "freelancing", icon: "💼",
    titleBn: "ফ্রিল্যান্সিং", titleEn: "Freelancing",
    descriptionBn: "মূলধারার ফ্রিল্যান্সিং, ডিজিটাল মার্কেটিং, এসইও এবং ডেটা বিশ্লেষণ — তালিকায় থাকা প্রত্যেকটি কোর্স পাবেন একেবারে ফ্রিতে।",
    descriptionEn: "Mainstream freelancing, digital marketing, SEO and data analysis — every course is completely free.",
    platformLogos: ["Upwork", "Fiverr", "Freelancer"], trainers: ["Khalid Farhan", "Freelancer Nasim"],
    courses: [
      { nameBn: "ঘরে বসে ফ্রিল্যান্সিং — Freelancing From Home", nameEn: "Freelancing From Home" },
      { nameBn: "ডাটা এন্ট্রি ফ্রিল্যান্সিং — Data Entry Freelancing", nameEn: "Data Entry Freelancing" },
      { nameBn: "ফেসবুক মার্কেটিং — Facebook Marketing", nameEn: "Facebook Marketing" },
      { nameBn: "গ্রাফিক্স ডিজাইন — Graphics Design", nameEn: "Graphics Design" },
      { nameBn: "ডিজিটাল মার্কেটিং — Digital Marketing", nameEn: "Digital Marketing" },
      { nameBn: "এসইও ফর বিগিনার্স — SEO For Beginners", nameEn: "SEO For Beginners" },
      { nameBn: "এসইও বেসিক — SEO Basic", nameEn: "SEO Basic" },
      { nameBn: "আইটি বাড়ি SEO পার্ট ১ ও ২ — IT Bari SEO", nameEn: "IT Bari SEO Part 1 & 2" },
      { nameBn: "গুগল অ্যাডস মাস্টারি — Google Ads Mastery", nameEn: "Google Ads Mastery" },
      { nameBn: "ফেসবুক অ্যাডস মাস্টারি — Facebook Ads Mastery", nameEn: "Facebook Ads Mastery" },
      { nameBn: "ফেসবুক পিক্সেল ও কনভার্সন API — Facebook Pixel & API", nameEn: "Facebook Pixel & Conversion API" },
      { nameBn: "গুগল অ্যানালিটিক্স ৪ — Google Analytics 4", nameEn: "Google Analytics 4" },
      { nameBn: "গুগল ট্যাগ ম্যানেজার ফর শপিফাই — GTM For Shopify", nameEn: "GTM For Shopify" },
      { nameBn: "ওয়েব অ্যানালিটিক্স মাস্টারি — Web Analytics Mastery", nameEn: "Web Analytics Mastery" },
      { nameBn: "অ্যাডভান্সড গুগল ট্যাগ ম্যানেজার — Advanced GTM", nameEn: "Advanced Google Tag Manager" },
      { nameBn: "GA4 সার্ভার-সাইড ট্র্যাকিং — GA4 Server Side", nameEn: "GA4 Server Side Tracking" },
      { nameBn: "গুগল অ্যাডস ম্যানেজমেন্ট — Google Ads Management", nameEn: "Google Ads Management" },
      { nameBn: "গুগল অ্যানালিটিক্স ফর ই-কমার্স — GA For E-Commerce", nameEn: "Google Analytics For E-Commerce" },
      { nameBn: "গুগল শপিং অ্যাডস — Google Shopping Ads", nameEn: "Google Shopping Ads" },
      { nameBn: "ফেসবুক অ্যাডস ফানেল — Facebook Ads Funnel", nameEn: "Facebook Ads Funnel" },
      { nameBn: "অ্যাডভান্স ইউটিউব বুস্টিং — Advanced YouTube Boosting", nameEn: "Advanced YouTube Boosting" },
      { nameBn: "লিঙ্কডইন মার্কেটিং — LinkedIn Marketing", nameEn: "LinkedIn Marketing" },
      { nameBn: "ইনস্টাগ্রাম মার্কেটিং — Instagram Marketing", nameEn: "Instagram Marketing" },
      { nameBn: "ইনস্টাগ্রাম মার্কেটিং মাস্টারক্লাস — Instagram Masterclass", nameEn: "Instagram Marketing Masterclass" },
      { nameBn: "সিপিএ মার্কেটিং — CPA Marketing", nameEn: "CPA Marketing" },
      { nameBn: "ডিজিটাল মার্কেটিং অল-ইন-ওয়ান — Digital Marketing All-In-One", nameEn: "Digital Marketing All-In-One" },
      { nameBn: "বেসিক ডিজিটাল মার্কেটিং — Basic Digital Marketing", nameEn: "Basic Digital Marketing" },
      { nameBn: "ফেসবুক কনটেন্ট ডিজাইন — Facebook Content Design", nameEn: "Facebook Content Design" },
      { nameBn: "ইউটিউব মার্কেটিং — YouTube Marketing", nameEn: "YouTube Marketing" },
      { nameBn: "রয় ডিজিটাল মার্কেটিং — RoY Digital Marketing", nameEn: "RoY Digital Marketing" },
      { nameBn: "ওয়েবকোডার আইটি ডিজিটাল মার্কেটিং — Webcoder IT Digital Marketing", nameEn: "Webcoder IT Digital Marketing" },
    ],
  },
  // Tab 4 — ই-কমার্স
  {
    id: "ecommerce", icon: "🌍",
    titleBn: "ই-কমার্স", titleEn: "E-Commerce",
    descriptionBn: "গ্লোবাল ই-কমার্স, ব্যবসা উদ্যোগ, পেশাদার পেশা ও অন্যান্য দক্ষতা।",
    descriptionEn: "Global e-commerce, business ventures, professional careers & other skills.",
    platformLogos: ["Shopify", "Amazon"], trainers: ["Mahade Hasan", "Jubayer Hossain"],
    courses: [
      { nameBn: "ই-কমার্স স্টার্টআপ — E-Commerce Startup", nameEn: "E-Commerce Startup" },
      { nameBn: "ই-কমার্স স্টার্টআপ ২ — E-Commerce Startup 2", nameEn: "E-Commerce Startup 2" },
      { nameBn: "শপিফাই ড্রপশিপিং — Shopify Dropshipping", nameEn: "Shopify Dropshipping" },
      { nameBn: "শপিফাই থিম ডেভেলপমেন্ট — Shopify Theme Development", nameEn: "Shopify Theme Development" },
      { nameBn: "অ্যাফিলিয়েট মার্কেটিং ফর বিগিনার্স — Affiliate Marketing For Beginners", nameEn: "Affiliate Marketing For Beginners" },
      { nameBn: "কমপ্লিট অ্যাফিলিয়েট মার্কেটিং — Complete Affiliate Marketing", nameEn: "Complete Affiliate Marketing" },
      { nameBn: "সোর্সিং এজেন্ট বিজনেস — Sourcing Agent Business", nameEn: "Sourcing Agent Business" },
      { nameBn: "এক্সপোর্ট ফ্রম বাংলাদেশ — Export From Bangladesh", nameEn: "Export From Bangladesh" },
      { nameBn: "মার্চ বাই অ্যামাজন — Merch By Amazon", nameEn: "Merch By Amazon" },
      { nameBn: "অ্যামাজন অ্যাফিলিয়েট উইথ ইউটিউব — Amazon Affiliate With YouTube", nameEn: "Amazon Affiliate With YouTube" },
      { nameBn: "অ্যালিএক্সপ্রেস অ্যাফিলিয়েট — AliExpress Affiliate", nameEn: "AliExpress Affiliate" },
      { nameBn: "ফাইভার মাস্টারক্লাস — Fiverr Masterclass", nameEn: "Fiverr Masterclass" },
      { nameBn: "ফাইভার মার্কেটপ্লেস A-Z — Fiverr Marketplace A-Z", nameEn: "Fiverr Marketplace A-Z" },
      { nameBn: "ফাইভার অ্যাকাউন্ট সাকসেস — Fiverr Account Success", nameEn: "Fiverr Account Success" },
      { nameBn: "ভার্চুয়াল অ্যাসিস্ট্যান্ট — Virtual Assistant", nameEn: "Virtual Assistant" },
      { nameBn: "কমপ্লিট গুগল অ্যাডসেন্স — Complete Google AdSense", nameEn: "Complete Google AdSense" },
      { nameBn: "কনটেন্ট রাইটিং — Content Writing", nameEn: "Content Writing" },
      { nameBn: "আর্টিকেল রাইটিং — Article Writing", nameEn: "Article Writing" },
      { nameBn: "প্রোডাক্ট ডিসক্রিপশন রাইটিং — Product Description Writing", nameEn: "Product Description Writing" },
      { nameBn: "ওয়েব কনটেন্ট ক্রিয়েশন — Web Content Creation", nameEn: "Web Content Creation" },
      { nameBn: "সিভি রাইটিং — CV Writing", nameEn: "CV Writing" },
      { nameBn: "চাকরি জীবনের প্রস্তুতি — Career Preparation", nameEn: "Career Preparation" },
      { nameBn: "প্রথম ৯০ দিনের প্ল্যান — First 90 Days Plan", nameEn: "First 90 Days Plan" },
      { nameBn: "কমুনিকেশন মাস্টারক্লাস — Communication Masterclass", nameEn: "Communication Masterclass" },
      { nameBn: "পেশা গাইডেন্স — Career Guidance", nameEn: "Career Guidance" },
      { nameBn: "ইংলিশ ফর ফ্রিল্যান্সিং — English For Freelancing", nameEn: "English For Freelancing" },
      { nameBn: "ক্রিয়েটিভ কনটেন্ট ডিজাইন টেকনিকস — Creative Content Design", nameEn: "Creative Content Design Techniques" },
      { nameBn: "ই-বিজনেস আইডিয়া — E-Business Idea", nameEn: "E-Business Idea" },
      { nameBn: "২৪ ঘণ্টায় কোরআন শিক্ষা — Quran Learning in 24 Hours", nameEn: "Quran Learning in 24 Hours" },
      { nameBn: "কোরআন লার্নিং — Quran Learning", nameEn: "Quran Learning" },
      { nameBn: "সহজে স্পোকেন আরবি — Spoken Arabic Easily", nameEn: "Spoken Arabic Easily" },
      { nameBn: "সুন্দর ও দ্রুত বাংলা হাতের লেখা — Bangla Handwriting", nameEn: "Bangla Handwriting" },
      { nameBn: "দ্রুত ইংরেজি হাতের লেখা — Fast English Handwriting", nameEn: "Fast English Handwriting" },
      { nameBn: "রোবোটিক্স ফর বিগিনার্স — Robotics For Beginners", nameEn: "Robotics For Beginners" },
      { nameBn: "পার্সোনাল ফিটনেস — Personal Fitness", nameEn: "Personal Fitness" },
      { nameBn: "সেলফ ডিফেন্স — Self Defense", nameEn: "Self Defense" },
      { nameBn: "বেসিক কার মেইনটেন্যান্স — Basic Car Maintenance", nameEn: "Basic Car Maintenance" },
      { nameBn: "পেশাদার ব্লক প্রিন্ট ডিজাইন — Professional Block Print Design", nameEn: "Professional Block Print Design" },
      { nameBn: "ম্যাজিক অফ মিউচুয়াল ফান্ডস — Magic Of Mutual Funds", nameEn: "Magic Of Mutual Funds" },
      { nameBn: "Nutrition And Good Health", nameEn: "Nutrition And Good Health" },
      { nameBn: "ইথিক্যাল হ্যাকিং — Ethical Hacking", nameEn: "Ethical Hacking" },
      { nameBn: "সার্টিফাইড এথিক্যাল হ্যাকিং — Certified Ethical Hacking", nameEn: "Certified Ethical Hacking" },
      { nameBn: "সাইবার ৭১ — Cyber 71", nameEn: "Cyber 71" },
      { nameBn: "রুট ফোন — Root Phone", nameEn: "Root Phone" },
      { nameBn: "গুগল ড্রাইভ আনলিমিটেড স্টোরেজ — Google Drive Unlimited", nameEn: "Google Drive Unlimited Storage" },
      { nameBn: "ব্ল্যাকহ্যাট মানি মেকিং — Blackhat Money Making", nameEn: "Blackhat Money Making" },
      { nameBn: "ভিডিওস্ক্রাইব সফটওয়্যার — VideoScribe Software", nameEn: "VideoScribe Software" },
      { nameBn: "গ্রাফিক স্কুল — Graphic School", nameEn: "Graphic School" },
      { nameBn: "আইটি ফার্ম বিডি ক্লাস — IT Firm BD Class", nameEn: "IT Firm BD Class" },
    ],
  },
  // Tab 5 — ডেভেলপমেন্ট
  {
    id: "development", icon: "👨‍💻",
    titleBn: "ডেভেলপমেন্ট", titleEn: "Development",
    descriptionBn: "কোডিং, ওয়েব ও সফটওয়্যার অ্যাপ্লিকেশন ডেভেলপমেন্ট।",
    descriptionEn: "Coding, web & software application development.",
    platformLogos: ["WordPress", "Figma"], trainers: ["Jhankar Mahbub", "Abtahi Iptesam"],
    courses: [
      { nameBn: "ওয়েব ডিজাইন — Web Design", nameEn: "Web Design" },
      { nameBn: "ওয়ার্ডপ্রেস — WordPress", nameEn: "WordPress" },
      { nameBn: "ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট — Full Stack Web Development", nameEn: "Full Stack Web Development" },
      { nameBn: "MERN স্ট্যাক ওয়েব ডেভেলপমেন্ট — MERN Stack", nameEn: "MERN Stack Web Development" },
      { nameBn: "অ্যাপ ডেভেলপমেন্ট — App Development", nameEn: "App Development" },
      { nameBn: "অ্যান্ড্রয়েড অ্যাপ ডেভেলপমেন্ট — Android App Development", nameEn: "Android App Development" },
      { nameBn: "জাভা — Java", nameEn: "Java" },
      { nameBn: "পাইথন বেসিক — Python Basic", nameEn: "Python Basic" },
      { nameBn: "সি প্রোগ্রাম — C Program", nameEn: "C Program" },
      { nameBn: "পিএইচপি ও মাইএসকিউএল — PHP & MySQL", nameEn: "PHP & MySQL" },
      { nameBn: "ডার্ট অ্যান্ড ফ্লাটার — Dart And Flutter", nameEn: "Dart And Flutter" },
      { nameBn: "কমপ্লিট জাভা কোর্স — Complete Java Course", nameEn: "Complete Java Course" },
      { nameBn: "অ্যান্ড্রয়েড বাই কটলিন — Android By Kotlin", nameEn: "Android By Kotlin" },
      { nameBn: "জিরো টু হিরো ইন অ্যান্ড্রয়েড — Zero To Hero In Android", nameEn: "Zero To Hero In Android" },
      { nameBn: "ডেভেলপ পেশাদার ওয়েবসাইট — Professional Websites", nameEn: "Develop Professional Websites" },
      { nameBn: "বেসিক ওয়ার্ডপ্রেস — Basic WordPress", nameEn: "Basic WordPress" },
      { nameBn: "ওয়ার্ডপ্রেস থিম ডেভেলপমেন্ট — WordPress Theme Development", nameEn: "WordPress Theme Development" },
      { nameBn: "ওয়ার্ডপ্রেস থিম কাস্টমাইজেশন — WordPress Theme Customization", nameEn: "WordPress Theme Customization" },
      { nameBn: "ওয়েব থিম ডেভেলপমেন্ট — Web Theme Development", nameEn: "Web Theme Development" },
      { nameBn: "ASP.NET", nameEn: "ASP.NET" },
      { nameBn: "ফুল স্ট্যাক শপ — Full Stack Shop", nameEn: "Full Stack Shop" },
      { nameBn: "গেম ডেভেলপমেন্ট — Game Development", nameEn: "Game Development" },
      { nameBn: "গেম ডেভেলপমেন্ট উইদাউট কোডিং — Game Dev Without Coding", nameEn: "Game Development Without Coding" },
    ],
  },
  // Tab 6 — ভাষা ও চাকরি
  {
    id: "language-jobs", icon: "📚",
    titleBn: "ভাষা ও চাকরি", titleEn: "Language & Jobs",
    descriptionBn: "সরকারি বেসরকারি চাকরি এবং ভাষা শিক্ষা কোর্সসমূহ।",
    descriptionEn: "Government & private job preparation and language learning courses.",
    platformLogos: ["YouTube"], trainers: ["Ayman Sadiq", "Munzarin Shahid", "Vaibhav Sisinity"],
    courses: [
      { nameBn: "আইইএলটিএস — IELTS", nameEn: "IELTS" },
      { nameBn: "স্পোকেন ইংলিশ — Spoken English", nameEn: "Spoken English" },
      { nameBn: "বিসিএস প্রিলিমিনারি — BCS Preliminary", nameEn: "BCS Preliminary" },
      { nameBn: "ইংলিশ গ্রামার ক্র্যাশ কোর্স — English Grammar Crash Course", nameEn: "English Grammar Crash Course" },
      { nameBn: "ইংলিশ গ্রামার ক্র্যাশ কোর্স — English Grammar Crash Course", nameEn: "English Grammar Crash Course" },
      { nameBn: "সরকারি চাকরি প্রস্তুতি — Government Job Preparation", nameEn: "Government Job Preparation" },
      { nameBn: "প্রাথমিক সহকারী শিক্ষক নিয়োগ — Primary Assistant Teacher", nameEn: "Primary Assistant Teacher Recruitment" },
      { nameBn: "ব্যাংক জবস ফুল কোর্স — Bank Jobs Full Course", nameEn: "Bank Jobs Full Course" },
      { nameBn: "স্পোকেন ইংলিশ ফর কিডস — Spoken English For Kids", nameEn: "Spoken English For Kids" },
      { nameBn: "ইংলিশ ফর পেশাদার — English For Professional", nameEn: "English For Professional" },
      { nameBn: "ইংলিশ রাইটিং ফর শিক্ষার্থী — English Writing For Student", nameEn: "English Writing For Student" },
      { nameBn: "ইংলিশ ফর ডেইলি লাইফ — English For Daily Life", nameEn: "English For Daily Life" },
      { nameBn: "ইংলিশ গ্রামার ১০১ — English Grammar 101", nameEn: "English Grammar 101" },
      { nameBn: "ইংলিশ গ্রামার ১০২ — English Grammar 102", nameEn: "English Grammar 102" },
      { nameBn: "আইইএলটিএস জেনারেল — IELTS General Preparation", nameEn: "IELTS General Preparation" },
      { nameBn: "অ্যাডভান্স ইংলিশ স্পিকিং — Advanced English Speaking", nameEn: "Advanced English Speaking" },
      { nameBn: "ভোকাবুলারি ফর অল — Vocabulary For All", nameEn: "Vocabulary For All" },
      { nameBn: "স্টাডি স্মার্ট — Study Smart", nameEn: "Study Smart" },
      { nameBn: "মাইক্রোসফট অফিস ফুল কোর্স — MS Office Full Course", nameEn: "Microsoft Office Full Course" },
      { nameBn: "মাইক্রোসফট এক্সেল — Microsoft Excel", nameEn: "Microsoft Excel" },
      { nameBn: "মাইক্রোসফট ওয়ার্ড — Microsoft Word", nameEn: "Microsoft Word" },
      { nameBn: "মাইক্রোসফট পাওয়ারপয়েন্ট — Microsoft PowerPoint", nameEn: "Microsoft PowerPoint" },
      { nameBn: "কম্পিউটার বেসিক কোর্স — Computer Basic Course", nameEn: "Computer Basic Course" },
      { nameBn: "কম্পিউটার বেসিক কোর্স — Computer Basic Course", nameEn: "Computer Basic Course" },
      { nameBn: "ই-শিখন এক্সেল কোর্স — E-Shikhon Excel Course", nameEn: "E-Shikhon Excel Course" },
      { nameBn: "অ্যাডভান্স এক্সেল — Advanced Excel", nameEn: "Advanced Excel" },
      { nameBn: "এইচএসসি ইংলিশ কোর্স — HSC English Course", nameEn: "HSC English Course" },
      { nameBn: "এইচএসসি টেস্ট পেপার সলভ — HSC Test Paper Solve", nameEn: "HSC Test Paper Solve" },
      { nameBn: "এইচএসসি শেষ মুহূর্তের প্রস্তুতি — HSC Last Minute", nameEn: "HSC Last Minute Preparation" },
      { nameBn: "এইচএসসি শর্ট সিলেবাস — HSC Short Syllabus", nameEn: "HSC Short Syllabus" },
      { nameBn: "এসএসসি প্রস্তুতি কোর্স — SSC Preparation", nameEn: "SSC Preparation Course" },
    ],
  },
  // Tab 7 — UI/UX ও মাল্টিমিডিয়া
  {
    id: "uiux-multimedia", icon: "🎨",
    titleBn: "UI/UX ও মাল্টিমিডিয়া", titleEn: "UI/UX & Multimedia",
    descriptionBn: "ইউআই/ইউএক্স, ভিজ্যুয়াল মাল্টিমিডিয়া ও থ্রিডি অ্যানিমেশন আর্টস।",
    descriptionEn: "UI/UX, visual multimedia & 3D animation arts.",
    platformLogos: ["Figma"], trainers: ["Sadman Sadik"],
    courses: [
      { nameBn: "বেসিক UI/UX ডিজাইন — Basic UI/UX Design", nameEn: "Basic UI/UX Design" },
      { nameBn: "লার্ন UI/UX ফ্রম স্ক্র্যাচ — Learn UI/UX From Scratch", nameEn: "Learn UI/UX From Scratch" },
      { nameBn: "UI/UX ডিজাইন (Interactive Care)", nameEn: "UI/UX Design (Interactive Care)" },
      { nameBn: "মোশন গ্রাফিক্স ইন আফটার ইফেক্টস — Motion Graphics In AE", nameEn: "Motion Graphics In After Effects" },
      { nameBn: "ক্রিয়েটিভ আইটি মোশন গ্রাফিক্স — Creative IT Motion Graphics", nameEn: "Creative IT Motion Graphics" },
      { nameBn: "মোশন গ্রাফিক্স 2D ও 3D — Motion Graphics 2D & 3D", nameEn: "Motion Graphics 2D & 3D" },
      { nameBn: "২ডি/৩ডি মোশন — 2D/3D Motion", nameEn: "2D/3D Motion" },
      { nameBn: "কার্টুন অ্যানিমেশন — Cartoon Animation", nameEn: "Cartoon Animation" },
      { nameBn: "থ্রিডি অ্যানিমেশন বেসিক — 3D Animation Basic", nameEn: "3D Animation Basic" },
      { nameBn: "অ্যাডোবি ইলাস্ট্রেটর — Adobe Illustrator", nameEn: "Adobe Illustrator" },
      { nameBn: "গ্রাফিক ডিজাইনিং উইথ ফটোশপ — Graphic Designing With Photoshop", nameEn: "Graphic Designing With Photoshop" },
      { nameBn: "অ্যাডোবি এক্সডি এসেনশিয়াল — Adobe XD Essential", nameEn: "Adobe XD Essential" },
      { nameBn: "লোগো ডিজাইন করে ফ্রিল্যান্সিং — Logo Design Freelancing", nameEn: "Logo Design Freelancing" },
      { nameBn: "টি-শার্ট ডিজাইন করে ফ্রিল্যান্সিং — T-Shirt Design Freelancing", nameEn: "T-Shirt Design Freelancing" },
      { nameBn: "টি-শার্ট ডিজাইন মাস্টারক্লাস — T-Shirt Design Masterclass", nameEn: "T-Shirt Design Masterclass" },
      { nameBn: "ফ্লায়ার ডিজাইন মাস্টারক্লাস — Flyer Design Masterclass", nameEn: "Flyer Design Masterclass" },
      { nameBn: "বিজনেস কার্ড ও ব্যানার ডিজাইন — Business Card & Banner Design", nameEn: "Business Card & Banner Design" },
      { nameBn: "গ্রাফিক্স ডিজাইন আপডেট টিউটোরিয়াল — Graphics Design Update", nameEn: "Graphics Design Update Tutorial" },
      { nameBn: "জিরো টু হিরো ইন ফটোশপ — Zero To Hero In Photoshop", nameEn: "Zero To Hero In Photoshop" },
      { nameBn: "গ্রাফিক্স ডিজাইন উইথ পাওয়ারপয়েন্ট — Graphics Design With PowerPoint", nameEn: "Graphics Design With PowerPoint" },
      { nameBn: "অটোক্যাড কোর্স — AutoCAD Course", nameEn: "AutoCAD Course" },
      { nameBn: "বাংলা টাইপোগ্রাফি অ্যান্ড ক্যালিগ্রাফি — Bangla Typography & Calligraphy", nameEn: "Bangla Typography & Calligraphy" },
      { nameBn: "ভিডিও এডিটিং উইথ প্রিমিয়ার প্রো — Video Editing With Premiere Pro", nameEn: "Video Editing With Premiere Pro" },
      { nameBn: "মোবাইল দিয়ে গ্রাফিক ডিজাইন — Graphic Design Using Mobile", nameEn: "Graphic Design Using Mobile" },
      { nameBn: "ফটো এডিটিং উইথ স্মার্টফোন — Photo Editing With Smartphone", nameEn: "Photo Editing With Smartphone" },
      { nameBn: "মোবাইল ফটোগ্রাফি — Mobile Photography", nameEn: "Mobile Photography" },
      { nameBn: "ওয়েডিং ফটোগ্রাফি — Wedding Photography", nameEn: "Wedding Photography" },
      { nameBn: "ফুড ফটোগ্রাফি — Food Photography", nameEn: "Food Photography" },
    ],
  },
  // Tab 8 — সফটওয়্যার টুলস
  {
    id: "software-tools", icon: "🛠️",
    titleBn: "সফটওয়্যার টুলস", titleEn: "Software Tools",
    descriptionBn: "সফটওয়্যার টুলস এবং ডিজিটাল প্ল্যাটফর্মের প্রয়োজনীয়তার ক্রমবিন্যাস — এই সফটওয়্যার গুলোর প্রিমিয়াম ভার্সন পাবেন ফ্রিতে।",
    descriptionEn: "Software tools and digital platforms sorted by necessity — get premium versions of these software for free.",
    platformLogos: [], trainers: [],
    courses: [
      { nameBn: "মাইক্রোসফট অফিস — Microsoft Office", nameEn: "Microsoft Office" },
      { nameBn: "মাইক্রোসফট এক্সেল — Microsoft Excel", nameEn: "Microsoft Excel" },
      { nameBn: "মাইক্রোসফট ওয়ার্ড — Microsoft Word", nameEn: "Microsoft Word" },
      { nameBn: "ফেসবুক অ্যাডস — Facebook Ads", nameEn: "Facebook Ads" },
      { nameBn: "ইউটিউব — YouTube", nameEn: "YouTube" },
      { nameBn: "ফাইভার — Fiverr", nameEn: "Fiverr" },
      { nameBn: "আপওয়ার্ক — Upwork", nameEn: "Upwork" },
      { nameBn: "ওয়ার্ডপ্রেস — WordPress", nameEn: "WordPress" },
      { nameBn: "অ্যাডোবি ফটোশপ — Adobe Photoshop", nameEn: "Adobe Photoshop" },
      { nameBn: "অ্যাডোবি ইলাস্ট্রেটর — Adobe Illustrator", nameEn: "Adobe Illustrator" },
      { nameBn: "মাইক্রোসফট পাওয়ারপয়েন্ট — Microsoft PowerPoint", nameEn: "Microsoft PowerPoint" },
      { nameBn: "গুগল অ্যাডস — Google Ads", nameEn: "Google Ads" },
      { nameBn: "পাইথন — Python", nameEn: "Python" },
      { nameBn: "জাভা — Java", nameEn: "Java" },
      { nameBn: "পিএইচপি — PHP", nameEn: "PHP" },
      { nameBn: "মাইএসকিউএল — MySQL", nameEn: "MySQL" },
      { nameBn: "শপিফাই — Shopify", nameEn: "Shopify" },
      { nameBn: "ইনস্টাগ্রাম — Instagram", nameEn: "Instagram" },
      { nameBn: "ফ্রিল্যান্সার ডটকম — Freelancer.com", nameEn: "Freelancer.com" },
      { nameBn: "গুগল অ্যানালিটিক্স — Google Analytics", nameEn: "Google Analytics" },
      { nameBn: "GA4 — Google Analytics 4", nameEn: "Google Analytics 4" },
      { nameBn: "গুগল ট্যাগ ম্যানেজার — Google Tag Manager", nameEn: "Google Tag Manager" },
      { nameBn: "ফেসবুক পিক্সেল — Facebook Pixel", nameEn: "Facebook Pixel" },
      { nameBn: "কনভার্সন API — Conversion API", nameEn: "Conversion API" },
      { nameBn: "নোড.জেএস — Node.js", nameEn: "Node.js" },
      { nameBn: "এক্সপ্রেস.জেএস — Express.js", nameEn: "Express.js" },
      { nameBn: "মঙ্গোডিবি — MongoDB", nameEn: "MongoDB" },
      { nameBn: "ফ্লাটার — Flutter", nameEn: "Flutter" },
      { nameBn: "ডার্ট — Dart", nameEn: "Dart" },
      { nameBn: "কটলিন — Kotlin", nameEn: "Kotlin" },
      { nameBn: "ASP.NET", nameEn: "ASP.NET" },
      { nameBn: "অ্যাডোবি প্রিমিয়ার প্রো — Adobe Premiere Pro", nameEn: "Adobe Premiere Pro" },
      { nameBn: "অ্যাডোবি আফটার ইফেক্টস — Adobe After Effects", nameEn: "Adobe After Effects" },
      { nameBn: "অ্যাডোবি XD — Adobe XD", nameEn: "Adobe XD" },
      { nameBn: "গুগল অ্যাডসেন্স — Google AdSense", nameEn: "Google AdSense" },
      { nameBn: "অ্যামাজন — Amazon", nameEn: "Amazon" },
      { nameBn: "অ্যালিএক্সপ্রেস — AliExpress", nameEn: "AliExpress" },
      { nameBn: "গুগল শপিং অ্যাডস — Google Shopping Ads", nameEn: "Google Shopping Ads" },
      { nameBn: "মার্চেন্ট সেন্টার — Merchant Center", nameEn: "Merchant Center" },
      { nameBn: "পিপল পার আওয়ার — PeoplePerHour", nameEn: "PeoplePerHour" },
      { nameBn: "গুরু — Guru", nameEn: "Guru" },
      { nameBn: "অটোক্যাড — AutoCAD", nameEn: "AutoCAD" },
      { nameBn: "অটোডেস্ক — Autodesk", nameEn: "Autodesk" },
      { nameBn: "মকআপ টুলস — Mockup Tools", nameEn: "Mockup Tools" },
      { nameBn: "ভিডিওস্ক্রাইব — VideoScribe", nameEn: "VideoScribe" },
      { nameBn: "টার্মাক্স — Termux", nameEn: "Termux" },
      { nameBn: "ওয়েবিডো — Webydo", nameEn: "Webydo" },
    ],
  },
  // Tab 9 — নোটস
  {
    id: "notes", icon: "🔐",
    titleBn: "নোটস", titleEn: "Notes",
    descriptionBn: "শেখার পাশাপাশি প্রয়োজনীয় নিরাপত্তা বিষয়ক রিসোর্স।",
    descriptionEn: "Security-related resources alongside learning.",
    platformLogos: [], trainers: [],
    courses: [
      { nameBn: "Arif Notes | সকল নোটস", nameEn: "Arif Notes | All Notes" },
      { nameBn: "Copyright Content Course", nameEn: "Copyright Content Course" },
      { nameBn: "ডিজিটাল সুরক্ষা", nameEn: "Digital Security" },
    ],
  },
];



export const testimonials: Testimonial[] = [
  { stars: "★★★★★", rating: "5.0/5",
    quoteBn: "জোবায়ের গ্রুপের নির্দেশিকা আর সহায়তার কারণে আজ আমি নিজের ল্যাপটপ থেকে মাসে ২৫,০০০+ টাকা ইনকাম করছি।",
    quoteEn: "With Jobayer Group's guidance, I now earn 25,000+ BDT monthly from my laptop.",
    authorBn: "মিতা ইসলাম", authorEn: "Mita Islam",
    labelBn: "ফ্রিল্যান্সার, সিলেট", labelEn: "Freelancer, Sylhet" },
  { stars: "★★★★★", rating: "4.9/5",
    quoteBn: "এই কোর্সটা আমাকে রিয়েল মার্কেটের জন্য প্রস্তুত করেছে। এখন নিয়মিত ক্লায়েন্ট পাচ্ছি। সবার কাছে রেকমেন্ড করব!",
    quoteEn: "This course prepared me for the real market. I'm getting regular clients now. Highly recommended!",
    authorBn: "নীলা হোসেন", authorEn: "Neela Hossain",
    labelBn: "ডিজিটাল মার্কেটার, ঢাকা", labelEn: "Digital Marketer, Dhaka" },
  { stars: "★★★★★", rating: "5.0/5",
    quoteBn: "৭ মাসে এখন মাসিক আয় ৪০,০০০+। সবচেয়ে বড় কথা, একটা সহায়ক কমিউনিটি পেয়েছি।",
    quoteEn: "Now earning 40,000+ monthly in 7 months. Most importantly, I found a supportive community.",
    authorBn: "রাফসান জামান", authorEn: "Rafsan Zaman",
    labelBn: "ই-কমার্স আর্নার, চট্টগ্রাম", labelEn: "E-commerce Earner, Chittagong" },
  { stars: "★★★★★", rating: "4.9/5",
    quoteBn: "শুধু কোর্স না — রিয়েল প্রজেক্ট ও জব সাপোর্ট পেয়েছি। যারা সিরিয়াস তাদের জন্য এটি পারফেক্ট!",
    quoteEn: "Not just courses — I got real projects and job support. Perfect for serious learners!",
    authorBn: "আতিকুর রহমান", authorEn: "Atiqur Rahman",
    labelBn: "ওয়েব ডেভেলপার, রাজশাহী", labelEn: "Web Developer, Rajshahi" },
  { stars: "★★★★★", rating: "5.0/5",
    quoteBn: "ফাইভারে এখন মাসে ৩০,০০০+ টাকা আয় করছি। জোবায়ের গ্রুপের ফ্রিল্যান্সিং কোর্স আমার জীবন বদলে দিয়েছে।",
    quoteEn: "I now earn 30,000+ BDT monthly on Fiverr. The freelancing course changed my life.",
    authorBn: "শারমিন জাহান", authorEn: "Sharmin Jahan",
    labelBn: "ফাইভার ফ্রিল্যান্সার, খুলনা", labelEn: "Fiverr Freelancer, Khulna" },
  { stars: "★★★★★", rating: "4.8/5",
    quoteBn: "একদম শূন্য থেকে শুরু করেছি। আজ ১৫,০০০+ মাসিক আয়। ধন্যবাদ জোবায়ের গ্রুপ টিমকে।",
    quoteEn: "Started from absolute zero. Today I earn 15,000+ monthly. Thank you Jobayer Group team!",
    authorBn: "রেজাউল করিম", authorEn: "Rezaul Karim",
    labelBn: "ডিজিটাল মার্কেটার, বগুড়া", labelEn: "Digital Marketer, Bogura" },
  { stars: "★★★★★", rating: "5.0/5",
    quoteBn: "যতগুলো কোর্স করেছি, জোবায়ের গ্রুপের কোর্স সবচেয়ে প্রাক্টিক্যাল। সরাসরি মার্কেটে কাজে লাগাতে পেরেছি।",
    quoteEn: "Among all courses I've taken, Jobayer Group's are the most practical. I applied them directly in the market.",
    authorBn: "সানজিদা করিম", authorEn: "Sanjida Karim",
    labelBn: "গ্রাফিক্স ডিজাইনার, কুমিল্লা", labelEn: "Graphics Designer, Cumilla" },
];

export const faqs: FaqItem[] = [
  { qBn: "💵 বিনামূল্যে রেজিস্টার করে কি সত্যিই অনলাইনে আয় করা সম্ভব?", qEn: "💵 Can I really earn online by registering for free?",
    aBn: "হ্যাঁ, সম্ভব। আমাদের ৮৬৬+ শিক্ষার্থী প্রমাণ করে সঠিক গাইড পেলে যে কেউ আয় করতে পারেন। মাসে ৫০,০০০+ টাকা আয় করা সম্ভব।",
    aEn: "Yes. Our 866+ students prove that with the right guidance, anyone can earn. 50,000+ BDT monthly is achievable." },
  { qBn: "🛡️ এটি কি কোনো স্ক্যাম বা ফেক প্রোগ্রাম?", qEn: "🛡️ Is this a scam or fake program?",
    aBn: "একেবারেই না। জোবায়ের গ্রুপ ৮+ বছর ধরে কাজ করছে। আমরা ২৪ ঘণ্টায় টাকা ফেরত দিই — কোনো প্রতারক কোম্পানি টাকা ফেরত দেয় না।",
    aEn: "Absolutely not. Jobayer Group has been operating for 8+ years. We offer 24h money back — no scam company does that." },
  { qBn: "📱 আমার কোনো পূর্ব অভিজ্ঞতা নেই — তবু কি পারব?", qEn: "📱 I have no prior experience — can I still do it?",
    aBn: "অবশ্যই। আপনার শুধু দরকার একটি স্মার্টফোন বা ল্যাপটপ আর শেখার ইচ্ছা। বাকি সব — আমরা দিচ্ছি।",
    aEn: "Of course. All you need is a smartphone or laptop and the desire to learn. We provide the rest." },
  { qBn: "💰 কত তাড়াতাড়ি আমি প্রথম পেমেন্ট পাব?", qEn: "💰 How soon will I get my first payment?",
    aBn: "বেশিরভাগ শিক্ষার্থী প্রথম মাসেই ১,১০০ - ৫,০০০+ টাকা আয় শুরু করেন। মাসে ৫০,০০০+ টাকা আয় করতে ৩-৬ মাস লাগতে পারে।",
    aEn: "Most students start earning 1,100 - 5,000+ BDT in the first month. 50,000+ BDT monthly takes 3-6 months." },
  { qBn: "🔄 কি মাসিক ফি দিতে হবে? নাকি একবারই দিলেই হবে?", qEn: "🔄 Is there a monthly fee or one-time payment?",
    aBn: "একবার রেজিস্টার করলেই আজীবন অ্যাক্সেস! কোনো মাসিক ফি নেই, কোনো লুকানো চার্জ নেই।",
    aEn: "Register once and get lifetime access! No monthly fees, no hidden charges." },
  { qBn: "📥 রেজিস্টার করার পর কীভাবে কোর্স অ্যাক্সেস পাব?", qEn: "📥 How do I access courses after registration?",
    aBn: "রেজিস্টার করার ১ মিনিটের মধ্যে আপনার ইমেইলে ও হোয়াটসঅ্যাপে গুগল ড্রাইভ লিংক চলে যাবে।",
    aEn: "Within 1 minute of registration, a Google Drive link will be sent to your email and WhatsApp." },
  { qBn: "🎓 আমি কি একসাথে সব কোর্স করতে পারব?", qEn: "🎓 Can I take all courses at once?",
    aBn: "হ্যাঁ, আপনি যেকোনো সময় যেকোনো কোর্স শুরু করতে পারেন। সব কোর্স আপনার জন্য উন্মুক্ত থাকবে আজীবনের জন্য।",
    aEn: "Yes, you can start any course at any time. All courses remain open to you for life." },
  { qBn: "📞 রেজিস্টার করতে সমস্যা হলে কী করব?", qEn: "📞 What if I face issues registering?",
    aBn: "আমাদের ২৪/৭ সাপোর্ট টিম সবসময় আপনার জন্য প্রস্তুত। ফোন, ইমেইল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।",
    aEn: "Our 24/7 support team is always ready to help. Contact us by phone, email, or WhatsApp." },
];

export const galleryImages: GalleryImage[] = [
  { src: "/images/payments/payment-1.jpg", alt: "bKash payment" },
  { src: "/images/payments/payment-2.jpg", alt: "Nagad payment" },
  { src: "/images/payments/payment-3.jpg", alt: "Bank transfer" },
  { src: "/images/payments/payment-4.jpg", alt: "Rocket payment" },
  { src: "/images/payments/payment-5.jpg", alt: "Upwork payment" },
  { src: "/images/payments/payment-6.jpg", alt: "Fiverr payment" },
  { src: "/images/payments/payment-7.jpg", alt: "Freelancer payment" },
  { src: "/images/payments/payment-8.jpg", alt: "bKash large payment" },
  { src: "/images/payments/payment-9.jpg", alt: "Nagad large payment" },
  { src: "/images/payments/payment-10.jpg", alt: "Bank salary" },
];

export const trustBadges = [
  { icon: "🔒", textBn: "SSL সুরক্ষিত", textEn: "SSL Secured" },
  { icon: "✅", textBn: "২৪ ঘণ্টা টাকা ফেরত", textEn: "24h Money Back" },
  { icon: "⚡", textBn: "সাথে সাথে এক্সেস", textEn: "Instant Access" },
  { icon: "📞", textBn: "২৪/৭ সাপোর্ট", textEn: "24/7 Support" },
];

export const howItWorksSteps = [
  {
    num: "১", numEn: "1", icon: "📝",
    titleBn: "বিনামূল্যে রেজিস্টার করুন",
    titleEn: "Register for Free",
    descBn: "আপনার অ্যাকাউন্ট খুলুন। সাথে সাথেই সব কোর্স ও টুলস খুলে যাবে!",
    descEn: "Create your account. All courses and tools unlock immediately!",
    highlightBn: "⏱ ৩০ সেকেন্ড",
    highlightEn: "⏱ 30 Seconds",
  },
  {
    num: "২", numEn: "2", icon: "📢",
    titleBn: "লিংক শেয়ার করুন",
    titleEn: "Share Your Link",
    descBn: "আপনার লিংক ফেসবুক ও হোয়াটসঅ্যাপে শেয়ার করুন। কোনো অভিজ্ঞতা লাগে না — সবকিছু রেডিমেড দেওয়া আছে!",
    descEn: "Share your link on Facebook & WhatsApp. No experience needed — everything is ready-made!",
    highlightBn: "🎯 শুরু করুন আজই",
    highlightEn: "🎯 Start Today",
  },
  {
    num: "৩", numEn: "3", icon: "💰",
    titleBn: "টাকা তুলুন",
    titleEn: "Withdraw Money",
    descBn: "আপনার লিংকে যতজন যুক্ত হবে, তত আয় সরাসরি বিকাশ/নগদে চলে আসবে!",
    descEn: "The more people join through your link, the more you earn directly to bKash/Nagad!",
    highlightBn: "🟢 সরাসরি পেমেন্ট",
    highlightEn: "🟢 Direct Payment",
  },
];

export const howItWorksFooterNoteBn = "💡 আমাদের ৮৬৬+ শিক্ষার্থীর ৭২% ই প্রথম মাসেই আয় শুরু করেছেন! 🚀 আপনার পালা এখনই!";
export const howItWorksFooterNoteEn = "💡 72% of our 866+ students started earning in the first month! 🚀 Your turn now!";

export const trustSectionData = {
  badgeBn: "🛡️ বিশ্বাসযোগ্যতা ও নিরাপত্তা",
  badgeEn: "🛡️ Trust & Security",
  titleBn: "৩০ সেকেন্ডেই শুরু করুন আপনার আয়ের যাত্রা!",
  titleEn: "Start Your Earning Journey in 30 Seconds!",
  descBn: "নিচে আপনার নাম-ফোন দিন, সাথে সাথেই সব কোর্স ও অ্যাক্সেস চলে আসবে!",
  descEn: "Enter your name & phone below to get instant access to all courses!",
  ctaBn: "🚀 এখনই রেজিস্টার করুন →",
  ctaEn: "🚀 Register Now →",
  footerBn: "🔒 আপনার তথ্য SSL সুরক্ষিত। কোনো স্প্যাম ইমেইল নয়।",
  footerEn: "🔒 Your data is SSL secured. No spam emails.",
};

export const platformShowcaseText = {
  badgeBn: "🏛️ প্ল্যাটফর্মসমূহ",
  badgeEn: "🏛️ Platforms",
  titleBn: "যেসব প্ল্যাটফর্মের কোর্স আপনি পাচ্ছেন",
  titleEn: "Platforms Whose Courses You Get",
  subtitleBn: (n: number) => `মোট ${n}টি প্রতিষ্ঠানের কোর্স — সব একসাথে`,
  subtitleEn: (n: number) => `Courses from ${n} platforms — all in one place`,
};

export const paymentGalleryText = {
  badgeBn: "💰 আয়ের প্রমাণ",
  badgeEn: "💰 Proof of Earnings",
  titleBn: "শিক্ষার্থীদের আয়ের বাস্তব চিত্র",
  titleEn: "Real Earnings of Our Students",
  descBn: "নিয়মিত পেমেন্ট পাচ্ছেন আমাদের শিক্ষার্থীরা",
  descEn: "Our students receive payments regularly",
};

export const statsSectionText = {
  badgeBn: "📊 আমাদের পরিসংখ্যান",
  badgeEn: "📊 Our Statistics",
};

export const heroSectionBadgeBn = "💰 সরাসরি কাজ শিখে প্রথম মাসেই ১১,০০০ থেকে ৯২,০০০ টাকা পর্যন্ত উপার্জনের বাস্তবমুখী সুযোগ!";
export const heroSectionBadgeEn = "💰 Earn from ৳11,000 to ৳92,000/month — real opportunity, real results!";

export const salaryNames = [
  "Ayan Rahman","সুমন দাস","Maria Gomes","Ratan Marma","উদয় বড়ুয়া",
  "Nusrat Jahan","অনিক পাল","Rakib Hasan","Bimal Tripura","তানিয়া সুলতানা",
  "Sabbir Hossain","Mithila Roy","Farhan Ahmed","Riya Chakma","Tanvir Islam",
  "Lima Das","Omar Faruk","Puja Rani","Hasan Mahmud","Nabila Noor",
];

export const liveNotifText = {
  joinedRecent: "থেকে সদ্য যুক্ত হলেন!",
  joinedRecentEn: "just joined!",
};

export const platformPrices: Record<string, number> = {
  "10 Minute School": 85000,
  "Ghoori Learning": 55000,
  "Skill Up": 35000,
  "eShikhon": 65000,
  "Mayajal": 40000,
  "MSB Academy": 75000,
  "Creative IT": 90000,
  "Problem KI": 30000,
  "REPTO": 12000,
};

export const trainerPrices: Record<string, number> = {
  "Ayman Sadiq": 45000,
  "Munzereen Shahid": 25000,
  "Jhankar Mahbub": 55000,
  "Khalid Farhan": 30000,
  "Sadman Sadik": 20000,
  "Freelancer Nasim": 28000,
  "Tahsan Khan": 35000,
  "Jubayer Hossain": 25000,
  "Abtahi Iptesam": 18000,
  "Mahade Hasan": 15000,
  "Vaibhav Sisinity": 32000,
  "Soban Tariq": 22000,
};

export const priceAnchorData = {
  marketValueBn: "১০,০০,০০০+ টাকা",
  marketValueEn: "10,00,000+ BDT",
  offerPriceBn: "মাত্র ৯৯ টাকা",
  offerPriceEn: "Only 99 BDT",
  savingsBn: "৯,৯৯,৯০১+ টাকা",
  savingsEn: "9,99,901+ BDT",
  discountPercent: 99.99,
  headlineBn: "⏳ শেষবারের মতো অফার: ১০ লক্ষ টাকার ২৩০+ কোর্স আজ মাত্র ৯৯ টাকায়!",
  headlineEn: "⏳ Last Chance: 230+ courses worth 10 Lakh BDT for only 99 BDT!",
  subheadBn: "আগামী ২৪ ঘণ্টা পর দাম বেড়ে হবে ১,৪৯৯ টাকা। এই মুহূর্তে যুক্ত হলে পাচ্ছেন দেশের সেরা ১২ জন প্রশিক্ষকের ২৩০টির বেশি কোর্স — আজীবনের জন্য। পছন্দ না হলে ২৪ ঘণ্টায় টাকা ফেরত।",
  subheadEn: "After 24 hours, the price will increase to 1,499 BDT. Join now to get 230+ courses from Bangladesh's top 12 trainers — for life. 24h money-back guarantee.",
  ctaBn: "🔥 হ্যাঁ, দাম বাড়ার আগে মাত্র ৯৯ টাকায় আজীবন অ্যাক্সেস নিন →",
  ctaEn: "🔥 Yes, Get Lifetime Access for Only 99 BDT Before Price Hike →",
  timerShow: true,
};

export const sectionText = {
  problem: {
    badgeBn: "🤔 আপনি কি এই সমস্যাগুলোর মুখোমুখি?",
    badgeEn: "🤔 Facing These Problems?",
    items: [
      {
        icon: "⚠️",
        titleBn: "প্রিমিয়াম কোর্সের দাম ১০,০০০-৮৫,০০০+ টাকা",
        titleEn: "Premium courses cost 10,000-85,000+ BDT",
        descBn: "সবার জন্য affordable না",
        descEn: "Not affordable for everyone",
      },
      {
        icon: "⚠️",
        titleBn: "ইউটিউবে ভালো কন্টেন্ট আছে কিন্তু স্ট্রাকচারড গাইডেন্স নেই",
        titleEn: "YouTube has good content but lacks structured guidance",
        descBn: "রোডম্যাপ নেই",
        descEn: "No roadmap",
      },
      {
        icon: "⚠️",
        titleBn: "বিভিন্ন প্ল্যাটফর্মে ছড়িয়ে থাকা কোর্স",
        titleEn: "Courses scattered across platforms",
        descBn: "এক জায়গায় পাবেন না",
        descEn: "Not in one place",
      },
      {
        icon: "⚠️",
        titleBn: "কোন স্কিল প্রথমে শিখবেন — সঠিক দিকনির্দেশনা নেই",
        titleEn: "Which skill to learn first — no proper guidance",
        descBn: "কীভাবে শুরু করবেন",
        descEn: "How to start",
      },
      {
        icon: "⚠️",
        titleBn: "শেখার পর কীভাবে ইনকাম শুরু করবেন — সেই পথ দেখায় না",
        titleEn: "After learning, how to start earning — courses don't show this",
        descBn: "অধিকাংশ কোর্স অসম্পূর্ণ",
        descEn: "Most courses are incomplete",
      },
    ],
  },
  solution: {
    items: [
      {
        icon: "✅",
        titleBn: "মাত্র ৯৯ টাকায় ২৩০+ প্রিমিয়াম কোর্স",
        titleEn: "230+ premium courses for only 99 BDT",
        descBn: "১০ লক্ষ টাকার কন্টেন্ট!",
        descEn: "10 Lakh BDT worth of content!",
      },
      {
        icon: "✅",
        titleBn: "১০টি বিভাগে A-Z স্ট্রাকচারড কোর্স",
        titleEn: "A-Z structured courses in 10 categories",
        descBn: "এক জায়গায় সম্পূর্ণ সিলেবাস",
        descEn: "Complete syllabus in one place",
      },
      {
        icon: "✅",
        titleBn: "বিগিনার থেকে পেশাদার — প্রতিটি ধাপে গাইডেন্স",
        titleEn: "Beginner to professional — step-by-step guidance",
        descBn: "স্টেপ-বাই-স্টেপ গাইড",
        descEn: "Step-by-step guide",
      },
      {
        icon: "✅",
        titleBn: "ক্লায়েন্ট খোঁজার গাইড — শেখার পরপরই আয় শুরু করুন",
        titleEn: "Client-finding guide — start earning right after learning",
        descBn: "রিয়েল প্রজেক্ট ও ইন্টার্নশিপ",
        descEn: "Real projects & internships",
      },
      {
        icon: "✅",
        titleBn: "লাইফটাইম অ্যাক্সেস + ফ্রি আপডেট",
        titleEn: "Lifetime access + free updates",
        descBn: "আজীবনের জন্য আপনার সম্পদ",
        descEn: "Your asset for life",
      },
    ],
  },
};

export const chatTestimonials = [
  {
    avatar: "🌸",
    nameBn: "রোজিনা আক্তার",
    nameEn: "Rozina Akter",
    platformBn: "ফেসবুক গ্রুপ · ২ সপ্তাহ আগে",
    platformEn: "Facebook Group · 2 weeks ago",
    msgBn: "প্রথম বোনাস পাওয়ার দিনটা এখনো মনে আছে। নিজের চেষ্টায় কিছু অর্জনের অনুভূতি অসাধারণ! মাত্র ৯৯ টাকা দিয়ে শুরু করে আজ মাসে ২৫,০০০+ টাকা আয় করছি। যারা দ্বিধায় আছেন, তাদের বলব—শুরু করে দেখুন!",
    msgEn: "I still remember the day I got my first bonus. The feeling of achieving something through my own effort is incredible! Started with just 99 BDT and now earning 25,000+ BDT monthly. To those hesitating — just start!",
    stars: "★★★★★",
    timeBn: "গতকাল ৩:৪২ PM",
    timeEn: "Yesterday 3:42 PM",
  },
  {
    avatar: "🌿",
    nameBn: "পূর্ণিমা বেগম",
    nameEn: "Purnima Begum",
    platformBn: "হোয়াটসঅ্যাপ গ্রুপ · ১ মাস আগে",
    platformEn: "WhatsApp Group · 1 month ago",
    msgBn: "আমি গ্রামের মেয়ে। আগে ভাবতাম অনলাইনে কাজ করা শুধু শহরের ছেলেমেয়েদের জন্য। কিন্তু এই প্ল্যাটফর্মে যুক্ত হওয়ার পর আমার চোখ খুলে গেছে। এখন ঘরে বসে কাজ করি আর পরিবারকে সাহায্য করি।",
    msgEn: "I'm a village girl. I used to think online work was only for city people. But joining this platform opened my eyes. Now I work from home and support my family.",
    stars: "★★★★★",
    timeBn: "গত সপ্তাহে ১১:১৫ AM",
    timeEn: "Last week 11:15 AM",
  },
  {
    avatar: "💪",
    nameBn: "ফারিয়া ইসলাম",
    nameEn: "Faria Islam",
    platformBn: "ফেসবুক মেসেঞ্জার · ৩ সপ্তাহ আগে",
    platformEn: "Facebook Messenger · 3 weeks ago",
    msgBn: "শেখার সুযোগ আর আয়—দুটোই পাচ্ছি এখান থেকে। সঠিক নির্দেশিকা আর সহায়তা পেলে যে কেউ সফল হতে পারে। আমি এখন ৬ মাস ধরে যুক্ত আর প্রতিদিন নতুন কিছু শিখছি। ধন্যবাদ জোবায়ের গ্রুপ টিমকে!",
    msgEn: "I'm getting both learning opportunities and income here. With proper guidance and support, anyone can succeed. I've been here for 6 months and learn something new every day. Thank you Jobayer Group team!",
    stars: "★★★★★",
    timeBn: "গতকাল ৭:০৮ PM",
    timeEn: "Yesterday 7:08 PM",
  },
  {
    avatar: "🔥",
    nameBn: "তামান্না হাসান",
    nameEn: "Tamanna Hasan",
    platformBn: "হোয়াটসঅ্যাপ · ৫ দিন আগে",
    platformEn: "WhatsApp · 5 days ago",
    msgBn: "আমার জন্য এটি নতুন দিগন্ত খুলে দিয়েছে। প্রথমে ভয় ছিল, কিন্তু টিমের সহায়তায় সব ভয় কেটে গেছে। এখন ইনকাম শুরু করেছি, খুব ভালো লাগছে। এখন আমি অনলাইন জগত নিয়ে অনেক বেশি আত্মবিশ্বাসী!",
    msgEn: "This has opened new horizons for me. I was scared at first, but the team's support eliminated all fears. I've started earning now and feeling great. I'm much more confident about the online world now!",
    stars: "★★★★★",
    timeBn: "গতকাল ৯:২২ PM",
    timeEn: "Yesterday 9:22 PM",
  },
];

export const gridTestimonials = [
  { stars: "★★★★★", rating: "4.9/5", nameBn: "নীলা হোসেন", nameEn: "Neela Hossain", textBn: "আমি শুরুতে ভেবেছিলাম এটা হয়তো অন্য অনেক অনলাইন সুযোগের মতোই হবে। কিন্তু কাজ শুরু করার পর বুঝলাম এখানে নিয়মিত নির্দেশিকা দেওয়া হয় এবং নতুনদের শেখানোর জন্য আলাদা সহায়তা রয়েছে। এখন প্রতি মাসে নিয়মিত কাজ করছি এবং সময়মতো পেমেন্ট পাচ্ছি।", textEn: "I initially thought this would be like other online opportunities. But after starting, I realized regular guidance and dedicated support is provided. Now I work regularly and get paid on time." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "মিতা ইসলাম", nameEn: "Mita Islam", textBn: "আমি আগে কোনো অনলাইন কাজ করিনি। এখানে যোগ দেওয়ার পর ধাপে ধাপে কাজ শিখেছি। পরিবারের পাশে থেকে কাজ করতে পারছি, এটা আমার জন্য সবচেয়ে বড় সুবিধা।", textEn: "I never did online work before. After joining, I learned step by step. Working while being with family is the biggest advantage for me." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "রাফসান জামান", nameEn: "Rafsan Zaman", textBn: "ই-কমার্সে কাজ করে মাসে ৪০,০০০+ ইনকাম করছি। শুরুতে কেউ বিশ্বাস করেনি, কিন্তু আজ আমি প্রমাণ করেছি। সবার দোয়া চাই।", textEn: "Earning 40,000+ monthly from e-commerce. No one believed at first, but today I proved them wrong." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "সাবরিনা খান", nameEn: "Sabrina Khan", textBn: "ডিজিটাল মার্কেটিং শিখে এখন নিজেই ক্লায়েন্ট ম্যানেজ করি। এটা শুধু আয়ের জায়গা না, এটি পেশা গড়ার জায়গা।", textEn: "After learning digital marketing, I now manage my own clients. This isn't just an earning opportunity — it's a career builder." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "রেহানা বেগম", nameEn: "Rehana Begum", textBn: "গৃহিণী হয়েও অনলাইনে কাজ করা সম্ভব—এটা প্রমাণ করেছি নিজেই। মাসে ভালো ইনকাম করছি।", textEn: "Being a homemaker, I proved that online work is possible. I earn well monthly." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "নাদিয়া সুলতানা", nameEn: "Nadia Sultana", textBn: "প্রথম প্রথম কাজ পেতে সময় লেগেছে, কিন্তু এখন নিয়মিত আয়। সবার ধৈর্য ধরাটা জরুরি।", textEn: "It took time to get work initially, but now I earn regularly. Patience is key." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "নাজনীন আক্তার", nameEn: "Naznin Akter", textBn: "যারা শুরু করতে চান তাদের বলব—ভয় না করে শুরু করুন। সঠিক নির্দেশিকা পেলে সফলতা আসবেই।", textEn: "To those wanting to start — don't be afraid, just start. With proper guidance, success will follow." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "তামান্না হাসান", nameEn: "Tamanna Hasan", textBn: "আমার জন্য এটি নতুন দিগন্ত খুলে দিয়েছে। এখন আমি অনলাইন জগত নিয়ে অনেক বেশি আত্মবিশ্বাসী।", textEn: "This has opened new horizons for me. I'm much more confident about the online world now." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "মর্জিনা খাতুন", nameEn: "Morjina Khatun", textBn: "প্রথমে ভয় ছিল, কিন্তু টিমের সহায়তায় সব ভয় কেটে গেছে। এখন ইনকাম শুরু করেছি, খুব ভালো লাগছে।", textEn: "I was scared at first, but the team's support eliminated all fears. I've started earning now." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "শামীমা আক্তার", nameEn: "Shamima Akter", textBn: "যারা এখনো শুরু করেননি, তাদের বলব—সময় নষ্ট না করে শুরু করুন। সঠিক নির্দেশিকা পেতে দেরি করবেন না।", textEn: "To those who haven't started yet — don't waste time, just begin. Don't delay getting proper guidance." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "ফারিয়া ইসলাম", nameEn: "Faria Islam", textBn: "শেখার সুযোগ আর আয়—দুটোই পাচ্ছি। যারা শুরু করবেন, তাদের জন্য এটি সেরা জায়গা।", textEn: "I'm getting both learning and earning. This is the best place for starters." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "সাবিকুন নাহার", nameEn: "Sabikun Nahar", textBn: "সঠিক নির্দেশিকা এবং সহায়তা পেলে যে কেউ সফল হতে পারে। আমি তার উদাহরণ।", textEn: "With proper guidance and support, anyone can succeed. I'm living proof." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "নুসরাত জাহান", nameEn: "Nusrat Jahan", textBn: "নতুনদের ছোট করে দেখা হয় না, যে কোনো প্রশ্নের উত্তর ধৈর্য সহকারে দেওয়া হয়। এটাই আমার সবচেয়ে পছন্দের দিক।", textEn: "Newcomers are never looked down upon. Every question is answered patiently. That's what I like most." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "ইভা রহমান", nameEn: "Eva Rahman", textBn: "শুরুতে ধৈর্য ধরে কাজ করতে হবে, কিন্তু ফলাফল ভালো। আমি এখন সন্তুষ্ট।", textEn: "Need patience initially, but the results are good. I'm satisfied now." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "মামুন মিয়া", nameEn: "Mamun Mia", textBn: "যারা দ্বিধায় আছেন তাদের বলব, শুরু করে দিন। এখানে সঠিক দিকনির্দেশনা পাবেন।", textEn: "To those who are hesitant — just start. You'll get proper guidance here." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "মোর্শেদ মিয়া", nameEn: "Morshed Mia", textBn: "পেশাদার পরিবেশ আর নিয়মিত কাজ — এটাই সবার জন্য দরকার।", textEn: "Professional environment and regular work — that's what everyone needs." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "আনিকা ইসলাম", nameEn: "Anika Islam", textBn: "ই-কমার্সে কাজ করে মাসে ৪০,০০০+ ইনকাম করছি। শুরুতে কেউ বিশ্বাস করেনি, কিন্তু আজ আমি প্রমাণ করেছি।", textEn: "Earning 40,000+ monthly from e-commerce. No one believed at first, but I proved them wrong today." },
];

export const googleDriveData = {
  badgeBn: "📁 কেনার পর পাবেন — ২৩০+ কোর্সের গুগল ড্রাইভ!",
  badgeEn: "📁 What You Get After Purchase — Google Drive with 230+ Courses!",
  titleBn: "জোবায়ের গ্রুপ পেশা — মাস্টার বান্ডেল (২৩০+ কোর্স)",
  titleEn: "Jobayer Group Career — Master Bundle (230+ Courses)",
  statusBn: "🟢 লাইভ",
  statusEn: "🟢 Live",
  folders: [
    { icon: "💼", nameBn: "ফ্রিল্যান্সিং ও আয়", nameEn: "Freelancing & Income" },
    { icon: "🌐", nameBn: "ওয়েব ডেভেলপমেন্ট", nameEn: "Web Development" },
    { icon: "🎨", nameBn: "গ্রাফিক্স ও ভিডিও", nameEn: "Graphics & Video" },
    { icon: "🛒", nameBn: "ই-কমার্স", nameEn: "E-commerce" },
    { icon: "🗣️", nameBn: "ভাষা ও চাকরি", nameEn: "Language & Jobs" },
    { icon: "📱", nameBn: "অ্যাপ ও গেম", nameEn: "App & Game" },
    { icon: "🔐", nameBn: "সাইবার সিকিউরিটি", nameEn: "Cyber Security" },
    { icon: "📒", nameBn: "নোটস", nameEn: "Notes" },
  ],
  footerBn: "⚡ এখনই কিনলে সঙ্গে সঙ্গে গুগল ড্রাইভে সব খুলে যাবে!",
  footerEn: "⚡ Buy now and everything on Google Drive unlocks instantly!",
};

export const checkoutCtaData = {
  headlineBn: "৩০ সেকেন্ডেই শুরু করুন আপনার আয়ের যাত্রা!",
  headlineEn: "Start Your Earning Journey in 30 Seconds!",
  descBn: "নিচে আপনার নাম-ফোন দিন, পেমেন্ট করুন। সাথে সাথেই সব কোর্স ও অ্যাক্সেস চলে আসবে!",
  descEn: "Enter your name & phone, make payment. All courses unlock instantly!",
  ctaBn: "🔥 হ্যাঁ, দাম বাড়ার আগে মাত্র ৯৯ টাকায় আজীবন অ্যাক্সেস নিন →",
  ctaEn: "🔥 Yes, Get Lifetime Access for Only 99 BDT Before Price Hike →",
  timerDuration: 1800,
  timerMin: 300,
  initialQuota: 87,
  badges: [
    { icon: "✅", textBn: "২৩০+ প্রিমিয়াম কোর্স", textEn: "230+ Premium Courses" },
    { icon: "✅", textBn: "লাইফটাইম অ্যাক্সেস", textEn: "Lifetime Access" },
    { icon: "✅", textBn: "২৪ ঘণ্টা নিঃশর্ত ফেরত", textEn: "24h Unconditional Refund" },
    { icon: "✅", textBn: "SSL সুরক্ষিত পেমেন্ট", textEn: "SSL Secured Payment" },
    { icon: "✅", textBn: "সাথে সাথে এক্সেস", textEn: "Instant Access" },
  ],
  paymentBrands: [
    { name: "বিকাশ", nameEn: "bKash", style: "bkash" },
    { name: "নগদ", nameEn: "Nagad", style: "nagad" },
    { name: "রকেট", nameEn: "Rocket", style: "rocket" },
    { name: "SSL কমার্জ", nameEn: "SSL Commerce", style: "ssl" },
  ],
  priceOriginalBn: "১০,০০,০০০+ টাকা",
  priceOriginalEn: "10,00,000+ BDT",
  priceOfferBn: "৯৯ টাকা",
  priceOfferEn: "99 BDT",
  discountLabelBn: "৯৯.৯৯% ছাড়",
  discountLabelEn: "99.99% OFF",
};


export const heroFeatureGridItems = [
  { icon: "🎯+", textBn: "২৩০+ প্রিমিয়াম কোর্স (উপহার)", textEn: "230+ Premium Courses (Gift)" },
  { icon: "📊", textBn: "লাইভ ইনকাম প্রুফ", textEn: "Live Income Proof" },
  { icon: "💳", textBn: "রিয়েল পেমেন্ট প্রুফ", textEn: "Real Payment Proof" },
  { icon: "🔄", textBn: "২৪ ঘন্টা মানি ব্যাক গ্যারান্টি", textEn: "24h Money Back Guarantee" },
];

export const phpSliderTestimonials: Testimonial[] = [
  { stars: "★★★★★", rating: "5.0/5", quoteBn: "\"প্রথমে আমার সন্দেহ ছিল, কিন্তু যোগ দেওয়ার পর প্রথম মাসেই ৪৫,০০০ টাকা আয় করেছি। ট্রেইনাররা অসাধারণ!\"", quoteEn: "\"I was skeptical at first, but after joining I earned ৳45,000 in my first month. The trainers are amazing!\"", authorBn: "রাকিব এইচ", authorEn: "Rakib H.", labelBn: "ফ্রিল্যান্সার, ঢাকা", labelEn: "Freelancer, Dhaka" },
  { stars: "★★★★★", rating: "5.0/5", quoteBn: "\"২৩০+ কোর্স মাত্র ৯৯ টাকায় দারুণ ব্যাপার। কোর্সের মান চমৎকার। সবার জন্য রেকমেন্ডেড!\"", quoteEn: "\"230+ courses for only ৳99 is a steal. The course quality is top-notch. Highly recommend!\"", authorBn: "ফাতিমা কে", authorEn: "Fatima K.", labelBn: "শিক্ষার্থী, চট্টগ্রাম", labelEn: "Student, Chattogram" },
  { stars: "★★★★★", rating: "4.9/5", quoteBn: "\"ক্লায়েন্ট ফাইন্ডিং গাইড একাই দামের ১০ গুণ মূল্যবান। আমি ৩ দিনের মধ্যেই প্রথম প্রজেক্ট পেয়ে গিয়েছি!\"", quoteEn: "\"The client-finding guide alone is worth 10x the price. I landed my first project in 3 days!\"", authorBn: "শাহিন এ", authorEn: "Shahin A.", labelBn: "ওয়েব ডেভেলপার, সিলেট", labelEn: "Web Developer, Sylhet" },
  { stars: "★★★★★", rating: "5.0/5", quoteBn: "\"আগে কিছুই আয় করতাম না। এখন ফ্রিল্যান্সিং থেকে মাসে ২৫,০০০+ টাকা আয় করি। জোবায়ের গ্রুপকে ধন্যবাদ!\"", quoteEn: "\"I was earning nothing before. Now I make ৳25,000+ monthly from freelancing. Thank you Jobayer Group!\"", authorBn: "নুসরাত জে", authorEn: "Nusrat J.", labelBn: "ভার্চুয়াল অ্যাসিস্ট্যান্ট, রাজশাহী", labelEn: "Virtual Assistant, Rajshahi" },
  { stars: "★★★★★", rating: "4.9/5", quoteBn: "\"শুধু ইংরেজি কোর্সগুলিই ৯৯ টাকার চেয়ে অনেক বেশি মূল্যবান। মাত্র ২ সপ্তাহে আমার স্পিকিং স্কিল নাটকীয়ভাবে উন্নত হয়েছে।\"", quoteEn: "\"The English courses alone are worth ৳99. I improved my speaking skills dramatically in just 2 weeks.\"", authorBn: "আরিফ এম", authorEn: "Arif M.", labelBn: "চাকরিপ্রার্থী, খুলনা", labelEn: "Job Seeker, Khulna" },
];

export const trainerPhotoGrid = [
  { nameBn: "আয়মান সাদিক", nameEn: "Ayman Sadiq", specialtyBn: "ইংরেজি ও দক্ষতা উন্নয়ন", specialtyEn: "English & Skill Dev" },
  { nameBn: "মুনজারিন শহীদ", nameEn: "Munzarin Shahid", specialtyBn: "ইংরেজি ভাষা শিক্ষা", specialtyEn: "English Language" },
  { nameBn: "ঝংকার মাহবুব", nameEn: "Jhankar Mahbub", specialtyBn: "প্রোগ্রামিং", specialtyEn: "Programming" },
  { nameBn: "খালিদ ফারহান", nameEn: "Khalid Farhan", specialtyBn: "ফ্রিল্যান্সিং", specialtyEn: "Freelancing" },
  { nameBn: "সাদমান সাদিক", nameEn: "Sadman Sadik", specialtyBn: "গ্রাফিক্স ডিজাইন", specialtyEn: "Graphics Design" },
  { nameBn: "ফ্রিল্যান্সার নাসিম", nameEn: "Freelancer Nasim", specialtyBn: "ফ্রিল্যান্সিং", specialtyEn: "Freelancing" },
  { nameBn: "তাহসান খান", nameEn: "Tahsan Khan", specialtyBn: "কন্টেন্ট ক্রিয়েশন", specialtyEn: "Content Creation" },
  { nameBn: "জুবায়ের হোসাইন", nameEn: "Jubayer Hossain", specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing" },
  { nameBn: "আবতাহি ইপ্তেসাম", nameEn: "Abtahi Iptesam", specialtyBn: "ওয়েব ডেভেলপমেন্ট", specialtyEn: "Web Development" },
  { nameBn: "মাহাদে হাসান", nameEn: "Mahade Hasan", specialtyBn: "ই-কমার্স", specialtyEn: "E-Commerce" },
  { nameBn: "ভৈভব সিসিনিটি", nameEn: "Vaibhav Sisinity", specialtyBn: "ইংরেজি ও পেশাগত", specialtyEn: "English & Professional" },
  { nameBn: "সোবান তারিক", nameEn: "Soban Tariq", specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing" },
];

export const bundlePricingData = {
  totalValueBn: "১০,০০,০০০+ টাকা",
  totalValueEn: "৳10,00,000+",
  offerPriceBn: "৯৯ টাকা",
  offerPriceEn: "৳99",
  savingsTextBn: "আপনি ৯৯.৯% সাশ্রয় করছেন — মাত্র এক বেলা খাবারের দামে ২৩০+ কোর্স!",
  savingsTextEn: "You save 99.9% — 230+ courses for the price of a lunch!",
  platformLogos: [
    { name: "Upwork", icon: "U" },
    { name: "Fiverr", icon: "F" },
    { name: "Shopify", icon: "S" },
    { name: "WordPress", icon: "W" },
    { name: "Amazon", icon: "A" },
    { name: "YouTube", icon: "Y" },
    { name: "Freelancer", icon: "Fr" },
    { name: "Figma", icon: "Fi" },
  ],
};
