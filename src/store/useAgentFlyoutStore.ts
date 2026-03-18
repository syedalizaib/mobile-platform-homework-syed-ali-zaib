import { create } from 'zustand';

interface AgentFlyoutState {
  visible: boolean;
  open: () => void;
  close: () => void;
}

export const useAgentFlyoutStore = create<AgentFlyoutState>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));
