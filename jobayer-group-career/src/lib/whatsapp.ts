interface WhatsAppMessage {
  to: string;
  text: string;
}

export async function sendWhatsAppMessage(
  message: WhatsAppMessage,
  apiKey: string,
  apiUrl = "https://whatsapp-api.example.com/send"
): Promise<boolean> {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: message.to,
        text: message.text,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function sendBulkWhatsApp(
  messages: WhatsAppMessage[],
  apiKey: string,
  apiUrl?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const msg of messages) {
    const ok = await sendWhatsAppMessage(msg, apiKey, apiUrl);
    if (ok) success++;
    else failed++;
  }

  return { success, failed };
}

export function generateWhatsAppTemplate(workerName: string, type: "welcome" | "commission" | "order" | "withdrawal"): string {
  const templates: Record<string, string> = {
    welcome: `Welcome ${workerName} to Jobayer Group Career! Start your journey today and build your team.`,
    commission: `Congratulations ${workerName}! You have received a new commission. Check your dashboard for details.`,
    order: `Hello ${workerName}, your order has been placed successfully. Track it from your dashboard.`,
    withdrawal: `Dear ${workerName}, your withdrawal request has been processed. Thank you for being with Jobayer Group Career.`,
  };

  return templates[type] || `Hello ${workerName}, thank you for being with Jobayer Group Career.`;
}
