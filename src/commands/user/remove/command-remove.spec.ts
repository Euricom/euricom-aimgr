import { AIProvider } from '@/providers/ai-provider';
import { createProvider } from '@/providers/ai-provider-factory';
import * as loading from '@/utils/loading';
import consola from 'consola';
import { describe, expect, it, Mock, vi } from 'vitest';
import { userRemoveCommand } from './command-remove';

// Define a comprehensive mock for the AI provider
let mockAIProvider: AIProvider = {
  getName: vi.fn().mockReturnValue('mockProvider'),
  getUserDetails: vi.fn().mockResolvedValue(undefined),
  getUsers: vi.fn().mockResolvedValue([]),
  getUserFromProvider: vi.fn().mockResolvedValue(undefined),
  getUserPendingInvite: vi.fn().mockResolvedValue(undefined),
  getInvites: vi.fn().mockResolvedValue([]),
  getUserWorkspace: vi.fn().mockResolvedValue(undefined),
  getWorkspaceApiKeys: vi.fn().mockResolvedValue([]),
  inviteUser: vi.fn().mockResolvedValue(false),
  assignUserToWorkspace: vi.fn().mockResolvedValue(false),
  removeUser: vi.fn().mockResolvedValue(false),
  removeWorkspace: vi.fn().mockResolvedValue(false),
  removeInvite: vi.fn().mockResolvedValue(false),
};

// Mock the entire module and provide a custom implementation for createProvider
vi.mock('@/providers/ai-provider-factory', () => ({
  createProvider: vi.fn(() => mockAIProvider),
}));

vi.mock('@/store');

describe('userRemoveCommand', () => {
  const email = 'user@example.com';
  const options = { provider: 'mockProvider' };

  it('should remove user from provider', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      userId: '123',
      userName: 'user',
      providerName: 'mockProvider',
    });
    vi.spyOn(mockAIProvider, 'removeUser').mockResolvedValue(true);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(mockAIProvider.getUserFromProvider).toHaveBeenCalledWith(email);
    expect(loading.succeed).toHaveBeenCalledWith(`Removed ${email} from mockProvider.`);
  });

  it('should handle user not a member of provider', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue(undefined);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(loading.warn).toHaveBeenCalledWith(`${email} is not a member of mockProvider.`);
  });

  it('should handle removal failure', async () => {
    // arrange
    vi.spyOn(mockAIProvider, 'getUserFromProvider').mockResolvedValue({
      userId: '123',
      userName: 'user',
      providerName: 'mockProvider',
    });
    vi.spyOn(mockAIProvider, 'removeUser').mockResolvedValue(false);

    // act
    await userRemoveCommand(email, options);

    // assert
    expect(mockAIProvider.getUserFromProvider).toHaveBeenCalledWith(email);
    expect(loading.fail).toHaveBeenCalledWith(`Failed to remove ${email} from mockProvider.`);
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
