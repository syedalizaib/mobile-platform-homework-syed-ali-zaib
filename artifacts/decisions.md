# Decisions

## 1. Zustand over Redux

**What:** Use Zustand for global state (preferences, agent log, explore filters).

**Why:** Less boilerplatee for a 3-screen app. No actions/reducers, direct `set` and `append` calls. AsyncStorage persistence is a few lines.

---

## 2. LLM emits structured JSON, Router owns execution

**What:** The agent returns `{ message, command }`. Only the CommandRouter executes commands.

**Why:** Safety boundary, the LLM cannot directly mutate state or call native code. Every action is validated (allowlist, schema, confirmation) and logged.

---

## 3. Bottom sheet persists at root, not per-screen

**What:** AgentFlyout is rendered in App.tsx above the tab navigator.

**Why:** Agent is always accessible regardless of which screen the user is on. No need to remount or pass props through navigation.

---

## 4. (Rejected) Expo — needs bare native module access

**What:** Chose bare React Native workflow instead of Expo.

**Why:** The challenge requires a custom native module (AuditLogExporter) written in Swift/Kotlin. Expo’s managed workflow would require ejecting or using a config plugin, bare RN gives direct control.

---

## 5. (Rejected) Letting LLM call functions directly — no audit trail

**What:** Did not allow the agent to invoke arbitrary functions.

**Why:** No audit trail, no confirmation gate, and no schema validation. The CommandRouter pattern ensures every action is logged and can be reviewed in the Profile Activity Log.
