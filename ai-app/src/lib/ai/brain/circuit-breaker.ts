interface CircuitState {
  failures: number;
  lastFailureAt: number;
  state: "closed" | "open" | "half-open";
  halfOpenRequests: number;
}

const circuits = new Map<string, CircuitState>();

const THRESHOLD = 5;
const RESET_TIMEOUT = 30000;
const HALF_MAX = 3;

function getCircuit(name: string): CircuitState {
  let c = circuits.get(name);
  if (!c) {
    c = { failures: 0, lastFailureAt: 0, state: "closed", halfOpenRequests: 0 };
    circuits.set(name, c);
  }
  return c;
}

export async function callWithCircuitBreaker<T>(
  circuitName: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  const circuit = getCircuit(circuitName);
  const now = Date.now();

  if (circuit.state === "open") {
    if (now - circuit.lastFailureAt > RESET_TIMEOUT) {
      circuit.state = "half-open";
      circuit.halfOpenRequests = 0;
    } else {
      if (fallback) return fallback();
      throw new Error(`Circuit "${circuitName}" is open`);
    }
  }

  if (circuit.state === "half-open") {
    if (circuit.halfOpenRequests >= HALF_MAX) {
      if (fallback) return fallback();
      throw new Error(`Circuit "${circuitName}" is half-open and at capacity`);
    }
    circuit.halfOpenRequests++;
  }

  try {
    const result = await fn();
    circuit.failures = 0;
    circuit.state = "closed";
    circuit.halfOpenRequests = 0;
    return result;
  } catch (err) {
    circuit.failures++;
    circuit.lastFailureAt = now;
    if (circuit.failures >= THRESHOLD) {
      circuit.state = "open";
    }
    if (fallback) return fallback();
    throw err;
  }
}

export function recordFailure(key: string): void {
  const circuit = getCircuit(key);
  circuit.failures++;
  circuit.lastFailureAt = Date.now();
  if (circuit.failures >= THRESHOLD) {
    circuit.state = "open";
  }
}

export function recordSuccess(key: string): void {
  const circuit = getCircuit(key);
  circuit.failures = 0;
  circuit.state = "closed";
  circuit.halfOpenRequests = 0;
}

export function isCircuitOpen(key: string): boolean {
  const circuit = circuits.get(key);
  if (!circuit) return false;
  if (circuit.state === "open") {
    if (Date.now() - circuit.lastFailureAt > RESET_TIMEOUT) {
      circuit.state = "half-open";
      circuit.halfOpenRequests = 0;
      return false;
    }
    return true;
  }
  return false;
}

export function getCircuitSummary(): Record<string, { state: string; failures: number; lastFailure: string }> {
  const summary: Record<string, any> = {};
  for (const [key, c] of circuits) {
    if (c.failures > 0 || c.state !== "closed") {
      summary[key] = {
        state: c.state,
        failures: c.failures,
        lastFailure: c.lastFailureAt ? new Date(c.lastFailureAt).toISOString() : "never",
      };
    }
  }
  return summary;
}

export function resetCircuit(key: string): void {
  circuits.delete(key);
}

export function resetAllCircuits(): void {
  circuits.clear();
}
