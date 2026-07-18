import { execute, query } from "@/lib/db/queries";

export interface ScheduleEntry {
  id: number;
  phone: string;
  agent_id: string;
  task_type: string;
  cron_expression: string;
  params: string;
  enabled: number;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

const TASK_TYPES = ["report", "follow_up", "check_in", "birthday", "reminder"] as const;

export function parseCron(cron: string): { hour: number; minute: number; dayOfWeek?: number } {
  const parts = cron.split(" ");
  const minute = parseInt(parts[0] || "0", 10);
  const hour = parseInt(parts[1] || "9", 10);
  const dayOfWeek = parts[4] !== "*" ? parseInt(parts[4], 10) : undefined;
  return { hour, minute, dayOfWeek };
}

export function computeNextRun(cron: string): string {
  const { hour, minute, dayOfWeek } = parseCron(cron);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  if (next <= now) next.setDate(next.getDate() + 1);

  if (dayOfWeek !== undefined) {
    while (next.getDay() !== dayOfWeek) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next.toISOString().replace("T", " ").split(".")[0];
}

export async function createSchedule(
  db: any,
  phone: string,
  agent_id: string,
  task_type: string,
  cron_expression: string,
  params: Record<string, any> = {},
): Promise<void> {
  if (!TASK_TYPES.includes(task_type as any)) {
    throw new Error(`Invalid task type: ${task_type}. Must be one of: ${TASK_TYPES.join(", ")}`);
  }
  const nextRun = computeNextRun(cron_expression);
  await execute(
    db,
    `INSERT INTO agent_schedule (phone, agent_id, task_type, cron_expression, params, next_run_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [phone, agent_id, task_type, cron_expression, JSON.stringify(params), nextRun],
  );
}

export async function getSchedules(
  db: any,
  phone?: string,
  enabledOnly = true,
): Promise<ScheduleEntry[]> {
  let sql = `SELECT id, phone, agent_id, task_type, cron_expression, params, enabled, last_run_at, next_run_at, created_at FROM agent_schedule WHERE 1=1`;
  const params: unknown[] = [];
  if (phone) { sql += ` AND phone = ?`; params.push(phone); }
  if (enabledOnly) { sql += ` AND enabled = 1`; }
  sql += ` ORDER BY next_run_at ASC`;
  return query<ScheduleEntry>(db, sql, params);
}

export async function updateSchedule(
  db: any,
  id: number,
  updates: Partial<Pick<ScheduleEntry, "cron_expression" | "enabled" | "params">>,
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (updates.cron_expression) {
    sets.push("cron_expression = ?");
    params.push(updates.cron_expression);
    sets.push("next_run_at = ?");
    params.push(computeNextRun(updates.cron_expression));
  }
  if (updates.enabled !== undefined) {
    sets.push("enabled = ?");
    params.push(updates.enabled);
  }
  if (updates.params) {
    sets.push("params = ?");
    params.push(JSON.stringify(updates.params));
  }

  if (sets.length === 0) return;
  params.push(id);
  await execute(db, `UPDATE agent_schedule SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteSchedule(db: any, id: number): Promise<void> {
  await execute(db, `DELETE FROM agent_schedule WHERE id = ?`, [id]);
}

export async function getDueSchedules(db: any): Promise<ScheduleEntry[]> {
  return query<ScheduleEntry>(
    db,
    `SELECT id, phone, agent_id, task_type, cron_expression, params, enabled, last_run_at, next_run_at, created_at FROM agent_schedule WHERE enabled = 1 AND next_run_at <= datetime('now') ORDER BY next_run_at ASC LIMIT 20`,
  );
}

export async function markScheduleRun(db: any, id: number, nextCron: string): Promise<void> {
  const nextRun = computeNextRun(nextCron);
  await execute(
    db,
    `UPDATE agent_schedule SET last_run_at = datetime('now'), next_run_at = ? WHERE id = ?`,
    [nextRun, id],
  );
}
