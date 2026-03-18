import React, { useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useAgentLogStore } from '../store/useAgentLogStore';
import { useColors } from '../theme/ThemeContext';
import type { LogEntry } from '../agent/CommandLogger';

export function ProfileScreen() {
  const { prefs, set, load } = usePreferencesStore();
  const { log } = useAgentLogStore();
  const colors = useColors();

  useEffect(() => {
    load();
  }, [load]);

  const renderLogItem: ListRenderItem<LogEntry> = ({ item }) => (
    <View
      style={[styles.logItem, { backgroundColor: colors.logItem }]}
    >
      <Text style={[styles.logType, { color: colors.text }]}>
        {item.command.type}
      </Text>
      <Text style={[styles.logPayload, { color: colors.textSecondary }]}>
        {JSON.stringify(item.command.payload)}
      </Text>
      <Text
        style={[
          styles.logStatus,
          { color: colors.success },
          item.status === 'rejected' && { color: colors.error },
        ]}
      >
        {item.status}
        {item.reason ? ` — ${item.reason}` : ''}
      </Text>
      <Text style={[styles.logTime, { color: colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferences
        </Text>
        <View
          style={[
            styles.toggleRow,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={prefs.darkMode ?? false}
            onValueChange={(v) => set('darkMode', v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
        <View
          style={[
            styles.toggleRow,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            Notifications
          </Text>
          <Switch
            value={prefs.notifications ?? true}
            onValueChange={(v) => set('notifications', v)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Activity Log
        </Text>
        <FlatList
          data={log}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderLogItem}
          style={styles.logList}
          ListEmptyComponent={
            <Text
              style={[styles.empty, { color: colors.textSecondary }]}
            >
              No activity yet.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toggleLabel: {
    fontSize: 16,
  },
  logList: {
    maxHeight: 300,
  },
  logItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logType: {
    fontWeight: '600',
    fontSize: 14,
  },
  logPayload: {
    fontSize: 12,
    marginTop: 4,
  },
  logStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  logTime: {
    fontSize: 11,
    marginTop: 4,
  },
  empty: {
    fontStyle: 'italic',
  },
});
