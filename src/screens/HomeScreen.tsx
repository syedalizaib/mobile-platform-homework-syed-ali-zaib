import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

export function HomeScreen() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.hero, { color: colors.text }]}>
        Mobile Platform Homework
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        A small app with an anchored agent chat that helps you navigate and
        control the UI through validated, auditable commands. Use the agent
        flyout to ask questions and propose actions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});
