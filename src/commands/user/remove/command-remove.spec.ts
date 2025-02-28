import { createProvider } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userRemoveCommand } from './command-remove';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userRemoveCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  it('should remove user from provider', async () => {
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue({
        userId: '123',
        userName: 'user',
      }),
      getUserWorkspace: vi.fn().mockResolvedValue({
        workspaceId: '456',
        workspaceName: 'workspace',
      }),
      removeWorkspace: vi.fn().mockResolvedValue(true),
      removeUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(mockProvider.getUserFromProvider).toHaveBeenCalledWith(email);
    expect(loading.succeed).toHaveBeenCalledWith(`Removed ${email} from openai.`);
  });

  it('should handle user not a member of provider', async () => {
    // arrange
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue(undefined),
      removeUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(`${email} is not a member of openai.`);
  });

  it('should handle removal failure', async () => {
    const mockProvider = {
      getUserFromProvider: vi.fn().mockResolvedValue({
        userId: '123',
        userName: 'user',
      }),
      removeUser: vi.fn().mockResolvedValue(false), // Simulate removal failure
      getUserWorkspace: vi.fn().mockResolvedValue({
        workspaceId: '456',
        workspaceName: 'workspace',
      }),
      removeWorkspace: vi.fn().mockResolvedValue(true), // Assume workspace removal is successful
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(mockProvider.getUserFromProvider).toHaveBeenCalledWith(email);
    expect(loading.fail).toHaveBeenCalledWith(`Failed to remove ${email} from openai.`);
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
