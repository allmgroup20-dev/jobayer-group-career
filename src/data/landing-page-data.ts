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
  priceBn?: string;
  priceEn?: string;
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
  headlineBn: "ঘরে বসে মাসে ৫০,০০০+ টাকা আয় — আপনার জীবন বদলান আজই",
  headlineEn: "Earn 50,000+ Tk/Month from Home — Transform Your Life Today",
  subheadBn: "৮৬৬+ শিক্ষার্থী ইতিমধ্যেই আয় শুরু করেছেন। দেশের সেরা ১২ জন প্রশিক্ষকের ২৩০টির বেশি কোর্স — আজীবনের জন্য। এখনই এই সুযোগটি না নিলে আপনি প্রতি মাসে ৫০,০০০+ টাকা হারাচ্ছেন যা আপনি পেতে পারতেন। পছন্দ না হলে ২৪ ঘণ্টায় টাকা ফেরত — কোনো ঝুঁকি নেই।",
  subheadEn: "866+ students are already earning. 230+ courses from Bangladesh's top 12 trainers — lifetime access. By not joining today, you're losing 50,000+ Tk every month that you could be earning. 24h money-back guarantee — zero risk.",
  badges: [
    { icon: "🎯", textBn: "রিয়েল মার্কেট প্রজেক্ট", textEn: "Real Market Projects" },
    { icon: "📚", textBn: "২৩০+ কোর্স", textEn: "230+ Courses" },
    { icon: "👨‍🏫", textBn: "১২ জন বিশেষজ্ঞ", textEn: "12 Expert Trainers" },
    { icon: "💼", textBn: "জব প্লেসমেন্ট", textEn: "Job Placement" },
  ],
  problemBn: "আপনি কি জানেন — শুধু সঠিক স্কিল না থাকার কারণে আপনি প্রতি মাসে ৫০,০০০+ টাকা হারাচ্ছেন? বেশিরভাগ কোর্স শুধু থিওরি দেয় — রিয়েল মার্কেটের জন্য তৈরি করে না। আপনি যত অপেক্ষা করবেন, আপনার প্রতিযোগীরা তত এগিয়ে যাবে। আর এখনই শুরু না করলে এই সুযোগটি আপনার হাতছাড়া হবে।",
  problemEn: "Did you know — you are losing 50,000+ Tk every single month just because you don't have the right skills? Most courses only teach theory — they don't prepare you for the real market. Every month you wait, your competitors move further ahead. Don't let this opportunity slip away.",
  solutionBn: "জোবায়ের গ্রুপ ক্যারিয়ার আপনাকে দেয় — রিয়েল মার্কেট প্রজেক্ট, সরাসরি ক্লায়েন্ট এক্সপোজার, এবং কাজ শেখার পর ইন্টার্নশিপের সুযোগ। এটি শুধু একটি কোর্স নয় — এটি আপনার মাসিক আয় ৫০,০০০+ টাকায় নিয়ে যাওয়ার একটি সিস্টেম। আপনি যখন এই সুযোগটি নেবেন, আপনার জীবন বদলে যাবে।",
  solutionEn: "Jobayer Group Career gives you real market projects, direct client exposure, and internship opportunities — all in one system. This is not just a course — it's a complete system to take your monthly income to 50,000+ Tk. When you take this opportunity, your life will transform.",
  ctaBn: "🚀 এখনই আপনার জীবন বদলান →",
  ctaEn: "🚀 Transform Your Life Now →",
  ctaHref: "/register",
  liveCountLabelBn: "সক্রিয় শিক্ষার্থী (এবং বাড়ছে)",
  liveCountLabelEn: "Active Students (Growing)",
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
    image: "/images/trainers/ayman-sadiq.jpg",
    bioBn: "দেশের শীর্ষ ইংরেজি শিক্ষক ও উদ্যোক্তা। টেন মিনিট স্কুলের প্রতিষ্ঠাতা।",
    bioEn: "Bangladesh's top English teacher and entrepreneur. Founder of 10 Minute School."
  },
  {
    name: "Munzarin Shahid", nameBn: "মুনজারিন শহীদ",
    specialtyBn: "ইংরেজি ভাষা শিক্ষা", specialtyEn: "English Language Teaching",
    credentialBn: "সিনিয়র ট্রেইনার, টেন মিনিট স্কুল", credentialEn: "Senior Trainer, 10 Minute School",
    coursesBn: ["স্পোকেন ইংলিশ কোর্স", "ইংরেজি গ্রামার কোর্স"],
    coursesEn: ["Spoken English Course", "English Grammar Course"],
    image: "/images/trainers/munzereen-shahid.jpg",
    bioBn: "ইংরেজি ভাষা শিক্ষায় দেশের জনপ্রিয় প্রশিক্ষক।",
    bioEn: "Popular English language trainer in Bangladesh."
  },
  {
    name: "Jhankar Mahbub", nameBn: "ঝংকার মাহবুব",
    specialtyBn: "প্রোগ্রামিং ও ওয়েব ডেভেলপমেন্ট", specialtyEn: "Programming & Web Development",
    credentialBn: "লেখক ও প্রোগ্রামার", credentialEn: "Author & Programmer",
    coursesBn: ["ওয়েব ডেভেলপমেন্ট কোর্স", "পাইথন প্রোগ্রামিং"],
    coursesEn: ["Web Development Course", "Python Programming"],
    image: "/images/trainers/jhankar-mahbub.jpg",
    bioBn: "প্রোগ্রামিং ভাষায় বাংলায় বইয়ের জন্য বিখ্যাত।",
    bioEn: "Famous for Bangla programming books."
  },
  {
    name: "Khalid Farhan", nameBn: "খালিদ ফারহান",
    specialtyBn: "ফ্রিল্যান্সিং ও আউটসোর্সিং", specialtyEn: "Freelancing & Outsourcing",
    credentialBn: "সিনিয়র ফ্রিল্যান্সার", credentialEn: "Senior Freelancer",
    coursesBn: ["ফ্রিল্যান্সিং মাস্টারি", "আউটসোর্সিং গাইড"],
    coursesEn: ["Freelancing Mastery", "Outsourcing Guide"],
    image: "/images/trainers/khalid-farhan.jpg",
    bioBn: "ফ্রিল্যান্সিং ও আউটসোর্সিং এ দেশের শীর্ষ প্রশিক্ষক।",
    bioEn: "Top freelancing and outsourcing trainer."
  },
  {
    name: "Sadman Sadik", nameBn: "সাদমান সাদিক",
    specialtyBn: "গ্রাফিক্স ডিজাইন ও মাল্টিমিডিয়া", specialtyEn: "Graphics Design & Multimedia",
    credentialBn: "ক্রিয়েটিভ ডিরেক্টর", credentialEn: "Creative Director",
    coursesBn: ["গ্রাফিক্স ডিজাইন কোর্স", "মাল্টিমিডিয়া কোর্স"],
    coursesEn: ["Graphics Design Course", "Multimedia Course"],
    image: "/images/trainers/sadman-sadik.jpg",
    bioBn: "গ্রাফিক্স ডিজাইন ও মাল্টিমিডিয়ায় বিশেষজ্ঞ প্রশিক্ষক।",
    bioEn: "Graphics design and multimedia expert trainer."
  },
  {
    name: "Freelancer Nasim", nameBn: "ফ্রিল্যান্সার নাসিম",
    specialtyBn: "ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং", specialtyEn: "Freelancing & Digital Marketing",
    credentialBn: "এক্সপার্ট ফ্রিল্যান্সার", credentialEn: "Expert Freelancer",
    coursesBn: ["ফ্রিল্যান্সিং বিগিনার টু অ্যাডভান্সড", "ডিজিটাল মার্কেটিং কোর্স"],
    coursesEn: ["Freelancing Beginner to Advanced", "Digital Marketing Course"],
    image: "/images/trainers/freelancer-nasim.jpg",
    bioBn: "ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং এ হাজারো শিক্ষার্থী তৈরি করেছেন।",
    bioEn: "Has trained thousands in freelancing and digital marketing."
  },
  {
    name: "Tahsan Khan", nameBn: "তাহসান খান",
    specialtyBn: "কন্টেন্ট ক্রিয়েশন ও ইউটিউব", specialtyEn: "Content Creation & YouTube",
    credentialBn: "টপ ক্রিয়েটর", credentialEn: "Top Creator",
    coursesBn: ["ইউটিউব কন্টেন্ট ক্রিয়েশন", "সোশ্যাল মিডিয়া মার্কেটিং"],
    coursesEn: ["YouTube Content Creation", "Social Media Marketing"],
    image: "/images/trainers/tahsan-khan.jpg",
    bioBn: "ইউটিউব ও কন্টেন্ট ক্রিয়েশনে দেশের শীর্ষ ক্রিয়েটর।",
    bioEn: "Top YouTube and content creator in Bangladesh."
  },
  {
    name: "Jubayer Hossain", nameBn: "জুবায়ের হোসাইন",
    specialtyBn: "ডিজিটাল মার্কেটিং ও এসইও", specialtyEn: "Digital Marketing & SEO",
    credentialBn: "ডিজিটাল মার্কেটিং এক্সপার্ট", credentialEn: "Digital Marketing Expert",
    coursesBn: ["ডিজিটাল মার্কেটিং কোর্স", "SEO মাস্টারি"],
    coursesEn: ["Digital Marketing Course", "SEO Mastery"],
    image: "/images/trainers/jubayer-hossain.jpg",
    bioBn: "ডিজিটাল মার্কেটিং ও এসইও বিশেষজ্ঞ।",
    bioEn: "Digital marketing and SEO expert."
  },
  {
    name: "Abtahi Iptesam", nameBn: "আবতাহি ইপ্তেসাম",
    specialtyBn: "ওয়েব ডেভেলপমেন্ট ও টেকনোলজি", specialtyEn: "Web Development & Technology",
    credentialBn: "ওয়েব ডেভেলপার", credentialEn: "Web Developer",
    coursesBn: ["ওয়েব ডেভেলপমেন্ট কোর্স", "টেকনোলজি গাইড"],
    coursesEn: ["Web Development Course", "Technology Guide"],
    image: "/images/trainers/abtahi-iptesam.jpg",
    bioBn: "ওয়েব ডেভেলপমেন্ট ও টেকনোলজি বিষয়ে জনপ্রিয় প্রশিক্ষক।",
    bioEn: "Popular trainer in web development and technology."
  },
  {
    name: "Mahade Hasan", nameBn: "মাহাদে হাসান",
    specialtyBn: "ই-কমার্স ও অনলাইন ব্যবসা", specialtyEn: "E-Commerce & Online Business",
    credentialBn: "ই-কমার্স এক্সপার্ট", credentialEn: "E-Commerce Expert",
    coursesBn: ["ই-কমার্স বিগিনার টু প্রো", "শপিফাই স্টোর সেটআপ"],
    coursesEn: ["E-Commerce Beginner to Pro", "Shopify Store Setup"],
    image: "/images/trainers/mahade-hasan.jpg",
    bioBn: "ই-কমার্স ও অনলাইন ব্যবসায় বিশেষজ্ঞ প্রশিক্ষক।",
    bioEn: "E-commerce and online business expert trainer."
  },
  {
    name: "Vaibhav Sisinity", nameBn: "ভৈভব সিসিনিটি",
    specialtyBn: "ইংরেজি ও পেশাগত উন্নয়ন", specialtyEn: "English & Professional Development",
    credentialBn: "কমিউনিকেশন এক্সপার্ট", credentialEn: "Communication Expert",
    coursesBn: ["ইংলিশ ফর প্রফেশনালস", "কমিউনিকেশন মাস্টারক্লাস"],
    coursesEn: ["English for Professionals", "Communication Masterclass"],
    image: "/images/trainers/vaibhav-sisinity.jpg",
    bioBn: "ইংরেজি যোগাযোগ ও পেশাগত উন্নয়নে আন্তর্জাতিক প্রশিক্ষক।",
    bioEn: "International trainer in English communication and professional development."
  },
  {
    name: "Soban Tariq", nameBn: "সোবান তারিক",
    specialtyBn: "ডিজিটাল মার্কেটিং ও ব্র্যান্ডিং", specialtyEn: "Digital Marketing & Branding",
    credentialBn: "ডিজিটাল মার্কেটিং বিশেষজ্ঞ", credentialEn: "Digital Marketing Specialist",
    coursesBn: ["ডিজিটাল মার্কেটিং স্ট্র্যাটেজি", "ব্র্যান্ডিং মাস্টারি"],
    coursesEn: ["Digital Marketing Strategy", "Branding Mastery"],
    image: "/images/trainers/soban-tariq.jpg",
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
    priceBn: "২০,০০০", priceEn: "20,000",
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
    priceBn: "২৫,০০০", priceEn: "25,000",
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
    priceBn: "১০,০০০", priceEn: "10,000",
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
    priceBn: "১৪,০০০", priceEn: "14,000",
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
    priceBn: "১৮,০০০", priceEn: "18,000",
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
    priceBn: "৮,৫০০", priceEn: "8,500",
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
    priceBn: "১৬,০০০", priceEn: "16,000",
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
    priceBn: "৬,০০০", priceEn: "6,000",
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
    priceBn: "৩,৫০০", priceEn: "3,500",
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
    quoteBn: "আমি আগে কখনো অনলাইনে কাজ করিনি। জোবায়ের গ্রুপের নির্দেশিকা আর সহায়তার কারণে আজ আমি নিজের ল্যাপটপ থেকে মাসে ২৫,০০০+ টাকা ইনকাম করছি। শুরুটা ছিল ৯৯ টাকা, কিন্তু ভ্যালু পেয়েছি লক্ষ টাকার বেশি!",
    quoteEn: "I never worked online before. Thanks to Jobayer Group's guidance, I now earn 25,000+ BDT monthly from my laptop. Started with just 99 BDT, but got value worth lakhs!",
    authorBn: "মিতা ইসলাম", authorEn: "Mita Islam",
    labelBn: "ফ্রিল্যান্সার, সিলেট", labelEn: "Freelancer, Sylhet" },
  { stars: "★★★★★", rating: "4.9/5",
    quoteBn: "ইউটিউবে অনেক কিছু ফ্রিতে পাওয়া যায়, কিন্তু স্ট্রাকচার আর দিকনির্দেশনা ছাড়া শেখা অসম্পূর্ণ। এই কোর্সটা আমাকে রিয়েল মার্কেটের জন্য প্রস্তুত করেছে। এখন নিয়মিত ক্লায়েন্ট পাচ্ছি। সবার কাছে রেকমেন্ড করব!",
    quoteEn: "YouTube has lots of free content, but learning without structure is incomplete. This course prepared me for the real market. I'm getting regular clients now. Highly recommend!",
    authorBn: "নীলা হোসেন", authorEn: "Neela Hossain",
    labelBn: "ডিজিটাল মার্কেটার, ঢাকা", labelEn: "Digital Marketer, Dhaka" },
  { stars: "★★★★★", rating: "5.0/5",
    quoteBn: "শুরুতে ভেবেছিলাম এটা আর দশটা অনলাইন স্ক্যাম হবে। কিন্তু জোবায়ের গ্রুপের ট্রান্সপারেন্সি আর রিয়েল শিক্ষার্থী ফলাফল দেখে কনফিডেন্ট হলাম। ৭ মাসে এখন মাসিক আয় ৪০,০০০+। সবচেয়ে বড় কথা, একটা সহায়ক কমিউনিটি পেয়েছি।",
    quoteEn: "I initially thought this was just another online scam. But Jobayer Group's transparency and real student results made me confident. Now earning 40,000+ monthly in 7 months. Most importantly, I found a supportive community.",
    authorBn: "রাফসান জামান", authorEn: "Rafsan Zaman",
    labelBn: "ই-কমার্স আর্নার, চট্টগ্রাম", labelEn: "E-commerce Earner, Chittagong" },
];

export const faqs: FaqItem[] = [
  { qBn: "💵 বিনামূল্যে রেজিস্টার করে কি সত্যিই অনলাইনে আয় করা সম্ভব?", qEn: "💵 Can I really earn online by registering for free?",
    aBn: "আমি আপনার প্রশ্ন বুঝতে পারছি। আমাদের ৮৬৬+ শিক্ষার্থীর অনেকেই প্রথমে একই প্রশ্ন করেছিলেন। কিন্তু তারা পরে খুঁজে পেয়েছেন যে সঠিক গাইড ও সিস্টেম থাকলে যে কেউ মাসে ৫০,০০০+ টাকা আয় করতে পারেন। সুযোগটি হাতছাড়া না করে আজই শুরু করুন।",
    aEn: "I understand your question. Many of our 866+ students felt the same way at first. But they found that with the right guidance and system, anyone can earn 50,000+ BDT monthly. Don't let this opportunity slip away — start today." },
  { qBn: "🛡️ এটি কি কোনো স্ক্যাম বা ফেক প্রোগ্রাম?", qEn: "🛡️ Is this a scam or fake program?",
    aBn: "এটি একটি সম্পূর্ণ বৈধ প্রোগ্রাম। জোবায়ের গ্রুপ ৮+ বছর ধরে কাজ করছে এবং আমরা ২৪ ঘণ্টায় টাকা ফেরত দিই — কোনো প্রতারক কোম্পানি টাকা ফেরত দেয় না। আপনি যখন নিশ্চিত হবেন যে এটি কাজ করে, তখনই কেবল টাকা দেবেন।",
    aEn: "This is completely legitimate. Jobayer Group has been operating for 8+ years and we offer 24h money back — no scam company does that. You only pay when you're confident it works for you." },
  { qBn: "📱 আমার কোনো পূর্ব অভিজ্ঞতা নেই — তবু কি পারব?", qEn: "📱 I have no prior experience — can I still do it?",
    aBn: "অবশ্যই পারবেন! অনেক সফল শিক্ষার্থী আপনার মতোই কোনো অভিজ্ঞতা ছাড়াই শুরু করেছিলেন। তাদের প্রত্যেকেই প্রমাণ করেছেন — আপনার শুধু দরকার একটি স্মার্টফোন এবং শেখার ইচ্ছা। বাকি সব আমরা দিচ্ছি: স্টেপ-বাই-স্টেপ গাইড, ২৪/৭ সাপোর্ট, এবং একটি প্রমাণিত সিস্টেম।",
    aEn: "Absolutely! Many of our successful students started with zero experience, just like you. They all proved that all you need is a smartphone and a willingness to learn. We provide the rest: step-by-step guidance, 24/7 support, and a proven system." },
  { qBn: "💰 কত তাড়াতাড়ি আমি প্রথম পেমেন্ট পাব?", qEn: "💰 How soon will I get my first payment?",
    aBn: "বেশিরভাগ শিক্ষার্থী প্রথম মাসেই ১,১০০ - ৫,০০০+ টাকা আয় শুরু করেন। কেউ কেউ প্রথম সপ্তাহেই পেমেন্ট পেয়েছেন। আপনি যত দ্রুত শুরু করবেন, তত দ্রুত আয় শুরু হবে। অপেক্ষা করলে আপনি প্রতি মাসে ৫০,০০০+ টাকা হারাচ্ছেন যা আপনি পেতে পারতেন।",
    aEn: "Most students start earning 1,100 - 5,000+ BDT in their first month. Some get their first payment within the first week. The sooner you start, the sooner you earn. Every month you wait, you're losing 50,000+ Tk you could be making." },
  { qBn: "🔄 কি মাসিক ফি দিতে হবে? নাকি একবারই দিলেই হবে?", qEn: "🔄 Is there a monthly fee or one-time payment?",
    aBn: "একবার রেজিস্টার করলেই আজীবন অ্যাক্সেস! কোনো মাসিক ফি নেই, কোনো লুকানো চার্জ নেই। এটি একটি এককালীন বিনিয়োগ যা আপনার পুরো জীবনের আয় বদলে দিতে পারে।",
    aEn: "Register once and get lifetime access! No monthly fees, no hidden charges. This is a one-time investment that can transform your entire lifetime income." },
  { qBn: "📥 রেজিস্টার করার পর কীভাবে কোর্স অ্যাক্সেস পাব?", qEn: "📥 How do I access courses after registration?",
    aBn: "রেজিস্টার করার ১ মিনিটের মধ্যে আপনার ইমেইলে ও হোয়াটসঅ্যাপে গুগল ড্রাইভ লিংক চলে যাবে। সাথে সাথেই সব কোর্স ও টুলস অ্যাক্সেস করতে পারবেন। এর চেয়ে সহজ আর কিছু হতে পারে না।",
    aEn: "Within 1 minute of registration, a Google Drive link will be sent to your email and WhatsApp. You can access all courses and tools immediately. It couldn't be simpler." },
  { qBn: "🎓 আমি কি একসাথে সব কোর্স করতে পারব?", qEn: "🎓 Can I take all courses at once?",
    aBn: "হ্যাঁ, আপনি যেকোনো সময় যেকোনো কোর্স শুরু করতে পারেন। সব কোর্স আপনার জন্য উন্মুক্ত থাকবে আজীবনের জন্য। এটি একটি সুযোগ যা আপনার ক্যারিয়ার বদলে দিতে পারে — এখনই নিন।",
    aEn: "Yes, you can start any course at any time. All courses remain open to you for life. This is an opportunity that can transform your career — take it now." },
  { qBn: "📞 রেজিস্টার করতে সমস্যা হলে কী করব?", qEn: "📞 What if I face issues registering?",
    aBn: "আমাদের ২৪/৭ সাপোর্ট টিম সবসময় আপনার জন্য প্রস্তুত। ফোন, ইমেইল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন। আমরা আছি আপনার সাফল্যের জন্য — আপনি একা নন।",
    aEn: "Our 24/7 support team is always ready to help. Contact us by phone, email, or WhatsApp. We're here for your success — you're not alone." },
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
  { src: "/images/payments/payment-11.jpg", alt: "Student payment proof" },
  { src: "/images/payments/payment-12.jpg", alt: "Student payment proof" },
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
  "Ayesha Rahman","সুমনা দাস","Priya Saha","Farzana Akter","বিজয় বড়ুয়া",
  "Tasnim Karim","রিনা পাল","মাহিরা নূর","Daniel Gomes","Tanjila Islam",
  "তপন দাস","সুমাইয়া আহমেদ","Milan Roy","Lamia Sultana","জিতু ত্রিপুরা",
  "Sohana Noor","বৃষ্টি রায়","রাবেয়া খাতুন","Peter Costa","Tamanna Yasmin",
  "Mariam Akter","লতা বিশ্বাস","আফিফা করিম","Robin Rozario","Nabila Rahman",
  "রাকেশ শীল","Sabina Islam","ডলি সরকার","তাসমিয়া রহমান","Ananda Das",
  "Farhin Sultana","শিউলি রানী","Shabnam Yasmin","Rony Marma","সামিয়া নূর",
  "John Tripura","Rukhsana Begum","সাগর রায়","Hira Ahmed","নির্মল বড়ুয়া",
  "সাদিয়া করিম","Rita Paul","Mehnaz Akter","ডেভিড কস্তা","Nuzhat Jahan",
  "কাব্য পাল","Maliha Noor","উজ্জ্বল দাস","Ishrat Sultana","Pinky Rani",
  "মাহজাবীন নূর","Simon Gomes","Tasnia Islam","বরুণ দাস","Labiba Noor",
  "রিমা সরকার","Afreen Karim","জুয়েল বড়ুয়া","Saima Rahman","রতন মারমা",
  "Halima Khatun","Tanmoy Saha","Fariha Sultana","অনিল বড়ুয়া","Amina Begum",
  "তুলি রানী","Sharmeen Akter","Victor Rozario","Zannat Ara","লিমন ত্রিপুরা",
  "Humaira Noor","রেখা বালা","Farzana Rahman","বর্ষা রায়","Nusrat Sultana",
  "Rafia Islam","Sujan Barua","Afsana Karim","Tamanna Islam","Samira Ahmed",
];

export const liveNotifText = {
  joinedRecent: "থেকে সদ্য যুক্ত হয়েছেন!",
  joinedRecentEn: "just joined!",
};

export const liveSalaryText = {
  badgeBn: "📊 লাইভ আপডেট",
  badgeEn: "📊 Live Updates",
  titleBn: "লাইভ — বোনাস বিতরণ করা হচ্ছে 🟢",
  titleEn: "Live — Bonuses Are Being Distributed 🟢",
  subtitleBn: "এই মুহূর্তে কে কত টাকা আয় করছে তা নিচে দেখুন — প্রতি মুহূর্তে নতুন আয়ের খবর আসছে!",
  subtitleEn: "See who is earning how much right now — new earnings updates every moment!",
  successStatusBn: "নগদ অ্যাকাউন্টে ট্রান্সফার সম্পন্ন হয়েছে",
  successStatusEn: "Transfer to cash account completed",
  bonusStatusBn: "বোনাস দেওয়া হয়েছে",
  bonusStatusEn: "Bonus given",
  liveNotifJoined: "থেকে সদ্য যুক্ত হয়েছেন এবং কোর্স এক্সেস পেয়েছেন!",
  liveNotifJoinedEn: "just joined and got course access!",
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
    badgeBn: "⚠️ এই সুযোগটি হারাচ্ছেন না তো?",
    badgeEn: "⚠️ Are You Missing This Opportunity?",
    items: [
      {
        icon: "⚠️",
        titleBn: "আপনি প্রতি মাসে হাজার হাজার টাকা হারাচ্ছেন সঠিক স্কিল না থাকার কারণে",
        titleEn: "You're losing thousands every month without the right skills",
        descBn: "আপনার প্রতিযোগীরা এগিয়ে যাচ্ছে, আপনি পিছিয়ে পড়ছেন",
        descEn: "Your competitors are moving ahead while you fall behind",
      },
      {
        icon: "⚠️",
        titleBn: "প্রিমিয়াম কোর্স ১০,০০০-৮৫,০০০ টাকা — আপনার বাজেটের বাইরে",
        titleEn: "Premium courses cost 10,000-85,000+ BDT — out of budget",
        descBn: "আপনি affordable কোর্স খুঁজছেন কিন্তু পাচ্ছেন না",
        descEn: "You want affordable courses but can't find them",
      },
      {
        icon: "⚠️",
        titleBn: "ইউটিউবে কন্টেন্ট আছে কিন্তু স্ট্রাকচারড রোডম্যাপ নেই — সময় নষ্ট হচ্ছে",
        titleEn: "YouTube has content but no roadmap — you're wasting time",
        descBn: "কী শিখবেন, কোথা থেকে শুরু করবেন — আপনি বিভ্রান্ত",
        descEn: "What to learn, where to start — you're confused",
      },
      {
        icon: "⚠️",
        titleBn: "শেখার পর ইনকাম শুরু করবেন কীভাবে — কেউ সেই পথ দেখায় না",
        titleEn: "After learning, how to earn — nobody shows this path",
        descBn: "অধিকাংশ কোর্স অসম্পূর্ণ — শিখেও কাজে লাগাতে পারেন না",
        descEn: "Most courses are incomplete — you learn but can't apply",
      },
      {
        icon: "⚠️",
        titleBn: "সঠিক গাইডলাইন না থাকায় সময় ও টাকা দুটোই নষ্ট হচ্ছে",
        titleEn: "Without proper guidance, you're wasting both time and money",
        descBn: "এক জায়গায় সব পেলে কত ভালো হত!",
        descEn: "If only everything was in one place!",
      },
    ],
  },
  solution: {
    badgeBn: "💡 এখন এই সুযোগটি নিন — আপনার জীবন বদলান",
    badgeEn: "💡 Take This Opportunity — Transform Your Life",
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
  { stars: "★★★★★", rating: "5.0/5", nameBn: "করিম মিয়া", nameEn: "Karim Mia", textBn: "৩ মাসের মধ্যেই প্রথম ক্লায়েন্ট পেয়ে গিয়েছি। এখন মাসে ১৮,০০০+ টাকা আয় করছি। যারা শুরু করতে চান, তাদের বলব—শুধু শুরু করুন!", textEn: "Got my first client within 3 months. Now earning 18,000+ BDT monthly. To those wanting to start — just begin!" },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "শাহিনা বেগম", nameEn: "Shahina Begum", textBn: "গৃহিণী হয়েও যে অনলাইনে এত ভালো আয় করা যায়, তা আগে কল্পনাও করিনি। এখন মাসে ১২,০০০+ টাকা আয় করছি। সংসারে হাত লাগাতে পারছি।", textEn: "Never imagined a housewife could earn this much online. Now earning 12,000+ BDT monthly and supporting my family." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "রাসেল আহমেদ", nameEn: "Rasel Ahmed", textBn: "চাকরি হারানোর পর হতাশায় ছিলাম। জোবায়ের গ্রুপের ফ্রিল্যান্সিং কোর্স আমাকে নতুন পথ দেখিয়েছে। এখন আপওয়ার্কে মাসে ৩৫,০০০+ টাকা আয় করছি।", textEn: "Was depressed after losing my job. Jobayer Group's freelancing course showed me a new path. Now earning 35,000+ BDT monthly on Upwork." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "নাছিমা আক্তার", nameEn: "Nashima Akter", textBn: "স্কিল ডেভেলপমেন্টের জন্য ভর্তি হয়েছিলাম, কিন্তু আয়ের সুযোগ পেয়ে গিয়েছি। প্রথম মাসেই ৮,০০০+ টাকা আয়! অসাধারণ এক প্ল্যাটফর্ম।", textEn: "Joined for skill development but found earning opportunities. Earned 8,000+ BDT in the first month! An amazing platform." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "তৌহিদুল ইসলাম", nameEn: "Touhidul Islam", textBn: "ওয়েব ডেভেলপমেন্ট শিখে এখন ফ্রিল্যান্সিং করছি। ৬ মাসে মাসিক আয় ৫০,০০০+। জোবায়ের গ্রুপের কোর্স ছাড়া এটা সম্ভব ছিল না।", textEn: "Learned web development and now freelancing. Monthly income 50,000+ BDT in 6 months. Impossible without Jobayer Group's course." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "সুফিয়া খাতুন", nameEn: "Sufia Khatun", textBn: "মেয়েকে নিয়ে থাকি, স্বামী নেই। অনলাইনে কাজ শিখে এখন মাসে ২০,০০০+ টাকা আয় করছি। মেয়ের পড়ার খরচ নিজেই দিতে পারছি। আল্লাহর পর জোবায়ের গ্রুپকে ধন্যবাদ।", textEn: "Single mother raising my daughter. Learned online work and now earn 20,000+ BDT monthly. Can pay for my daughter's education myself. Thank you Jobayer Group!" },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "জাহিদ করিম", nameEn: "Jahid Karim", textBn: "ছোটবেলা থেকে প্রোগ্রামিং শেখার ইচ্ছা ছিল। এই প্ল্যাটফর্মে পাইথন ও জাভা শিখে এখন সফটওয়্যার কোম্পানিতে চাকরি করছি। স্যালারি ৪৫,০০০+।", textEn: "Always wanted to learn programming. Learned Python & Java here and now work at a software company. Salary 45,000+ BDT." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "রোকেয়া বেগম", nameEn: "Rokeya Begum", textBn: "বয়স ৪৫, কম্পিউটার চালানো শিখেছি এই প্ল্যাটফর্ম থেকে। আজ ফাইভারে গ্রাফিক্স ডিজাইন করে মাসে ১৫,০০০+ টাকা আয় করছি। বয়স কোনো বাধা না!", textEn: "Age 45, learned computer skills from this platform. Now earning 15,000+ BDT monthly on Fiverr doing graphic design. Age is no barrier!" },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "ইমরান খান", nameEn: "Imran Khan", textBn: "ইংলিশে দুর্বল ছিলাম, স্পোকেন ইংলিশ কোর্সটা আমার জীবন বদলে দিয়েছে। এখন কল সেন্টারে চাকরি করছি। মাসে ৩০,০০০+ ইনকাম।", textEn: "Was weak in English. The spoken English course changed my life. Now working at a call center earning 30,000+ BDT monthly." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "পারভীন সুলতানা", nameEn: "Parvin Sultana", textBn: "গ্রামের বাড়ি থেকে বসেই অনলাইনে কাজ করতে পারব ভাবিনি। এখন মাসে ২২,০০০+ টাকা আয় করছি। সবাই ভেবেছিল এটা সম্ভব না।", textEn: "Never thought I could work online from my village home. Now earning 22,000+ BDT monthly. Everyone thought it was impossible." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "মিজানুর রহমান", nameEn: "Mizanur Rahman", textBn: "বেকার ছিলাম ২ বছর। ফ্রিল্যান্সিং কোর্স করার পর এখন ইউটিউব থেকে মাসে ২৮,০০০+ টাকা আয় করছি। জীবনটা বদলে গেছে।", textEn: "Was unemployed for 2 years. After the freelancing course, now earning 28,000+ BDT monthly from YouTube. Life has changed." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "আছিয়া বেগম", nameEn: "Ashiya Begum", textBn: "স্বামী প্রবাসী, আমি একা সংসার দেখি। এই কোর্স করে এখন নিজের পায়ে দাঁড়িয়েছি। মাসে ১৬,০০০+ আয়। অসম্ভবকে সম্ভব করেছেন জোবায়ের গ্রুপ।", textEn: "Husband lives abroad, I manage the household alone. After this course, I'm now independent. Earning 16,000+ BDT monthly. Jobayer Group made the impossible possible." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "সাজ্জাদ হোসেন", nameEn: "Sazzad Hossain", textBn: "ডিজিটাল মার্কেটিং শিখে এখন নিজের এজেন্সি খুলেছি। ৩ জন কর্মচারী। মাসে ৬০,০০০+ আয়। সবার কাছে রেকমেন্ড করব এই প্ল্যাটফর্ম।", textEn: "Learned digital marketing and opened my own agency with 3 employees. Earning 60,000+ BDT monthly. Highly recommend this platform." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "লায়লা আক্তার", nameEn: "Laila Akter", textBn: "ভাষা ও চাকরি বিভাগের কোর্সগুলো অসাধারণ। IELTS প্রস্তুতি নিয়ে এখন কানাডায় পড়তে যাচ্ছি। স্বপ্ন পূরণের পথ দেখিয়েছে জোবায়ের গ্রুপ।", textEn: "The language & jobs courses are amazing. Prepared for IELTS through this and now going to Canada for studies. Jobayer Group showed me the path to my dream." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "আমিনুল ইসলাম", nameEn: "Aminul Islam", textBn: "ই-কমার্স কোর্স করে শপিফাই স্টোর খুলেছি। প্রথম মাসেই ১২,০০০+ টাকা সেলস! এখন পুরোদমে ব্যবসা করছি। বড় হওয়ার স্বপ্ন দেখছি।", textEn: "Opened a Shopify store after the e-commerce course. 12,000+ BDT sales in the first month! Now running a full business. Dreaming big." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "রাহেলা খাতুন", nameEn: "Rahela Khatun", textBn: "ছেলেকে নিয়ে থাকি, আয়ের তেমন পথ ছিল না। এই প্ল্যাটফর্মে ভার্চুয়াল অ্যাসিস্ট্যান্ট কোর্স করে এখন মাসে ১৮,০০০+ টাকা আয় করছি।", textEn: "Live with my son, had no income source. After the VA course on this platform, now earning 18,000+ BDT monthly." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "শরীফ হাসান", nameEn: "Sharif Hasan", textBn: "SEO শিখে এখন ফাইভারে টॉप রেটেড সেলার। মাসে ৪০,০০০+ টাকা আয়। এই প্ল্যাটফর্মের SEO কোর্সই আমার সাফল্যের চাবিকাঠি।", textEn: "Learned SEO and now a top-rated seller on Fiverr. Earning 40,000+ BDT monthly. This platform's SEO course was the key to my success." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "মনিরা বেগম", nameEn: "Monira Begum", textBn: "মোবাইল দিয়েই সব শিখেছি। ল্যাপটপ ছিল না, কিন্তু তাতেও সমস্যা হয়নি। এখন মোবাইল দিয়েই কন্টেন্ট রাইটিং করে মাসে ১৪,০০০+ টাকা আয় করছি।", textEn: "Learned everything using just my mobile phone. Didn't have a laptop but that wasn't a problem. Now earning 14,000+ BDT monthly through content writing on my phone." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "ফরহাদ মিয়া", nameEn: "Farhad Mia", textBn: "ইউটিউব মার্কেটিং কোর্সটা সোনায় মোড়ানো। আমার চ্যানেল এখন ৫০K সাবস্কাইবার। মাসে ২৫,০০০+ গুগল অ্যাডসেন্স আয়। অসাধারণ!", textEn: "The YouTube marketing course is pure gold. My channel now has 50K subscribers. Earning 25,000+ BDT monthly from Google AdSense. Amazing!" },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "ছবি আক্তার", nameEn: "Chobi Akter", textBn: "গ্রাফিক্স ডিজাইন শিখে আজ আমি একজন পেশাদার ডিজাইনার। ফাইভার ও ফেসবুক থেকে মাসে ৩২,০০০+ টাকা আয়। এই প্ল্যাটফর্ম না থাকলে আজ আমি এখানে থাকতাম না।", textEn: "Learned graphic design and today I'm a professional designer. Earning 32,000+ BDT monthly from Fiverr & Facebook. Wouldn't be here without this platform." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "হাসান মাহমুদ", nameEn: "Hasan Mahmud", textBn: "ফেসবুক অ্যাডস মাস্টারি কোর্স করে এখন ক্লায়েন্টদের অ্যাড ম্যানেজ করি। মাসে ৫৫,০০০+ আয়। কোন কলেজের ডিগ্রি এই মূল্য দেয়নি।", textEn: "After the Facebook Ads Mastery course, I now manage ads for clients. Earning 55,000+ BDT monthly. No college degree gave me this value." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "নূরজাহান বেগম", nameEn: "Noorjahan Begum", textBn: "বিয়ে শেষ, সংসারে সমস্যা। অনলাইনে কাজ শিখে নিজের পায়ে দাঁড়িয়েছি। মাসে ২১,০০০+ আয়। আত্মবিশ্বাস ফিরে পেয়েছি। জোবায়ের গ্রুপকে লক্ষ কোটি ধন্যবাদ।", textEn: "Marriage ended, family issues. Learned online work and became independent. Earning 21,000+ BDT monthly. Got my confidence back. Countless thanks to Jobayer Group." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "রিয়াজ উদ্দিন", nameEn: "Riaz Uddin", textBn: "এমএস অফিস ও এক্সেল শিখে এখন একটি ব্যাংকে চাকরি পেয়েছি। কম্পিউটার বেসিক কোর্সটা আমার ক্যারিয়ার বদলে দিয়েছে। সবার জন্য রেকমেন্ডেড!", textEn: "Learned MS Office & Excel and got a job at a bank. The computer basic course changed my career. Highly recommended for everyone!" },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "সেলিনা আক্তার", nameEn: "Selina Akter", textBn: "ইন্টারনেট কীভাবে ব্যবহার করতে হয় শিখেছি এই প্ল্যাটফর্ম থেকে। আজ আমি ফেসবুক মার্কেটিং করে মাসে ২০,০০০+ আয় করছি। কখনো ভাবিনি পারব!", textEn: "Learned how to use the internet from this platform. Today I earn 20,000+ BDT monthly from Facebook marketing. Never thought I could!" },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "মাহবুব আলম", nameEn: "Mahbub Alam", textBn: "ফ্রিল্যান্সিং শিখে এখন বিদেশি ক্লায়েন্টদের সাথে কাজ করছি। মাসে ৭০,০০০+ টাকা আয়। জোবায়ের গ্রুপের ফ্রিল্যান্সিং কোর্স ছাড়া এত দূর আসতে পারতাম না।", textEn: "Learned freelancing and now working with international clients. Earning 70,000+ BDT monthly. Couldn't have come this far without Jobayer Group's freelancing course." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "তাসনিম জাহান", nameEn: "Tasnim Jahan", textBn: "ইংরেজি গ্রামার ১০১ ও ১০২ কোর্স দুইটাই অসাধারণ। এখন ইংরেজিতে fluent। ইনশাআল্লাহ বিদেশে উচ্চশিক্ষার জন্য আবেদন করব। ধন্যবাদ জোবায়ের গ্রুপ।", textEn: "English Grammar 101 & 102 courses are amazing. Now fluent in English. Will apply for higher studies abroad InshaAllah. Thank you Jobayer Group." },
  { stars: "★★★★★", rating: "4.9/5", nameBn: "জাকির হোসেন", nameEn: "Jakir Hossain", textBn: "গুগল অ্যাডস ও অ্যানালিটিক্স শিখে এখন নিজেই ডিজিটাল মার্কেটিং এজেন্সি চালাই। মাসে ৮০,০০০+ টাকা আয়। এই প্ল্যাটফর্মের প্রতিটি কোর্স প্র্যাকটিক্যাল।", textEn: "Learned Google Ads & Analytics and now run my own digital marketing agency. Earning 80,000+ BDT monthly. Every course here is practical." },
  { stars: "★★★★★", rating: "4.8/5", nameBn: "হালিমা বেগম", nameEn: "Halima Begum", textBn: "ছোট বাচ্চা নিয়ে বসে থাকতাম। এখন অনলাইনে ডাটা এন্ট্রি করে মাসে ১০,০০০+ টাকা আয় করছি। নিজের কিছু আয় হচ্ছে—অনেক ভালো লাগছে।", textEn: "Used to sit at home with young kids. Now earning 10,000+ BDT monthly through online data entry. Having my own income feels great." },
  { stars: "★★★★★", rating: "5.0/5", nameBn: "মোশাররফ হোসেন", nameEn: "Mosharraf Hossain", textBn: "রোবোটিক্স ও গেম ডেভেলপমেন্ট কোর্স আমার ছেলের জন্য কিনেছিলাম। ছেলে এখন নিজেই গেম বানায় এবং অনলাইনে sells করে। মাসে ১৫,০০০+ আয় করছে।", textEn: "Bought the robotics & game dev courses for my son. He now makes his own games and sells them online. Earning 15,000+ BDT monthly." },
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
  { nameBn: "আয়মান সাদিক", nameEn: "Ayman Sadiq", specialtyBn: "ইংরেজি ও দক্ষতা উন্নয়ন", specialtyEn: "English & Skill Dev", image: "/images/trainers/ayman-sadiq.jpg" },
  { nameBn: "মুনজারিন শহীদ", nameEn: "Munzarin Shahid", specialtyBn: "ইংরেজি ভাষা শিক্ষা", specialtyEn: "English Language", image: "/images/trainers/munzereen-shahid.jpg" },
  { nameBn: "ঝংকার মাহবুব", nameEn: "Jhankar Mahbub", specialtyBn: "প্রোগ্রামিং", specialtyEn: "Programming", image: "/images/trainers/jhankar-mahbub.jpg" },
  { nameBn: "খালিদ ফারহান", nameEn: "Khalid Farhan", specialtyBn: "ফ্রিল্যান্সিং", specialtyEn: "Freelancing", image: "/images/trainers/khalid-farhan.jpg" },
  { nameBn: "সাদমান সাদিক", nameEn: "Sadman Sadik", specialtyBn: "গ্রাফিক্স ডিজাইন", specialtyEn: "Graphics Design", image: "/images/trainers/sadman-sadik.jpg" },
  { nameBn: "ফ্রিল্যান্সার নাসিম", nameEn: "Freelancer Nasim", specialtyBn: "ফ্রিল্যান্সিং", specialtyEn: "Freelancing", image: "/images/trainers/freelancer-nasim.jpg" },
  { nameBn: "তাহসান খান", nameEn: "Tahsan Khan", specialtyBn: "কন্টেন্ট ক্রিয়েশন", specialtyEn: "Content Creation", image: "/images/trainers/tahsan-khan.jpg" },
  { nameBn: "জুবায়ের হোসাইন", nameEn: "Jubayer Hossain", specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing", image: "/images/trainers/jubayer-hossain.jpg" },
  { nameBn: "আবতাহি ইপ্তেসাম", nameEn: "Abtahi Iptesam", specialtyBn: "ওয়েব ডেভেলপমেন্ট", specialtyEn: "Web Development", image: "/images/trainers/abtahi-iptesam.jpg" },
  { nameBn: "মাহাদে হাসান", nameEn: "Mahade Hasan", specialtyBn: "ই-কমার্স", specialtyEn: "E-Commerce", image: "/images/trainers/mahade-hasan.jpg" },
  { nameBn: "ভৈভব সিসিনিটি", nameEn: "Vaibhav Sisinity", specialtyBn: "ইংরেজি ও পেশাগত", specialtyEn: "English & Professional", image: "/images/trainers/vaibhav-sisinity.jpg" },
  { nameBn: "সোবান তারিক", nameEn: "Soban Tariq", specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing", image: "/images/trainers/soban-tariq.jpg" },
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
