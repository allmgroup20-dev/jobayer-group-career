import PolicyPage from "@/components/legal/PolicyPage";

export default function PrivacyPage() {
  return (
    <PolicyPage
      badgeEn="🔒 Privacy"
      badgeBn="🔒 গোপনীয়তা"
      titleEn="Privacy Policy"
      titleBn="গোপনীয়তা নীতি"
      updatedEn="Last updated: August 2026"
      updatedBn="সর্বশেষ আপডেট: আগস্ট ২০২৬"
      sections={[
        {
          enTitle: "1. Information We Collect",
          bnTitle: "১. আমরা যে তথ্য সংগ্রহ করি",
          en: [
            "We collect the minimum information needed to provide our services: your phone number, name, and any details you voluntarily provide when registering or using the platform.",
            "When you refer others, we record the referral relationship so commissions can be credited correctly. We do not collect sensitive personal data beyond what is required.",
          ],
          bn: [
            "আমাদের সেবা প্রদানের জন্য প্রয়োজনীয় ন্যূনতম তথ্য আমরা সংগ্রহ করি: আপনার মোবাইল নম্বর, নাম এবং রেজিস্ট্রেশন বা প্ল্যাটফর্ম ব্যবহারের সময় আপনি স্বেচ্ছায় দেওয়া যেকোনো তথ্য।",
            "আপনি অন্যকে রেফার করলে কমিশন সঠিকভাবে প্রদানের জন্য আমরা রেফারেল সম্পর্ক সংরক্ষণ করি। প্রয়োজনীয়তার বাইরে আমরা সংবেদনশীল ব্যক্তিগত তথ্য সংগ্রহ করি না।",
          ],
        },
        {
          enTitle: "2. How We Use Your Information",
          bnTitle: "২. আমরা আপনার তথ্য কীভাবে ব্যবহার করি",
          en: [
            "Your information is used to: manage your account, process resource purchases and commissions, send service-related notifications (including WhatsApp updates you opt into), and improve our platform.",
            "We do not sell your personal information to third parties.",
          ],
          bn: [
            "আপনার তথ্য ব্যবহার করা হয়: আপনার অ্যাকাউন্ট পরিচালনা, রিসোর্স ক্রয় ও কমিশন প্রক্রিয়াকরণ, সেবা-সংক্রান্ত নোটিফিকেশন পাঠানো (আপনি সম্মতি দেওয়া ওয়াটসঅ্যাপ আপডেটসহ) এবং আমাদের প্ল্যাটফর্ম উন্নত করতে।",
            "আমরা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করি না।",
          ],
        },
        {
          enTitle: "3. Cookies & Tracking",
          bnTitle: "৩. কুকি ও ট্র্যাকিং",
          en: [
            "We use cookies to keep you logged in, remember your language preference, and understand how the platform is used. You can decline non-essential cookies via the consent banner.",
            "Analytics data is aggregated and does not personally identify you.",
          ],
          bn: [
            "আপনাকে লগইন রাখতে, আপনার ভাষা পছন্দ মনে রাখতে এবং প্ল্যাটফর্ম কীভাবে ব্যবহৃত হচ্ছে তা বুঝতে আমরা কুকি ব্যবহার করি। কনসেন্ট ব্যানারের মাধ্যমে অপ্রয়োজনীয় কুকি প্রত্যাখ্যান করতে পারেন।",
            "বিশ্লেষণ ডেটা একত্রিত আকারে থাকে এবং ব্যক্তিগতভাবে আপনাকে চিহ্নিত করে না।",
          ],
        },
        {
          enTitle: "4. Data Retention",
          bnTitle: "৪. ডেটা সংরক্ষণ",
          en: [
            "Account data is retained while your account is active. Withdrawal and commission records are kept to comply with financial record-keeping requirements.",
            "If you close your account, your personal details are deactivated and anonymized where possible, while financial records required by law are retained.",
          ],
          bn: [
            "আপনার অ্যাকাউন্ট সক্রিয় থাকাকালীন অ্যাকাউন্ট ডেটা সংরক্ষিত থাকে। আর্থিক রেকর্ড-রক্ষণাবেক্ষণের প্রয়োজনীয়তা মেনে চলতে উত্তোলন ও কমিশন রেকর্ড রাখা হয়।",
            "আপনি অ্যাকাউন্ট বন্ধ করলে আপনার ব্যক্তিগত তথ্য নিষ্ক্রিয় ও সম্ভব হলে বেনামী করা হয়, তবে আইন অনুযায়ী প্রয়োজনীয় আর্থিক রেকর্ড সংরক্ষিত থাকে।",
          ],
        },
        {
          enTitle: "5. Your Rights",
          bnTitle: "৫. আপনার অধিকার",
          en: [
            "You may request a copy of the data we hold about you, request corrections, or request deletion of your account. Contact support via WhatsApp or support@jobayergroup.com.",
          ],
          bn: [
            "আমাদের কাছে থাকা আপনার তথ্যের একটি কপি চাইতে, সংশোধনের অনুরোধ করতে বা অ্যাকাউন্ট মুছে ফেলার অনুরোধ করতে পারেন। ওয়াটসঅ্যাপ বা support@jobayergroup.com-এর মাধ্যমে সাপোর্টে যোগাযোগ করুন।",
          ],
        },
        {
          enTitle: "6. Contact",
          bnTitle: "৬. যোগাযোগ",
          en: [
            "For any privacy questions, contact us at support@jobayergroup.com. We respond within 48 hours.",
          ],
          bn: [
            "যেকোনো গোপনীয়তা প্রশ্নের জন্য support@jobayergroup.com-এ যোগাযোগ করুন। আমরা ৪৮ ঘণ্টার মধ্যে উত্তর দিই।",
          ],
        },
      ]}
    />
  );
}
