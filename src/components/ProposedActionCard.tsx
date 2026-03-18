import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Command } from '../agent/CommandRouter';
import { useColors } from '../theme/ThemeContext';

interface ProposedActionCardProps {
  command: Command;
  onConfirm: () => void;
  onReject: () => void;
}

function formatAction(command: Command): string {
  const { type, payload } = command;
  switch (type) {
    case 'setPreference':
      return `Set "${payload.key}" → ${payload.value ? 'ON' : 'OFF'}`;
    case 'exportAuditLog':
      return 'Export audit log to device';
    case 'navigate':
      return `Go to ${String(payload.screen)}`;
    case 'applyExploreFilter':
      return `Apply filter: ${payload.filter}${payload.sort ? ` / ${payload.sort}` : ''}`;
    default:
      return `${type}: ${JSON.stringify(payload)}`;
  }
}

export function ProposedActionCard({
  command,
  onConfirm,
  onReject,
}: ProposedActionCardProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>⚡ Proposed Action</Text>
      <Text style={[styles.action, { color: colors.text }]}>{formatAction(command)}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.success }]}
          onPress={onConfirm}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rejectBtn,
            { backgroundColor: colors.background, borderColor: colors.error },
          ]}
          onPress={onReject}
        >
          <Text style={[styles.rejectText, { color: colors.error }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  action: {
    fontSize: 14,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectText: {
    fontWeight: '600',
  },
});
