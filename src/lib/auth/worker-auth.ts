async function signHMAC(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let _jwtSecretWarned = false;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (!_jwtSecretWarned) {
      console.error("CRITICAL: JWT_SECRET env var is not set! Authentication tokens will be insecure. Set JWT_SECRET in wrangler.jsonc vars or .env");
      _jwtSecretWarned = true;
    }
    return "insecure-default-change-me";
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

export async function generateToken(workerId: string, secret: string, expiresInSec = 7 * 24 * 60 * 60): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: workerId, type: "worker",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  }));
  const signature = await signHMAC(secret, `${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token: string, secret: string): Promise<{ sub: string; type: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const expectedSig = await signHMAC(secret, `${parts[0]}.${parts[1]}`);
    if (parts[2] !== expectedSig) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, type: payload.type };
  } catch { return null; }
}

export function generateWorkerId(name: string, phone: string): string {
  const prefix = "JGC";
  const namePart = name.substring(0, 2).toUpperCase();
  const phonePart = phone.slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${namePart}${phonePart}${random}`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) {
    return "880" + digits.slice(1);
  }
  if (digits.startsWith("880") && digits.length === 13) {
    return digits;
  }
  return digits;
}
