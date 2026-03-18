import { create } from 'zustand';
import type { LogEntry } from '../agent/CommandLogger';

interface AgentLogState {
  log: LogEntry[];
  append: (entry: LogEntry) => void;
  clear: () => void;
}

export const useAgentLogStore = create<AgentLogState>((set) => ({
  log: [],
  append: (entry) =>
    set((state) => ({ log: [...state.log, entry] })),
  clear: () => set({ log: [] }),
}));
