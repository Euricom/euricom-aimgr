import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAddCommand } from './command-add';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userAddCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  it('should add user to provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(false),
      addUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAddCommand(email, options);

    // assert
    expect(mockProvider.addUser).toHaveBeenCalledWith(email.toLowerCase());
    expect(consola.success).toHaveBeenCalledWith(
      `User invited successfully for the following providers: ${options.provider}\nWaiting for invite acceptance.`
    );
  });

  it('should handle user already exists', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      addUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAddCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`User ${email} already exists in the following providers: openai`);
  });

  -it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAddCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
