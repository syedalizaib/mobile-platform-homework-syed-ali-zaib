# Mobile Platform Homework

Agent-driven 3-screen React Native app. The agent helps navigate, change filters, toggle preferences, and export the activity log—all through validated, auditable commands.

## Setup

```bash
npm install
cd ios && pod install && cd ..
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Agent (LLM):** Add `GROQ_API_KEY` to `.env` — get a free key at https://console.groq.com. Restart Metro after changing `.env`.

## Architecture (TL;DR)

- **3 screens:** Home, Explore, Profile. Bottom tabs.
- **Agent flyout:** Bottom sheet, FAB to open. Sends messages to LLM, gets `{ message, command }`.
- **CommandRouter:** Allowlist + schema validation + confirmation gate. Logs every execute/reject.
- **Native module:** `AuditLogExporter` (Swift/Kotlin) writes log to device documents.

## Key decisions

- Zustand for state (prefs, log, filters)
- LLM emits JSON only; Router owns execution
- Bottom sheet at root, always accessible
- Bare RN (not Expo) for custom native module
- No direct LLM state mutation—audit trail required

## AI disclosure

- **Tools:** Claude (claude website), QWEN (CLI)
- **Usage:** Boilerplate, native module wiring, test case structure, Console error debugging
- **Workflow:** Prompts to debug, manual review and edits for correctness
- **Mine:** Architecture choices, core features, command schema, confirmation rules, README voice

## Demo script

1. Tap Agent FAB → ask "what can you do" → agent responds from context
2. Ask "navigate to explore" → ProposedActionCard → Confirm → navigates
3. Ask "toggle on dark mode" → ProposedActionCard (confirmation) → Confirm → toggle flips
4. Profile → Activity Log → see executed entries
5. Ask "audit logs" → Confirm → native module writes file

## Test

```bash
npm test -- --testPathPattern=CommandRouter
```

Proves: allowlist rejects unknown commands, schema rejects invalid `navigate` screen, `setPreference` requires confirmation, and confirmed `setPreference` executes.

## Next steps

- Load `agent/CONTEXT.md` at runtime for system prompt
- Add `react-native-dotenv` for API key
- Deep links + web portal (3 buttons: Explore+filter, Profile, flyout+prompt)
- E2E tests with Detox

## Submission checklist

- [x] Repo named `mobile-platform-homework-syed-ali-zaib`, default branch `main`
- [x] README includes Setup commands for iOS + Android
- [x] README word count ≤ 500 (excluding commands/checkboxes)
- [x] `agent/CONTEXT.md` included
- [x] `artifacts/decisions.md` included (≤ 400 words)
- [x] `artifacts/architecture.md` included
- [x] `artifacts/demo-ios.mp4` and `artifacts/demo-android.mp4` included
- [x] One meaningful test included and described
- [x] AI disclosure included
