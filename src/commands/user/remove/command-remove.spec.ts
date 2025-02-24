import { createProvider } from '@/providers/ai-provider-factory';
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
    // arrange
    const mockProvider = {
      getMemberFromProvider: vi.fn().mockResolvedValue({
        userId: '123',
        userName: 'user',
      }),
      removeUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(consola.success).toHaveBeenCalledWith(`\nUser ${email} was removed from openai.`);
  });

  it('should handle user not a member of provider', async () => {
    // arrange
    const mockProvider = {
      getMemberFromProvider: vi.fn().mockResolvedValue(undefined),
      removeUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`\nUser ${email} is not a member of openai.`);
  });

  it('should handle removal failure', async () => {
    // arrange
    const mockProvider = {
      getMemberFromProvider: vi.fn().mockResolvedValue({
        userId: '123',
        userName: 'user',
      }),
      removeUser: vi.fn().mockResolvedValue(false),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`\nFailed to remove user ${email} from openai.`);
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
