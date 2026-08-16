export interface StatItem {
  key?: "students" | "courses";
  num?: string;
  textBn?: string;
  textEn?: string;
  labelBn?: string;
  labelEn?: string;
  separator?: boolean;
}

export const stats: StatItem[] = [
  { key: "students", num: "—", labelBn: "সক্রিয় শিক্ষার্থী", labelEn: "Active Students" },
  { separator: true },
  { key: "courses", num: "—", labelBn: "প্রিমিয়াম রিসোর্স", labelEn: "Premium Resources" },
  { separator: true },
  { textBn: "৳৯৯", textEn: "৳99", labelBn: "থেকে শুরু", labelEn: "Starting From" },
];

export const statsSectionText = {
  badgeBn: "📊 আমাদের পরিসংখ্যান",
  badgeEn: "📊 Our Statistics",
};
