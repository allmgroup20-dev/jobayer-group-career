const GRAPH_API = "https://graph.facebook.com/v18.0/me/messages";

function getPageToken(): string {
  const token = process.env.MESSENGER_PAGE_TOKEN;
  if (!token) throw new Error("MESSENGER_PAGE_TOKEN env var not set");
  return token;
}

export async function sendMessengerMessage(
  senderId: string,
  text: string,
  pageToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const token = pageToken || getPageToken();
    const res = await fetch(`${GRAPH_API}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text },
      }),
    });
    const data = await res.json() as { message_id?: string; error?: { message: string }; recipient_id?: string };
    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message || "Messenger API error" };
    }
    return { success: true, messageId: data.message_id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function setMessengerWebhook(verifyToken: string, pageToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = pageToken || getPageToken();
    const webhookUrl = `${process.env.PUBLIC_URL || "https://career.jobayergroup.com"}/api/messenger/webhook`;
    const res = await fetch(`https://graph.facebook.com/v18.0/me/subscribed_apps?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscribed_fields: ["messages", "messaging_postbacks"],
        callback_url: webhookUrl,
        verify_token: verifyToken,
      }),
    });
    const data = await res.json() as { success?: boolean; error?: { message: string } };
    if (!data.success) return { success: false, error: data.error?.message || "Failed to subscribe" };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
