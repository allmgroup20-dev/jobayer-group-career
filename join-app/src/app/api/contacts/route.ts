import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { verifyWorkerFromCookies } from "@/lib/session";
import { normalizePhone } from "@/lib/queries";

type PeopleConnection = {
  resourceName?: string;
  names?: { displayName?: string; givenName?: string }[];
  phoneNumbers?: { value?: string; canonicalForm?: string }[];
};

const GOOGLE_PEOPLE_URL = "https://people.googleapis.com/v1/people/me/connections";
const MAX_PAGES = 5;

function pickName(conn: PeopleConnection): string {
  const n = conn.names?.[0];
  return n?.displayName || n?.givenName || "";
}

// Proxies Google People API for the current worker's Google contacts.
// Returns { contacts: [{ name, phone }] } or { fallback: true } so the UI can
// silently fall back to the native phonebook picker when the API is
// unreachable or the free quota is exhausted.
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const auth = request.headers.get("authorization") || "";
    const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const accessToken = bearer || request.nextUrl.searchParams.get("access_token") || "";
    if (!accessToken) {
      return NextResponse.json({ fallback: true, error: "No token" });
    }

    const env = await getDB();
    await env.DB.prepare(
      "INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at) VALUES (?, 'contacts_fetch', '/complete', 'complete', ?, datetime('now'))"
    ).bind(payload.sub, JSON.stringify({ source: "google" })).run().catch(() => {});

    const contacts: { name: string; phone: string }[] = [];
    let nextPageToken: string | undefined;
    let pages = 0;

    do {
      const params = new URLSearchParams({
        personFields: "names,phoneNumbers",
        pageSize: "1000",
      });
      if (nextPageToken) params.set("pageToken", nextPageToken);
      const res = await fetch(`${GOOGLE_PEOPLE_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });

      if (!res.ok) {
        // 401/403 = bad token; 429/500 = quota/transient. Either way, fall back.
        return NextResponse.json({ fallback: true, error: `Google API ${res.status}` });
      }

      const data = await res.json() as { connections?: PeopleConnection[]; nextPageToken?: string };
      for (const conn of data.connections || []) {
        const name = pickName(conn);
        for (const p of conn.phoneNumbers || []) {
          const phone = normalizePhone(p.value || p.canonicalForm || "");
          if (phone) contacts.push({ name, phone });
        }
      }
      nextPageToken = data.nextPageToken;
      pages++;
    } while (nextPageToken && pages < MAX_PAGES);

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json({ fallback: true, error: "Internal" });
  }
}