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

export function generateToken(workerId: string, secret: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: workerId,
      type: "worker",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  );
  const signature = btoa(secret + "." + header + "." + payload);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string, secret: string): { sub: string; type: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, type: payload.type };
  } catch {
    return null;
  }
}

export function generateWorkerId(name: string, phone: string): string {
  const prefix = "JGC";
  const namePart = name.substring(0, 2).toUpperCase();
  const phonePart = phone.slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${namePart}${phonePart}${random}`;
}
