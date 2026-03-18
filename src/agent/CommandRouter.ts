/**
 * CommandRouter — validates and executes agent commands.
 * The LLM never directly touches state; it only emits JSON commands.
 * This router owns execution and enforces allowlist, schema, and confirmation.
 */

export interface Command {
  type: string;
  payload: Record<string, unknown>;
}

export type ExecutionStatus =
  | 'executed'
  | 'rejected'
  | 'PENDING_CONFIRMATION';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  reason?: string;
}

const ALLOWLIST = [
  'navigate',
  'openFlyout',
  'closeFlyout',
  'applyExploreFilter',
  'setPreference',
  'showAlert',
  'exportAuditLog',
] as const;

const CONFIRMATION_REQUIRED = ['setPreference', 'exportAuditLog'] as const;

const SCHEMAS: Record<
  string,
  { required: string[]; allowedValues?: Record<string, unknown[]> }
> = {
  navigate: {
    required: ['screen'],
    allowedValues: { screen: ['home', 'explore', 'profile'] },
  },
  openFlyout: { required: [] },
  closeFlyout: { required: [] },
  applyExploreFilter: {
    required: ['filter'],
    allowedValues: {
      filter: ['Category', 'Sort'],
      sort: ['A-Z', 'Recent'],
    },
  },
  setPreference: {
    required: ['key', 'value'],
    allowedValues: {
      key: ['darkMode', 'notifications'],
      value: [true, false],
    },
  },
  showAlert: { required: ['title', 'message'] },
  exportAuditLog: { required: [] }, // log is supplied by handler from store
};

export type CommandRouterHandler = (
  cmd: Command,
  confirmed?: boolean
) => Promise<ExecutionResult>;

export class CommandRouter {
  private handler: CommandRouterHandler | null = null;
  private logger: (entry: {
    command: Command;
    status: string;
    reason?: string;
    timestamp: number;
  }) => void = () => {};

  setHandler(handler: CommandRouterHandler): void {
    this.handler = handler;
  }

  setLogger(logger: CommandRouter['logger']): void {
    this.logger = logger;
  }

  validate(cmd: Command): ValidationResult {
    if (!cmd || typeof cmd !== 'object' || !cmd.type) {
      return { valid: false, reason: 'Invalid command: missing type' };
    }

    if (!ALLOWLIST.includes(cmd.type as (typeof ALLOWLIST)[number])) {
      return {
        valid: false,
        reason: `Command type "${cmd.type}" not in allowlist`,
      };
    }

    const schema = SCHEMAS[cmd.type];
    if (!schema) return { valid: true };

    const payload = cmd.payload ?? {};
    for (const field of schema.required) {
      if (!(field in payload)) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }

    if (schema.allowedValues) {
      for (const [field, allowed] of Object.entries(schema.allowedValues)) {
        const val = payload[field];
        if (val !== undefined && !allowed.includes(val)) {
          return {
            valid: false,
            reason: `Invalid value for ${field}: ${JSON.stringify(val)}. Allowed: ${JSON.stringify(allowed)}`,
          };
        }
      }
    }

    return { valid: true };
  }

  requiresConfirmation(cmd: Command): boolean {
    return CONFIRMATION_REQUIRED.includes(
      cmd.type as (typeof CONFIRMATION_REQUIRED)[number]
    );
  }

  async execute(cmd: Command, confirmed?: boolean): Promise<ExecutionResult> {
    const validation = this.validate(cmd);
    if (!validation.valid) {
      this.logger({
        command: cmd,
        status: 'rejected',
        reason: validation.reason,
        timestamp: Date.now(),
      });
      return { status: 'rejected', reason: validation.reason };
    }

    if (this.requiresConfirmation(cmd) && confirmed !== true) {
      this.logger({
        command: cmd,
        status: 'PENDING_CONFIRMATION',
        timestamp: Date.now(),
      });
      return { status: 'PENDING_CONFIRMATION' };
    }

    if (!this.handler) {
      const reason = 'No handler registered';
      this.logger({
        command: cmd,
        status: 'rejected',
        reason,
        timestamp: Date.now(),
      });
      return { status: 'rejected', reason };
    }

    try {
      const result = await this.handler(cmd, confirmed);
      this.logger({
        command: cmd,
        status: result.status,
        reason: result.reason,
        timestamp: Date.now(),
      });
      return result;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger({
        command: cmd,
        status: 'rejected',
        reason,
        timestamp: Date.now(),
      });
      return { status: 'rejected', reason };
    }
  }
}

export const commandRouter = new CommandRouter();
