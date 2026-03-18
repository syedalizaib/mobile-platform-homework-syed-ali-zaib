/**
 * AgentService — sends user messages to LLM and parses response for command + message.
 * Uses Groq (free, fast). Get key at https://console.groq.com
 */

import { GROQ_API_KEY } from '@env';
import type { Command } from './CommandRouter';

export interface AgentResponse {
  message: string;
  command: Command | null;
}

const DEFAULT_SYSTEM_PROMPT = `You are an in-app agent for a mobile app with 3 screens: Home, Explore, Profile.
You can propose actions by emitting a JSON command. Only use these command types:
- navigate: { screen: "home"|"explore"|"profile" }
- openFlyout / closeFlyout: {}
- applyExploreFilter: { filter: "Category"|"Sort", sort?: "A-Z"|"Recent" }
- setPreference: { key: "darkMode"|"notifications", value: true|false } — requires user confirmation
- showAlert: { title: string, message: string }
- exportAuditLog: {} — requires user confirmation

Always respond with JSON: { "message": "your reply", "command": <command or null> }

Command MUST have "type" and "payload". Example for navigate: { "type": "navigate", "payload": { "screen": "explore" } }
Example for setPreference: { "type": "setPreference", "payload": { "key": "darkMode", "value": true } }
Put all parameters inside "payload", not at top level. When proposing a state-changing action, include the command. Otherwise command: null.`;

/** Normalize LLM output: infer type if missing, move top-level fields into payload */
function normalizeCommand(raw: Record<string, unknown>): Command | null {
  let type: string;
  const rawType = raw.type ?? raw.action;
  if (typeof rawType === 'string') {
    type = rawType;
  } else if ('screen' in raw) {
    type = 'navigate';
  } else if ('key' in raw && 'value' in raw) {
    type = 'setPreference';
  } else if ('filter' in raw) {
    type = 'applyExploreFilter';
  } else if ('title' in raw && 'message' in raw) {
    type = 'showAlert';
  } else {
    return null;
  }

  const payloadKeys: Record<string, string[]> = {
    navigate: ['screen'],
    setPreference: ['key', 'value'],
    applyExploreFilter: ['filter', 'sort'],
    showAlert: ['title', 'message'],
    exportAuditLog: [],
    openFlyout: [],
    closeFlyout: [],
  };
  const keys = payloadKeys[type] ?? [];
  const payload: Record<string, unknown> =
    (raw.payload as Record<string, unknown>) ?? {};

  for (const k of keys) {
    if (k in raw && !(k in payload)) payload[k] = raw[k];
  }
  return { type, payload };
}

export async function sendToAgent(userMessage: string): Promise<AgentResponse> {
  const apiKey = GROQ_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith('your-') || apiKey.length < 10) {
    return {
      message:
        'No API key. Add GROQ_API_KEY to .env — get a free key at https://console.groq.com',
      command: null,
    };
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return {
        message: `API error: ${res.status} — ${err.slice(0, 100)}`,
        command: null,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return { message: 'No response from agent.', command: null };
    }

    const parsed = JSON.parse(text) as {
      message?: string;
      command?: Record<string, unknown> | null;
    };
    const raw = parsed.command;
    const command = raw ? normalizeCommand(raw) : null;
    return {
      message: parsed.message ?? 'No message.',
      command,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { message: `Error: ${msg}`, command: null };
  }
}
