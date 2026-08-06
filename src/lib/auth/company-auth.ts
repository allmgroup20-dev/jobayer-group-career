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

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string): Uint8Array<ArrayBuffer> {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const s = atob(str);
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
  return buf;
}

const PBKDF2_ITERATIONS = 60000;
const PBKDF2_SALT_BYTES = 16;

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial, 256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64url(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash.startsWith("pbkdf2$")) {
    // Legacy format: unsalted SHA-256 hex
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    return toHex(new Uint8Array(digest)) === hash;
  }
  const parts = hash.split("$");
  if (parts.length !== 4) return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromB64url(parts[2]);
  const expected = parts[3];
  const derived = await pbkdf2(password, salt, iterations);
  return toHex(derived) === expected;
}

export async function generateCompanyToken(username: string, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: username, type: "company",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  }));
  const signature = await signHMAC(secret, `${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export async function verifyCompanyToken(token: string, secret: string): Promise<{ sub: string; type: string } | null> {
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
