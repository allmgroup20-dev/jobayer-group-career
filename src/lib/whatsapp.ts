export { sendMessage, enqueueMessage, processQueue, getQueueStats, getPendingWebMessages, markWebSent } from "./whatsapp/index"

export async function sendWhatsAppMessage(
  message: { to: string; text: string },
  _apiKey?: string,
  _apiUrl?: string
): Promise<boolean> {
  const { sendMessage } = await import("./whatsapp/sender")
  const result = await sendMessage(message.to, message.text)
  return result.success
}

export function generateWhatsAppTemplate(workerName: string, type: "welcome" | "commission" | "order" | "withdrawal" | "premium_upgrade" | "general_welcome" | "referral_share"): string {
  const templates: Record<string, string> = {
    welcome: `Welcome ${workerName} to Jobayer Group Career! Start your journey today and build your team.`,
    commission: `Congratulations ${workerName}! You have received a new commission. Check your dashboard for details.`,
    order: `Hello ${workerName}, your order has been placed successfully. Track it from your dashboard.`,
    withdrawal: `Dear ${workerName}, your withdrawal request has been processed. Thank you for being with Jobayer Group Career.`,
    premium_upgrade: `🎉 Congratulations ${workerName}! You are now a PREMIUM Member! Enjoy zero tax on withdrawals, automatic payouts, and unlimited resource unlocks. Thank you for your trust!`,
    general_welcome: `👋 Welcome ${workerName}! You are now a General Member of Jobayer Group Career. ✅ Refer friends and earn commissions ✅ Access free resources ✅ Upgrade to Premium to unlock: zero tax, auto payouts, unlimited unlocks. Visit your dashboard to start!`,
    referral_share: `🎯 Jobayer Group Career — ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে! বন্ধুর সাথে শেয়ার করুন, একসাথে শিখুন: {{refLink}} (কোড: {{refCode}})`,
  }
  return templates[type] || `Hello ${workerName}, thank you for being with Jobayer Group Career.`
}
