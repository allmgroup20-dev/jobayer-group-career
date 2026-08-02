interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
  maxTotalCostPerDay: number;
  cooldownAfterLimit: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 30,
  maxTokensPerDay: 500_000,
  maxTotalCostPerDay: 50,
  cooldownAfterLimit: 60_000,
};

const configs = new Map<string, RateLimitConfig>();
const requestLogs = new Map<string, { count: number; resetAt: number }>();
const tokenLogs = new Map<string, { count: number; resetAt: number }>();
const costLogs = new Map<string, { count: number; resetAt: number }>();
const cooldowns = new Map<string, number>();

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

function getConfig(workerId: string): RateLimitConfig {
  return configs.get(workerId) || DEFAULT_CONFIG;
}

export function setRateLimitConfig(workerId: string, config: Partial<RateLimitConfig>): void {
  const existing = getConfig(workerId);
  configs.set(workerId, { ...existing, ...config });
}

export async function checkRateLimit(workerId: string): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  const now = Date.now();
  const config = getConfig(workerId);

  const cooldownUntil = cooldowns.get(workerId);
  if (cooldownUntil && now < cooldownUntil) {
    return { allowed: false, reason: "In cooldown after rate limit hit", retryAfter: cooldownUntil - now };
  }

  const reqEntry = requestLogs.get(workerId);
  if (reqEntry && now < reqEntry.resetAt) {
    if (reqEntry.count >= config.maxRequestsPerMinute) {
      cooldowns.set(workerId, now + config.cooldownAfterLimit);
      return { allowed: false, reason: "Per-minute rate limit exceeded", retryAfter: reqEntry.resetAt - now };
    }
  }

  const tokEntry = tokenLogs.get(workerId);
  if (tokEntry && now < tokEntry.resetAt) {
    if (tokEntry.count >= config.maxTokensPerDay) {
      return { allowed: false, reason: "Daily token limit exceeded", retryAfter: tokEntry.resetAt - now };
    }
  }

  const costEntry = costLogs.get(workerId);
  if (costEntry && now < costEntry.resetAt) {
    if (costEntry.count >= config.maxTotalCostPerDay) {
      return { allowed: false, reason: "Daily cost limit exceeded", retryAfter: costEntry.resetAt - now };
    }
  }

  return { allowed: true };
}

export async function consumeToken(workerId: string, tokens: number): Promise<void> {
  const now = Date.now();

  let reqEntry = requestLogs.get(workerId);
  if (!reqEntry || now >= reqEntry.resetAt) {
    reqEntry = { count: 0, resetAt: now + MINUTE_MS };
  }
  reqEntry.count++;
  requestLogs.set(workerId, reqEntry);

  let tokEntry = tokenLogs.get(workerId);
  if (!tokEntry || now >= tokEntry.resetAt) {
    tokEntry = { count: 0, resetAt: now + DAY_MS };
  }
  tokEntry.count += tokens;
  tokenLogs.set(workerId, tokEntry);
}

export async function consumeCost(workerId: string, cost: number): Promise<void> {
  const now = Date.now();

  let costEntry = costLogs.get(workerId);
  if (!costEntry || now >= costEntry.resetAt) {
    costEntry = { count: 0, resetAt: now + DAY_MS };
  }
  costEntry.count += cost;
  costLogs.set(workerId, costEntry);
}

export function getRateLimitStats(): { totalTracked: number } {
  return { totalTracked: requestLogs.size };
}

export function resetRateLimits(workerId: string): void {
  requestLogs.delete(workerId);
  tokenLogs.delete(workerId);
  costLogs.delete(workerId);
  cooldowns.delete(workerId);
}
