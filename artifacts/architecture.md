# Architecture

```
User Input → AgentFlyout → LLM (system prompt from CONTEXT.md)
                               ↓
                         { message, command? }
                               ↓
                         CommandRouter
                    ┌──────────┼──────────┐
                 Allowlist  Validate  ConfirmGate
                               ↓
                    Execute → CommandLogger
                    ↓                  ↓
              UI Side Effects      Log Store → Profile Screen
                                              → NativeModule (export)
```

**Key files:**
- `src/agent/CommandRouter.ts` — allowlist, schema validation, confirmation gate
- `src/agent/AgentService.ts` — LLM call, parses `{ message, command }`
- `src/store/useAgentLogStore.ts` — in-memory log, appended by router
- `src/native/AuditLogExporter.ts` — JS bridge to Swift/Kotlin module
- `src/setupCommandRouter.ts` — wires handler + logger to router
