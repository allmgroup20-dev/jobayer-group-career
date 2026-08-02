async function getHuggingFaceKey(db?: any): Promise<string | null> {
  if (process.env.HUGGINGFACE_API_KEY) return process.env.HUGGINGFACE_API_KEY;
  if (!db) return null;
  try {
    const { queryFirst } = await import("@/lib/db/queries");
    const row = await queryFirst<{ key_value: string }>(
      { DB: db },
      "SELECT key_value FROM ai_api_keys WHERE provider = 'huggingface' AND is_active = 1 ORDER BY id DESC LIMIT 1"
    );
    return row?.key_value || null;
  } catch {
    return null;
  }
}

async function getOpenRouterKey(db?: any): Promise<string | null> {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  if (!db) return null;
  try {
    const { queryFirst } = await import("@/lib/db/queries");
    const row = await queryFirst<{ key_value: string }>(
      { DB: db },
      "SELECT key_value FROM ai_api_keys WHERE provider = 'openrouter' AND is_active = 1 ORDER BY id ASC LIMIT 1"
    );
    return row?.key_value || null;
  } catch {
    return null;
  }
}

export async function downloadMedia(mediaId: string): Promise<{ buffer: ArrayBuffer; mimeType: string } | null> {
  const token = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_META_TOKEN;
  if (!token) return null;

  try {
    const infoRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!infoRes.ok) return null;
    const info = await infoRes.json() as { url?: string; mime_type?: string };
    if (!info.url) return null;

    const dataRes = await fetch(info.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!dataRes.ok) return null;

    const buffer = await dataRes.arrayBuffer();
    return { buffer, mimeType: info.mime_type || "audio/ogg" };
  } catch {
    return null;
  }
}

export async function transcribeAudio(audioBuffer: ArrayBuffer, db?: any): Promise<string | null> {
  const hfKey = await getHuggingFaceKey(db);
  if (!hfKey) return null;

  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "audio/ogg" },
        body: audioBuffer,
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as { text?: string };
    return data?.text || null;
  } catch {
    return null;
  }
}

export async function analyzeImage(imageBuffer: ArrayBuffer, mimeType: string, db?: any): Promise<string | null> {
  const token = await getOpenRouterKey(db);
  if (!token) return null;

  try {
    const base64 = arrayBufferToBase64(imageBuffer);
    const dataUri = `data:${mimeType};base64,${base64}`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "HTTP-Referer": "https://career.jobayergroup.com",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        messages: [
          { role: "system", content: "Describe this image in detail. Include text, objects, people, and context." },
          { role: "user", content: [
            { type: "image_url", image_url: { url: dataUri } },
            { type: "text", text: "What do you see in this image? Describe everything." },
          ]},
        ],
        max_tokens: 500,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { choices?: { message: { content: string } }[] };
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface MediaResult {
  text: string;
  mediaType?: "voice" | "image";
  mediaDescription?: string;
}
