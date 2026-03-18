/**
 * Mobile Platform Homework — Agent-driven 3-screen app
 * @format
 */

import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AgentFlyout } from './src/components/AgentFlyout';
import { setupCommandRouter } from './src/setupCommandRouter';
import { useAgentFlyoutStore } from './src/store/useAgentFlyoutStore';
import { ThemeProvider, useTheme, useColors } from './src/theme/ThemeContext';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
  );
}

function TabNavigator() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const navigationRef = useRef<{ navigate: (name: string) => void } | null>(null);
  const { visible, open, close } = useAgentFlyoutStore();
  const colors = useColors();
  const theme = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setupCommandRouter(navigationRef);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NavigationContainer
        key={theme}
        theme={{
          ...DefaultTheme,
          dark: isDark,
          colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
        }}
        ref={(ref) => {
          if (ref) {
            navigationRef.current = {
              navigate: (name: string) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ref as any).navigate(name),
            };
          }
        }}
      >
        <TabNavigator />
      </NavigationContainer>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={open}
      >
        <Text style={styles.fabText}>Agent</Text>
      </TouchableOpacity>
      <AgentFlyout visible={visible} onClose={close} />
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppWithTheme() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppContent />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default App;
