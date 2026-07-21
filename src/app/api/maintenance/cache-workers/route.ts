import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { setCached } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("Authorization");
    if (auth !== "Bearer cache-backfill-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDB();

    // Cache all workers
    const workers = await query<{ worker_id: string; name: string; password: string; phone: string }>(
      db,
      "SELECT worker_id, name, password, phone FROM workers"
    );

    let cached = 0;
    for (const w of workers) {
      const phoneHash = Array.from(new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(w.phone))
      )).map(b => b.toString(16).padStart(2, "0")).join("");

      await setCached(`auth:worker:${phoneHash}`, {
        worker_id: w.worker_id,
        name: w.name,
        password: w.password,
      });
      cached++;
    }

    // Cache all company users
    const companyUsers = await query<{ username: string; name: string; password: string; role: string }>(
      db,
      "SELECT username, name, password, role FROM company_users"
    );

    let companyCached = 0;
    for (const u of companyUsers) {
      const usernameHash = Array.from(new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(u.username.toLowerCase()))
      )).map(b => b.toString(16).padStart(2, "0")).join("");

      await setCached(`auth:company:${usernameHash}`, {
        username: u.username,
        name: u.name,
        password: u.password,
        role: u.role,
      });
      companyCached++;
    }

    return NextResponse.json({
      success: true,
      totalWorkers: workers.length,
      workersCached: cached,
      companyUsersCached: companyCached,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
