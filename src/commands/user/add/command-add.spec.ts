import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAddCommand } from './command-add';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userAddCommand', () => {
  const options = { email: 'user@example.com', provider: 'openai' };

  it('should add user to provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(false),
      addUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAddCommand(options);

    // assert
    expect(mockProvider.isUserMemberOfProvider).toHaveBeenCalledWith(options.email.toLowerCase());
    expect(mockProvider.addUser).toHaveBeenCalledWith(options.email.toLowerCase());
    expect(consola.success).toHaveBeenCalledWith(
      `User invited successfully for the following providers: ${options.provider}\n Waiting for invite acceptance.`
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
    await userAddCommand(options);

    // assert
    expect(consola.error).toHaveBeenCalledWith(`User ${options.email} already exists in all providers`);
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockRejectedValue(new Error('Error checking membership')),
      addUser: vi.fn(),
      getName: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAddCommand(options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
