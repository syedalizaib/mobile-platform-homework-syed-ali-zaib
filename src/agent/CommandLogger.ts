/**
 * CommandLogger — appends to in-memory + persisted log array.
 * Used by CommandRouter on every execute/reject.
 */

export interface LogEntry {
  command: { type: string; payload: Record<string, unknown> };
  status: string;
  reason?: string;
  timestamp: number;
}

let logBuffer: LogEntry[] = [];

export function appendLog(entry: LogEntry): void {
  logBuffer.push(entry);
}

export function getLog(): LogEntry[] {
  return [...logBuffer];
}

export function clearLog(): void {
  logBuffer = [];
}

export function setLog(entries: LogEntry[]): void {
  logBuffer = [...entries];
}
