import PolicyPage from "@/components/legal/PolicyPage";

export default function RefundPage() {
  return (
    <PolicyPage
      badgeEn="💸 Refund Policy"
      badgeBn="💸 রিফান্ড নীতি"
      titleEn="Refund & Cancellation Policy"
      titleBn="রিফান্ড ও বাতিলকরণ নীতি"
      updatedEn="Last updated: August 2026"
      updatedBn="সর্বশেষ আপডেট: আগস্ট ২০২৬"
      sections={[
        {
          enTitle: "1. Digital Resources",
          bnTitle: "১. ডিজিটাল রিসোর্স",
          en: [
            "All resources on Jobayer Group Career are digital and delivered immediately upon purchase. Because digital products cannot be returned once accessed, our refund policy is simple and transparent:",
            "A refund is available within 7 days of purchase only if the resource has not been accessed or downloaded. No refund is provided if the resource has been opened or downloaded.",
          ],
          bn: [
            "জোবায়ের গ্রুপ ক্যারিয়ারের সব রিসোর্স ডিজিটাল এবং ক্রয়ের সাথে সাথেই ডেলিভার করা হয়। ডিজিটাল পণ্য একবার অ্যাক্সেস করলে ফেরত দেওয়া যায় না বলে আমাদের রিফান্ড নীতি সহজ ও স্বচ্ছ:",
            "রিসোর্সটি খোলা বা ডাউনলোড না হলে ক্রয়ের ৭ দিনের মধ্যে রিফান্ড পাওয়া যায়। রিসোর্স খোলা বা ডাউনলোড হয়ে থাকলে কোনো রিফান্ড দেওয়া হয় না।",
          ],
        },
        {
          enTitle: "2. How to Request a Refund",
          bnTitle: "২. রিফান্ডের অনুরোধ কীভাবে করবেন",
          en: [
            "Contact support via WhatsApp or support@jobayergroup.com within 7 days of purchase, stating the resource and your phone number.",
            "Refunds are processed within 5-7 business days after approval. The refund is returned to the original payment method where possible.",
          ],
          bn: [
            "ক্রয়ের ৭ দিনের মধ্যে ওয়াটসঅ্যাপ বা support@jobayergroup.com-এর মাধ্যমে রিসোর্সের নাম ও আপনার মোবাইল নম্বরসহ সাপোর্টে যোগাযোগ করুন।",
            "অনুমোদনের পর ৫-৭ কার্যদিবসের মধ্যে রিফান্ড প্রক্রিয়া করা হয়। সম্ভব হলে রিফান্ডটি মূল পেমেন্ট মাধ্যমেই ফেরত দেওয়া হয়।",
          ],
        },
        {
          enTitle: "3. Account Cancellation",
          bnTitle: "৩. অ্যাকাউন্ট বাতিলকরণ",
          en: [
            "You may cancel your account at any time by contacting support via WhatsApp. Your account is deactivated within 48 hours.",
            "Unpaid earned commissions are paid out per the normal withdrawal rules before your account is closed.",
          ],
          bn: [
            "যেকোনো সময় ওয়াটসঅ্যাপের মাধ্যমে সাপোর্টে যোগাযোগ করে আপনার অ্যাকাউন্ট বাতিল করতে পারেন। ৪৮ ঘণ্টার মধ্যে অ্যাকাউন্ট নিষ্ক্রিয় করা হয়।",
            "অ্যাকাউন্ট বন্ধের আগে অপরিশোধিত অর্জিত কমিশন স্বাভাবিক উত্তোলন নিয়ম অনুযায়ী পরিশোধ করা হয়।",
          ],
        },
        {
          enTitle: "4. No Hidden Terms",
          bnTitle: "৪. কোনো লুকানো শর্ত নেই",
          en: [
            "There are no hidden conditions. If a refund is not applicable (for example, the resource was already accessed), we will clearly explain the reason for the decision.",
          ],
          bn: [
            "কোনো লুকানো শর্ত নেই। রিফান্ড প্রযোজ্য না হলে (উদাহরণস্বরূপ, রিসোর্স ইতিমধ্যে খোলা হয়েছে) আমরা সিদ্ধান্তের কারণ স্পষ্টভাবে ব্যাখ্যা করব।",
          ],
        },
        {
          enTitle: "5. Contact",
          bnTitle: "৫. যোগাযোগ",
          en: [
            "For any refund or cancellation questions, contact support@jobayergroup.com.",
          ],
          bn: [
            "যেকোনো রিফান্ড বা বাতিলকরণ প্রশ্নের জন্য support@jobayergroup.com-এ যোগাযোগ করুন।",
          ],
        },
      ]}
    />
  );
}
