import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAssignCommand } from './command-assign';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userAssignCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'openai' };

  it('should assign user to provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      isUserAssignedToProvider: vi.fn().mockResolvedValue(false),
      getMemberFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      assignUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(email, options);

    // assert
    expect(consola.success).toHaveBeenCalledWith(`\nUser ${email} was assigned to: openai`);
  });

  it('should handle user already assigned', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      isUserAssignedToProvider: vi.fn().mockResolvedValue(true),
      getMemberFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      assignUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`\nUser ${email} is already assigned to openai.`);
  });

  it('should handle user not a member of provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(false),
      getMemberFromProvider: vi.fn().mockResolvedValue(undefined),
      assignUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`\nUser ${email} is not a member of openai.`);
  });

  it('should handle assignment failure', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      isUserAssignedToProvider: vi.fn().mockResolvedValue(false),
      getMemberFromProvider: vi.fn().mockResolvedValue({
        providerName: 'openai',
        userName: 'user',
        userId: '123',
      }),
      assignUser: vi.fn().mockResolvedValue(false),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(email, options);

    // assert
    expect(consola.warn).toHaveBeenCalledWith(`\nFailed to assign user ${email} to openai.`);
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = 'fake provider';
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(email, options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
