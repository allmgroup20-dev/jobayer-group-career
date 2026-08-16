import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export interface CostEntry {
  provider: string;
  feature: string;
  operation?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  quantity?: number;
  unitCostUsd?: number;
  estCostUsd?: number;
  status?: string;
}

// Fire-and-forget insert into api_cost_logs. Never throws — cost accounting must
// never break a request that already succeeded.
export async function logApiCost(entry: CostEntry): Promise<void> {
  try {
    const db = await ensureDB();
    await execute(
      { DB: db },
      `INSERT INTO api_cost_logs
        (provider, feature, operation, model, input_tokens, output_tokens,
         quantity, unit_cost_usd, est_cost_usd, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        entry.provider,
        entry.feature || "general",
        entry.operation || null,
        entry.model || null,
        entry.inputTokens || 0,
        entry.outputTokens || 0,
        entry.quantity || 1,
        entry.unitCostUsd || 0,
        entry.estCostUsd || 0,
        entry.status || "ok",
      ]
    );
  } catch {
    // ignore — best-effort accounting
  }
}