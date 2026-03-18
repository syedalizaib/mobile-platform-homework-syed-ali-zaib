import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { sendToAgent } from '../agent/AgentService';
import { commandRouter } from '../agent/CommandRouter';
import type { Command } from '../agent/CommandRouter';
import { ProposedActionCard } from './ProposedActionCard';
import { useColors } from '../theme/ThemeContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status?: string;
}

interface AgentFlyoutProps {
  visible: boolean;
  onClose: () => void;
  onCommandExecuted?: () => void;
}

export function AgentFlyout({
  visible,
  onClose,
  onCommandExecuted,
}: AgentFlyoutProps) {
  const colors = useColors();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<Command | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((m) => [...m, { id: Date.now().toString(), role: 'user', text }]);
    setLoading(true);
    setPendingCommand(null);
    setLastStatus(null);

    try {
      const { message, command } = await sendToAgent(text);

      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: message,
        },
      ]);

      if (command) {
        const result = await commandRouter.execute(command, false);
        if (result.status === 'PENDING_CONFIRMATION') {
          setPendingCommand(command);
        } else if (result.status === 'executed') {
          setLastStatus('Executed');
          onCommandExecuted?.();
        } else {
          setLastStatus(`Rejected: ${result.reason ?? 'unknown'}`);
        }
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, onCommandExecuted]);

  const handleConfirm = useCallback(async () => {
    if (!pendingCommand) return;
    const result = await commandRouter.execute(pendingCommand, true);
    setPendingCommand(null);
    setLastStatus(result.status === 'executed' ? 'Executed' : `Rejected: ${result.reason ?? ''}`);
    onCommandExecuted?.();
  }, [pendingCommand, onCommandExecuted]);

  const handleReject = useCallback(() => {
    setPendingCommand(null);
    setLastStatus('Rejected by user');
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.safe, { backgroundColor: colors.background }]}
          edges={['top', 'bottom']}
        >
        <View
          style={[
            styles.headerRow,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.header, { color: colors.text }]}>Agent</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messageList} contentContainerStyle={styles.messageContent}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user'
                  ? { ...styles.userBubble, backgroundColor: colors.primary }
                  : { ...styles.assistantBubble, backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user'
                    ? { color: '#fff' }
                    : { color: colors.text },
                ]}
              >
                {msg.text}
              </Text>
              {msg.status && (
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  {msg.status}
                </Text>
              )}
            </View>
          ))}
          {pendingCommand && (
            <ProposedActionCard
              command={pendingCommand}
              onConfirm={handleConfirm}
              onReject={handleReject}
            />
          )}
          {lastStatus && !pendingCommand && (
            <Text style={[styles.inlineStatus, { color: colors.success }]}>
              {lastStatus}
            </Text>
          )}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputRow,
            { borderTopColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
            placeholder="Ask the agent..."
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: colors.primary },
              loading && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  inlineStatus: {
    fontSize: 12,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
