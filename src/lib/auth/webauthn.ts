import type { JsonWebKey } from "crypto";
import { getCached, setCached, invalidateCache } from "@/lib/cache";

// ── Challenge Store ──

interface ChallengeEntry {
  challenge: string;
  expiresAt: number;
}

// In-memory fallback (same-isolate fast path) + KV for multi-isolate consistency.
// Cloudflare isolates are ephemeral, so the authoritative store is KV.
const challengeStore = new Map<string, ChallengeEntry>();
const CHALLENGE_TTL_SEC = 300;
let lastCleanup = 0;

function cleanupStore(): void {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [id, entry] of challengeStore) {
    if (entry.expiresAt < now) challengeStore.delete(id);
  }
}

export async function issueChallenge(): Promise<{ id: string; challenge: string }> {
  cleanupStore();
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const challenge = base64urlEncode(bytes);
  const id = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const entry: ChallengeEntry = { challenge, expiresAt: Date.now() + CHALLENGE_TTL_SEC * 1000 };
  challengeStore.set(id, entry);
  setCached(`wb:ch:${id}`, entry).catch(() => {});
  return { id, challenge };
}

export async function consumeChallenge(id: string): Promise<string | null> {
  cleanupStore();
  const cached = await getCached<ChallengeEntry>(`wb:ch:${id}`, CHALLENGE_TTL_SEC);
  const local = challengeStore.get(id);
  const entry = cached || local;
  if (!entry) return null;
  challengeStore.delete(id);
  invalidateCache(`wb:ch:${id}`).catch(() => {});
  if (entry.expiresAt < Date.now()) return null;
  return entry.challenge;
}

// ── Base64 Helpers ──

export function base64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const s = atob(str);
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i);
  return view;
}

function b64Decode(str: string): Uint8Array<ArrayBuffer> {
  const s = atob(str);
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i);
  return view;
}

// ── Minimal CBOR Decoder ──

const textDecoder = new TextDecoder();

function readCBOR(bytes: Uint8Array, pos: { offset: number }): any {
  if (pos.offset >= bytes.length) return undefined;
  const first = bytes[pos.offset++];
  const majorType = first >> 5;
  let addInfo = first & 0x1f;

  let value: number;
  if (addInfo < 24) {
    value = addInfo;
  } else if (addInfo === 24) {
    value = bytes[pos.offset++];
  } else if (addInfo === 25) {
    value = (bytes[pos.offset++] << 8) | bytes[pos.offset++];
  } else if (addInfo === 26) {
    value = (bytes[pos.offset++] << 24) | (bytes[pos.offset++] << 16) |
            (bytes[pos.offset++] << 8) | bytes[pos.offset++];
  } else {
    pos.offset += 8; value = 0;
  }

  switch (majorType) {
    case 0: return value;
    case 1: return -1 - value;
    case 2: { const r = bytes.slice(pos.offset, pos.offset + value); pos.offset += value; return r; }
    case 3: { const r = textDecoder.decode(bytes.slice(pos.offset, pos.offset + value)); pos.offset += value; return r; }
    case 4: { const arr: any[] = []; for (let i = 0; i < value; i++) arr.push(readCBOR(bytes, pos)); return arr; }
    case 5: { const map = new Map<number | string, any>(); for (let i = 0; i < value; i++) { const k = readCBOR(bytes, pos); const v = readCBOR(bytes, pos); map.set(k, v); } return map; }
    case 6: return readCBOR(bytes, pos);
    default: return undefined;
  }
}

// ── COSE Key Extraction from attestationObject ──

export function extractPublicKeyFromAttestationObject(attestationObjectBase64: string): JsonWebKey | null {
  try {
    const bytes = b64Decode(attestationObjectBase64);
    const cbor = readCBOR(bytes, { offset: 0 });
    if (!(cbor instanceof Map)) return null;
    const authData = cbor.get("authData");
    if (!(authData instanceof Uint8Array)) return null;
    return parseAuthData(authData);
  } catch { return null; }
}

function parseAuthData(authData: Uint8Array): JsonWebKey | null {
  let off = 0;
  off += 32; // rpIdHash
  const flags = authData[off++];
  off += 4;  // signCount
  if (!(flags & 0x40)) return null;
  off += 16; // AAGUID
  const credIdLen = (authData[off++] << 8) | authData[off++];
  off += credIdLen;
  const coseKey = readCBOR(authData, { offset: off });
  if (!(coseKey instanceof Map)) return null;
  return coseKeyToJWK(coseKey);
}

function coseKeyToJWK(coseKey: Map<number, any>): JsonWebKey | null {
  const kty = coseKey.get(1);  // 1 = kty
  const alg = coseKey.get(3);  // 3 = alg
  const crv = coseKey.get(-1); // -1 = crv
  const x = coseKey.get(-2);   // -2 = x
  const y = coseKey.get(-3);   // -3 = y
  if (kty !== 2 || alg !== -7 || crv !== 1) return null;
  if (!(x instanceof Uint8Array) || !(y instanceof Uint8Array)) return null;
  return {
    kty: "EC", crv: "P-256",
    x: base64urlEncode(x),
    y: base64urlEncode(y),
  };
}

// ── Authentication Assertion Verification ──

export async function verifyAuthentication(
  storedPublicKeyJWK: JsonWebKey,
  clientDataJSONBase64: string,
  authenticatorDataBase64: string,
  signatureBase64: string,
  expectedChallenge: string,
  expectedOrigin: string,
): Promise<{ valid: boolean; signCount: number | null }> {
  try {
    const clientDataBytes = b64Decode(clientDataJSONBase64);
    const clientData = JSON.parse(textDecoder.decode(clientDataBytes));
    if (clientData.type !== "webauthn.get") return { valid: false, signCount: null };
    if (clientData.challenge !== expectedChallenge) return { valid: false, signCount: null };
    if (clientData.origin !== expectedOrigin) return { valid: false, signCount: null };

    const authDataBytes = b64Decode(authenticatorDataBase64);
    if (authDataBytes.length < 37) return { valid: false, signCount: null };

    // Authenticator flags: UP (user-present) = 0x01, UV (user-verified) = 0x04
    const flags = authDataBytes[32];
    const userPresent = (flags & 0x01) === 0x01;
    const userVerified = (flags & 0x04) === 0x04;
    if (!userPresent || !userVerified) return { valid: false, signCount: null };

    const signCount = ((authDataBytes[33] << 24) | (authDataBytes[34] << 16) | (authDataBytes[35] << 8) | authDataBytes[36]) >>> 0;

    const publicKey = await crypto.subtle.importKey(
      "jwk", storedPublicKeyJWK as any,
      { name: "ECDSA", namedCurve: "P-256" },
      false, ["verify"]
    );

    const clientDataHash = await crypto.subtle.digest("SHA-256", clientDataBytes);
    const signedData = new Uint8Array(authDataBytes.length + clientDataHash.byteLength);
    signedData.set(authDataBytes, 0);
    signedData.set(new Uint8Array(clientDataHash), authDataBytes.length);

    const sigBytes = b64Decode(signatureBase64);
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      publicKey, sigBytes, signedData
    );
    return { valid, signCount };
  } catch {
    return { valid: false, signCount: null };
  }
}

// ── Registration Attestation Verification ──

export async function verifyRegistrationAttestation(
  clientDataJSONBase64: string,
  attestationObjectBase64: string,
  expectedChallenge: string,
  expectedOrigin: string,
): Promise<{ jwk: JsonWebKey; credentialId: string } | null> {
  try {
    const clientDataBytes = b64Decode(clientDataJSONBase64);
    const clientData = JSON.parse(textDecoder.decode(clientDataBytes));
    if (clientData.type !== "webauthn.create") return null;
    if (clientData.challenge !== expectedChallenge) return null;
    if (clientData.origin !== expectedOrigin) return null;

    const jwk = extractPublicKeyFromAttestationObject(attestationObjectBase64);
    if (!jwk) return null;

    // Extract credentialId from authData as well
    const attBytes = b64Decode(attestationObjectBase64);
    const cbor = readCBOR(attBytes, { offset: 0 });
    if (!(cbor instanceof Map)) return null;
    const authData = cbor.get("authData");
    if (!(authData instanceof Uint8Array)) return null;

    let off = 0;
    off += 32; const flags = authData[off++];
    off += 4; if (!(flags & 0x40)) return null;
    off += 16;
    const credIdLen = (authData[off++] << 8) | authData[off++];
    const credentialIdBytes = authData.slice(off, off + credIdLen);
    const credentialId = btoa(String.fromCharCode(...credentialIdBytes));

    return { jwk, credentialId };
  } catch { return null; }
}
