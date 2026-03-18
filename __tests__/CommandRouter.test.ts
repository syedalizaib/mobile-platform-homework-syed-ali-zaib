/**
 * CommandRouter unit tests.
 * Proves: allowlist enforcement, schema validation, confirmation policy.
 */

import { CommandRouter } from '../src/agent/CommandRouter';

describe('CommandRouter', () => {
  let router: CommandRouter;

  beforeEach(() => {
    router = new CommandRouter();
    router.setHandler(async (cmd, confirmed) => {
      if (cmd.type === 'setPreference' && confirmed) {
        return { status: 'executed' };
      }
      return { status: 'rejected', reason: 'Handler not configured' };
    });
    router.setLogger(() => {});
  });

  it('rejects commands not in allowlist', async () => {
    const result = await router.execute({
      type: 'deleteAllData',
      payload: {},
    });
    expect(result.status).toBe('rejected');
    expect(result.reason).toContain('allowlist');
  });

  it('rejects navigate with invalid screen value', async () => {
    const result = await router.execute({
      type: 'navigate',
      payload: { screen: 'settings' },
    });
    expect(result.status).toBe('rejected');
    expect(result.reason).toContain('Invalid value');
  });

  it('returns PENDING_CONFIRMATION for setPreference without confirmed flag', async () => {
    const result = await router.execute({
      type: 'setPreference',
      payload: { key: 'darkMode', value: true },
    });
    expect(result.status).toBe('PENDING_CONFIRMATION');
  });

  it('executes setPreference when confirmed=true', async () => {
    const result = await router.execute(
      {
        type: 'setPreference',
        payload: { key: 'darkMode', value: true },
      },
      true
    );
    expect(result.status).toBe('executed');
  });
});
