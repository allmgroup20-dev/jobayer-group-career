export type ReligionOption = {
  en: string;
  bn: string;
  v: string;
  children?: ReligionOption[];
};

export const RELIGIONS: ReligionOption[] = [
  {
    en: "Islam", bn: "ইসলাম", v: "islam",
    children: [
      {
        en: "Sunni", bn: "সুন্নি", v: "sunni",
        children: [
          { en: "Ahle Sunnat (Hanafi)", bn: "আহলে সুন্নাত (হানাফি)", v: "ahle_sunnat" },
          { en: "Deobandi", bn: "দেওবন্দি", v: "deobandi" },
          { en: "Ahle Hadith", bn: "আহলে হাদীস", v: "ahle_hadith" },
          { en: "Other", bn: "অন্যান্য", v: "sunni_other" },
        ],
      },
      {
        en: "Shia", bn: "শিয়া", v: "shia",
        children: [
          { en: "Ismaili", bn: "ইসমাইলি", v: "ismaili" },
          { en: "Other", bn: "অন্যান্য", v: "shia_other" },
        ],
      },
      { en: "Sufi", bn: "সুফি", v: "sufi" },
      { en: "Ahmadiyya", bn: "আহমদিয়া", v: "ahmadiyya" },
      { en: "Ahle Quran", bn: "আহলে কুরআন", v: "ahle_quran" },
      { en: "Other", bn: "অন্যান্য", v: "islam_other" },
    ],
  },
  {
    en: "Hindu", bn: "হিন্দু", v: "hindu",
    children: [
      { en: "Vaishnav", bn: "বৈষ্ণব", v: "vaishnav" },
      { en: "Shaiva", bn: "শৈব", v: "shaiva" },
      { en: "Shakta", bn: "শাক্ত", v: "shakta" },
      { en: "Brahmo", bn: "ব্রাহ্মো", v: "brahmo" },
      { en: "Other", bn: "অন্যান্য", v: "hindu_other" },
    ],
  },
  {
    en: "Buddhist", bn: "বৌদ্ধ", v: "buddhist",
    children: [
      { en: "Theravada", bn: "থেরবাদ", v: "theravada" },
      { en: "Mahayana", bn: "মহাযান", v: "mahayana" },
      { en: "Other", bn: "অন্যান্য", v: "buddhist_other" },
    ],
  },
  {
    en: "Christian", bn: "খ্রিস্টান", v: "christian",
    children: [
      { en: "Catholic", bn: "ক্যাথলিক", v: "catholic" },
      {
        en: "Protestant", bn: "প্রোটেস্ট্যান্ট", v: "protestant",
        children: [
          { en: "Baptist", bn: "ব্যাপ্টিস্ট", v: "baptist" },
          { en: "Lutheran", bn: "লুথারান", v: "lutheran" },
          { en: "Pentecostal", bn: "পেন্টেকস্টাল", v: "pentecostal" },
          { en: "Other", bn: "অন্যান্য", v: "protestant_other" },
        ],
      },
      { en: "Orthodox", bn: "অর্থোডক্স", v: "orthodox" },
      { en: "Other", bn: "অন্যান্য", v: "christian_other" },
    ],
  },
  { en: "Sikh", bn: "শিখ", v: "sikh" },
  { en: "Jain", bn: "জৈন", v: "jain" },
  { en: "Bahai Faith", bn: "বাহাই", v: "bahai" },
  { en: "Atheist / No Religion", bn: "নাস্তিক / ধর্মহীন", v: "atheist" },
  { en: "Prefer not to say", bn: "উত্তর দিতে চাই না", v: "prefer_not" },
];

export type ReligionSelection = { l1?: string; l2?: string; l3?: string };

export function religionPath(sel: ReligionSelection): string {
  return [sel.l1, sel.l2, sel.l3].filter(Boolean).join(">");
}

export function findChildren(options: ReligionOption[], key?: string): ReligionOption[] | undefined {
  if (!key) return undefined;
  const opt = options.find((o) => o.v === key);
  return opt?.children;
}