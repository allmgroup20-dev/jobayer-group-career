export type OutreachChannel = "whatsapp" | "email" | "sms";

export interface ChannelMessage {
  channel: OutreachChannel;
  to: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelResult {
  channel: OutreachChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendChannelMessage(msg: ChannelMessage): Promise<ChannelResult> {
  switch (msg.channel) {
    case "whatsapp":
      return sendWhatsAppMessage(msg);
    case "email":
      return sendEmailMessage(msg);
    case "sms":
      return sendSMSMessage(msg);
    default:
      return { channel: msg.channel, success: false, error: `Unsupported channel: ${msg.channel}` };
  }
}

async function sendWhatsAppMessage(msg: ChannelMessage): Promise<ChannelResult> {
  try {
    const { sendMessage } = await import("@/lib/whatsapp/sender");
    const result = await sendMessage(msg.to, msg.body);
    return { channel: "whatsapp", success: result.success, messageId: result.messageId || undefined };
  } catch (e) {
    return { channel: "whatsapp", success: false, error: (e as Error)?.message };
  }
}

async function sendEmailMessage(msg: ChannelMessage): Promise<ChannelResult> {
  try {
    // Email sending using SMTP or API
    const emailApi = process.env.EMAIL_API_URL;
    if (!emailApi) {
      // Fallback: log the email (dev mode)
      console.log(`[EMAIL] To: ${msg.to} | Subject: ${msg.subject || "No subject"} | Body: ${msg.body.slice(0, 100)}...`);
      return { channel: "email", success: true, messageId: `logged-${Date.now()}` };
    }

    const res = await fetch(emailApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.EMAIL_API_KEY || ""}` },
      body: JSON.stringify({
        to: msg.to,
        subject: msg.subject || "Jobayer Group Career",
        html: msg.body,
      }),
    });
    const data = await res.json() as { id?: string };
    return { channel: "email", success: res.ok, messageId: data.id || undefined };
  } catch (e) {
    return { channel: "email", success: false, error: (e as Error)?.message };
  }
}

async function sendSMSMessage(msg: ChannelMessage): Promise<ChannelResult> {
  try {
    const smsApi = process.env.SMS_API_URL;
    if (!smsApi) {
      console.log(`[SMS] To: ${msg.to} | Body: ${msg.body.slice(0, 100)}...`);
      return { channel: "sms", success: true, messageId: `logged-${Date.now()}` };
    }

    const res = await fetch(smsApi, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SMS_API_KEY || ""}` },
      body: JSON.stringify({
        to: msg.to,
        message: msg.body,
      }),
    });
    const data = await res.json() as { id?: string };
    return { channel: "sms", success: res.ok, messageId: data.id || undefined };
  } catch (e) {
    return { channel: "sms", success: false, error: (e as Error)?.message };
  }
}

export function selectBestChannel(
  preferredChannel: OutreachChannel | undefined,
  userHasEmail: boolean,
  userHasPhone: boolean
): OutreachChannel {
  if (preferredChannel) {
    if (preferredChannel === "email" && !userHasEmail) return userHasPhone ? "whatsapp" : "sms";
    if (preferredChannel === "sms" && !userHasPhone) return userHasEmail ? "email" : "whatsapp";
    return preferredChannel;
  }
  // Default priority: WhatsApp > Email > SMS
  if (userHasPhone) return "whatsapp";
  if (userHasEmail) return "email";
  return "whatsapp";
}

export function buildMultiChannelContext(
  channels: OutreachChannel[],
  lang: string
): string {
  const channelLabels: Record<OutreachChannel, string> = {
    whatsapp: lang === "bn" ? "WhatsApp" : "WhatsApp",
    email: lang === "bn" ? "ইমেইল" : "Email",
    sms: lang === "bn" ? "এসএমএস" : "SMS",
  };

  const channelDescriptions: Record<OutreachChannel, string> = {
    whatsapp: lang === "bn" ? "তাত্ক্ষণিক বার্তা, উচ্চ খোলার হার" : "Instant messaging, high open rate",
    email: lang === "bn" ? "বিস্তারিত যোগাযোগের জন্য উপযুক্ত" : "Best for detailed communications",
    sms: lang === "bn" ? "সংক্ষিপ্ত জরুরি বার্তা" : "Short urgent messages",
  };

  const header = lang === "bn"
    ? "## মাল্টি-চ্যানেল আউটরিচ\nনিম্নলিখিত চ্যানেলের মাধ্যমে সদস্যদের সাথে যোগাযোগ করা যেতে পারে:\n"
    : "## Multi-Channel Outreach\nMembers can be reached via the following channels:\n";

  const lines = channels.map((ch) => {
    return `- **${channelLabels[ch]}**: ${channelDescriptions[ch]}`;
  });

  return `${header}\n${lines.join("\n")}\n`;
}
