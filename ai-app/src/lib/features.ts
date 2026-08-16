import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

// Central feature flags for the jgcareer-ai worker.
//
// The feature_flags table lives in the shared jgcareer-db (same DB the main
// app worker uses), so toggles made from /company/features in the main app
// apply here immediately. Every flag defaults to OFF when missing.

export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const db = await getDB();
    const rows = await query<{ enabled: number }>(
      db,
      "SELECT enabled FROM feature_flags WHERE feature_key = ? LIMIT 1",
      [key]
    );
    return rows.length > 0 && rows[0].enabled === 1;
  } catch {
    return false;
  }
}