import PolicyPage from "@/components/legal/PolicyPage";

export default function TermsPage() {
  return (
    <PolicyPage
      badgeEn="📄 Terms"
      badgeBn="📄 শর্তাবলী"
      titleEn="Terms of Service"
      titleBn="সেবার শর্তাবলী"
      updatedEn="Last updated: August 2026"
      updatedBn="সর্বশেষ আপডেট: আগস্ট ২০২৬"
      sections={[
        {
          enTitle: "1. Acceptance of Terms",
          bnTitle: "১. শর্তাবলী গ্রহণ",
          en: [
            "By registering or using Jobayer Group Career, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
          ],
          bn: [
            "জোবায়ের গ্রুপ ক্যারিয়ারে রেজিস্ট্রেশন বা ব্যবহারের মাধ্যমে আপনি এই সেবার শর্তাবলীতে সম্মত হচ্ছেন। আপনি যদি সম্মত না হন, তাহলে প্ল্যাটফর্ম ব্যবহার করবেন না।",
          ],
        },
        {
          enTitle: "2. Membership & Pricing",
          bnTitle: "২. মেম্বারশিপ ও মূল্য",
          en: [
            "Registration is free. Premium resources are unlocked individually, starting from ৳99 per resource. Bundles are available, and the All-Resources Pack (৳5,200) unlocks the full library and grants Premium status.",
            "Prices shown on the platform are the final prices in Bangladeshi Taka (৳) unless stated otherwise.",
          ],
          bn: [
            "রেজিস্ট্রেশন সম্পূর্ণ ফ্রি। প্রিমিয়াম রিসোর্স আলাদাভাবে আনলক করা যায়, প্রতি রিসোর্স ৳৯৯ থেকে। বিভিন্ন বান্ডেল রয়েছে এবং অল-রিসোর্সেস প্যাক (৳৫,২০০) সম্পূর্ণ লাইব্রেরি আনলক করে প্রিমিয়াম স্ট্যাটাস প্রদান করে।",
            "প্ল্যাটফর্মে প্রদর্শিত মূল্যই চূড়ান্ত মূল্য (বাংলাদেশি টাকা/৳), যদি না অন্যথায় উল্লেখ থাকে।",
          ],
        },
        {
          enTitle: "3. Referral Commissions",
          bnTitle: "৩. রেফারেল কমিশন",
          en: [
            "Members earn a fixed referral commission of ৳20 for each successful referral at Level 1, and ৳10 for each referral at Levels 2-4.",
            "Commissions are credited when a referred member completes a resource purchase. There are no percentage commissions, team-size bonuses, or guaranteed earnings. Income depends entirely on the member's own referral activity.",
          ],
          bn: [
            "লেভেল ১-এ প্রতি সফল রেফারেলে সদস্যরা নির্দিষ্ট ৳২০ রেফারেল কমিশন পান এবং লেভেল ২-৪-এ প্রতি রেফারেলে ৳১০।",
            "রেফার করা সদস্য রিসোর্স ক্রয় সম্পন্ন করলে কমিশন জমা হয়। কোনো শতাংশ কমিশন, টিম-সাইজ বোনাস বা গ্যারান্টিড আয় নেই। আয় সম্পূর্ণভাবে সদস্যের নিজের রেফারেল কার্যকলাপের উপর নির্ভর করে।",
          ],
        },
        {
          enTitle: "4. Withdrawals",
          bnTitle: "৪. উত্তোলন",
          en: [
            "General members can withdraw from a minimum of ৳500, subject to a 5% withdrawal tax. Premium members can withdraw from a minimum of ৳20 with no withdrawal tax.",
            "Withdrawal requests are processed according to the rules stated in your dashboard. Earned commissions are payable only after a successful referral purchase is completed.",
          ],
          bn: [
            "সাধারণ সদস্যরা ন্যূনতম ৳৫০০ থেকে উত্তোলন করতে পারেন, ৫% উত্তোলন কর সহ। প্রিমিয়াম সদস্যরা ৫% কর ছাড়া ন্যূনতম ৳২০ থেকে উত্তোলন করতে পারেন।",
            "আপনার ড্যাশবোর্ডে বর্ণিত নিয়ম অনুযায়ী উত্তোলনের অনুরোধ প্রক্রিয়া করা হয়। সফল রেফারেল ক্রয় সম্পন্ন হওয়ার পরই অর্জিত কমিশন পরিশোধযোগ্য।",
          ],
        },
        {
          enTitle: "5. Refund & Cancellation",
          bnTitle: "৫. রিফান্ড ও বাতিলকরণ",
          en: [
            "Digital resources are delivered immediately upon purchase. A refund is available within 7 days of purchase only if the resource has not been accessed or downloaded. No refund is provided if the resource has been opened.",
            "To cancel your account, contact support via WhatsApp; your account is deactivated within 48 hours. Unpaid earned commissions are paid out per the normal withdrawal rules.",
          ],
          bn: [
            "ক্রয়ের সাথে সাথেই ডিজিটাল রিসোর্স ডেলিভার করা হয়। রিসোর্সটি খোলা বা ডাউনলোড না হলে ক্রয়ের ৭ দিনের মধ্যে রিফান্ড পাওয়া যায়। রিসোর্স খোলা হয়ে থাকলে কোনো রিফান্ড দেওয়া হয় না।",
            "অ্যাকাউন্ট বাতিল করতে ওয়াটসঅ্যাপের মাধ্যমে সাপোর্টে যোগাযোগ করুন; ৪৮ ঘণ্টার মধ্যে অ্যাকাউন্ট নিষ্ক্রিয় করা হয়। অপরিশোধিত অর্জিত কমিশন স্বাভাবিক উত্তোলন নিয়ম অনুযায়ী পরিশোধ করা হয়।",
          ],
        },
        {
          enTitle: "6. Prohibited Conduct",
          bnTitle: "৬. নিষিদ্ধ আচরণ",
          en: [
            "You agree not to: make false or misleading income claims, spam or harass others, create multiple accounts to abuse referrals, misrepresent your relationship with the platform, or use the platform for any unlawful purpose.",
            "We reserve the right to suspend accounts that violate these terms.",
          ],
          bn: [
            "আপনি সম্মত হচ্ছেন যে: মিথ্যা বা বিভ্রান্তিকর আয়ের দাবি করবেন না, অন্যদের স্প্যাম বা হয়রানি করবেন না, রেফারেল অপব্যবহারের জন্য একাধিক অ্যাকাউন্ট তৈরি করবেন না, প্ল্যাটফর্মের সাথে আপনার সম্পর্ক ভুলভাবে উপস্থাপন করবেন না বা যেকোনো অবৈধ উদ্দেশ্যে প্ল্যাটফর্ম ব্যবহার করবেন না।",
            "এই শর্তাবলী লঙ্ঘনকারী অ্যাকাউন্ট স্থগিত করার অধিকার আমরা সংরক্ষণ করি।",
          ],
        },
        {
          enTitle: "7. Limitation of Liability",
          bnTitle: "৭. দায়বদ্ধতার সীমাবদ্ধতা",
          en: [
            "The platform is provided \"as is\". We do not guarantee any specific income or results from using the resources. Your use of the platform is at your own discretion.",
          ],
          bn: [
            "প্ল্যাটফর্মটি \"যেমন আছে\" তেমনিভাবে প্রদান করা হয়। রিসোর্স ব্যবহার থেকে কোনো নির্দিষ্ট আয় বা ফলাফলের নিশ্চয়তা আমরা দিই না। প্ল্যাটফর্ম ব্যবহার আপনার নিজের বিবেচনায়।",
          ],
        },
        {
          enTitle: "8. Changes to Terms",
          bnTitle: "৮. শর্তাবলীর পরিবর্তন",
          en: [
            "We may update these terms from time to time. Continued use of the platform after changes means you accept the updated terms.",
          ],
          bn: [
            "আমরা সময়ে সময়ে এই শর্তাবলী আপডেট করতে পারি। পরিবর্তনের পর প্ল্যাটফর্ম ব্যবহারের ধারাবাহিকতা মানে আপনি আপডেটেড শর্তাবলী গ্রহণ করেছেন।",
          ],
        },
        {
          enTitle: "9. Contact",
          bnTitle: "৯. যোগাযোগ",
          en: [
            "For questions about these terms, contact support@jobayergroup.com.",
          ],
          bn: [
            "এই শর্তাবলী সম্পর্কে প্রশ্ন থাকলে support@jobayergroup.com-এ যোগাযোগ করুন।",
          ],
        },
      ]}
    />
  );
}
