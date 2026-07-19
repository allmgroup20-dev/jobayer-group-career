import { ensureDB } from "@/lib/db";

const queue: Record<string, unknown>[] = [];
let flushing = false;

async function flush() {
  if (flushing) return;
  flushing = true;
  const batch = queue.splice(0);
  if (batch.length === 0) { flushing = false; return; }
  try {
    const db = await ensureDB();
    const stmt = db.prepare(
      `INSERT INTO system_logs (log_type, source, message, details, stack_trace, duration_ms, status_code, route, method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const row of batch) {
      await stmt.bind(
        row.log_type || "info",
        row.source || "unknown",
        row.message || "",
        row.details ? JSON.stringify(row.details) : null,
        row.stack_trace || null,
        row.duration_ms || null,
        row.status_code || null,
        row.route || null,
        row.method || null
      ).run();
    }
  } catch {
    // logger must never throw
  }
  flushing = false;
}

export async function logSystemEvent(
  logType: string,
  source: string,
  message: string,
  data?: Record<string, unknown>
) {
  queue.push({
    log_type: logType,
    source,
    message,
    ...(data?.details ? { details: data.details } : {}),
    ...(data?.stack_trace ? { stack_trace: data.stack_trace } : {}),
    ...(data?.duration_ms ? { duration_ms: data.duration_ms } : {}),
    ...(data?.status_code ? { status_code: data.status_code } : {}),
    ...(data?.route ? { route: data.route } : {}),
    ...(data?.method ? { method: data.method } : {}),
    ...(data?.extra ? { extra: data.extra } : {}),
  });
  if (queue.length >= 10) {
    flush().catch(() => {});
  } else if (!flushing) {
    setTimeout(() => flush().catch(() => {}), 5000);
  }
}

export async function logError(source: string, error: unknown, extra?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  await logSystemEvent("error", source, err.message, {
    stack_trace: err.stack,
    ...extra,
  });
}

export function logApiError(source: string, error: unknown, route: string, method: string) {
  logError(source, error, { route, method }).catch(() => {});
}
