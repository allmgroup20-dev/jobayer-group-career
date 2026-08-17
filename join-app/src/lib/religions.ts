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
        en: "Sunni (Ahle Sunnat)", bn: "সুন্নি (আহলে সুন্নত)", v: "sunni",
        children: [
          { en: "Deobandi (Qawmi)", bn: "দেওবন্দি (কওমি)", v: "deobandi" },
          { en: "Barelvi (Ahle Sunnat wal Jamaat)", bn: "বেরলভি (আহলে সুন্নাত ওয়াল জামাত)", v: "barelvi" },
          { en: "Ahle Hadith", bn: "আহলে হাদীস", v: "ahle_hadith" },
          {
            en: "Sufi", bn: "সুফি", v: "sufi",
            children: [
              { en: "Qadiri", bn: "কাদেরিয়া", v: "qadiri" },
              { en: "Chishti", bn: "চিশতিয়া", v: "chishti" },
              { en: "Naqshbandi", bn: "নকশবন্দিয়া", v: "naqshbandi" },
              { en: "Mujaddidi", bn: "মুজাদ্দেদিয়া", v: "mujaddidi" },
              { en: "Suhrawardi", bn: "সোহরাওয়ার্দীয়া", v: "suhrawardi" },
              { en: "Maizbhandari", bn: "মাইজভান্ডারী", v: "maizbhandari" },
              { en: "Sureshwari", bn: "সুরেশ্বরিয়া", v: "sureshwari" },
              { en: "Fultali", bn: "ফুলতলি", v: "fultali" },
              { en: "Rifai", bn: "রিফাঈয়া", v: "rifai" },
              { en: "Other", bn: "অন্যান্য", v: "sufi_other" },
            ],
          },
          { en: "Other", bn: "অন্যান্য", v: "sunni_other" },
        ],
      },
      {
        en: "Shia", bn: "শিয়া", v: "shia",
        children: [
          { en: "Isna Ashari (Twelver)", bn: "ইসনা আশারিয়া (দ্বাদশী)", v: "isna_ashari" },
          {
            en: "Ismaili", bn: "ইসমাইলি", v: "ismaili",
            children: [
              { en: "Dawoodi Bohra", bn: "দাউদী বোহরা", v: "dawoodi_bohra" },
              { en: "Nizari", bn: "নিজারি", v: "nizari" },
              { en: "Other", bn: "অন্যান্য", v: "ismaili_other" },
            ],
          },
          { en: "Other", bn: "অন্যান্য", v: "shia_other" },
        ],
      },
      { en: "Ahmadiyya", bn: "আহমদিয়া", v: "ahmadiyya" },
      { en: "Ahle Quran (Quranist)", bn: "আহলে কুরআন (কুরআনিস্ট)", v: "ahle_quran" },
      { en: "Mahdavia", bn: "মহদাবিয়া", v: "mahdavia" },
      { en: "Nondenominational Muslim", bn: "নিরপেক্ষ মুসলিম", v: "non_denominational" },
      { en: "Other", bn: "অন্যান্য", v: "islam_other" },
    ],
  },
  {
    en: "Hindu", bn: "হিন্দু", v: "hindu",
    children: [
      {
        en: "Vaishnav", bn: "বৈষ্ণব", v: "vaishnav",
        children: [
          { en: "Gaudiya (ISKCON)", bn: "গৌড়ীয় (ইসকন)", v: "gaudiya" },
          { en: "Other", bn: "অন্যান্য", v: "vaishnav_other" },
        ],
      },
      { en: "Shaiva", bn: "শৈব", v: "shaiva" },
      { en: "Shakta", bn: "শাক্ত", v: "shakta" },
      { en: "Smarta", bn: "স্মার্ত", v: "smarta" },
      { en: "Brahmo", bn: "ব্রাহ্মো", v: "brahmo" },
      { en: "Other", bn: "অন্যান্য", v: "hindu_other" },
    ],
  },
  {
    en: "Buddhist", bn: "বৌদ্ধ", v: "buddhist",
    children: [
      {
        en: "Theravada", bn: "থেরবাদ", v: "theravada",
        children: [
          { en: "Barua", bn: "বারুয়া", v: "barua" },
          { en: "Chakma", bn: "চাকমা", v: "chakma" },
          { en: "Marma", bn: "মারমা", v: "marma" },
          { en: "Mro (Mru)", bn: "ম্রো", v: "mro" },
          { en: "Khumi", bn: "খুমি", v: "khumi" },
          { en: "Chak", bn: "চাক", v: "chak" },
          { en: "Murang", bn: "মুরং", v: "murang" },
          { en: "Tanchangya", bn: "তঞ্চঙ্গ্যা", v: "tanchangya" },
          { en: "Khiang (Khyang)", bn: "খিয়াং (খ্যাং)", v: "khiang" },
          { en: "Other", bn: "অন্যান্য", v: "theravada_other" },
        ],
      },
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
          { en: "Anglican (Church of Bangladesh)", bn: "অ্যাংলিকান (বাংলাদেশ চার্চ)", v: "anglican" },
          { en: "Lutheran", bn: "লুথারান", v: "lutheran" },
          { en: "Presbyterian", bn: "প্রেসবিটেরিয়ান", v: "presbyterian" },
          { en: "Methodist", bn: "মেথডিস্ট", v: "methodist" },
          { en: "Pentecostal", bn: "পেন্টেকস্টাল", v: "pentecostal" },
          { en: "Seventh-day Adventist", bn: "সেভেন্থ-ডে অ্যাডভেন্টিস্ট", v: "adventist" },
          { en: "Nazarene", bn: "নাজারিন", v: "nazarene" },
          { en: "Salvation Army", bn: "স্যালভেশন আর্মি", v: "salvation_army" },
          { en: "Christian Brethren", bn: "খ্রিস্টান ব্রাদারেন", v: "brethren" },
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
  { en: "Zoroastrian (Parsi)", bn: "জরথুস্ট্রীয় (পারসি)", v: "zoroastrian" },
  { en: "Judaism", bn: "ইহুদি", v: "judaism" },
  {
    en: "Indigenous / Folk Religions", bn: "আদিবাসী / লোকধর্ম", v: "indigenous",
    children: [
      { en: "Sanamahism", bn: "সানামাহি", v: "sanamahism" },
      { en: "Sarnaism / Sari Dharam", bn: "সারনা / সারি ধর্ম", v: "sarnaism" },
      { en: "Songsarek", bn: "সঙ্গসারেক", v: "songsarek" },
      { en: "Sakhua", bn: "সাখুয়া", v: "sakhua" },
      { en: "Krama", bn: "ক্রামা", v: "krama" },
      { en: "Niamtre", bn: "নিয়ামত্রে", v: "niamtre" },
      { en: "Ka Niam Khasi", bn: "কা নিয়াম খাসি", v: "ka_niam_khasi" },
      { en: "Tripuri Folk Religion", bn: "ত্রিপুরী লোকধর্ম", v: "tripuri" },
      { en: "Kiratism", bn: "কিরাতি", v: "kiratism" },
      { en: "Other", bn: "অন্যান্য", v: "indigenous_other" },
    ],
  },
  { en: "Atheist / No Religion", bn: "নাস্তিক / ধর্মহীন", v: "atheist" },
  { en: "Prefer not to say", bn: "উত্তর দিতে চাই না", v: "prefer_not" },
];

// Split a stored path string ("a>b>c") into its keys.
export function religionKeys(path?: string): string[] {
  return (path || "").split(">").filter(Boolean);
}

// Build a path string from an array of keys.
export function religionPath(keys: string[]): string {
  return keys.filter(Boolean).join(">");
}

// Options for the select at `level`, given the already-selected `keys`.
export function religionOptions(keys: string[], level: number): ReligionOption[] {
  let opts = RELIGIONS;
  for (let i = 0; i < level; i++) {
    const node = opts.find((o) => o.v === keys[i]);
    if (!node?.children || node.children.length === 0) return [];
    opts = node.children;
  }
  return opts;
}

// How many cascade selects to render for the given keys (stops at the deepest
// level that has options, and never beyond what the user has drilled into).
export function religionLevels(keys: string[]): number {
  let n = 0;
  while (n <= keys.length && religionOptions(keys, n).length > 0) n++;
  return n;
}
