/**
 * Wires CommandRouter with handler and logger.
 * Must be called after navigation ref and bottom sheet ref are available.
 */

import { Alert } from 'react-native';
import { commandRouter } from './agent/CommandRouter';
import { useAgentLogStore } from './store/useAgentLogStore';
import { usePreferencesStore } from './store/usePreferencesStore';
import { useExploreFilterStore } from './store/useExploreFilterStore';
import { useAgentFlyoutStore } from './store/useAgentFlyoutStore';
import { exportLog } from './native/AuditLogExporter';
import type { Command } from './agent/CommandRouter';

export type NavRef = {
  navigate: (name: string) => void;
} | null;

export function setupCommandRouter(navRef: React.RefObject<NavRef>) {
  const logStore = useAgentLogStore.getState();
  const prefsStore = usePreferencesStore.getState();
  const filterStore = useExploreFilterStore.getState();

  commandRouter.setLogger((entry) => {
    if (entry.status !== 'PENDING_CONFIRMATION') {
      logStore.append(entry);
    }
  });

  commandRouter.setHandler(async (cmd: Command, confirmed?: boolean) => {
    switch (cmd.type) {
      case 'navigate': {
        const screen = String(cmd.payload?.screen ?? '');
        const name = screen.charAt(0).toUpperCase() + screen.slice(1);
        navRef.current?.navigate(name);
        return { status: 'executed' };
      }
      case 'openFlyout':
        useAgentFlyoutStore.getState().open();
        return { status: 'executed' };
      case 'closeFlyout':
        useAgentFlyoutStore.getState().close();
        return { status: 'executed' };
      case 'applyExploreFilter': {
        const filter = cmd.payload?.filter as string;
        const sort = cmd.payload?.sort as string | undefined;
        if (filter === 'Category' || filter === 'Sort') {
          filterStore.setFilter(filter);
        }
        if (sort === 'A-Z' || sort === 'Recent') {
          filterStore.setSort(sort);
        }
        return { status: 'executed' };
      }
      case 'setPreference': {
        const key = cmd.payload?.key as string;
        const value = cmd.payload?.value as boolean;
        if ((key === 'darkMode' || key === 'notifications') && typeof value === 'boolean') {
          prefsStore.set(key, value);
          return { status: 'executed' };
        }
        return { status: 'rejected', reason: 'Invalid preference key or value' };
      }
      case 'showAlert': {
        const title = cmd.payload?.title as string;
        const message = cmd.payload?.message as string;
        Alert.alert(title ?? 'Alert', message ?? '');
        return { status: 'executed' };
      }
      case 'exportAuditLog': {
        const logEntries = logStore.log;
        const content = logEntries
          .map(
            (e) =>
              `[${new Date(e.timestamp).toISOString()}] ${e.command.type} ${JSON.stringify(e.command.payload)} - ${e.status}${e.reason ? `: ${e.reason}` : ''}`
          )
          .join('\n');
        const path = await exportLog(content || 'No log entries.');
        Alert.alert('Exported', `Audit log saved to:\n${path}`);
        return { status: 'executed' };
      }
      default:
        return { status: 'rejected', reason: `Unknown command: ${cmd.type}` };
    }
  });
}
