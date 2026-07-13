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

export interface CourseCategory {
  id: string;
  icon: string;
  titleBn: string;
  titleEn: string;
  platformLogos: string[];
  trainers: string[];
  courses: { nameBn: string; nameEn: string }[];
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
    name: "Tanvirul Islam", nameBn: "তানভিরুল ইসলাম",
    specialtyBn: "ইংরেজি ও নেতৃত্ব", specialtyEn: "English & Leadership",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৮+ বছর", credentialEn: "Expert Trainer, 8+ years",
    coursesBn: ["ইংরেজি ভাষা কোর্স", "পাবলিক স্পিকিং কোর্স"],
    coursesEn: ["English Language Course", "Public Speaking Course"],
    image: "/images/trainers/default.jpg",
    bioBn: "ইংরেজি ভাষা ও নেতৃত্ব উন্নয়নে দেশের শীর্ষ প্রশিক্ষক।",
    bioEn: "Top trainer in English language and leadership development."
  },
  {
    name: "Shariful Islam", nameBn: "শরিফুল ইসলাম",
    specialtyBn: "ইংরেজি ও ভর্তি", specialtyEn: "English & Admission",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৭+ বছর", credentialEn: "Expert Trainer, 7+ years",
    coursesBn: ["Duolingo ইংলিশ টেস্ট কোর্স", "বিশ্ববিদ্যালয় ভর্তি গাইড"],
    coursesEn: ["Duolingo English Test Course", "University Admission Guide"],
    image: "/images/trainers/default.jpg",
    bioBn: "ইংরেজি পরীক্ষা ও বিশ্ববিদ্যালয় ভর্তি বিশেষজ্ঞ।",
    bioEn: "English test and university admission specialist."
  },
  {
    name: "Md. Rashed", nameBn: "মোঃ রাশেদ",
    specialtyBn: "ফ্রিল্যান্সিং ও ডেভেলপমেন্ট", specialtyEn: "Freelancing & Development",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৬+ বছর", credentialEn: "Expert Trainer, 6+ years",
    coursesBn: ["ফ্রিল্যান্সিং বিগিনার টু অ্যাডভান্সড", "ওয়েব ডেভেলপমেন্ট"],
    coursesEn: ["Freelancing Beginner to Advanced", "Web Development"],
    image: "/images/trainers/default.jpg",
    bioBn: "ফ্রিল্যান্সিং ও ডেভেলপমেন্টে হাজারো শিক্ষার্থী তৈরি করেছেন।",
    bioEn: "Has trained thousands in freelancing and development."
  },
  {
    name: "Md. Hasan", nameBn: "মোঃ হাসান",
    specialtyBn: "ই-কমার্স ও মার্কেটিং", specialtyEn: "E-Commerce & Marketing",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৬+ বছর", credentialEn: "Expert Trainer, 6+ years",
    coursesBn: ["ই-কমার্স বিগিনার টু প্রো", "শপিফাই স্টোর সেটআপ"],
    coursesEn: ["E-Commerce Beginner to Pro", "Shopify Store Setup"],
    image: "/images/trainers/default.jpg",
    bioBn: "ই-কমার্স ও ডিজিটাল মার্কেটিং বিশেষজ্ঞ।",
    bioEn: "E-commerce and digital marketing expert."
  },
  {
    name: "Abdullah Al Mamun", nameBn: "আব্দুল্লাহ আল মামুন",
    specialtyBn: "UI/UX ও ডিজাইন", specialtyEn: "UI/UX & Design",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["UI/UX ডিজাইন ফান্ডামেন্টালস", "ফিগমা মাস্টারি"],
    coursesEn: ["UI/UX Design Fundamentals", "Figma Mastery"],
    image: "/images/trainers/default.jpg",
    bioBn: "UI/UX ডিজাইন ও ভিজুয়াল ডিজাইনে শীর্ষ প্রশিক্ষক।",
    bioEn: "Top trainer in UI/UX design and visual design."
  },
  {
    name: "Sajib Das", nameBn: "সাজিব দাস",
    specialtyBn: "ডেভেলপমেন্ট ও সফটওয়্যার টুলস", specialtyEn: "Development & Software Tools",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["জাভাস্ক্রিপ্ট মাস্টারি", "মাইক্রোসফট অফিস স্যুট"],
    coursesEn: ["JavaScript Mastery", "Microsoft Office Suite"],
    image: "/images/trainers/default.jpg",
    bioBn: "ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার টুলস বিশেষজ্ঞ।",
    bioEn: "Web development and software tools specialist."
  },
  {
    name: "Jakir Hossain", nameBn: "জাকির হোসেন",
    specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["ডিজিটাল মার্কেটিং কোর্স", "SEO মাস্টারি"],
    coursesEn: ["Digital Marketing Course", "SEO Mastery"],
    image: "/images/trainers/default.jpg",
    bioBn: "ডিজিটাল মার্কেটিং ও এসইও বিশেষজ্ঞ।",
    bioEn: "Digital marketing and SEO expert."
  },
  {
    name: "Mahmud Hasan", nameBn: "মাহমুদ হাসান",
    specialtyBn: "ফ্রিল্যান্সিং ও ক্যারিয়ার", specialtyEn: "Freelancing & Career",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৬+ বছর", credentialEn: "Expert Trainer, 6+ years",
    coursesBn: ["ফ্রিল্যান্সিং ক্যারিয়ার গাইড", "ক্লায়েন্ট কমিউনিকেশন"],
    coursesEn: ["Freelancing Career Guide", "Client Communication"],
    image: "/images/trainers/default.jpg",
    bioBn: "ফ্রিল্যান্সিং ক্যারিয়ার গঠনে বিশেষজ্ঞ প্রশিক্ষক।",
    bioEn: "Expert trainer in freelancing career building."
  },
  {
    name: "Rafiqul Islam", nameBn: "রফিকুল ইসলাম",
    specialtyBn: "ভাষা ও চাকরি", specialtyEn: "Language & Jobs",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৭+ বছর", credentialEn: "Expert Trainer, 7+ years",
    coursesBn: ["চাকরির ইন্টারভিউয়ের জন্য ইংরেজি", "সিভি ও রেজিউম রাইটিং"],
    coursesEn: ["English for Job Interview", "CV & Resume Writing"],
    image: "/images/trainers/default.jpg",
    bioBn: "ভাষা শিক্ষা ও চাকরি প্রস্তুতিতে দেশের শীর্ষ প্রশিক্ষক।",
    bioEn: "Top trainer in language education and job preparation."
  },
  {
    name: "Sharmin Akhter", nameBn: "শারমিন আখতার",
    specialtyBn: "মাল্টিমিডিয়া ও কন্টেন্ট", specialtyEn: "Multimedia & Content",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["ভিডিও এডিটিং কোর্স", "কন্টেন্ট ক্রিয়েশন"],
    coursesEn: ["Video Editing Course", "Content Creation"],
    image: "/images/trainers/default.jpg",
    bioBn: "মাল্টিমিডিয়া ও কন্টেন্ট ক্রিয়েশন বিশেষজ্ঞ।",
    bioEn: "Multimedia and content creation specialist."
  },
  {
    name: "Nusrat Jahan", nameBn: "নুসরাত জাহান",
    specialtyBn: "UI/UX ও গ্রাফিক্স", specialtyEn: "UI/UX & Graphics",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৪+ বছর", credentialEn: "Expert Trainer, 4+ years",
    coursesBn: ["গ্রাফিক ডিজাইন প্রিন্সিপলস", "ক্যানভা বিগিনার টু প্রো"],
    coursesEn: ["Graphic Design Principles", "Canva for Beginners to Pro"],
    image: "/images/trainers/default.jpg",
    bioBn: "গ্রাফিক্স ডিজাইন ও UI/UX প্রশিক্ষক।",
    bioEn: "Graphics design and UI/UX trainer."
  },
  {
    name: "Imran Hossain", nameBn: "ইমরান হোসেন",
    specialtyBn: "সফটওয়্যার ও ডেভেলপমেন্ট", specialtyEn: "Software & Development",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["পাইথন প্রোগ্রামিং", "রিঅ্যাক্ট.জেএস সম্পূর্ণ কোর্স"],
    coursesEn: ["Python Programming", "React.js Complete Course"],
    image: "/images/trainers/default.jpg",
    bioBn: "সফটওয়্যার ডেভেলপমেন্ট ও প্রোগ্রামিং বিশেষজ্ঞ।",
    bioEn: "Software development and programming expert."
  },
  {
    name: "Farzana Yesmin", nameBn: "ফারজানা ইয়াসমিন",
    specialtyBn: "বিজনেস ও ম্যানেজমেন্ট", specialtyEn: "Business & Management",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৪+ বছর", credentialEn: "Expert Trainer, 4+ years",
    coursesBn: ["বিজনেস ম্যানেজমেন্ট কোর্স", "নেতৃত্ব ও ব্যবস্থাপনা"],
    coursesEn: ["Business Management Course", "Leadership & Management"],
    image: "/images/trainers/default.jpg",
    bioBn: "বিজনেস ও ম্যানেজমেন্ট প্রশিক্ষক।",
    bioEn: "Business and management trainer."
  },
  {
    name: "Anisur Rahman", nameBn: "আনিসুর রহমান",
    specialtyBn: "ক্যারিয়ার ও সাফল্য", specialtyEn: "Career & Success",
    credentialBn: "এক্সপার্ট ট্রেইনার, ৫+ বছর", credentialEn: "Expert Trainer, 5+ years",
    coursesBn: ["ক্যারিয়ার প্ল্যানিং কোর্স", "সাফল্যের মনোবিজ্ঞান"],
    coursesEn: ["Career Planning Course", "Psychology of Success"],
    image: "/images/trainers/default.jpg",
    bioBn: "ক্যারিয়ার ডেভেলপমেন্ট ও ব্যক্তিত্ব বিকাশ বিশেষজ্ঞ।",
    bioEn: "Career development and personality growth specialist."
  },
];
export const courseCategories: CourseCategory[] = [
  {
    id: "knowledge-skills", icon: "🧠",
    titleBn: "জ্ঞান ও দক্ষতা", titleEn: "Knowledge & Skills",
    platformLogos: ["Upwork", "Fiverr"],
    trainers: ["Tanvirul Islam"],
    courses: [
      { nameBn: "ইংরেজি ভাষা কোর্স (HSC থেকে মাস্টার্স)", nameEn: "English Language Course (HSC to Masters)" },
      { nameBn: "IELTS ক্র্যাশ কোর্স", nameEn: "IELTS Crash Course" },
      { nameBn: "বিশ্ববিদ্যালয় ভর্তির জন্য ইংরেজি", nameEn: "English for University Admission" },
      { nameBn: "মানসিক স্বাস্থ্য ও সুখ", nameEn: "Mental Health & Happiness" },
      { nameBn: "পাবলিক স্পিকিং: ভয় থেকে সুপারস্টার", nameEn: "Public Speaking: From Scared to Superstar" },
      { nameBn: "কার্যকরী যোগাযোগ কোর্স", nameEn: "Effective Communication Course" },
      { nameBn: "ফান ও স্পোকেন ইংলিশ", nameEn: "Fun & Spoken English" },
      { nameBn: "শারীরিক স্বাস্থ্য ও জিম", nameEn: "Physical Health & GYM" },
      { nameBn: "নেতৃত্ব ও ব্যবস্থাপনা", nameEn: "Leadership & Management" },
      { nameBn: "সাফল্যের মনোবিজ্ঞান", nameEn: "Psychology of Success" },
      { nameBn: "ইংরেজি স্পিকিং বুটক্যাম্প", nameEn: "English Speaking Bootcamp" },
      { nameBn: "দ্রুত ও স্মার্ট ইংরেজি", nameEn: "Quick & Smart English" },
      { nameBn: "স্পোকেন ইংলিশ ও কথোপকথন", nameEn: "Spoken English & Conversation" },
      { nameBn: "ভালো পিতা-মাতা হওয়া", nameEn: "Become a Better Parent" },
      { nameBn: "সময় ব্যবস্থাপনা ও উৎপাদনশীলতা", nameEn: "Time Management & Productivity" },
      { nameBn: "বিশ্লেষণী ও সমালোচনামূলক চিন্তা", nameEn: "Analytical & Critical Thinking" },
      { nameBn: "লক্ষ্য নির্ধারণ ও পরিকল্পনা", nameEn: "Goal Setting & Planning" },
      { nameBn: "ব্যক্তিত্ব বিকাশ", nameEn: "Personality Development" },
    ],
  },
  {
    id: "institutions", icon: "🏛️",
    titleBn: "প্রতিষ্ঠান", titleEn: "Institutions",
    platformLogos: ["WordPress", "YouTube"],
    trainers: ["Shariful Islam"],
    courses: [
      { nameBn: "Duolingo ইংলিশ টেস্ট ক্র্যাশ কোর্স", nameEn: "Duolingo English Test Crash Course" },
      { nameBn: "SAT পরীক্ষা ক্র্যাশ কোর্স", nameEn: "SAT Exam Crash Course" },
      { nameBn: "TOEFL পরীক্ষা ক্র্যাশ কোর্স", nameEn: "TOEFL Exam Crash Course" },
      { nameBn: "BCS প্রস্তুতি কোর্স", nameEn: "BCS Preparation Course" },
      { nameBn: "বিশ্ববিদ্যালয় ভর্তি গাইড", nameEn: "University Admission Guide" },
      { nameBn: "PSC/JSC/SSC/HSC ইংরেজি", nameEn: "PSC / JSC / SSC / HSC English" },
      { nameBn: "মেডিকেল ভর্তি গাইড", nameEn: "Medical Admission Guide" },
      { nameBn: "ইঞ্জিনিয়ারিং ভর্তি গাইড", nameEn: "Engineering Admission Guide" },
    ],
  },
  {
    id: "trainers", icon: "👨‍🏫",
    titleBn: "ট্রেইনার", titleEn: "Trainers",
    platformLogos: ["Upwork", "Fiverr", "Freelancer"],
    trainers: ["Tanvirul Islam", "Shariful Islam", "Md. Rashed", "Md. Hasan", "Abdullah Al Mamun", "Sajib Das", "Jakir Hossain", "Mahmud Hasan", "Rafiqul Islam", "Sharmin Akhter", "Nusrat Jahan", "Imran Hossain", "Farzana Yesmin", "Anisur Rahman"],
    courses: [
      { nameBn: "ট্রেইনার: তানভিরুল ইসলাম (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Tanvirul Islam (Complete Profile)" },
      { nameBn: "ট্রেইনার: শরিফুল ইসলাম (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Shariful Islam (Complete Profile)" },
      { nameBn: "ট্রেইনার: মোঃ রাশেদ (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Md. Rashed (Complete Profile)" },
      { nameBn: "ট্রেইনার: মোঃ হাসান (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Md. Hasan (Complete Profile)" },
      { nameBn: "ট্রেইনার: আব্দুল্লাহ আল মামুন (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Abdullah Al Mamun (Complete Profile)" },
      { nameBn: "ট্রেইনার: সাজিব দাস (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Sajib Das (Complete Profile)" },
      { nameBn: "ট্রেইনার: জাকির হোসেন (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Jakir Hossain (Complete Profile)" },
      { nameBn: "ট্রেইনার: মাহমুদ হাসান (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Mahmud Hasan (Complete Profile)" },
      { nameBn: "ট্রেইনার: রফিকুল ইসলাম (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Rafiqul Islam (Complete Profile)" },
      { nameBn: "ট্রেইনার: শারমিন আখতার (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Sharmin Akhter (Complete Profile)" },
      { nameBn: "ট্রেইনার: নুসরাত জাহান (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Nusrat Jahan (Complete Profile)" },
      { nameBn: "ট্রেইনার: ইমরান হোসেন (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Imran Hossain (Complete Profile)" },
      { nameBn: "ট্রেইনার: ফারজানা ইয়াসমিন (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Farzana Yesmin (Complete Profile)" },
      { nameBn: "ট্রেইনার: আনিসুর রহমান (সম্পূর্ণ প্রোফাইল)", nameEn: "Trainer: Anisur Rahman (Complete Profile)" },
    ],
  },
  {
    id: "freelancing", icon: "🌍",
    titleBn: "ফ্রিল্যান্সিং", titleEn: "Freelancing",
    platformLogos: ["Upwork", "Fiverr", "Freelancer"],
    trainers: ["Md. Rashed", "Mahmud Hasan"],
    courses: [
      { nameBn: "ফ্রিল্যান্সিং বিগিনার থেকে অ্যাডভান্সড", nameEn: "Freelancing Beginner to Advanced" },
      { nameBn: "Upwork প্রোফাইল ও প্রপোজাল মাস্টারি", nameEn: "Upwork Profile & Proposal Mastery" },
      { nameBn: "Fiverr Gig অপটিমাইজেশন", nameEn: "Fiverr Gig Optimization" },
      { nameBn: "PeoplePerHour এ ফ্রিল্যান্সিং", nameEn: "Freelancing on PeoplePerHour" },
      { nameBn: "Freelancer.com সম্পূর্ণ গাইড", nameEn: "Freelancer.com Complete Guide" },
      { nameBn: "LinkedIn ফ্রিল্যান্সিং ও নেটওয়ার্কিং", nameEn: "LinkedIn Freelancing & Networking" },
      { nameBn: "কন্টেন্ট রাইটিং ও কপিরাইটিং", nameEn: "Content Writing & Copywriting" },
      { nameBn: "ভার্চুয়াল অ্যাসিস্ট্যান্ট মাস্টারি", nameEn: "Virtual Assistant Mastery" },
      { nameBn: "ডাটা এন্ট্রি ও অনলাইন রিসার্চ", nameEn: "Data Entry & Online Research" },
      { nameBn: "ফ্রিল্যান্সিং ক্লায়েন্ট কমিউনিকেশন", nameEn: "Freelancing Client Communication" },
      { nameBn: "নিশ ফ্রিল্যান্সিং: গ্রাফিক্স ও ডিজাইন", nameEn: "Niche Freelancing: Graphics & Design" },
      { nameBn: "নিশ ফ্রিল্যান্সিং: ওয়েব ডেভেলপমেন্ট", nameEn: "Niche Freelancing: Web Development" },
      { nameBn: "নিশ ফ্রিল্যান্সিং: SEO ও মার্কেটিং", nameEn: "Niche Freelancing: SEO & Marketing" },
      { nameBn: "নিশ ফ্রিল্যান্সিং: মোবাইল অ্যাপ ডেভেলপমেন্ট", nameEn: "Niche Freelancing: Mobile App Dev" },
    ],
  },
  {
    id: "ecommerce", icon: "🛒",
    titleBn: "ই-কমার্স", titleEn: "E-Commerce",
    platformLogos: ["Shopify", "Amazon"],
    trainers: ["Md. Hasan"],
    courses: [
      { nameBn: "ই-কমার্স বিগিনার থেকে প্রো", nameEn: "E-Commerce Beginner to Pro" },
      { nameBn: "Shopify স্টোর সেটআপ ও গ্রোথ", nameEn: "Shopify Store Setup & Growth" },
      { nameBn: "WooCommerce মাস্টারি", nameEn: "WooCommerce Mastery" },
      { nameBn: "Amazon FBA বিগিনার গাইড", nameEn: "Amazon FBA Beginner Guide" },
      { nameBn: "ডিজিটাল প্রোডাক্ট ক্রিয়েশন ও সেলস", nameEn: "Digital Product Creation & Sales" },
      { nameBn: "Facebook ও Instagram Shops", nameEn: "Facebook & Instagram Shops" },
      { nameBn: "ড্রপশিপিং সম্পূর্ণ কোর্স", nameEn: "Dropshipping Complete Course" },
      { nameBn: "ই-কমার্স SEO ও মার্কেটিং", nameEn: "E-Commerce SEO & Marketing" },
      { nameBn: "পেমেন্ট গেটওয়ে ইন্টিগ্রেশন", nameEn: "Payment Gateway Integration" },
      { nameBn: "ই-কমার্স অ্যানালিটিক্স ও গ্রোথ", nameEn: "E-Commerce Analytics & Growth" },
      { nameBn: "অ্যাফিলিয়েট মার্কেটিং মাস্টারি", nameEn: "Affiliate Marketing Mastery" },
    ],
  },
  {
    id: "development", icon: "💻",
    titleBn: "ডেভেলপমেন্ট", titleEn: "Development",
    platformLogos: ["WordPress", "Figma"],
    trainers: ["Sajib Das", "Imran Hossain"],
    courses: [
      { nameBn: "HTML ও CSS বিগিনার থেকে অ্যাডভান্সড", nameEn: "HTML & CSS Beginner to Advanced" },
      { nameBn: "JavaScript মাস্টারি", nameEn: "JavaScript Mastery" },
      { nameBn: "React.js সম্পূর্ণ কোর্স", nameEn: "React.js Complete Course" },
      { nameBn: "Node.js ও Express ব্যাকএন্ড", nameEn: "Node.js & Express Backend" },
      { nameBn: "Python প্রোগ্রামিং", nameEn: "Python Programming" },
      { nameBn: "PHP ও MySQL ওয়েব ডেভেলপমেন্ট", nameEn: "PHP & MySQL Web Development" },
      { nameBn: "WordPress থিম ও প্লাগইন ডেভেলপমেন্ট", nameEn: "WordPress Theme & Plugin Dev" },
      { nameBn: "Flutter দিয়ে মোবাইল অ্যাপ ডেভেলপমেন্ট", nameEn: "Mobile App Development with Flutter" },
      { nameBn: "Git ও GitHub ভার্সন কন্ট্রোল", nameEn: "Git & GitHub Version Control" },
      { nameBn: "API ডেভেলপমেন্ট ও ইন্টিগ্রেশন", nameEn: "API Development & Integration" },
      { nameBn: "ডাটাবেজ ডিজাইন ও SQL", nameEn: "Database Design & SQL" },
      { nameBn: "কম্পিউটার সায়েন্স ফান্ডামেন্টালস", nameEn: "Computer Science Fundamentals" },
    ],
  },
  {
    id: "language-jobs", icon: "🗣️",
    titleBn: "ভাষা ও পেশা", titleEn: "Language & Jobs",
    platformLogos: ["YouTube", "WordPress"],
    trainers: ["Rafiqul Islam"],
    courses: [
      { nameBn: "চাকরির ইন্টারভিউয়ের জন্য ইংরেজি", nameEn: "English for Job Interview" },
      { nameBn: "CV ও রেজিউম রাইটিং", nameEn: "CV & Resume Writing" },
      { nameBn: "পেশাদার ইমেল রাইটিং", nameEn: "Professional Email Writing" },
      { nameBn: "ব্যবসায়িক ইংরেজি যোগাযোগ", nameEn: "Business English Communication" },
      { nameBn: "আরবি ভাষা কোর্স", nameEn: "Arabic Language Course" },
      { nameBn: "জাপানি ভাষা বিগিনারদের জন্য", nameEn: "Japanese Language for Beginners" },
      { nameBn: "কোরিয়ান ভাষা কোর্স", nameEn: "Korean Language Course" },
      { nameBn: "চাইনিজ (ম্যান্ডারিন) বেসিক", nameEn: "Chinese (Mandarin) Basics" },
      { nameBn: "চাকরির ইন্টারভিউ প্রস্তুতি", nameEn: "Job Interview Preparation" },
      { nameBn: "সরকারি চাকরি প্রস্তুতি", nameEn: "Government Job Preparation" },
      { nameBn: "ব্যাংক জব প্রস্তুতি", nameEn: "Bank Job Preparation" },
      { nameBn: "এনজিও জব প্রস্তুতি", nameEn: "NGO Job Preparation" },
      { nameBn: "ফ্রিল্যান্সিং বনাম চাকরি: ক্যারিয়ার প্ল্যানিং", nameEn: "Freelancing vs Job: Career Planning" },
      { nameBn: "LinkedIn প্রোফাইল অপটিমাইজেশন", nameEn: "LinkedIn Profile Optimization" },
      { nameBn: "কর্মক্ষেত্রের জন্য সফট স্কিল", nameEn: "Soft Skills for Workplace" },
      { nameBn: "কর্পোরেট কমিউনিকেশন", nameEn: "Corporate Communication" },
      { nameBn: "পেশাদার প্রেজেন্টেশন স্কিল", nameEn: "Professional Presentation Skills" },
      { nameBn: "নেগোশিয়েশন স্কিল", nameEn: "Negotiation Skills" },
    ],
  },
  {
    id: "uiux-multimedia", icon: "🎨",
    titleBn: "UI/UX ও মাল্টিমিডিয়া", titleEn: "UI/UX & Multimedia",
    platformLogos: ["Figma", "YouTube"],
    trainers: ["Abdullah Al Mamun", "Nusrat Jahan"],
    courses: [
      { nameBn: "UI/UX ডিজাইন ফান্ডামেন্টালস", nameEn: "UI/UX Design Fundamentals" },
      { nameBn: "Figma মাস্টারি", nameEn: "Figma Mastery" },
      { nameBn: "Adobe Photoshop সম্পূর্ণ", nameEn: "Adobe Photoshop Complete" },
      { nameBn: "Adobe Illustrator মাস্টারি", nameEn: "Adobe Illustrator Mastery" },
      { nameBn: "Premiere Pro দিয়ে ভিডিও এডিটিং", nameEn: "Video Editing with Premiere Pro" },
      { nameBn: "After Effects দিয়ে মোশন গ্রাফিক্স", nameEn: "Motion Graphics with After Effects" },
      { nameBn: "Canva বিগিনার থেকে প্রো", nameEn: "Canva for Beginners to Pro" },
      { nameBn: "গ্রাফিক ডিজাইন প্রিন্সিপলস", nameEn: "Graphic Design Principles" },
      { nameBn: "মোবাইল অ্যাপের জন্য UI ডিজাইন", nameEn: "UI Design for Mobile Apps" },
      { nameBn: "UX রিসার্চ ও টেস্টিং", nameEn: "UX Research & Testing" },
      { nameBn: "Blender দিয়ে 3D মডেলিং", nameEn: "3D Modeling with Blender" },
      { nameBn: "কালার থিওরি ও টাইপোগ্রাফি", nameEn: "Color Theory & Typography" },
    ],
  },
  {
    id: "software-tools", icon: "🛠️",
    titleBn: "সফটওয়্যার টুলস", titleEn: "Software Tools",
    platformLogos: ["WordPress", "Figma"],
    trainers: ["Sajib Das"],
    courses: [
      { nameBn: "মাইক্রোসফট অফিস স্যুট (Word, Excel, PPT)", nameEn: "Microsoft Office Suite (Word, Excel, PPT)" },
      { nameBn: "গুগল ওয়ার্কস্পেস (Docs, Sheets, Drive)", nameEn: "Google Workspace (Docs, Sheets, Drive)" },
      { nameBn: "VS Code ও প্রোডাক্টিভিটি টুলস", nameEn: "VS Code & Productivity Tools" },
      { nameBn: "Trello, Asana ও প্রজেক্ট ম্যানেজমেন্ট", nameEn: "Trello, Asana & Project Management" },
      { nameBn: "Slack, Zoom ও কমিউনিকেশন টুলস", nameEn: "Slack, Zoom & Communication Tools" },
      { nameBn: "SEO টুলস: Ahrefs, SEMrush, Yoast", nameEn: "SEO Tools: Ahrefs, SEMrush, Yoast" },
      { nameBn: "ডিজাইন টুলস: Figma, Canva, Adobe XD", nameEn: "Design Tools: Figma, Canva, Adobe XD" },
      { nameBn: "Mailchimp ও ইমেল মার্কেটিং টুলস", nameEn: "Mailchimp & Email Marketing Tools" },
      { nameBn: "অ্যানালিটিক্স: Google Analytics ও Meta Business", nameEn: "Analytics: Google Analytics & Meta Business" },
    ],
  },
  {
    id: "notes", icon: "📝",
    titleBn: "নোট", titleEn: "Notes",
    platformLogos: [],
    trainers: [],
    courses: [
      { nameBn: "সব কোর্সের নোট ও চিটশিট", nameEn: "All Course Notes & Cheatsheets" },
      { nameBn: "ফ্রিল্যান্সিং কন্ট্র্যাক্ট টেমপ্লেট", nameEn: "Freelancing Contract Templates" },
      { nameBn: "CV ও রেজিউম টেমপ্লেট", nameEn: "CV & Resume Templates" },
      { nameBn: "ক্লায়েন্ট প্রপোজাল টেমপ্লেট", nameEn: "Client Proposal Templates" },
      { nameBn: "স্টাডি নোট ও রিভিশন গাইড", nameEn: "Study Notes & Revision Guides" },
      { nameBn: "রিসোর্স লাইব্রেরি অ্যাক্সেস", nameEn: "Resource Library Access" },
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
  { nameBn: "তানভিরুল ইসলাম", nameEn: "Tanvirul Islam", specialtyBn: "ইংরেজি ও নেতৃত্ব", specialtyEn: "English & Leadership" },
  { nameBn: "শরিফুল ইসলাম", nameEn: "Shariful Islam", specialtyBn: "ইংরেজি ও ভর্তি", specialtyEn: "English & Admission" },
  { nameBn: "মোঃ রাশেদ", nameEn: "Md. Rashed", specialtyBn: "ফ্রিল্যান্সিং ও ডেভ", specialtyEn: "Freelancing & Dev" },
  { nameBn: "মোঃ হাসান", nameEn: "Md. Hasan", specialtyBn: "ই-কমার্স ও মার্কেটিং", specialtyEn: "E-Commerce & Marketing" },
  { nameBn: "আব্দুল্লাহ আল মামুন", nameEn: "Abdullah Al Mamun", specialtyBn: "UI/UX ও ডিজাইন", specialtyEn: "UI/UX & Design" },
  { nameBn: "সাজিব দাস", nameEn: "Sajib Das", specialtyBn: "ডেভ ও সফটওয়্যার টুলস", specialtyEn: "Dev & Software Tools" },
  { nameBn: "জাকির হোসেন", nameEn: "Jakir Hossain", specialtyBn: "ডিজিটাল মার্কেটিং", specialtyEn: "Digital Marketing" },
  { nameBn: "মাহমুদ হাসান", nameEn: "Mahmud Hasan", specialtyBn: "ফ্রিল্যান্সিং ও ক্যারিয়ার", specialtyEn: "Freelancing & Career" },
  { nameBn: "রফিকুল ইসলাম", nameEn: "Rafiqul Islam", specialtyBn: "ভাষা ও পেশা", specialtyEn: "Language & Jobs" },
  { nameBn: "শারমিন আখতার", nameEn: "Sharmin Akhter", specialtyBn: "মাল্টিমিডিয়া ও কন্টেন্ট", specialtyEn: "Multimedia & Content" },
  { nameBn: "নুসরাত জাহান", nameEn: "Nusrat Jahan", specialtyBn: "UI/UX ও গ্রাফিক্স", specialtyEn: "UI/UX & Graphics" },
  { nameBn: "ইমরান হোসেন", nameEn: "Imran Hossain", specialtyBn: "সফটওয়্যার ও ডেভেলপমেন্ট", specialtyEn: "Software & Development" },
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
