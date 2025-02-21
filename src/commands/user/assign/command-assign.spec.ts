import { createProvider } from '@/providers/ai-provider-factory';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userAssignCommand } from './command-assign';

vi.mock('@/providers/ai-provider-factory');
vi.mock('@/utils/loading');
vi.mock('consola');

describe('userAssignCommand', () => {
  const options = { email: 'user@example.com', provider: 'openai' };

  it('should assign user to provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(true),
      assignUser: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(options);

    // assert
    expect(mockProvider.isUserMemberOfProvider).toHaveBeenCalledWith(options.email.toLowerCase());
    expect(mockProvider.assignUser).toHaveBeenCalledWith(options.email.toLowerCase());
    expect(consola.success).toHaveBeenCalledWith(`User ${options.email} successfully assigned to openai.`);
  });

  it('should handle user not a member of provider', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockResolvedValue(false),
      assignUser: vi.fn(),
      getName: vi.fn().mockReturnValue('openai'),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(options);

    // assert
    expect(consola.error).toHaveBeenCalledWith(
      `User ${options.email} is not a member of openai.\nPlease add the user to the organization in openai first.`
    );
  });

  it('should handle errors gracefully', async () => {
    // arrange
    const mockProvider = {
      isUserMemberOfProvider: vi.fn().mockRejectedValue(new Error('Error checking membership')),
      assignUser: vi.fn(),
      getName: vi.fn(),
    };
    (createProvider as Mock).mockReturnValue(mockProvider);

    // act
    await userAssignCommand(options);

    // assert
    expect(consola.error).toHaveBeenCalled();
  });
});
